import express from "express";
import auth from "../middlewares/auth.middleware.js";
import role from "../middlewares/role.middleware.js";
import { 
    assignInterviewer, 
    submitFeedback, 
    getMyInterviews,
    getInterviewsByJob,
    getInterviewFeedback,
    getAllInterviews,
} from "../controllers/interview.controller.js";

const router = express.Router();

// Get all interviews in the org (Admin/Recruiter)
router.get(
    "/",
    auth,
    role("ADMIN", "RECRUITER"),
    getAllInterviews
);


// Get my assigned interviews (Interviewer)
router.get(
    "/my",
    auth,
    role("INTERVIEWER"),
    getMyInterviews
);

// Get interviews for a specific job (Recruiter)
router.get(
    "/job/:jobId",
    auth,
    role("RECRUITER"),
    getInterviewsByJob
);

// Get feedback for an interview
router.get(
    "/:interviewId/feedback",
    auth,
    getInterviewFeedback
);

// Assign interviewer (Recruiter)
router.post(
    "/assign", 
    auth, 
    role("RECRUITER"), 
    assignInterviewer
);

// Submit feedback (Interviewer)
router.post(
    "/:interviewId/feedback",
    auth,
    role("INTERVIEWER"),
    submitFeedback
);

export default router;