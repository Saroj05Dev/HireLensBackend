import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
        index: true
    },

    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
        index: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
    },

    phone: {
        type: String,
        trim: true
    },

    resumeUrl: {
        type: String,
    },

    currentStage: {
        type: String,
        enum: [
            "APPLIED",
            "SCREENING",
            "INTERVIEW",
            "OFFER",
            "HIRED",
            "REJECTED"
        ],
        default: "APPLIED",
        index: true
    },

    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model("Candidate", candidateSchema);