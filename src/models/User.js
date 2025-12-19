import mongoose from "mongoose";

const USER_ROLE = ["ADMIN", "RECRUITER", "INTERVIEWER"];

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true
    },

    password: {
        type: String,
        required: true,
        select: false // Exclude password from query results by default
    },

    role: {
        type: String,
        enum: USER_ROLE,
        required: true
    },

    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
        index: true
    },

    isActive: {
        type: Boolean,
        default: true
    },

    lastLoginAt: {
        type: Date
    }
}, {
    timestamps: true
});

export default mongoose.model("User", userSchema);