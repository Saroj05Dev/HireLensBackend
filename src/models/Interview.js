import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
        index: true,
    },
    
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
        required: true,
        index: true,
    },
    
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
        index: true,
    },

    interviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    
    status: {
        type: String,
        enum: ["ASSIGNED", "COMPLETED"],
        default: "ASSIGNED"
    },

    scheduledAt: {
        type: Date,
    }
}, {
    timestamps: true
});

export default mongoose.model("Interview", interviewSchema);