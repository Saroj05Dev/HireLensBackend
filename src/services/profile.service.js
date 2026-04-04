import User from '../models/User.js';
import cloudinary from '../config/cloudinary.config.js';
import ApiError from '../utils/ApiError.js';

export const getProfile = async (userId) => {
    const user = await User.findById(userId)
        .populate('organizationId', 'name')
        .select('-password');
    
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId._id,
        organizationName: user.organizationId.name,
        avatarUrl: user.avatarUrl,
        title: user.title,
        createdAt: user.createdAt
    };
};

export const updateProfile = async (userId, updates) => {
    const allowedUpdates = ['name', 'title'];
    const filteredUpdates = {};
    
    allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            filteredUpdates[field] = updates[field];
        }
    });
    
    const user = await User.findByIdAndUpdate(
        userId,
        filteredUpdates,
        { new: true, runValidators: true }
    ).populate('organizationId', 'name');
    
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId._id,
        organizationName: user.organizationId.name,
        avatarUrl: user.avatarUrl,
        title: user.title
    };
};

export const uploadAvatar = async (userId, file) => {
    try {
        // Upload to cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'hirelens/avatars',
                    public_id: `avatar_${userId}`,
                    overwrite: true,
                    transformation: [
                        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                        { quality: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            
            uploadStream.end(file.buffer);
        });
        
        // Update user with new avatar URL
        const user = await User.findByIdAndUpdate(
            userId,
            { avatarUrl: result.secure_url },
            { new: true }
        );
        
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        
        return result.secure_url;
    } catch (error) {
        throw new ApiError(500, 'Failed to upload avatar: ' + error.message);
    }
};
