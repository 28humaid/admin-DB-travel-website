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
    const body = await request.json();
    const { clientId, companyName, mobileNo, subCorporate, subEntity, gstNo, address } = body;

    if (!clientId) {
      return NextResponse.json({ message: "Customer ID is required" }, { status: 400 });
    }

    const updateData = {};
    if (companyName !== undefined) updateData.companyName = companyName;
    if (mobileNo !== undefined) updateData.mobileNo = mobileNo || null;
    if (subCorporate !== undefined) updateData.subCorporate = subCorporate;
    if (subEntity !== undefined) updateData.subEntity = subEntity;
    if (gstNo !== undefined) updateData.gstNo = gstNo || null;
    if (address !== undefined) updateData.address = address || null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "No valid fields to update" }, { status: 400 });
    }

    const customer = await prisma.client.update({
      where: { clientId: parseInt(clientId) },
      data: updateData,
      select: {
        clientId: true,
        email1: true,
        email2: true,
        email3: true,
        companyName: true,
        mobileNo: true,
        subCorporate: true,
        subEntity: true,
        gstNo: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ customer }, { status: 200 });
  } catch (error) {
    console.error("Update error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Unique constraint failed", field: error.meta?.target },
        { status: 400 }
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Failed to update customer" }, { status: 500 });
  }
}