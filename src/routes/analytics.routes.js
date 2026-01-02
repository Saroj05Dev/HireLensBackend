import { Router } from "express";
import { 
    getCandidateTimeInStage,
    getJobFunnel,
    getPipelineSummary,
    getTimeToHire
} from "../controllers/analytics.controller.js";

import auth from "../middlewares/auth.middleware.js";
import role from "../middlewares/role.middleware.js";

const router = Router();
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
)
export default router;