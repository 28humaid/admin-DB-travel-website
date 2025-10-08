import { NextResponse } from "next/server";
import Customer from "@/models/customer";
import { connectMongoDB } from "@/lib/mongodb";
import { getAuthSession } from "@/lib/getAuthSession";

export async function GET(request) {
    const session = await getAuthSession(request)
    // console.log("xyxyxyyxx",session);
    
      if (!session || session.user.role !== "admin"){
        // console.log(session);
        // console.log('sdfsdfsfsdfsd Session user role:',session.user.role);
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
  try {
    await connectMongoDB();
    const customers = await Customer.find({}); // Exclude password for security
    return NextResponse.json({ customers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { message: "Failed to fetch customers", error: error.message },
      { status: 500 }
    );
  }
}