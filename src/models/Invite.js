import mongoose from "mongoose";

const INVITE_ROLE = ["RECRUITER", "INTERVIEWER"];

const inviteSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },

    role: {
        type: String,
        enum: INVITE_ROLE,
        required: true
    },

    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
        index: true
    },

    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    expiresAt: {
        type: Date,
        required: true,
        index: true
    },

    isAccepted: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true
});

// Compound index for checking pending invites by email and organization
inviteSchema.index({ email: 1, organizationId: 1, isAccepted: 1 });

// Compound index for fetching pending invites by organization
inviteSchema.index({ organizationId: 1, isAccepted: 1 });

// Compound index for cleanup operations (expired invites)
inviteSchema.index({ expiresAt: 1, isAccepted: 1 });

export default mongoose.model("Invite", inviteSchema);
