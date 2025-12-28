import express from "express";
import auth from "../middlewares/auth.middleware.js";
import role from "../middlewares/role.middleware.js";
import { assignInterviewer, submitFeedback } from "../controllers/interview.controller.js";

const router = express.Router();

// Assign interviewer
router.post(
    "/assign", 
    auth, 
    role("RECRUITER"), 
    assignInterviewer
);

router.post(
    "/:interviewId/feedback",
    auth,
    role("INTERVIEWER"),
    submitFeedback
)

export default router;