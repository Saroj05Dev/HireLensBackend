import mongoose from "mongoose";
import { SERVER_CONFIG } from "./server.config.js";

const connectDB = async (retries: number = 5, delay: number = 5000): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(SERVER_CONFIG.MONGO_URL);
      console.log("MongoDB connected successfully");
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`MongoDB connection attempt ${i + 1} failed:`, errorMessage);

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