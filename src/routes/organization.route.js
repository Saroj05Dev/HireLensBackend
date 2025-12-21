import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import role from '../middlewares/role.middleware.js';
import { inviteUser, acceptInvite, getOrganizationMembers } from "../controllers/organization.controller.js";

const router = express.Router();

router.post('/invite', auth, role('ADMIN'), inviteUser);
router.post('/accept-invite', acceptInvite);

// Get organization members
router.get("/members", auth, role('ADMIN'), getOrganizationMembers);

export default router;