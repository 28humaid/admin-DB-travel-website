// app/api/customers/update/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/getAuthSession";

export async function PUT(request) {
  const session = await getAuthSession(request);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "Customer ID is required" },
        { status: 400 }
      );
    }

    const allowed = [
      "emails",
      "companyName",
      "phoneNumber",
      "subEntity",
      "gstNumber",
      "address",
    ];

    const sanitized = {};
    for (const key of allowed) {
      if (updateData[key] !== undefined) {
        sanitized[key] = updateData[key];
      }
    }

    if (Object.keys(sanitized).length === 0) {
      return NextResponse.json(
        { message: "No valid fields to update" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: sanitized,
      select: {
        id: true,
        emails: true,
        companyName: true,
        phoneNumber: true,
        subEntity: true,
        gstNumber: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ customer }, { status: 200 });
  } catch (error) {
    console.error("Error updating customer:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Unique constraint failed", field: error.meta?.target },
        { status: 400 }
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update customer" },
      { status: 500 }
    );
  }
}