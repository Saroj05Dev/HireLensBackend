import { Router } from "express";
import { 
    getCandidateTimeInStage,
    getJobFunnel,
    getPipelineSummary,
    getTimeToHire,
    getDashboardStats,
    getRecentActivity,
    getCandidatesByStage
} from "../controllers/analytics.controller.js";

import auth from "../middlewares/auth.middleware.js";
import role from "../middlewares/role.middleware.js";

const router = Router();

/**
 * Dashboard stats
 */
router.get(
  "/dashboard/stats",
  auth,
  role("ADMIN", "RECRUITER"),
  getDashboardStats
);

/**
 * Recent activity feed
 */
router.get(
  "/dashboard/activity",
  auth,
  role("ADMIN", "RECRUITER"),
  getRecentActivity
);

/**
 * Candidates by stage breakdown
 */
router.get(
  "/dashboard/candidates-by-stage",
  auth,
  role("ADMIN", "RECRUITER"),
  getCandidatesByStage
);

/**
 * Org pipeline summary
 */
router.get(
  "/pipeline/summary",
  auth,
  role("ADMIN", "RECRUITER"),
  getPipelineSummary
);

// Candidate time-in-stage
router.get(
    "/candidates/:candidateId/time-in-stage",
    auth,
    role("ADMIN", "RECRUITER"),
    getCandidateTimeInStage
);

/**
 * Job funnel analytics
 */
router.get(
  "/jobs/:jobId/funnel",
  auth,
  role("ADMIN", "RECRUITER"),
  getJobFunnel
);

router.get(
  "/jobs/:jobId/time-to-hire",
  auth,
  role("ADMIN", "RECRUITER"),
  getTimeToHire
);

export default router;