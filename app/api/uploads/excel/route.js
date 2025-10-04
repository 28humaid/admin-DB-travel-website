import Booking from '@/models/bookingsSchema';
import Customer from '@/models/customer';
import Refund from '@/models/refundsSchema';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getAuthSession';
import mongoose from 'mongoose';

// Column mappings remain unchanged
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

// convertToSchemaData function remains unchanged
const convertToSchemaData = (row, columnMap) => {
  const doc = { companyId: null };
  Object.keys(row).forEach(excelKey => {
    const schemaKey = columnMap[excelKey];
    if (schemaKey) {
      let value = row[excelKey];
      if (schemaKey.includes('Date') || schemaKey === 'dateOfBooking' || schemaKey === 'dateOfTravel' || schemaKey === 'refundDate') {
        if (typeof value === 'number' && value > 1 && value < 100000) {
          try {
            value = new Date((value - 25569) * 86400 * 1000);
            if (isNaN(value.getTime())) value = null;
          } catch {
            value = null;
          }
        } else if (value && typeof value === 'string') {
          try {
            const [day, month, year] = value.split('-').map(Number);
            if (day && month && year) {
              value = new Date(year, month - 1, day);
              if (isNaN(value.getTime())) value = null;
            } else {
              value = new Date(value);
              if (isNaN(value.getTime())) value = null;
            }
          } catch {
            value = null;
          }
        }
      } else if (schemaKey === 'statementPeriod') {
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
      } else if (
        schemaKey === 'sNo' ||
        schemaKey === 'noOfPax' ||
        schemaKey.includes('Amount') ||
        schemaKey === 'refund' ||
        schemaKey === 'cgst' ||
        schemaKey === 'sgst' ||
        schemaKey === 'igst' ||
        schemaKey === 'utgst' ||
        schemaKey === 'gst18' ||
        schemaKey === 'charges' ||
        schemaKey === 'ticketAmount' ||
        schemaKey === 'totalAmount'
      ) {
        if (value !== null && value !== undefined && value !== '') {
          value = Number(value);
          if (isNaN(value)) value = 0;
        } else {
          value = 0;
        }
      }
      doc[schemaKey] = value;
    }
  });
  return doc;
};

export async function GET(request) {
  try {
    const authSession = await getAuthSession();
    if (!authSession || !authSession.user || authSession.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const companyId = url.searchParams.get('companyId');

    if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
      return NextResponse.json({ success: false, error: 'Invalid companyId' }, { status: 400 });
    }

    const count = await Booking.countDocuments({ companyId });
    const exists = count > 0;

    return NextResponse.json({ success: true, exists });
  } catch (error) {
    console.error('Check existence error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authSession = await getAuthSession();
    if (!authSession || !authSession.user || authSession.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { jsonData, companyId, overwrite = false } = await request.json();

    if (!jsonData || !companyId) {
      return NextResponse.json({ success: false, error: 'Missing jsonData or companyId' }, { status: 400 });
    }

    const customer = await Customer.findById(companyId);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Invalid company ID' }, { status: 400 });
    }

    const { bookings: rawBookings = [], refunds: rawRefunds = [] } = jsonData;

    const filteredBookings = rawBookings.filter(
      (row) => row['PNR/Ticket #'] && row['PNR/Ticket #'].toString().trim() !== '' && row['Booking ID '] && row['Booking ID '].toString().trim() !== ''
    );
    const filteredRefunds = rawRefunds.filter(
      (row) => row['PNR_NO'] && row['PNR_NO'].toString().trim() !== ''
    );

    let bookingInserted = 0;
    let bookingUpdated = 0;
    let bookingSkipped = 0;
    let refundInserted = 0;
    let refundUpdated = 0;
    let refundSkipped = 0;

    const mongoSession = await mongoose.startSession({ maxCommitTimeMS: 60000 }); // 60s timeout for larger uploads
    await mongoSession.withTransaction(async () => {
      console.log(`Transaction started for company ${companyId}. Bookings: ${filteredBookings.length}, Refunds: ${filteredRefunds.length}. Overwrite: ${overwrite}`);

      if (overwrite) {
        await Booking.deleteMany({ companyId }, { session: mongoSession });
        await Refund.deleteMany({ companyId }, { session: mongoSession });
        console.log('Existing records deleted for overwrite.');
      }

      // Handle Bookings with Upsert (update if exists, insert if new)
      if (filteredBookings.length > 0) {
        const bulkOps = filteredBookings.map((row) => {
          const doc = convertToSchemaData(row, bookingsColumnMap);
          doc.companyId = companyId;
          // Normalize keys to avoid whitespace/case issues
          if (doc.bookingId) doc.bookingId = doc.bookingId.toString().trim();
          if (doc.pnrTicket) doc.pnrTicket = doc.pnrTicket.toString().trim();
          return {
            updateOne: {
              filter: { companyId, bookingId: doc.bookingId }, // Scoped to company + bookingId
              update: { $set: doc },
              upsert: true,
            },
          };
        });

        try {
          const result = await Booking.bulkWrite(bulkOps, { session: mongoSession });
          bookingInserted = result.upsertedCount;
          bookingUpdated = result.modifiedCount;
          console.log(`Bookings: ${bookingInserted} inserted, ${bookingUpdated} updated`);
        } catch (err) {
          // Log but don't abort for duplicates or validation issues
          bookingSkipped = filteredBookings.length - (err.result?.modifiedCount + err.result?.upsertedCount || 0);
          console.error('Bookings processing issues (continuing anyway):', err);
          if (err.code === 11000) {
            console.log('Duplicate bookingId(s) skipped—normal for re-uploads.');
          }
        }
      }

      // Handle Refunds with Upsert (same logic)
      if (filteredRefunds.length > 0) {
        const bulkOps = filteredRefunds.map((row) => {
          const doc = convertToSchemaData(row, refundsColumnMap);
          doc.companyId = companyId;
          // Normalize keys
          if (doc.pnrNo) doc.pnrNo = doc.pnrNo.toString().trim();
          return {
            updateOne: {
              filter: { companyId, pnrNo: doc.pnrNo }, // Scoped to company + pnrNo
              update: { $set: doc },
              upsert: true,
            },
          };
        });

        try {
          const result = await Refund.bulkWrite(bulkOps, { session: mongoSession });
          refundInserted = result.upsertedCount;
          refundUpdated = result.modifiedCount;
          console.log(`Refunds: ${refundInserted} inserted, ${refundUpdated} updated`);
        } catch (err) {
          // Log but don't abort
          refundSkipped = filteredRefunds.length - (err.result?.modifiedCount + err.result?.upsertedCount || 0);
          console.error('Refunds processing issues (continuing anyway):', err);
          if (err.code === 11000) {
            console.log('Duplicate pnrNo(s) skipped—normal for re-uploads.');
          }
        }
      }

      console.log('Transaction committed successfully.');
    });

    mongoSession.endSession();

    return NextResponse.json({
      success: true,
      bookings: {
        inserted: bookingInserted,
        updated: bookingUpdated,
        skipped: bookingSkipped,
      },
      refunds: {
        inserted: refundInserted,
        updated: refundUpdated,
        skipped: refundSkipped,
      },
      totalProcessed: filteredBookings.length + filteredRefunds.length,
    });
  } catch (error) {
    console.error('Upload error (outside transaction):', error);
    
    // Only fail hard for non-recoverable issues (e.g., connection, auth)
    if (error.message && error.message.includes('Transaction has been aborted')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Upload partially processed but transaction rolled back due to server issue. Check logs and retry with smaller file.' 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error—upload failed to start' },
      { status: 500 }
    );
  }
}