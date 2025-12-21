import express from 'express';
import auth from '../middlewares/auth.middleware.js';
import role from '../middlewares/role.middleware.js';
import { inviteUser } from "../controllers/organization.controller.js";

const router = express.Router();

router.post('/invite', auth, role('ADMIN'), inviteUser);

export default router;