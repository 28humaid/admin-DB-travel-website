import mongoose, { Schema, models } from "mongoose";

const adminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { collection: 'adminAuth' } // Explicitly set collection name
);

const Admin = models.Admin || mongoose.model("Admin", adminSchema);
export default Admin;