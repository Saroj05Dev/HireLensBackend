import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import cloudinary from "../config/cloudinary.config.js";
import { getIO } from "../config/socket.js";
import * as candidateRepository from "../repositories/candidate.repository.js";
import * as jobRepository from "../repositories/job.repository.js";
import * as decisionLogRepository from "../repositories/decisionLog.repository.js";
import * as interviewRepository from "../repositories/interview.repository.js";

const makeSafePublicId = (fileName) => {
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  return baseName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
};

const extractCloudinaryPublicId = (resumeUrl) => {
  if (!resumeUrl || !resumeUrl.includes("res.cloudinary.com")) {
    return null;
  }

  const match = resumeUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.?#]+(?:\?.*)?$/);
  return match?.[1] || null;
};

const buildResumeViewUrl = (candidate) => {
  // Just return the stored URL directly — it's already a valid Cloudinary public URL.
  // Signed URLs expire and cause 401 errors; re-generating with cloudinary.url() also
  // duplicates the folder path since public_id already includes it.
  return candidate.resumeUrl || null;
};

const serializeCandidate = (candidate) => {
  if (!candidate) return candidate;

  const plainCandidate = typeof candidate.toObject === "function"
    ? candidate.toObject()
    : { ...candidate };

  return {
    ...plainCandidate,
    resumeUrl: buildResumeViewUrl(plainCandidate),
  };
};

const uploadResumeToCloudinary = async (file) => {
  try {
    const safePublicId = `${makeSafePublicId(file.originalname)}-${Date.now()}`;

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "hirelens/resumes",
          resource_type: "raw",
          public_id: safePublicId,
          overwrite: false,
        },
        (error, uploadResult) => {
          if (error) reject(error);
          else resolve(uploadResult);
        }
      );

      uploadStream.end(file.buffer);
    });

    return {
      resumeUrl: result.secure_url,
      resumePublicId: result.public_id,
    };
  } catch (error) {
    throw new ApiError(500, `Failed to upload resume: ${error.message}`);
  }
};

export const addCandidate = async (user, payload, file) => {
  const { jobId, name, email, phone, resumeUrl } = payload;

  if (!jobId || !name) {
    throw new ApiError(400, "Job id and candidate name are required");
  }

  // 1. Validate job existence within the organization
  const job = await jobRepository.findById(jobId);
  if (!job || job.organizationId.toString() !== user.organizationId) {
    throw new ApiError(404, "Job not found in your organization");
  }

  const uploadedResume = file
    ? await uploadResumeToCloudinary(file)
    : resumeUrl;

  // 2. Create candidate record
  const candidate = await candidateRepository.create({
    organizationId: user.organizationId,
    name,
    email,
    phone,
    resumeUrl: file ? uploadedResume.resumeUrl : uploadedResume,
    resumePublicId: file ? uploadedResume.resumePublicId : extractCloudinaryPublicId(uploadedResume),
    jobId,
    addedBy: user.id,
  });

  return serializeCandidate(candidate);
};

export const getCandidatesByJob = async (user, jobId) => {
  const candidates = await candidateRepository.findByJobId(jobId);

  return candidates.filter(
    (c) => c.organizationId.toString() === user.organizationId
  ).map(serializeCandidate);
};

export const getAllCandidates = async (user, filters) => {
  const { stage, jobId } = filters;

  const candidates = await candidateRepository.findByOrganizationIdWithFilters(
    user.organizationId,
    { stage, jobId }
  );

  return candidates.map(serializeCandidate);
};

export const getCandidateProfile = async (user, candidateId) => {
  const candidate = await candidateRepository.findById(candidateId);

  if (
    !candidate ||
    candidate.organizationId.toString() !== user.organizationId
  ) {
    throw new ApiError(404, "Candidate not found in your organization");
  }

  return serializeCandidate(candidate);
};

// Stage order for linear progression validation
const STAGE_ORDER = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED"];

