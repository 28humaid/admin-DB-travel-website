import { getAuthSession } from "@/lib/getAuthSession";
import { connectMongoDB } from "@/lib/mongodb";
import Customer from "@/models/customer";
import Booking from "@/models/bookingsSchema";
import Refund from "@/models/refundsSchema";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function DELETE(request) {
  const session = await getAuthSession(request);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongoDB();
    const { id } = await request.json(); // Expect { id: '_id' } in body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid customer ID" }, { status: 400 });
    }

    // Start a MongoDB transaction
    const mongoSession = await mongoose.startSession({ maxCommitTimeMS: 60000 });
    let deletedCustomer;

    await mongoSession.withTransaction(async () => {
      // Delete the customer
      deletedCustomer = await Customer.findByIdAndDelete(id, { session: mongoSession });

      if (!deletedCustomer) {
        throw new Error("Customer not found");
      }

      // Delete related bookings and refunds
      await Booking.deleteMany({ companyId: id }, { session: mongoSession });
      await Refund.deleteMany({ companyId: id }, { session: mongoSession });
    });

    mongoSession.endSession();

    if (!deletedCustomer) {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Customer and related bookings and refunds deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting customer and related data:", error);
    return NextResponse.json(
      { message: "Failed to delete customer and related data", error: error.message },
      { status: 500 }
    );
  }
}