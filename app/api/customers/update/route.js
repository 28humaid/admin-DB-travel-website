import { NextResponse } from "next/server";
import Customer from "@/models/customer";
import { connectMongoDB } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/getAuthSession";

export async function PUT(request) {
  const session = await getAuthSession(request);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectMongoDB();
    const { id, ...updateData } = await request.json(); // Expect { id, emails, companyName, phoneNumber, subEntity, gstNumber, address }
    const customer = await Customer.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password'); // Exclude password
    if (!customer) {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json({ customer }, { status: 200 });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { message: "Failed to update customer", error: error.message },
      { status: 500 }
    );
  }
}