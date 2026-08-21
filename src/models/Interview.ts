import mongoose, { Document, Model, Schema, Types } from "mongoose";

export const INTERVIEW_STATUSES = ["ASSIGNED", "COMPLETED"] as const;
export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];

export interface IInterview {
  organizationId: Types.ObjectId;
  candidateId: Types.ObjectId;
  jobId: Types.ObjectId;
  interviewerId: Types.ObjectId;
  status: InterviewStatus;
  scheduledAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IInterviewDocument extends IInterview, Document {}

const interviewSchema = new Schema<IInterviewDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      index: true,
    },

    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    interviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: INTERVIEW_STATUSES,
      default: "ASSIGNED",
    },

    scheduledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Interview: Model<IInterviewDocument> = mongoose.model<IInterviewDocument>(
  "Interview",
  interviewSchema
);

export default Interview;