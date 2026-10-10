import express, { Request, Response, NextFunction } from "express";
import http from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import helmet from "helmet";
import { SERVER_CONFIG } from "./config/server.config.js";
import connectDB from "./config/db.config.js";
import initSocket from "./config/socket.js";
import { handleDatabaseError } from "./utils/errorHandler.js";
import { connectRedis } from "./config/redis.js";
import { redis } from "./config/redis.js";

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

// authLimiter is declared here and assigned inside startServer() after Redis connects
let authLimiter: ReturnType<typeof rateLimit>;

// Security headers
app.use(helmet());

// CORS
const allowedOrigins: string[] = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000", // Additional local dev ports
  "https://hire-lens-frontend-ebon.vercel.app", // Production frontend
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.log(`CORS: origin ${origin} not allowed. Allowed origins:`, allowedOrigins);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);

// Body parsing with size limits
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Custom MongoDB injection protection middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const sanitize = (obj: any): any => {
    if (obj && typeof obj === "object") {
      Object.keys(obj).forEach((key) => {
        if (key.startsWith("$") || key.includes(".")) {
          delete obj[key];
        } else if (typeof obj[key] === "object") {
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

// Root check
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, HireLens Backend!");
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Global Error Handler (must be after all routes)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err?.name === "MulterError") {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Resume file size must be 5MB or less"
        : err.message;

    return res.status(400).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }

  // Handle database and ApiErrors
  const finalError = handleDatabaseError(err);

  const statusCode = finalError.statusCode || 500;
  const message = finalError.message || "Internal Server Error";

  // Log error for debugging
  console.error(`[ERROR] ${statusCode}: ${message}`, err);

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

async function startServer() {
  try {
    await Promise.all([connectDB(), connectRedis()]);

    // Redis is now connected — safe to create RedisStore instances
    const createRateLimitStore = (prefix: string): RedisStore =>
      new RedisStore({
        prefix,
        sendCommand: (...args: string[]) => redis.sendCommand(args),
      });

    // Global rate limiter — applied to all routes
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10000, // 10,000 requests per 15 minutes
      store: createRateLimitStore("rate-limit:global:"),
      passOnStoreError: true,
      message: "Too many requests from this IP, please try again later.",
      standardHeaders: true,
      legacyHeaders: false,
    });
    app.use(limiter);

    // Auth route rate limiter
    authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      store: createRateLimitStore("rate-limit:auth:"),
      passOnStoreError: true,
      message: "Too many authentication attempts, please try again later.",
    });

    // API Routes — registered after Redis is ready so authLimiter is fully initialized
    app.use("/api/v1/auth", authLimiter, authRoutes);
    app.use("/api/v1/jobs", jobRoutes);
    app.use("/api/v1/organizations", organizationRoutes);
    app.use("/api/v1/candidates", candidateRoutes);
    app.use("/api/v1/interviews", interviewRoutes);
    app.use("/api/v1/analytics", analyticsRoutes);
    app.use("/api/v1/notifications", notificationRoutes);
    app.use("/api/v1/profile", profileRoutes);

    server.listen(SERVER_CONFIG.PORT, () => {
      console.log(`Server is running on port ${SERVER_CONFIG.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1); // Exit the process with an error code
  }
}

startServer();