import { Types } from "mongoose";
import Job, { IJob, IJobDocument, JobStatus } from "../models/Job.js";

export const create = async (jobData: Partial<IJob>): Promise<IJobDocument> => {
  const job = new Job(jobData);
  await job.save();
  return job;
};

export const findByOrganizationId = async (
  organizationId: string | Types.ObjectId
): Promise<IJobDocument[]> => {
  return Job.find({ organizationId })
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });
};

export const findById = async (
  jobId: string | Types.ObjectId
): Promise<IJobDocument | null> => {
  return Job.findById(jobId).populate("createdBy", "name email");
};

export const updateStatus = async (
  jobId: string | Types.ObjectId,
  status: JobStatus
): Promise<IJobDocument | null> => {
  return Job.findByIdAndUpdate(
    jobId,
    { status },
    { new: true, runValidators: true }
  );
};

export const update = async (
  jobId: string | Types.ObjectId,
  jobData: Partial<IJob>
): Promise<IJobDocument | null> => {
  return Job.findByIdAndUpdate(
    jobId,
    jobData,
    { new: true, runValidators: true }
  ).populate("createdBy", "name email");
};

export const deleteById = async (
  jobId: string | Types.ObjectId
): Promise<IJobDocument | null> => {
  return Job.findByIdAndDelete(jobId);
};