import mongoose from 'mongoose';

export async function connectMongoDB() {
  if (mongoose.connection.readyState >= 1) {
    console.log('Already connected to MongoDB');
    return;
  }
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('xxxyyyMONGODB_URI is not defined in environment variables');
    }
    await mongoose.connect(uri, {
      dbName: 'adminDatabase',
    });
    console.log('xxyyConnected to MongoDB');
  } catch (error) {
    console.error('xxyyMongoDB connection error:', error.message, error);
    throw new Error(`xxyyDatabase connection failed: ${error.message}`);
  }
}