// app/api/customers/create/route.js
import { NextResponse } from "next/server";
import Customer from "@/models/customer";
import { userName } from "@/utils/userNameGenerator";
import { tempPassword } from "@/utils/passwordGenerator";
import { sendAuthEmail } from "@/lib/emailService";
import { connectMongoDB } from "@/lib/mongodb";

export async function POST(request) {
  try {
    // Initialize MongoDB connection
    await connectMongoDB();

    // Extract form data from request body
    const {
      email1,
      email2,
      email3,
      companyName,
      phoneNumber,
      subEntity,
      gstNumber,
      addressLine1,
      addressLine2,
    } = await request.json();

    // Create email array
    const emails = [email1];
    if (email2) emails.push(email2);
    if (email3) emails.push(email3);

    // Combine address
    const address = `${addressLine1}${addressLine2 ? ", " + addressLine2 : ""}`;

    // Generate username and password
    const generatedUsername = userName(); // Ensure this function returns a value
    const generatedPassword = tempPassword(); // Ensure this function returns a value

    // Create new customer document
    const customer = new Customer({
      emails,
      companyName,
      phoneNumber,
      subEntity,
      gstNumber,
      address,
      username: generatedUsername,
      password: generatedPassword, // Consider hashing this in production
    });

    // Save to MongoDB
    await customer.save();

    // Send authentication email
    await sendAuthEmail(emails, generatedUsername, generatedPassword);

    return NextResponse.json(
      { message: "Customer created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { message: "Failed to create customer", error: error.message },
      { status: 500 }
    );
  }
}