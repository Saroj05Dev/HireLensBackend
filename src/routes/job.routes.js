import express from "express";
import auth from "../middlewares/auth.middleware.js";
import role from "../middlewares/role.middleware.js";

const router = express.Router();

// Only ADMIN & RECRUITER can create jobs
router.post(
  "/",
  auth,
  role("ADMIN", "RECRUITER"),
  (req, res) => {
    res.json({
      success: true,
      message: "Job created",
      createdBy: req.user.id
    });
  }
);

// Any authenticated user can view jobs
router.get("/", auth, (req, res) => {
  res.json({
    success: true,
    message: "Jobs fetched"
  });
});

export default router;
