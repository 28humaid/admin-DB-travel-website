import mongoose, { Schema, models } from "mongoose";

const refundsSchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Customer", // References the Customer model (customers collection)
      required: true,
    },
    refundDate: {
      type: Date,
      // required: true,
    },
    pnrNo: {
      type: String,
      required: true,
    },
    refund: {
      type: Number,
      // required: true,
      min: [0, "Refund amount cannot be negative"],
    },
    corporate: {
      type: String,
      // required: true,
    },
    uploadId: {
      type: Schema.Types.ObjectId,
      ref: "Upload", // References the Upload model (optional uploads collection)
      // required: false,
    },
  },
  {
    collection: "refunds", // Explicit collection name
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const Refund = models.Refund || mongoose.model("Refund", refundsSchema);
export default Refund;