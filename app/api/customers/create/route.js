// app/api/customers/create/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { userName } from '@/utils/userNameGenerator';
import { tempPassword } from '@/utils/passwordGenerator';
import { sendAuthEmail } from '@/lib/emailService';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  // --- 1. Auth Check ---
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const adminId = Number(session.user.id);

  try {
    // --- 2. Parse & Validate Input ---
    const body = await request.json();
    const {
      email1,
      email2,
      email3,
      companyName,
      subCorporate,
      subEntity,
      mobileNo = null,
      gstNo = null,
      addressLine1 = '',
      addressLine2 = '',
    } = body;

    if (!email1 || !companyName) {
      return NextResponse.json(
        { message: 'Missing required fields: email1, companyName' },
        { status: 400 }
      );
    }

    // --- 3. Build Data ---
    const emails = [email1];
    if (email2) emails.push(email2);
    if (email3) emails.push(email3);

    const address = [addressLine1, addressLine2]
      .filter(Boolean)
      .join(', ')
      .trim() || null;

    const generatedUsername = userName(); // e.g., "client_abc123"
    const generatedPassword = tempPassword(); // e.g., "Temp@123"

    const passwordHash = await bcrypt.hash(generatedPassword, 12);

    // --- 4. Create Client in DB (Prisma + SQL Server) ---
    const client = await prisma.client.create({
      data: {
        username: generatedUsername,
        passwordHash,
        email1,
        email2: email2 || null,
        email3: email3 || null,
        mobileNo,
        companyName,
        subCorporate,
        subEntity,
        gstNo,
        address,
        createdByAdminId: adminId,
      },
    });

    // --- 5. Send Email ---
    try {
      await sendAuthEmail(
        emails,
        generatedUsername,
        generatedPassword,
        companyName,
        gstNo
      );
    } catch (emailError) {
      console.error('Email failed (but client created):', emailError);
      // Don't fail the whole request — client is already created
    }

    // --- 6. Optional: Log to UploadLog ---
    await prisma.uploadLog.create({
      data: {
        adminId,
        uploadType: 'CLIENT_CREATE',
        fileName: null,
        rowsInserted: 1,
        notes: `Created client: ${companyName}, username: ${generatedUsername}`,
      },
    });

    // --- 7. Success Response ---
    return NextResponse.json(
      {
        message: 'Customer created successfully',
        clientId: client.clientId,
        username: generatedUsername,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating customer:', error);

    // --- Handle Unique Constraint Violations ---
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'unknown';
      return NextResponse.json(
        { message: `Duplicate ${field}. Already exists.` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to create customer', error: error.message },
      { status: 500 }
    );
  }
}