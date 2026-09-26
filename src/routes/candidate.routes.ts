import { Router, Request } from "express";
import multer, { FileFilterCallback } from "multer";
import ApiError from "../utils/ApiError.js";
import auth from "../middlewares/auth.middleware.js";
import role from "../middlewares/role.middleware.js";
import { zodValidate } from "../middlewares/zodValidate.middleware.js";
import {
  addCandidateSchema,
  updateStageSchema,
  candidateIdParamSchema,
  jobIdParamSchema,
} from "../validators/candidate.validator.js";
import {
  addCandidate,
  parseResume,
  getCandidatesByJob,
  getCandidateProfile,
  updateCandidateStage,
  reopenCandidate,
  getAllCandidates,
  getCandidateDecisionLogs,
  getInterviewsByCandidate,
} from "../controllers/candidate.controller.js";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, "Only PDF, DOC and DOCX files are allowed") as unknown as Error);
    }
  },
});

// Add candidate - Only ADMIN & RECRUITER
router.post(
  "/parse-resume",
  auth,
  role("ADMIN", "RECRUITER"),
  upload.single("resume"),
  parseResume
);

// Add candidate - Only ADMIN & RECRUITER
router.post(
  "/",
  auth,
  role("ADMIN", "RECRUITER"),
  upload.single("resume"),
  zodValidate(addCandidateSchema),
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
  zodValidate(jobIdParamSchema, "params"),
  getCandidatesByJob
);

router.get(
  "/:candidateId",
  auth,
  role("ADMIN", "RECRUITER", "INTERVIEWER"),
  zodValidate(candidateIdParamSchema, "params"),
  getCandidateProfile
);

router.patch(
  "/:candidateId/stage",
  auth,
  role("RECRUITER"),
  zodValidate(candidateIdParamSchema, "params"),
  zodValidate(updateStageSchema),
  updateCandidateStage
);

router.patch(
  "/:candidateId/reopen",
  auth,
  role("RECRUITER"),
  zodValidate(candidateIdParamSchema, "params"),
  reopenCandidate
);

router.get(
  "/:candidateId/decision-logs",
  auth,
  role("ADMIN", "RECRUITER", "INTERVIEWER"),
  zodValidate(candidateIdParamSchema, "params"),
  getCandidateDecisionLogs
);

router.get(
  "/:candidateId/interviews",
  auth,
  role("ADMIN", "RECRUITER", "INTERVIEWER"),
  zodValidate(candidateIdParamSchema, "params"),
  getInterviewsByCandidate
);

export default router;