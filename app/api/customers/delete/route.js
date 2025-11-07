// app/api/customers/delete/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function DELETE(request) {
  // --- 1. Admin Auth Check ---
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const adminId = Number(session.user.id);

  try {
    // --- 2. Get clientId from body ---
    const body = await request.json();
    const { id: rawId } = body;

    const clientId = Number(rawId);
    if (!rawId || isNaN(clientId)) {
      return NextResponse.json({ message: 'Invalid customer ID' }, { status: 400 });
    }

    // --- 3. Log start ---
    const log = await prisma.uploadLog.create({
      data: {
        adminId,
        uploadType: 'CLIENT_DELETE',
        fileName: null,
        rowsInserted: 0,
        notes: `Deleting client ID: ${clientId}`,
      },
    });

    // --- 4. Delete in transaction ---
    let deletedClient;
    await prisma.$transaction(async (tx) => {
      // Check if exists + get name for log
      deletedClient = await tx.client.findUnique({
        where: { clientId },
        select: { companyName: true, subEntity: true },
      });

      if (!deletedClient) {
        throw new Error('Customer not found');
      }

      // Delete related data
      await tx.booking.deleteMany({ where: { clientId } });
      await tx.refund.deleteMany({ where: { clientId } });

      // Finally delete client
      await tx.client.delete({ where: { clientId } });
    });

    // --- 5. Update log on success ---
    await prisma.uploadLog.update({
      where: { logId: log.logId },
      data: {
        notes: `${log.notes} → SUCCESS: Deleted ${deletedClient.companyName} (${deletedClient.subEntity}) + all bookings/refunds`,
      },
    });

    return NextResponse.json(
      { message: 'Customer and related bookings and refunds deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting customer:', error);

    // --- Update log on failure ---
    if (log) {
      await prisma.uploadLog.update({
        where: { logId: log.logId },
        data: { notes: `${log?.notes || ''}\nERROR: ${error.message}` },
      }).catch(() => {});
    }

    if (error.message === 'Customer not found') {
      return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Failed to delete customer and related data', error: error.message },
      { status: 500 }
    );
  }
}