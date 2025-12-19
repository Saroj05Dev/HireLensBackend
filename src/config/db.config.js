import mongoose from "mongoose";
import { SERVER_CONFIG } from "./server.config.js";

const connectDB = async () => {
  try {
    await mongoose.connect(SERVER_CONFIG.MONGO_URL);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
};

export default connectDB;