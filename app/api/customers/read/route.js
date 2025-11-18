// app/api/customers/read/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  // --- 1. Admin Auth Check ---
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const adminId = Number(session.user.id);

  try {
    // --- 2. Log action ---
    await prisma.uploadLog.create({
      data: {
        adminId,
        uploadType: 'CLIENT_READ',
        fileName: null,
        rowsInserted: 0,
        notes: `Admin viewed all clients`,
      },
    });

    // --- 3. Fetch all clients (exclude passwordHash) ---
    const clients = await prisma.client.findMany({
      select: {
        clientId: true,
        username: true,
        email1: true,
        email2: true,
        email3: true,
        mobileNo: true,
        companyName: true,
        subCorporate: true,
        subEntity: true,
        gstNo: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        hasExcel:true,
        // passwordHash is NOT selected → secure by default
      },
      orderBy: { createdAt: 'desc' },
    });

    // --- 4. Return in same shape as Mongo ---
    return NextResponse.json({ customers: clients }, { status: 200 });
  } catch (error) {
    console.error('Error fetching customers:', error);

    // Optional: log error
    await prisma.uploadLog.create({
      data: {
        adminId,
        uploadType: 'CLIENT_READ',
        fileName: null,
        rowsInserted: 0,
        notes: `ERROR: Failed to read clients – ${error.message}`,
      },
    }).catch(() => {});

    return NextResponse.json(
      { message: 'Failed to fetch customers', error: error.message },
      { status: 500 }
    );
  }
}