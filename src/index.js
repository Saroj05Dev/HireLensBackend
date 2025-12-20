import express from "express";
import cookieParser from "cookie-parser";
import { SERVER_CONFIG } from "./config/server.config.js";
import connectDB from "./config/db.config.js";

import authRoutes from "./routes/auth.routes.js";
import jobRoutes from "./routes/job.routes.js";

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.send("Hello, HireLens Backend!");
});

// Auth routes (register, login later)
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/jobs", jobRoutes);

// Start the server and connect to the database
app.listen(SERVER_CONFIG.PORT, async () => {
  console.log(`Server is running on port ${SERVER_CONFIG.PORT}`);
  await connectDB();
});
