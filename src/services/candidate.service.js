import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import * as candidateRepository from "../repositories/candidate.repository.js";
import * as jobRepository from "../repositories/job.repository.js";
import * as decisionLogRepository from "../repositories/decisionLog.repository.js";

export const addCandidate = async (user, payload) => {
    const { jobId, name, email, phone, resumeUrl } = payload;

    if(!jobId || !name) {
        throw new ApiError(400, "Job id and candidate name are required");
    }

    // 1. Validate job existence within the organization
    const job = await jobRepository.findById(jobId);
    if (!job || job.organizationId.toString() !== user.organizationId) {
        throw new ApiError(404, "Job not found in your organization");
    }

    // 2. Create candidate record
    return candidateRepository.create({
        organizationId: user.organizationId,
        name,
        email,
        phone,
        resumeUrl,
        jobId,
        addedBy: user.id
    });
};

export const getCandidatesByJob = async (user, jobId) => {
    const candidates = await candidateRepository.findByJobId(jobId);

    return candidates.filter(
        c => c.organizationId.toString() === user.organizationId
    )
}

export const getCandidateProfile = async (user, candidateId) => {
    const candidate = await candidateRepository.findById(candidateId);

    if (!candidate || candidate.organizationId.toString() !== user.organizationId) {
        throw new ApiError(404, "Candidate not found in your organization");
    }

    return candidate;
};

const VALID_STAGES = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED"
];

export const updateCandidateStage = async (
  user,
  candidateId,
  { newStage, note }
) => {
  if (!VALID_STAGES.includes(newStage)) {
    throw new ApiError(400, "Invalid stage");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1 Fetch candidate
    const candidate = await candidateRepository.findById(
      candidateId,
      session
    );

    if (
      !candidate ||
      candidate.organizationId.toString() !== user.organizationId
    ) {
      throw new ApiError(404, "Candidate not found");
    }

    const fromStage = candidate.currentStage;

    // 2 Prevent no-op updates
    if (fromStage === newStage) {
      throw new ApiError(400, "Candidate already in this stage");
    }

    // 3 Update candidate stage
    candidate.currentStage = newStage;
    await candidate.save({ session });

    // 4 Create decision log
    await decisionLogRepository.create(
      {
        organizationId: user.organizationId,
        candidateId: candidate._id,
        jobId: candidate.jobId,
        actionType: "STAGE_CHANGE",
        performedBy: user.id,
        fromStage,
        toStage: newStage,
        note
      },
      session
    );

    await session.commitTransaction();
    session.endSession();

    return {
      candidateId: candidate._id,
      fromStage,
      toStage: newStage
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};