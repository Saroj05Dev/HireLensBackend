import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import role from '../middlewares/role.middleware.js';
import { addCandidate } from '../controllers/candidate.controller.js';

const router = express.Router();

// Add candidate - Only ADMIN & RECRUITER
router.post(
    "/", 
    auth, 
    role("ADMIN", "RECRUITER"), 
    addCandidate
);

export default router;