import express from "express";
import auth from "../middlewares/auth.middleware.js";
import role from "../middlewares/role.middleware.js";
import { createJob, getJobs, closeJob, reopenJob, getJobById } from "../controllers/job.controller.js";

const router = express.Router();

// Create job - Only ADMIN & RECRUITER
router.post("/", auth, role("ADMIN", "RECRUITER"), createJob);

// Get all jobs for organization - Only ADMIN & RECRUITER
router.get("/", auth, role("ADMIN", "RECRUITER"), getJobs);

// Get job by ID - Only ADMIN & RECRUITER
router.get("/:jobId", auth, role("ADMIN", "RECRUITER"), getJobById);

// Close job - Only ADMIN & RECRUITER
router.patch("/:jobId/close", auth, role("ADMIN", "RECRUITER"), closeJob);

// Reopen job - Only ADMIN & RECRUITER
router.patch("/:jobId/reopen", auth, role("ADMIN", "RECRUITER"), reopenJob);

export default router;
