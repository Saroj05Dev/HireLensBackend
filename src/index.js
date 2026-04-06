import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { SERVER_CONFIG } from "./config/server.config.js";
import connectDB from "./config/db.config.js";
import initSocket from "./config/socket.js";

import authRoutes from "./routes/auth.routes.js";
import jobRoutes from "./routes/job.routes.js";
import organizationRoutes from "./routes/organization.route.js";
import candidateRoutes from "./routes/candidate.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import profileRoutes from "./routes/profile.routes.js";

const app = express();

const server = http.createServer(app);

initSocket(server);

// Rate limiting - Very generous limits for production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // 10,000 requests per 15 minutes (very generous)
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// Rate limiting for auth routes - still protective but reasonable
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 auth requests per 15 minutes (plenty for normal use)
  message: "Too many authentication attempts, please try again later.",
});

// Middlewares
// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom MongoDB injection protection middleware
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      });
    }
    return obj;
  };
  
  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  
  next();
});

// Routes
app.get("/", (req, res) => {
  res.send("Hello, HireLens Backend!");
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Auth routes (register, login later)
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/organizations", organizationRoutes);
app.use("/api/v1/candidates", candidateRoutes);
app.use("/api/v1/interviews", interviewRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/profile", profileRoutes);

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
server.listen(SERVER_CONFIG.PORT, async () => {
  console.log(`Server is running on port ${SERVER_CONFIG.PORT}`);
  await connectDB();
});
