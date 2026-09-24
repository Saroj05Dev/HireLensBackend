import { JobStatus } from "@prisma/client";
import * as jobRepository from "../repositories/job.repository.js";
import ApiError from "../utils/ApiError.js";

interface UserContext {
  id: string;
  organizationId: string;
  [key: string]: any;
}

interface JobPayload {
  title: string;
  description: string;
  skills: string[];
  experience: string;
  location: string;
}

export const createJob = async (user: UserContext, jobData: JobPayload) => {
  const { title, description, skills, experience, location } = jobData;

  if (!title || !description || !skills || !experience || !location) {
    throw new ApiError(
      400,
      "All fields (title, description, skills, experience, location) are required"
    );
  }

  if (!Array.isArray(skills) || skills.length === 0) {
    throw new ApiError(400, "Skills must be a non-empty array");
  }

  const job = await jobRepository.create({
    title,
    description,
    skills,
    experience,
    location,
    organizationId: user.organizationId,
    createdById: user.id,
    status: JobStatus.OPEN,
  });

  return {
    id: job.id,
    title: job.title,
    description: job.description,
    skills: job.skills,
    experience: job.experience,
    location: job.location,
    status: job.status,
    createdById: job.createdById,
    createdAt: job.createdAt,
  };
};

export const getOrganizationJobs = async (organizationId: string) => {
  const jobs = await jobRepository.findByOrganizationId(organizationId);

  return jobs.map((job) => ({
    id: job.id,
    title: job.title,
    description: job.description,
    skills: job.skills,
    experience: job.experience,
    location: job.location,
    status: job.status,
    createdBy: {
      name: job.createdBy?.name,
      email: job.createdBy?.email,
    },
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  }));
};

export const closeJob = async (user: UserContext, jobId: string) => {
  const job = await jobRepository.findById(jobId);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  if (job.organizationId !== user.organizationId) {
    throw new ApiError(403, "Access denied. Job belongs to another organization");
  }

  if (job.status === JobStatus.CLOSED) {
    throw new ApiError(400, "Job is already closed");
  }

  const updatedJob = await jobRepository.updateStatus(jobId, JobStatus.CLOSED);

  if (!updatedJob) {
    throw new ApiError(500, "Failed to update job status");
  }

  return {
    id: updatedJob.id,
    title: updatedJob.title,
    description: updatedJob.description,
    skills: updatedJob.skills,
    experience: updatedJob.experience,
    location: updatedJob.location,
    status: updatedJob.status,
    createdById: updatedJob.createdById,
    createdAt: updatedJob.createdAt,
    updatedAt: updatedJob.updatedAt,
  };
};

export const reopenJob = async (user: UserContext, jobId: string) => {
  const job = await jobRepository.findById(jobId);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  if (job.organizationId !== user.organizationId) {
    throw new ApiError(403, "Access denied. Job belongs to another organization");
  }

  if (job.status === JobStatus.OPEN) {
    throw new ApiError(400, "Job is already open");
  }

  const updatedJob = await jobRepository.updateStatus(jobId, JobStatus.OPEN);

  if (!updatedJob) {
    throw new ApiError(500, "Failed to update job status");
  }

  return {
    id: updatedJob.id,
    title: updatedJob.title,
    description: updatedJob.description,
    skills: updatedJob.skills,
    experience: updatedJob.experience,
    location: updatedJob.location,
    status: updatedJob.status,
    createdById: updatedJob.createdById,
    createdAt: updatedJob.createdAt,
    updatedAt: updatedJob.updatedAt,
  };
};

export const getJobById = async (jobId: string) => {
  const job = await jobRepository.findById(jobId);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  return {
    id: job.id,
    title: job.title,
    description: job.description,
    skills: job.skills,
    experience: job.experience,
    location: job.location,
    status: job.status,
    createdBy: {
      name: job.createdBy?.name,
      email: job.createdBy?.email,
    },
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
};

export const updateJob = async (user: UserContext, jobId: string, jobData: JobPayload) => {
  const { title, description, skills, experience, location } = jobData;

  const job = await jobRepository.findById(jobId);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  if (job.organizationId !== user.organizationId) {
    throw new ApiError(403, "Access denied. Job belongs to another organization");
  }

  if (!title || !description || !skills || !experience || !location) {
    throw new ApiError(
      400,
      "All fields (title, description, skills, experience, location) are required"
    );
  }

  if (!Array.isArray(skills) || skills.length === 0) {
    throw new ApiError(400, "Skills must be a non-empty array");
  }

  const updatedJob = await jobRepository.update(jobId, {
    title,
    description,
    skills,
    experience,
    location,
  });

  if (!updatedJob) {
    throw new ApiError(500, "Failed to update job");
  }

  return {
    id: updatedJob.id,
    title: updatedJob.title,
    description: updatedJob.description,
    skills: updatedJob.skills,
    experience: updatedJob.experience,
    location: updatedJob.location,
    status: updatedJob.status,
    createdBy: updatedJob.createdBy,
    createdAt: updatedJob.createdAt,
    updatedAt: updatedJob.updatedAt,
  };
};

export const deleteJob = async (user: UserContext, jobId: string) => {
  const job = await jobRepository.findById(jobId);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  if (job.organizationId !== user.organizationId) {
    throw new ApiError(403, "Access denied. Job belongs to another organization");
  }

  await jobRepository.deleteById(jobId);

  return {
    id: job.id,
    title: job.title,
  };
};