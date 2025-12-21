import mongoose from "mongoose";

const USER_ROLE = ["ADMIN", "RECRUITER", "INTERVIEWER"];

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: function() {
            return this.isActive === true;
        }
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
        select: false, // Exclude password from query results by default
        required: function() {
            return this.isActive === true;
        }
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