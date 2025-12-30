import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    interviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Interview",
        required: true,
        index: true,
    },
    
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
        required: true,
        index: true,
    },

    interviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    strengths: {
        type: String,
        required: true,
        trim: true
    },

    weaknesses: {
        type: String,
        required: true,
        trim: true
    },

    recommendation: {
        type: String,
        enum: ["PROCEED", "HOLD", "REJECT"],
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model("InterviewFeedback", feedbackSchema);