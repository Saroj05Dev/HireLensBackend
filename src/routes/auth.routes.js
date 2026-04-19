import express from "express";
import { register, login, refresh, logout, fetchMe, validateInviteToken, acceptInvite, sendOTP, verifyOTP, sendPasswordResetOTP, verifyPasswordResetOTP, resetPassword } from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/forgot-password", sendPasswordResetOTP);
router.post("/verify-reset-otp", verifyPasswordResetOTP);
router.post("/reset-password", resetPassword);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/me", authMiddleware, fetchMe);
router.get("/invites/:token/validate", validateInviteToken);
router.post("/accept-invite", acceptInvite);

export default router;