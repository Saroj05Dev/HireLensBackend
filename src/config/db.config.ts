import { prisma } from "./prisma.js";
import { SERVER_CONFIG } from "./server.config.js";

const connectDB = async (retries: number = 5, delay: number = 5000): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log("Prisma connected successfully");
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Prisma connection attempt ${i + 1} failed:`, errorMessage);

      if (i < retries - 1) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error("Prisma connection failed after all retries");
        process.exit(1);
      }
    }
  }
};

export default connectDB;