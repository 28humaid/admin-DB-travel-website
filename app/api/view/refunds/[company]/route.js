// app/api/view/refunds/[company]/route.js
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getAuthSession';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  const { company } = await params; // FIXED: Correct param name (matches folder)
  
  try {
    // ---- 1. Auth ----
    const session = await getAuthSession(request);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Authentication failed. Please log in again.' },
        { status: 401 }
      );
    }

    // ---- 2. Convert ID to clientId ----
    const clientId = Number(company); // FIXED: added radix
    if (isNaN(clientId)) {
      return NextResponse.json(
        { error: "Invalid company ID" },
        { status: 400 }
      );
    }

    // ---- 3. Query Prisma ----
    const refunds = await prisma.refund.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });

    // if (!refunds.length) {
    //   return NextResponse.json(
    //     { message: 'No refunds found for this company.' },
    //     { status: 404 }
    //   );
    // }

    // ---- 4. Success ----
    return NextResponse.json(
      { message: 'Refunds retrieved successfully', data: refunds },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching refunds:', error);

    return NextResponse.json(
      { message: 'Server error (Error 500). Please try again later.' },
      { status: 500 }
    );
  }
}
