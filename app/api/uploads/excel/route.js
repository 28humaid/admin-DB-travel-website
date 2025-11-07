// app/api/uploads/excel/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
// import ExcelJS from 'exceljs';

// -------------------------------
// Column Mappings (unchanged)
const bookingsColumnMap = {
  'S. No.': 'sNo',
  'Date of Booking': 'dateOfBooking',
  'PNR/Ticket #': 'pnrTicket',
  'Date of Travel': 'dateOfTravel',
  'Passenger Name': 'passengerName',
  'Sector': 'sector',
  'Origin Stn.': 'originStn',
  'Destination Stn.': 'destinationStn',
  'Class': 'class',
  'Quota': 'quota',
  'No. of Pax': 'noOfPax',
  'Ticket Amount': 'ticketAmount',
  'Charges': 'charges',
  'GST (18%)': 'gst18',
  'Total Amount': 'totalAmount',
  'Booking ID ': 'bookingId',
  'Corporate Name': 'corporateName',
  'Entity Name': 'entityName',
  'NTT Bill No.': 'nttBillNo',
  'Invoice No.': 'invoiceNo',
  'GST No.': 'gstNo',
  'CGST': 'cgst',
  'SGST': 'sgst',
  'IGST': 'igst',
  'UTGST': 'utgst',
  'Statement Period': 'statementPeriod',
  'Vendee Name': 'vendeeName',
};

const refundsColumnMap = {
  'REFUND DATE': 'refundDate',
  'PNR_NO': 'pnrNo',
  'REFUND': 'refund',
  'COPORATE': 'corporate',
};

// -------------------------------
// Date & Number Conversion (unchanged, just typed)
const convertToSchemaData = (row, columnMap) => {
  const doc = { clientId: null };

  Object.keys(row).forEach((excelKey) => {
    const schemaKey = columnMap[excelKey];
    if (!schemaKey) return;

    let value = row[excelKey];

    // --- Date fields ---
    if (
      schemaKey.includes('Date') ||
      ['dateOfBooking', 'dateOfTravel', 'refundDate'].includes(schemaKey)
    ) {
      if (typeof value === 'number' && value > 1 && value < 100000) {
        // Excel serial date
        try {
          const date = new Date((value - 25569) * 86400 * 1000);
          value = isNaN(date.getTime()) ? null : date;
        } catch {
          value = null;
        }
      } else if (typeof value === 'string' && value.trim()) {
        try {
          const [y, m, d] = value.split('-').map(Number);
          if (y && m && d) {
            const date = new Date(y, m - 1, d);
            value = isNaN(date.getTime()) ? null : date;
          } else {
            const date = new Date(value);
            value = isNaN(date.getTime()) ? null : date;
          }
        } catch {
          value = null;
        }
      } else {
        value = null;
      }
    }
    // --- Statement Period ---
    else if (schemaKey === 'statementPeriod') {
      if (typeof value === 'number' && value > 1 && value < 100000) {
        try {
          const date = new Date((value - 25569) * 86400 * 1000);
          if (!isNaN(date.getTime())) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = months[date.getMonth()];
            const year = (date.getFullYear() % 100).toString().padStart(2, '0');
            value = `${month}-${year}`;
          }
        } catch {
          value = value.toString();
        }
      } else if (typeof value === 'string') {
        value = value.trim();
      } else {
        value = value ? value.toString() : '';
      }
    }
    // --- Numeric fields ---
    else if (
      [
        'sNo',
        'noOfPax',
        'ticketAmount',
        'charges',
        'gst18',
        'totalAmount',
        'refund',
        'cgst',
        'sgst',
        'igst',
        'utgst',
      ].includes(schemaKey)
    ) {
      value = value !== null && value !== undefined && value !== '' ? Number(value) : 0;
      if (isNaN(value)) value = 0;
    }

    doc[schemaKey] = value;
  });

  return doc;
};

// -------------------------------
// Helper: Batch Insert/Upsert
async function upsertBookingsInBatches(
  data,
  clientId,
  adminId,
  session
) {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  const batchSize = 500; // Safe for SQL Server
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    const ops = batch.map((doc) => ({
      where: { clientId_pnrTicketNo: { clientId, pnrTicketNo: doc.pnrTicket?.toString().trim() } },
      update: { ...doc, clientId },
      create: { ...doc, clientId },
    }));

    try {
      const result = await prisma.booking.createMany({
        data: ops.map((op) => op.create),
        skipDuplicates: true,
      });
      inserted += result.count;

      // Now update existing ones
      for (const op of ops) {
        await prisma.booking.updateMany({
          where: op.where,
          data: op.update,
        });
      }
      updated += batch.length - result.count;
    } catch (err) {
      console.error('Batch upsert error:', err);
      skipped += batch.length;
    }
  }

  return { inserted, updated, skipped };
}

