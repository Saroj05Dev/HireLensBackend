import express from "express";
import cookieParser from "cookie-parser";
import { SERVER_CONFIG } from "./config/server.config.js";
import connectDB from "./config/db.config.js";

import authRoutes from "./routes/auth.routes.js";
import jobRoutes from "./routes/job.routes.js";
import organizationRoutes from "./routes/organization.route.js";
import candidateRoutes from "./routes/candidate.routes.js";

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
app.use("/api/v1/organizations", organizationRoutes);
app.use("/api/v1/candidates", candidateRoutes);


// Global Error Handler (must be after all routes)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log error for debugging
  console.error(`[ERROR] ${statusCode}: ${message}`, err);

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start the server and connect to the database
app.listen(SERVER_CONFIG.PORT, async () => {
  console.log(`Server is running on port ${SERVER_CONFIG.PORT}`);
  await connectDB();
});
