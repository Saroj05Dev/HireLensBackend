import * as jobRepository from "../repositories/job.repository.js";
import ApiError from "../utils/ApiError.js";

export const createJob = async (user, jobData) => {
  const { title, description, skills, experience, location } = jobData;

  // Validate required fields
  if (!title || !description || !skills || !experience || !location) {
    throw new ApiError(
      400,
      "All fields (title, description, skills, experience, location) are required"
    );
  }

  // Validate skills array
  if (!Array.isArray(skills) || skills.length === 0) {
    throw new ApiError(400, "Skills must be a non-empty array");
  }

  // Create job with organization context
  const job = await jobRepository.create({
    title,
    description,
    skills,
    experience,
    location,
    organizationId: user.organizationId,
    createdBy: user.id,
    status: "OPEN",
  });

  return {
    id: job._id,
    title: job.title,
    description: job.description,
    skills: job.skills,
    experience: job.experience,
    location: job.location,
    status: job.status,
    createdBy: job.createdBy,
    createdAt: job.createdAt,
  };
};

export const getOrganizationJobs = async (organizationId) => {
  const jobs = await jobRepository.findByOrganizationId(organizationId);

  return jobs.map((job) => ({
    id: job._id,
    title: job.title,
    description: job.description,
    skills: job.skills,
    experience: job.experience,
    location: job.location,
    status: job.status,
    createdBy: {
      id: job.createdBy._id,
      name: job.createdBy.name,
      email: job.createdBy.email,
    },
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  }));
};

export const closeJob = async (user, jobId) => {
  // Find job
  const job = await jobRepository.findById(jobId);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  // Verify job belongs to user's organization
  if (job.organizationId.toString() !== user.organizationId) {
    throw new ApiError(
      403,
      "Access denied. Job belongs to another organization"
    );
  }

  // Check if job is already closed
  if (job.status === "CLOSED") {
    throw new ApiError(400, "Job is already closed");
  }

  // Update job status
  const updatedJob = await jobRepository.updateStatus(jobId, "CLOSED");

  return {
    id: updatedJob._id,
    title: updatedJob.title,
    status: updatedJob.status,
    updatedAt: updatedJob.updatedAt,
  };
};
