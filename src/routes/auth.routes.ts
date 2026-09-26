import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  fetchMe,
  validateInviteToken,
  acceptInvite,
  sendOTP,
  verifyOTP,
  sendPasswordResetOTP,
  verifyPasswordResetOTP,
  resetPassword,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { zodValidate } from "../middlewares/zodValidate.middleware.js";
import {
  registerSchema,
  loginSchema,
  sendOTPSchema,
  verifyOTPSchema,
  resetPasswordSchema,
  acceptInviteSchema
 } from "../validators/auth.validator.js";

const router = Router();

router.post("/send-otp", zodValidate(sendOTPSchema), sendOTP);
router.post("/verify-otp", zodValidate(verifyOTPSchema), verifyOTP);
router.post("/forgot-password", zodValidate(sendOTPSchema), sendPasswordResetOTP);
router.post("/verify-reset-otp", zodValidate(verifyOTPSchema), verifyPasswordResetOTP);
router.post("/reset-password", zodValidate(resetPasswordSchema), resetPassword);
router.post("/register", zodValidate(registerSchema), register);
router.post("/login", zodValidate(loginSchema), login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/me", authMiddleware, fetchMe);
router.get("/invites/:token/validate", validateInviteToken);
router.post("/accept-invite", zodValidate(acceptInviteSchema), acceptInvite);

export default router;