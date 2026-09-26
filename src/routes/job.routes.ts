import express from "express";
import auth from "../middlewares/auth.middleware.js";
import role from "../middlewares/role.middleware.js";
import { zodValidate } from "../middlewares/zodValidate.middleware.js";
import {
    createJobSchema,
    updateJobSchema,
} from "../validators/job.validator.js";
import {
  createJob,
  getJobs,
  closeJob,
  reopenJob,
  getJobById,
  updateJob,
  deleteJob,
} from "../controllers/job.controller.js";

const router = express.Router();

// Create job - Only ADMIN & RECRUITER
router.post("/", auth, role("ADMIN", "RECRUITER"), zodValidate(createJobSchema), createJob);

// Get all jobs for organization - Only ADMIN & RECRUITER
router.get("/", auth, role("ADMIN", "RECRUITER"), getJobs);

// Get job by ID - Only ADMIN & RECRUITER
router.get("/:jobId", auth, role("ADMIN", "RECRUITER"), getJobById);

// Update job - Only ADMIN & RECRUITER
router.put("/:jobId", auth, role("ADMIN", "RECRUITER"), zodValidate(updateJobSchema), updateJob);

// Delete job - Only ADMIN & RECRUITER
router.delete("/:jobId", auth, role("ADMIN", "RECRUITER"), deleteJob);

// Close job - Only ADMIN & RECRUITER
router.patch("/:jobId/close", auth, role("ADMIN", "RECRUITER"), closeJob);

// Reopen job - Only ADMIN & RECRUITER
router.patch("/:jobId/reopen", auth, role("ADMIN", "RECRUITER"), reopenJob);

export default router;