const VALID_STAGES = [...STAGE_ORDER, "REJECTED"];

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
    // 1. Fetch candidate
    const candidate = await candidateRepository.findById(candidateId, session);

    if (
      !candidate ||
      candidate.organizationId.toString() !== user.organizationId
    ) {
      throw new ApiError(404, "Candidate not found");
    }

    const fromStage = candidate.currentStage;

    // 2. Prevent no-op updates
    if (fromStage === newStage) {
      throw new ApiError(400, "Candidate is already in this stage");
    }

    // 3. Lock HIRED — final state, no moves allowed
    if (fromStage === "HIRED") {
      throw new ApiError(400, "A hired candidate cannot be moved. This is a final state.");
    }

    // 4. Lock REJECTED — must use "Reopen Candidate" action instead
    if (fromStage === "REJECTED") {
      throw new ApiError(
        400,
        "A rejected candidate cannot be moved directly. Use the 'Reopen Candidate' action to re-evaluate them."
      );
    }

    // 5. Enforce linear progression (REJECTED is always allowed as a destination)
    if (newStage !== "REJECTED") {
      const fromIdx = STAGE_ORDER.indexOf(fromStage);
      const toIdx   = STAGE_ORDER.indexOf(newStage);

      // Block backward movement
      if (toIdx <= fromIdx) {
        throw new ApiError(
          400,
          `Backward movement is not allowed. Cannot move from ${fromStage} to ${newStage}.`
        );
      }

      // Block skipping stages
      if (toIdx - fromIdx > 1) {
        const nextStage = STAGE_ORDER[fromIdx + 1];
        throw new ApiError(
          400,
          `Cannot skip stages. The next valid stage after ${fromStage} is ${nextStage}.`
        );
      }
    }

    // 6. Interview gate — must have an assigned interview before entering INTERVIEW stage
    if (newStage === "INTERVIEW") {
      const existingInterviews = await interviewRepository.findByCandidateId(candidateId);
      if (!existingInterviews || existingInterviews.length === 0) {
        throw new ApiError(
          400,
          "An interview must be assigned to this candidate before moving them to the Interview stage."
        );
      }
    }

    // 7. Update candidate stage
    candidate.currentStage = newStage;
    await candidate.save({ session });

    // 8. Create decision log
    await decisionLogRepository.create(
      {
        organizationId: user.organizationId,
        candidateId: candidate._id,
        jobId: candidate.jobId,
        actionType: "STAGE_CHANGE",
        performedBy: user.id,
        fromStage,
        toStage: newStage,
        note,
      },
      session
    );

    await session.commitTransaction();
    session.endSession();

    const io = getIO();
    io.to(`org:${user.organizationId}`).emit("candidate:stage-updated", {
      candidateId: candidate._id,
      jobId: candidate.jobId,
      fromStage,
      toStage: newStage,
      updatedBy: user.id,
      updatedAt: new Date(),
    });

    io.to(`org:${user.organizationId}`).emit("decision:created", {
      type: "STAGE_CHANGE",
      candidateId: candidate._id,
      jobId: candidate.jobId,
      performedBy: user.id,
      fromStage,
      toStage: newStage,
      note,
      createdAt: new Date(),
    });

    return {
      candidateId: candidate._id,
      fromStage,
      toStage: newStage,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Reopen a REJECTED candidate — moves them back to APPLIED
 * and logs a REOPENED decision for audit clarity.
 */
export const reopenCandidate = async (user, candidateId, { note } = {}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const candidate = await candidateRepository.findById(candidateId, session);

    if (
      !candidate ||
      candidate.organizationId.toString() !== user.organizationId
    ) {
      throw new ApiError(404, "Candidate not found");
    }

    if (candidate.currentStage !== "REJECTED") {
      throw new ApiError(
        400,
        "Only rejected candidates can be reopened."
      );
    }

    const fromStage = "REJECTED";
    const toStage   = "APPLIED";

    candidate.currentStage = toStage;
    await candidate.save({ session });

    await decisionLogRepository.create(
      {
        organizationId: user.organizationId,
        candidateId: candidate._id,
        jobId: candidate.jobId,
        actionType: "REOPENED",
        performedBy: user.id,
        fromStage,
        toStage,
        note: note || "Candidate reopened for re-evaluation.",
      },
      session
    );

    await session.commitTransaction();
    session.endSession();

    const io = getIO();
    io.to(`org:${user.organizationId}`).emit("candidate:stage-updated", {
      candidateId: candidate._id,
      jobId: candidate.jobId,
      fromStage,
      toStage,
      updatedBy: user.id,
      updatedAt: new Date(),
    });

    io.to(`org:${user.organizationId}`).emit("decision:created", {
      type: "REOPENED",
      candidateId: candidate._id,
      jobId: candidate.jobId,
      performedBy: user.id,
      fromStage,
      toStage,
      note: note || "Candidate reopened for re-evaluation.",
      createdAt: new Date(),
    });

    return {
      candidateId: candidate._id,
      fromStage,
      toStage,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


export const getCandidateDecisionLogs = async (user, candidateId) => {
  const candidate = await candidateRepository.findById(candidateId);

  if (
    !candidate ||
    candidate.organizationId.toString() !== user.organizationId
  ) {
    throw new ApiError(404, "Candidate not found");
  }

  const logs = await decisionLogRepository.findByCandidateId(candidateId);

  return logs.map(log => ({
    action: log.actionType,
    from: log.fromStage,
    to: log.toStage,
    by: log.performedBy?.name || "System",
    note: log.note,
    timestamp: log.createdAt
  }));
};

export const getInterviewsByCandidate = async (user, candidateId) => {
    // 1. Validate candidate existence
    const candidate = await candidateRepository.findById(candidateId);
    if (!candidate || candidate.organizationId.toString() !== user.organizationId) {
        throw new ApiError(404, "Candidate not found in your organization");
    }

    // 2. Fetch interviews
    const interviews = await interviewRepository.findByCandidateId(candidateId);

    return interviews;
}

