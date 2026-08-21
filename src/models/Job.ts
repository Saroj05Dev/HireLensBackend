import mongoose, { Document, Model, Schema, Types } from "mongoose";

export const JOB_STATUSES = ["OPEN", "CLOSED"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export interface IJob {
  title: string;
  description: string;
  skills: string[];
  experience: string;
  location: string;
  status: JobStatus;
  organizationId: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IJobDocument extends IJob, Document {}

const jobSchema = new Schema<IJobDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    skills: {
      type: [String],
      required: true,
      validate: {
        validator: function (arr: string[]) {
          return Boolean(arr && arr.length > 0);
        },
        message: "At least one skill is required",
      },
    },

    experience: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: JOB_STATUSES,
      default: "OPEN",
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ organizationId: 1, status: 1 });

const Job: Model<IJobDocument> = mongoose.model<IJobDocument>("Job", jobSchema);
export default Job;