// Here we'll be exporting server configuration settings
import dotenv from "dotenv";
dotenv.config();

export const SERVER_CONFIG = {
  PORT: process.env.PORT || 3000,
  MONGO_URL: process.env.MONGO_URL || "mongodb://localhost:27017/hire-lens",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
};