import mongoose from "mongoose";
import dotenv from "dotenv";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import Job from "../models/Job.js";
import Candidate from "../models/Candidate.js";
import Interview from "../models/Interview.js";
import InterviewFeedback from "../models/InterviewFeedback.js";
import DecisionLog from "../models/DecisionLog.js";

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGO_URL || process.env.MONGODB_URI || "mongodb://localhost:27017/hirelens";

const cleanDatabase = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("\n🗑️  Cleaning database...");
    
    const results = await Promise.all([
      DecisionLog.deleteMany({}),
      InterviewFeedback.deleteMany({}),
      Interview.deleteMany({}),
      Candidate.deleteMany({}),
      Job.deleteMany({}),
      User.deleteMany({}),
      Organization.deleteMany({})
    ]);

    console.log("\n📊 Deletion Summary:");
    console.log(`   Decision Logs: ${results[0].deletedCount}`);
    console.log(`   Interview Feedbacks: ${results[1].deletedCount}`);
    console.log(`   Interviews: ${results[2].deletedCount}`);
    console.log(`   Candidates: ${results[3].deletedCount}`);
    console.log(`   Jobs: ${results[4].deletedCount}`);
    console.log(`   Users: ${results[5].deletedCount}`);
    console.log(`   Organizations: ${results[6].deletedCount}`);

    console.log("\n✅ Database cleaned successfully!");
    
    await mongoose.connection.close();
    console.log("👋 Connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error cleaning database:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

cleanDatabase();
