import * as profileService from '../services/profile.service.js';

export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await profileService.getProfile(userId);
        
        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;
        
        const updatedProfile = await profileService.updateProfile(userId, updates);
        
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedProfile
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

export const uploadAvatar = async (req, res) => {
    try {
        const userId = req.user.id;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        
        const avatarUrl = await profileService.uploadAvatar(userId, req.file);
        
        res.status(200).json({
            success: true,
            message: 'Avatar uploaded successfully',
            data: { avatarUrl }
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};
