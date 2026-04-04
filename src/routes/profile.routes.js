import express from 'express';
import multer from 'multer';
import * as profileController from '../controllers/profile.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// All routes require authentication
router.use(authMiddleware);

// Get current user profile
router.get('/', profileController.getProfile);

// Update profile (name, title)
router.put('/', profileController.updateProfile);

// Upload avatar
router.post('/avatar', upload.single('avatar'), profileController.uploadAvatar);

export default router;
