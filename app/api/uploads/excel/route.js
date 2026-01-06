// app/api/uploads/excel/route.js
import { NextResponse } from 'next/server';
import { read, utils } from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

const prisma = new PrismaClient();

function fixIST(dateValue) {
  if (!dateValue) return null;
  // Excel dates come as JS Date (UTC-based), we adjust to IST
  const date = new Date(dateValue);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000 + 10000);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const clientId = parseInt(formData.get('companyId'));

  if (!file || !clientId) {
    return NextResponse.json({ error: 'Missing file or company' }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = read(buffer, { type: 'buffer', cellDates: true });

    let rawBookings = [], rawRefunds = [];
    let preview = { bookings: [], refunds: [] };

    // === Parse Bookings Sheet ===
    const bookingSheetName = workbook.SheetNames.find(s => /booking/i.test(s));
    if (bookingSheetName) {
      const ws = workbook.Sheets[bookingSheetName];
      const rows = utils.sheet_to_json(ws, { header: 1, defval: null });
      if (rows.length > 1) {
        const headers = rows[0].map(h => h?.toString().trim());
        const pnrIdx = headers.findIndex(h => h === 'PNR/Ticket #');
        if (pnrIdx === -1) throw new Error('Bookings sheet: Missing "PNR/Ticket #" column');

        rawBookings = rows.slice(1)
          .filter(row => row[pnrIdx]?.toString().trim())
          .map(row => {
            const obj = {};
            headers.forEach((h, i) => { obj[h] = row[i]; });
            return obj;
          });

        preview.bookings = rawBookings.slice(0, 10);
      }
    }

    // === Parse Refunds Sheet ===
    const refundSheetName = workbook.SheetNames.find(s => /refund/i.test(s));
    if (refundSheetName) {
      const ws = workbook.Sheets[refundSheetName];
      const rows = utils.sheet_to_json(ws, { header: 1, defval: null });
      if (rows.length > 1) {
        const headers = rows[0].map(h => h?.toString().trim());
        const pnrIdx = headers.findIndex(h => h === 'PNR_NO');
        if (pnrIdx === -1) throw new Error('Refunds sheet: Missing "PNR_NO" column');

        rawRefunds = rows.slice(1)
          .filter(row => row[pnrIdx]?.toString().trim())
          .map(row => {
            const obj = {};
            headers.forEach((h, i) => { obj[h] = row[i]; });
            return obj;
          });

        preview.refunds = rawRefunds.slice(0, 10);
      }
    }

    if (rawBookings.length === 0 && rawRefunds.length === 0) {
      return NextResponse.json({ error: 'No valid data found in sheets' }, { status: 400 });
    }

    // === Collect all PNRs ===
    const bookingPnrs = rawBookings.map(r => r['PNR/Ticket #']?.toString().trim()).filter(Boolean);
    const refundPnrs = rawRefunds.map(r => r['PNR_NO']?.toString().trim()).filter(Boolean);
    const allPnrs = [...new Set([...bookingPnrs, ...refundPnrs])];

    // === Transaction for consistency and performance ===
    const result = await prisma.$transaction(async (tx) => {
      const result = {
        bookings: { inserted: 0, skipped: 0 },
        refunds: { inserted: 0, skipped: 0 }
      };

            // 1. Cross-company conflict check (chunked for MSSQL 2100 param limit)
      if (allPnrs.length > 0) {
        const CHUNK_SIZE = 2000;
        let conflicting = new Set();

        for (let i = 0; i < allPnrs.length; i += CHUNK_SIZE) {
          const chunk = allPnrs.slice(i, i + CHUNK_SIZE);

          const [confBookings, confRefunds] = await Promise.all([
            tx.booking.findMany({
              where: {
                pnrTicketNo: { in: chunk },
                clientId: { not: clientId }
              },
              select: { pnrTicketNo: true }
            }),
            tx.refund.findMany({
              where: {
                pnrNo: { in: chunk },
                clientId: { not: clientId }
              },
              select: { pnrNo: true }
            })
          ]);

          confBookings.forEach(b => conflicting.add(b.pnrTicketNo));
          confRefunds.forEach(r => conflicting.add(r.pnrNo));
        }

        if (conflicting.size > 0) {
          throw new Error('PNR(s) already exist for different company');
        }
      }

            // 2. Same-company duplicate check (chunked for MSSQL 2100 param limit)
      const existingBookingPnrs = new Set();
      const existingRefundPnrs = new Set();

      const CHUNK_SIZE = 2000;

      // Bookings duplicate check
      if (bookingPnrs.length > 0) {
        for (let i = 0; i < bookingPnrs.length; i += CHUNK_SIZE) {
          const chunk = bookingPnrs.slice(i, i + CHUNK_SIZE);
          const existing = await tx.booking.findMany({
            where: {
              clientId,
              pnrTicketNo: { in: chunk }
            },
            select: { pnrTicketNo: true }
          });
          existing.forEach(e => existingBookingPnrs.add(e.pnrTicketNo));
        }
      }

      // Refunds duplicate check
      if (refundPnrs.length > 0) {
        for (let i = 0; i < refundPnrs.length; i += CHUNK_SIZE) {
          const chunk = refundPnrs.slice(i, i + CHUNK_SIZE);
          const existing = await tx.refund.findMany({
            where: {
              clientId,
              pnrNo: { in: chunk }
            },
            select: { pnrNo: true }
          });
          existing.forEach(e => existingRefundPnrs.add(e.pnrNo));
        }
      }

      // 3. Filter new records only
      const newBookings = rawBookings
        .filter(r => !existingBookingPnrs.has(r['PNR/Ticket #'].toString().trim()))
        .map(r => ({
          clientId,
          serialNo: r['S. No.'] ? parseInt(r['S. No.']) : null,
          dateOfBooking: r['Date of Booking'] ? fixIST(r['Date of Booking']) : null,
          pnrTicketNo: r['PNR/Ticket #'].toString().trim(),
          dateOfTravel: r['Date of Travel'] ? fixIST(r['Date of Travel']) : null,
          passengerName: r['Passenger Name'] || null,
          sector: r['Sector'] || null,
          originStn: r['Origin Stn.'] || null,
          destinationStn: r['Destination Stn.'] || null,
          class: r['Class'] || null,
          quota: r['Quota'] || null,
          noOfPax: r['No. of Pax'] ? parseInt(r['No. of Pax']) : null,
          ticketAmount: r['Ticket Amount'] ? parseFloat(r['Ticket Amount']) : null,
          sCharges: r['S. Charges'] ? parseFloat(r['S. Charges']) : null,
          gst18: r['GST (18%)'] ? parseFloat(r['GST (18%)']) : null,
          totalAmount: r['Total Amount'] ? parseFloat(r['Total Amount']) : null,
          bookingId: r['Booking ID']?.toString().trim() || null,
          vendeeCorporate: r['Vendee/Corporate'] || null,
          subCorporate: r['Sub-Corporate'] || null,
          subEntity: r['Sub-Entity'] || null,
          nttBillNo: r['NTT Bill No.']?.toString().trim() || null,
          invoiceNo: r['Invoice No.']?.toString().trim() || null,
          statementPeriod: r['Statement Period'] ? fixIST(r['Statement Period']) : null,
          gstNo: r['GST No.']?.toString().trim() || null,
          gstState: r['GST State'] || null,
          cgst9: r['CGST %9'] ? parseFloat(r['CGST %9']) : null,
          sgst9: r['SGST % 9'] ? parseFloat(r['SGST % 9']) : null,
          igst18: r['IGST % 18'] ? parseFloat(r['IGST % 18']) : null,
        }));

      const newRefunds = rawRefunds
        .filter(r => !existingRefundPnrs.has(r['PNR_NO'].toString().trim()))
        .map(r => ({
          clientId,
          serialNo: r['S.No.'] ? parseInt(r['S.No.']) : null,
          refundDate: r['REFUND DATE'] ? fixIST(r['REFUND DATE']) : null,
          pnrNo: r['PNR_NO'].toString().trim(),
          refundAmount: r['REFUND'] ? parseFloat(r['REFUND']) : null,
          vendeeCorporate: r['Vendee/Corporate'] || null,
          subCorporate: r['Sub-Corporate'] || null,
          subEntity: r['Sub-Entity'] || null,
        }));

      // 4. Bulk insert
      if (newBookings.length > 0) {
        await tx.booking.createMany({ data: newBookings });
        result.bookings.inserted = newBookings.length;
      }
      result.bookings.skipped = rawBookings.length - result.bookings.inserted;

      if (newRefunds.length > 0) {
        await tx.refund.createMany({ data: newRefunds });
        result.refunds.inserted = newRefunds.length;
      }
      result.refunds.skipped = rawRefunds.length - result.refunds.inserted;

      // 5. Update hasExcel if anything was inserted
      if (result.bookings.inserted > 0 || result.refunds.inserted > 0) {
        await tx.client.update({
          where: { clientId },
          data: { hasExcel: true }
        });
      }

      return result;
      }, {
        timeout: 60000  // <-- This fixes the timeout error
      });

    return NextResponse.json({ success: true, ...result, preview });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { error: err.message || 'Upload failed' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET endpoint remains unchanged
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const clientId = parseInt(searchParams.get('companyId'));
  if (!clientId) return NextResponse.json({ exists: false });

  try {
    const count = await prisma.booking.count({ where: { clientId } }) +
                  await prisma.refund.count({ where: { clientId } });
    return NextResponse.json({ exists: count > 0 });
  } catch {
    return NextResponse.json({ exists: false });
  }
}