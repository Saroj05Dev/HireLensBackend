import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import role from '../middlewares/role.middleware.js';
import { 
  addCandidate, 
  getCandidatesByJob, 
  getCandidateProfile, 
  updateCandidateStage,
  getAllCandidates,
  getCandidateDecisionLogs,
  getInterviewsByCandidate,
} from '../controllers/candidate.controller.js';

const router = express.Router();

// Add candidate - Only ADMIN & RECRUITER
router.post(
    "/", 
    auth, 
    role("ADMIN", "RECRUITER"), 
    addCandidate
);

// Get all candidates for organization (with filters) - Only ADMIN & RECRUITER
router.get(
    "/",
    auth,
    role("ADMIN", "RECRUITER"),
    getAllCandidates
);

router.get(
    "/job/:jobId", 
    auth, 
    role("ADMIN", "RECRUITER"), 
    getCandidatesByJob
);

router.get(
  "/:candidateId",
  auth,
  role("ADMIN", "RECRUITER", "INTERVIEWER"),
  getCandidateProfile
);

router.patch(
  "/:candidateId/stage",
  auth,
  role("RECRUITER"),
  updateCandidateStage
);

router.get(
  "/:candidateId/decision-logs",
  auth,
  role("ADMIN", "RECRUITER", "INTERVIEWER"),
  getCandidateDecisionLogs
);

router.get(
    "/:candidateId/interviews",
    auth,
    role("ADMIN", "RECRUITER", "INTERVIEWER"),
    getInterviewsByCandidate
);

export default router;