// Same for Refunds
async function upsertRefundsInBatches(
  data,
  clientId,
  adminId,
  session
) {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  const batchSize = 500;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    const ops = batch.map((doc) => ({
      where: { clientId_pnrNo: { clientId, pnrNo: doc.pnrNo?.toString().trim() } },
      update: { ...doc, clientId },
      create: { ...doc, clientId },
    }));

    try {
      const result = await prisma.refund.createMany({
        data: ops.map((op) => op.create),
        skipDuplicates: true,
      });
      inserted += result.count;

      for (const op of ops) {
        await prisma.refund.updateMany({
          where: op.where,
          data: op.update,
        });
      }
      updated += batch.length - result.count;
    } catch (err) {
      skipped += batch.length;
    }
  }

  return { inserted, updated, skipped };
}

// -------------------------------
// GET: Check if data exists for client
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const clientId = url.searchParams.get('clientId');
  if (!clientId || isNaN(Number(clientId))) {
    return NextResponse.json({ success: false, error: 'Invalid clientId' }, { status: 400 });
  }

  const count = await prisma.booking.count({ where: { clientId: Number(clientId) } });
  return NextResponse.json({ success: true, exists: count > 0 });
}

// -------------------------------
// POST: Upload Excel JSON
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const adminId = Number(session.user.id);
  const body = await request.json();
  const { jsonData, clientId: rawClientId, overwrite = false } = body;

  const clientId = Number(rawClientId);
  if (!jsonData || !clientId || isNaN(clientId)) {
    return NextResponse.json({ success: false, error: 'Missing jsonData or clientId' }, { status: 400 });
  }

  const client = await prisma.client.findUnique({ where: { clientId } });
  if (!client) {
    return NextResponse.json({ success: false, error: 'Client not found' }, { status: 400 });
  }

  const { bookings: rawBookings = [], refunds: rawRefunds = [] } = jsonData;

  const filteredBookings = rawBookings.filter(
    (r) =>
      r['PNR/Ticket #']?.toString().trim() && r['Booking ID ']?.toString().trim()
  );
  const filteredRefunds = rawRefunds.filter((r) => r['PNR_NO']?.toString().trim());

  let bookingInserted = 0,
    bookingUpdated = 0,
    bookingSkipped = 0;
  let refundInserted = 0,
    refundUpdated = 0,
    refundSkipped = 0;

  const logEntry = await prisma.uploadLog.create({
    data: {
      adminId,
      uploadType: 'EXCEL',
      fileName: `client_${clientId}_upload_${new Date().toISOString().split('T')[0]}.json`,
      rowsInserted: 0,
      notes: `Processing ${filteredBookings.length} bookings, ${filteredRefunds.length} refunds. Overwrite: ${overwrite}`,
    },
  });

  try {
    await prisma.$transaction(async (tx) => {
      if (overwrite) {
        await tx.booking.deleteMany({ where: { clientId } });
        await tx.refund.deleteMany({ where: { clientId } });
      }

      const mappedBookings = filteredBookings.map((row) =>
        convertToSchemaData(row, bookingsColumnMap)
      );
      const mappedRefunds = filteredRefunds.map((row) =>
        convertToSchemaData(row, refundsColumnMap)
      );

      const bookingResult = await upsertBookingsInBatches(mappedBookings, clientId, adminId, tx);
      const refundResult = await upsertRefundsInBatches(mappedRefunds, clientId, adminId, tx);

      Object.assign(
        { bookingInserted, bookingUpdated, bookingSkipped },
        bookingResult
      );
      Object.assign(
        { refundInserted, refundUpdated, refundSkipped },
        refundResult
      );
    });

    // Update log
    await prisma.uploadLog.update({
      where: { logId: logEntry.logId },
      data: {
        rowsInserted: bookingInserted + refundInserted,
        notes: `${logEntry.notes}\nSuccess: ${bookingInserted}B/${refundInserted}R inserted, ${bookingUpdated}B/${refundUpdated}R updated`,
      },
    });

    return NextResponse.json({
      success: true,
      bookings: { inserted: bookingInserted, updated: bookingUpdated, skipped: bookingSkipped },
      refunds: { inserted: refundInserted, updated: refundUpdated, skipped: refundSkipped },
      totalProcessed: filteredBookings.length + filteredRefunds.length,
    });
  } catch (error) {
    await prisma.uploadLog.update({
      where: { logId: logEntry.logId },
      data: { notes: `${logEntry.notes}\nERROR: ${error.message}` },
    });

    return NextResponse.json(
      { success: false, error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}