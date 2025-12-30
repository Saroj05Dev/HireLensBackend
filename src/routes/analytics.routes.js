import { Router } from "express";
import { getCandidateTimeInStage } from "../controllers/analytics.controller.js";

import auth from "../middlewares/auth.middleware.js";
import role from "../middlewares/role.middleware.js";

const router = Router();

// Candidate time-in-stage
router.get(
    "/candidates/:candidateId/time-in-stage",
    auth,
    role("ADMIN", "RECRUITER"),
    getCandidateTimeInStage
)

export default router;