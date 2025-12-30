import { Router } from "express";
import { 
    getCandidateTimeInStage,
    getJobFunnel,
    getPipelineSummary
} from "../controllers/analytics.controller.js";

import auth from "../middlewares/auth.middleware.js";
import role from "../middlewares/role.middleware.js";

const router = Router();

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

/**
 * Org pipeline summary
 */
router.get(
  "/pipeline/summary",
  auth,
  role("ADMIN", "RECRUITER"),
  getPipelineSummary
);

export default router;