import { getAuthSession } from "@/lib/getAuthSession";
import { connectMongoDB } from "@/lib/mongodb";
import Customer from "@/models/customer";
import { NextResponse } from "next/server";

export async function DELETE(request) {
    const session = await getAuthSession();
      
      if (!session || session.user.role !== "admin"){
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
  try {
    await connectMongoDB();
    const { id } = await request.json(); // Expect { id: '_id' } in body
    const deleted = await Customer.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Customer deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { message: "Failed to delete customer", error: error.message },
      { status: 500 }
    );
  }
}