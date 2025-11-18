// app/api/customers/delete/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const adminId = Number(session.user.id);
  let log;

  try {
    const { id: rawId } = await request.json();
    const clientId = Number(rawId);

    if (!rawId || isNaN(clientId)) {
      return NextResponse.json({ message: 'Invalid customer ID' }, { status: 400 });
    }

    // 1. Create log entry
    log = await prisma.uploadLog.create({
      data: {
        adminId,
        uploadType: 'CLIENT_EXCEL_DELETE',
        fileName: null,
        rowsInserted: 0,
        notes: `Clearing bookings & refunds for client ID: ${clientId}`,
      },
    });

    // 2. Get client info for logging (before anything changes)
    const clientInfo = await prisma.client.findUnique({
      where: { clientId },
      select: { companyName: true, subEntity: true },
    });

    if (!clientInfo) {
      throw new Error('Customer not found');
    }

    // 3. Delete only related data – NOT the client itself
    await prisma.$transaction(async (tx) => {
      await tx.booking.deleteMany({ where: { clientId } });
      await tx.refund.deleteMany({ where: { clientId } });
      await tx.client.update({ where: { clientId }, data: { hasExcel: false}});
    });

    // 4. Success log
    await prisma.uploadLog.update({
      where: { logId: log.logId },
      data: {
        notes: `${log.notes} → SUCCESS: Cleared bookings & refunds for ${clientInfo.companyName} (${clientInfo.subEntity || 'N/A'})`,
      },
    });

    return NextResponse.json(
      { message: 'Bookings and refunds cleared successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error clearing client data:', error);

    if (log) {
      await prisma.uploadLog.update({
        where: { logId: log.logId },
        data: { notes: `${log.notes}\nERROR: ${error.message}` },
      }).catch(() => {});
    }

    if (error.message === 'Customer not found') {
      return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Failed to clear bookings and refunds', error: error.message },
      { status: 500 }
    );
  }
}