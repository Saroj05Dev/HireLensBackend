import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedDatabase } from "./seedData.js";

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGO_URL || process.env.MONGODB_URI || "mongodb://localhost:27017/hirelens";

const runSeed = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    await seedDatabase();

    console.log("\n✨ All done! Closing connection...");
    await mongoose.connection.close();
    console.log("👋 Connection closed");
    process.exit(0);
  } catch (error) {
    console.error("💥 Fatal error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

runSeed();
