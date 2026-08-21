import mongoose, { Document, Model, Schema, Types } from "mongoose";

export const ACTION_TYPES = [
  "STAGE_CHANGE",
  "INTERVIEW_ASSIGNED",
  "FEEDBACK_SUBMITTED",
  "REOPENED",
] as const;

export type ActionType = (typeof ACTION_TYPES)[number];

export interface IDecisionLog {
  organizationId: Types.ObjectId;
  candidateId: Types.ObjectId;
  jobId: Types.ObjectId;
  actionType: ActionType;
  performedBy: Types.ObjectId;
  fromStage?: string;
  toStage?: string;
  note?: string;
  createdAt?: Date;
}

export interface IDecisionLogDocument extends IDecisionLog, Document {}

const decisionLogSchema = new Schema<IDecisionLogDocument>(
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

    actionType: {
      type: String,
      enum: ACTION_TYPES,
      required: true,
    },

    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fromStage: {
      type: String,
    },

    toStage: {
      type: String,
    },

    note: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

const DecisionLog: Model<IDecisionLogDocument> = mongoose.model<IDecisionLogDocument>(
  "DecisionLog",
  decisionLogSchema
);

export default DecisionLog;