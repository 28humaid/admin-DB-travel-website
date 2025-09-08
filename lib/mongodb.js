// lib/mongodb.js
import mongoose from 'mongoose';

export async function connectMongoDB() {
  if (mongoose.connection.readyState >= 1) {
    console.log('Already connected to MongoDB');
    return;
  }
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    console.log('Connecting to MongoDB with URI:', uri.replace(/:([^@]+)@/, ':<hidden>@')); // Hide password
    await mongoose.connect(uri, {
      dbName: 'adminDatabase',
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error.message, error);
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

// import mongoose from "mongoose"

// export const connectMongoDB = async() =>{
//   try {
//     await mongoose.connect(process.env.MONGODB_URI)
//     // TEST KRNE K LIYE YE PRINT KRWA RHA HU
//     console.log("Conneected to MongoDB");
//   } catch (error) {
//     console.log("yyyyError connecting to MongoDB",error);
//   }
// }