import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import role from '../middlewares/role.middleware.js';
import { 
  addCandidate, 
  getCandidatesByJob, 
  getCandidateProfile, 
  updateCandidateStage 
} from '../controllers/candidate.controller.js';

const router = express.Router();

// Add candidate - Only ADMIN & RECRUITER
router.post(
    "/", 
    auth, 
    role("ADMIN", "RECRUITER"), 
    addCandidate
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

export default router;