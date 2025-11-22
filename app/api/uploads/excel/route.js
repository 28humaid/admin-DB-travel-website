// app/api/uploads/excel/route.js
import { NextResponse } from 'next/server';
import { read, utils } from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

const prisma = new PrismaClient();

export async function POST(request) {

  function fixIST(dateString) {
    let doo = new Date(dateString);
    let newDate = new Date( doo.getTime() - doo.getTimezoneOffset()*60000 + 10000);
    // console.log("I am raw date....",doo.getTime());
    // console.log("I am raw date with added offset....",doo.getTime() - doo.getTimezoneOffset()*60000 + 10000);
    // console.log("I am new date.....",newDate);
    // console.log("i am OG date....",doo.getTime());
    // console.log("I am offset in millisecond.....", doo.getTimezoneOffset()*60000);
    return newDate;
  }

  // function fixStatementPeriodIST(dateString) {
  //   const doo = new Date(dateString);
  //   const fixed = new Date(doo.getTime() - doo.getTimezoneOffset() * 60000 + 10000);
  //   console.log("I am OG date:- ",doo);
  //   console.log("i am converted date...")
  //   // Option 1: Full month name (e.g. "November 2025")
  //   // return fixed.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });

  //   // Option 2: Short (e.g. "Nov 2025")
  //   // return fixed.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });

  //   // Option 3: Numeric (e.g. "11-2025")
  //   console.log(`${String(fixed.getMonth() + 1).padStart(2, '0')}-${fixed.getFullYear()}`)
  //   return `${String(fixed.getMonth() + 1).padStart(2, '0')}/${fixed.getFullYear()}`;
  // }

  // --- 1. Auth Check ---
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
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

    let bookings = [], refunds = [];
    let preview = { bookings: [], refunds: [] };

    // === BOOKINGS SHEET ===
    const bookingSheet = workbook.SheetNames.find(s => s.toLowerCase().includes('booking'));
    if (bookingSheet) {
      const ws = workbook.Sheets[bookingSheet];
      const rows = utils.sheet_to_json(ws, { header: 1 });
      if (rows.length > 0) {
        const headers = rows[0].map(h => h?.toString().trim());
        const pnrIdx = headers.indexOf('PNR/Ticket #');
        if (pnrIdx === -1) throw new Error('Bookings: Missing PNR/Ticket #');

        bookings = rows.slice(1)
          .filter(r => r[pnrIdx] && r[pnrIdx].toString().trim())
          .map(r => {
            const obj = {};
            headers.forEach((h, i) => {
              let val = r[i];
              obj[h] = val;
            });
            return obj;
          });
        preview.bookings = bookings.slice(0, 10);
      }
    }

    // === REFUNDS SHEET ===
    const refundSheet = workbook.SheetNames.find(s => s.toLowerCase().includes('refund'));
    if (refundSheet) {
      const ws = workbook.Sheets[refundSheet];
      const rows = utils.sheet_to_json(ws, { header: 1 });
      if (rows.length > 0) {
        const headers = rows[0].map(h => h?.toString().trim());
        const pnrIdx = headers.indexOf('PNR_NO');
        if (pnrIdx === -1) throw new Error('Refunds: Missing PNR_NO');

        refunds = rows.slice(1)
          .filter(r => r[pnrIdx] && r[pnrIdx].toString().trim())
          .map(r => {
            const obj = {};
            headers.forEach((h, i) => {
              let val = r[i];
              obj[h] = val;
            });
            return obj;
          });
        preview.refunds = refunds.slice(0, 10);
      }
    }

    // === 1. CROSS-COMPANY PNR CONFLICT CHECK ===
    const conflictingPnrs = new Set();

    for (const row of bookings) {
      const pnr = row['PNR/Ticket #']?.toString().trim();
      if (!pnr) continue;
      const exists = await prisma.booking.findFirst({
        where: { pnrTicketNo: pnr, clientId: { not: clientId } },
        select: { pnrTicketNo: true }
      });
      if (exists) conflictingPnrs.add(pnr);
    }

    for (const row of refunds) {
      const pnr = row['PNR_NO']?.toString().trim();
      if (!pnr) continue;
      const exists = await prisma.refund.findFirst({
        where: { pnrNo: pnr, clientId: { not: clientId } },
        select: { pnrNo: true }
      });
      if (exists) conflictingPnrs.add(pnr);
    }

    if (conflictingPnrs.size > 0) {
      return NextResponse.json(
        { error: 'PNR(s) already exist for different company' },
        { status: 400 }
      );
    }

    // === 2. PROCESS BOOKINGS: Skip if exists, Insert if new ===
    const result = {
      bookings: { inserted: 0, skipped: 0 },
      refunds: { inserted: 0, skipped: 0 }
    };

    for (const row of bookings) {
      const pnr = row['PNR/Ticket #']?.toString().trim();
      const exists = await prisma.booking.findFirst({
        where: { clientId, pnrTicketNo: pnr }
      });

      if (exists) {
        result.bookings.skipped++;
      } else {
        await prisma.booking.create({
          data: {
            clientId,
            serialNo: row['S. No.'] ? parseInt(row['S. No.']) : null,
            dateOfBooking: row['Date of Booking'] ? fixIST(row['Date of Booking']) : null,
            pnrTicketNo: pnr,
            dateOfTravel: row['Date of Travel'] ? fixIST(row['Date of Travel']) : null,
            passengerName: row['Passenger Name'] || null,
            sector: row['Sector'] || null,
            originStn: row['Origin Stn.'] || null,
            destinationStn: row['Destination Stn.'] || null,
            class: row['Class'] || null,
            quota: row['Quota'] || null,
            noOfPax: row['No. of Pax'] ? parseInt(row['No. of Pax']) : null,
            ticketAmount: row['Ticket Amount'] ? parseFloat(row['Ticket Amount']) : null,
            sCharges: row['S. Charges'] ? parseFloat(row['S. Charges']) : null,
            gst18: row['GST (18%)'] ? parseFloat(row['GST (18%)']) : null,
            totalAmount: row['Total Amount'] ? parseFloat(row['Total Amount']) : null,
            bookingId: row['Booking ID']?.toString().trim() || null,
            vendeeCorporate: row['Vendee/Corporate'] || null,
            subCorporate: row['Sub-Corporate'] || null,
            subEntity: row['Sub-Entity'] || null,
            nttBillNo: row['NTT Bill No.']?.toString().trim() || null,
            invoiceNo: row['Invoice No.']?.toString().trim() || null,
            statementPeriod: row['Statement Period'] ? fixIST(row['Statement Period']) : null,
            gstNo: row['GST No.']?.toString().trim() || null,
            gstState: row['GST State'] || null,
            cgst9: row['CGST %9'] ? parseFloat(row['CGST %9']) : null,
            sgst9: row['SGST % 9'] ? parseFloat(row['SGST % 9']) : null,
            igst18: row['IGST % 18'] ? parseFloat(row['IGST % 18']) : null,
          }
        });
        result.bookings.inserted++;
      }
    }

    // === 3. PROCESS REFUNDS: Skip if exists, Insert if new ===
    for (const row of refunds) {
      const pnr = row['PNR_NO']?.toString().trim();
      const exists = await prisma.refund.findFirst({
        where: { clientId, pnrNo: pnr }
      });

      if (exists) {
        result.refunds.skipped++;
      } else {
        await prisma.refund.create({
          data: {
            clientId,
            serialNo: row['S.No.'] ? parseInt(row['S.No.']) : null,
            refundDate: row['REFUND DATE'] ? fixIST(row['REFUND DATE']) : null,
            pnrNo: pnr,
            refundAmount: row['REFUND'] ? parseFloat(row['REFUND']) : null,
            vendeeCorporate: row['Vendee/Corporate']?.toString().trim() || null,
            subCorporate: row['Sub-Corporate']?.toString().trim() || null,
            subEntity: row['Sub-Entity']?.toString().trim() || null,
          }
        });
        result.refunds.inserted++;
      }
    }
    // === UPDATE hasExcel = true IF ANY DATA WAS INSERTED ===
    const totalInserted = result.bookings.inserted + result.refunds.inserted;
    if (totalInserted > 0) {
      await prisma.client.update({
        where: { clientId },
        data: { hasExcel: true }
      });
    }
    return NextResponse.json({ success: true, ...result, preview });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { error: err.message.includes('different company') ? 'PNR(s) already exist for different company' : err.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// === CHECK IF DATA EXISTS ===
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