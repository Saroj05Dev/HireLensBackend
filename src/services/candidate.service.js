import mongoose from "mongoose";
import { createRequire } from "module";
import ApiError from "../utils/ApiError.js";
import cloudinary from "../config/cloudinary.config.js";
import { getIO } from "../config/socket.js";
import * as candidateRepository from "../repositories/candidate.repository.js";
import * as jobRepository from "../repositories/job.repository.js";
import * as decisionLogRepository from "../repositories/decisionLog.repository.js";
import * as interviewRepository from "../repositories/interview.repository.js";
import * as organizationRepository from "../repositories/organization.repository.js";
import { sendStageChangeEmail } from "./email.service.js";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

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

const extractEmailFromText = (text) => {
  if (!text) return null;
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match?.[0]?.toLowerCase() || null;
};

const normalizePhoneNumber = (rawPhone) => {
  if (!rawPhone) return null;

  const cleaned = rawPhone
    .replace(/[^\d+]/g, "")
    .replace(/(?!^)\+/g, "");

  const digitCount = cleaned.replace(/\D/g, "").length;
  if (digitCount < 10 || digitCount > 15) return null;

  return cleaned;
};

const extractPhoneFromText = (text) => {
  if (!text) return null;

  const phonePattern =
    /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,5}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}/g;
  const matches = text.match(phonePattern) || [];

  for (const candidatePhone of matches) {
    const normalized = normalizePhoneNumber(candidatePhone);
    if (normalized) return normalized;
  }

  return null;
};

const looksLikeAddressLine = (line) =>
  /(street|road|rd\b|lane|ln\b|avenue|ave\b|city|state|zip|pincode|address)/i.test(line);

const looksLikeResumeHeading = (line) =>
  /(resume|curriculum vitae|cv|profile|summary|objective)/i.test(line);

const isValidName = (line) => {
  if (!line) return false;
  if (line.length < 3 || line.length > 60) return false;
  if (/\d/.test(line)) return false;
  if (/@/.test(line)) return false;
  if (looksLikeAddressLine(line) || looksLikeResumeHeading(line)) return false;

  const words = line.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 5) return false;

  return words.every((word) => /^[A-Za-z][A-Za-z'`.-]*$/.test(word));
};

const toTitleCase = (text) =>
  text
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const extractNameFromText = (text) => {
  if (!text) return null;

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 25);

  for (const line of lines) {
    if (isValidName(line)) {
      return toTitleCase(line.replace(/[^A-Za-z\s'`.-]/g, "").trim());
    }
  }

  return null;
};

const parseCandidateContactFromResume = (text) => ({
  name: extractNameFromText(text),
  email: extractEmailFromText(text),
  phone: extractPhoneFromText(text),
});

export const parseResumeProfile = async (file) => {
  if (!file) {
    throw new ApiError(400, "Resume file is required");
  }

  if (file.mimetype !== "application/pdf") {
    throw new ApiError(400, "Resume parsing currently supports PDF files only");
  }

  let parser;
  let parsedPdf;
  try {
    parser = new PDFParse({ data: file.buffer });
    parsedPdf = await parser.getText();
  } catch (error) {
    const reason = error?.message ? ` (${error.message})` : "";
    throw new ApiError(400, `Failed to read PDF resume. Please upload a valid PDF file${reason}`);
  } finally {
    if (parser?.destroy) {
      try {
        await parser.destroy();
      } catch {
        // Best-effort cleanup
      }
    }
  }

  const parsed = parseCandidateContactFromResume(parsedPdf.text || "");

  return {
    ...parsed,
    confidence: {
      name: parsed.name ? "medium" : "low",
      email: parsed.email ? "high" : "low",
      phone: parsed.phone ? "medium" : "low",
    },
  };
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

    // Send stage change email to the candidate (fire-and-forget)
    if (candidate.email) {
      Promise.all([
        jobRepository.findById(candidate.jobId),
        organizationRepository.findById(user.organizationId),
      ]).then(([job, organization]) => {
        sendStageChangeEmail({
          candidateEmail: candidate.email,
          candidateName: candidate.name,
          jobTitle: job?.title || "the position",
          fromStage,
          toStage: newStage,
          organizationName: organization?.name || "HireLens",
          note,
        });
      }).catch((err) => console.error("[Email] Stage change email error:", err));
    }

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

