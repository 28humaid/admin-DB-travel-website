import mongoose, { Schema, models } from "mongoose";

const bookingsSchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Customer", // References the Customer model (customers collection)
      required: true,
    },
    sNo: {
      type: Number,
      required: true,
    },
    dateOfBooking: {
      type: Date,
      // required: true,
    },
    pnrTicket: {
      type: String,
      required: true,
      unique:true,
    },
    dateOfTravel: {
      type: Date,
      // required: true,
    },
    passengerName: {
      type: String,
      // required: true,
    },
    sector: {
      type: String,
      required: true,
    },
    originStn: {
      type: String,
      // required: true,
    },
    destinationStn: {
      type: String,
      // required: true,
    },
    class: {
      type: String,
      // required: true,
    },
    quota: {
      type: String,
      // required: true,
    },
    noOfPax: {
      type: Number,
      // required: true,
      min: [1, "Number of passengers must be at least 1"],
    },
    ticketAmount: {
      type: Number,
      // required: true,
      min: [0, "Ticket amount cannot be negative"],
    },
    charges: {
      type: Number,
      // required: true,
      min: [0, "Charges cannot be negative"],
    },
    gst18: {
      type: Number,
      // required: true,
      min: [0, "GST cannot be negative"],
    },
    totalAmount: {
      type: Number,
      // required: true,
      min: [0, "Total amount cannot be negative"],
    },
    bookingId: {
      type: String,
      required: true,
      unique:true,
    },
    corporateName: {
      type: String,
      // required: true,
    },
    entityName: {
      type: String,
      required: false,
    },
    nttBillNo: {
      type: String,
      required: false,
    },
    invoiceNo: {
      type: String,
      required: false,
    },
    gstNo: {
      type: String,
      required: false,
    },
    cgst: {
      type: Number,
      required: false,
      min: [0, "CGST cannot be negative"],
    },
    sgst: {
      type: Number,
      required: false,
      min: [0, "SGST cannot be negative"],
    },
    igst: {
      type: Number,
      required: false,
      min: [0, "IGST cannot be negative"],
    },
    utgst: {
      type: Number,
      required: false,
      min: [0, "UTGST cannot be negative"],
    },
    statementPeriod: {
      type: String,
      required: false,
    },
    vendeeName: {
      type: String,
      required: false,
    },
    uploadId: {
      type: Schema.Types.ObjectId,
      ref: "Upload", // References the Upload model (optional uploads collection)
      required: false,
    },
  },
  {
    collection: "bookings", // Explicit collection name
    timestamps: true, // Adds createdAt and updatedAt
  }
);

bookingsSchema.index({ companyId: 1 });

const Booking = models.Booking || mongoose.model("Booking", bookingsSchema);
export default Booking;