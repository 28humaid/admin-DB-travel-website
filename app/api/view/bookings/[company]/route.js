// app/api/view/bookings/[company]/route.js
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getAuthSession';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  const { company } = await params;  // FIX 1

  try {
    // ---- 1. Auth ----
    const session = await getAuthSession(request);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Authentication failed. Please log in again.' },
        { status: 401 }
      );
    }

    // ---- 2. Convert company → clientId ----
    const clientId = Number(company);  // FIX 2
    if (isNaN(clientId)) {
      return NextResponse.json(                // FIX 3
        { error: "Invalid company ID" },
        { status: 400 }
      );
    }

    // ---- 3. Query Prisma ----
    const bookings = await prisma.booking.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });

    // if (!bookings.length) {
    //   return NextResponse.json(
    //     { message: 'No bookings found for this company.' },
    //     { status: 404 }
    //   );
    // }

    // ---- 4. Success ----
    return NextResponse.json(
      { message: 'Bookings retrieved successfully', data: bookings },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching bookings:', error);

    return NextResponse.json(
      { message: 'Server error (Error 500). Please try again later.' },
      { status: 500 }
    );
  }
}
