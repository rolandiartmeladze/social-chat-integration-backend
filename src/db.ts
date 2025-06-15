import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI || "";

export async function connectDB() {
  try {
    await mongoose.connect(uri);
    console.log("Base is connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
