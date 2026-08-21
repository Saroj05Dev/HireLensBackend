import mongoose, { Document, Model, Schema, Types } from "mongoose";

export const RECOMMENDATIONS = ["PROCEED", "HOLD", "REJECT"] as const;
export type Recommendation = (typeof RECOMMENDATIONS)[number];

export interface IInterviewFeedback {
  interviewId: Types.ObjectId;
  candidateId: Types.ObjectId;
  interviewerId: Types.ObjectId;
  rating: number;
  strengths: string;
  weaknesses: string;
  recommendation: Recommendation;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IInterviewFeedbackDocument extends IInterviewFeedback, Document {}

const feedbackSchema = new Schema<IInterviewFeedbackDocument>(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
      index: true,
    },

    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      index: true,
    },

    interviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    strengths: {
      type: String,
      required: true,
      trim: true,
    },

    weaknesses: {
      type: String,
      required: true,
      trim: true,
    },

    recommendation: {
      type: String,
      enum: RECOMMENDATIONS,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const InterviewFeedback: Model<IInterviewFeedbackDocument> =
  mongoose.model<IInterviewFeedbackDocument>("InterviewFeedback", feedbackSchema);

export default InterviewFeedback;