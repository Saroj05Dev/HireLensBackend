import { Router, Request } from "express";
import multer, { FileFilterCallback } from "multer";
import * as profileController from "../controllers/profile.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { zodValidate } from "../middlewares/zodValidate.middleware.js";
import { updateProfileSchema } from "../validators/profile.validator.js";
import ApiError from "../utils/ApiError.js";

const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new ApiError(400, "Only image files are allowed") as unknown as Error);
    }
  },
});

// All routes require authentication
router.use(authMiddleware);

// Get current user profile
router.get("/", profileController.getProfile);

// Update profile (name, title)
router.put("/", zodValidate(updateProfileSchema), profileController.updateProfile);

// Upload avatar
router.post("/avatar", upload.single("avatar"), profileController.uploadAvatar);

export default router;