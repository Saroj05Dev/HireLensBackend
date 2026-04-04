import mongoose from "mongoose";
import { SERVER_CONFIG } from "./server.config.js";

const connectDB = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(SERVER_CONFIG.MONGO_URL);
      console.log("MongoDB connected successfully");
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${i + 1} failed:`, error.message);
      
      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error("MongoDB connection failed after all retries");
        process.exit(1);
      }
    }
  }
};

export default connectDB;