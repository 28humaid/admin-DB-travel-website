import mongoose, { Schema, models } from "mongoose";

const customerSchema = new Schema(
  {
    emails: {
      type: [String], // Array of email addresses
      required: true,
      validate: {
        validator: (arr) => arr.length > 0, // Ensure at least one email
        message: "At least one email is required",
      },
    },
    companyName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    subEntity: {
      type: String,
      required: false, // Optional based on your form
    },
    gstNumber: {
      type: String,
      required: true, // Optional based on your form
      unique:true,
    },
    address: {
      type: String,
      required: false,
    },
    username: {
      type: String,
      required: false,
      unique: true, // Ensure username is unique
    },
    password: {
      type: String,
      required: false,
    },
  },
  { collection: "customers", timestamps: true } // Explicit collection name and timestamps
);

const Customer = models.Customer || mongoose.model("Customer", customerSchema);
export default Customer;