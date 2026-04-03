import express from "express";
import { register, login, refresh, logout, fetchMe, validateInviteToken, acceptInvite } from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/me", authMiddleware, fetchMe);
router.get("/invites/:token/validate", validateInviteToken);
router.post("/accept-invite", acceptInvite);

export default router;