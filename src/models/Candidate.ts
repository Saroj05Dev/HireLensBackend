import mongoose, { Document, Model, Schema, Types } from "mongoose";

export const CANDIDATE_STAGES = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
] as const;

export type CandidateStage = (typeof CANDIDATE_STAGES)[number];

export interface ICandidate {
  organizationId: Types.ObjectId;
  jobId: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  resumePublicId?: string | null;
  currentStage: CandidateStage;
  addedBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICandidateDocument extends ICandidate, Document {}

const candidateSchema = new Schema<ICandidateDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    resumeUrl: {
      type: String,
    },

    resumePublicId: {
      type: String,
      default: null,
    },

    currentStage: {
      type: String,
      enum: CANDIDATE_STAGES,
      default: "APPLIED",
      index: true,
    },

    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Candidate: Model<ICandidateDocument> = mongoose.model<ICandidateDocument>(
  "Candidate",
  candidateSchema
);

export default Candidate;