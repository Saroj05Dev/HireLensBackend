import Job from "../models/Job.js";

export const create = async (jobData) => {
  const job = new Job(jobData);
  await job.save();
  return job;
};

export const findByOrganizationId = async (organizationId) => {
  return Job.find({ organizationId })
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });
};

export const findById = async (jobId) => {
  return Job.findById(jobId);
};

export const updateStatus = async (jobId, status) => {
  return Job.findByIdAndUpdate(
    jobId,
    { status },
    { new: true, runValidators: true }
  );
};
