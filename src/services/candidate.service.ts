import "multer";
import { createRequire } from "module";
import { CandidateStage, ActionType } from "@prisma/client";
import { prisma } from "../config/prisma.js";
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
const pdfParsePackage = require("pdf-parse");
const PDFParse = pdfParsePackage.PDFParse || pdfParsePackage;

interface UserContext {
  id: string;
  organizationId: string;
  [key: string]: any;
}

interface UploadedResume {
  resumeUrl: string;
  resumePublicId: string;
}

const makeSafePublicId = (fileName: string): string => {
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  return baseName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
};

const extractCloudinaryPublicId = (resumeUrl?: string): string | null => {
  if (!resumeUrl || !resumeUrl.includes("res.cloudinary.com")) {
    return null;
  }

  const match = resumeUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.?#]+(?:\?.*)?$/);
  return match?.[1] || null;
};

const buildResumeViewUrl = (candidate: Record<string, any>): string | null => {
  return candidate.resumeUrl || null;
};

const extractEmailFromText = (text: string): string | null => {
  if (!text) return null;
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match?.[0]?.toLowerCase() || null;
};

const normalizePhoneNumber = (rawPhone: string): string | null => {
  if (!rawPhone) return null;

  const cleaned = rawPhone
    .replace(/[^\d+]/g, "")
    .replace(/(?!^)\+/g, "");

  const digitCount = cleaned.replace(/\D/g, "").length;
  if (digitCount < 10 || digitCount > 15) return null;

  return cleaned;
};

const extractPhoneFromText = (text: string): string | null => {
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

const looksLikeAddressLine = (line: string): boolean =>
  /(street|road|rd\b|lane|ln\b|avenue|ave\b|city|state|zip|pincode|address)/i.test(line);

const looksLikeResumeHeading = (line: string): boolean =>
  /(resume|curriculum vitae|cv|profile|summary|objective)/i.test(line);

const isValidName = (line: string): boolean => {
  if (!line) return false;
  if (line.length < 3 || line.length > 60) return false;
  if (/\d/.test(line)) return false;
  if (/@/.test(line)) return false;
  if (looksLikeAddressLine(line) || looksLikeResumeHeading(line)) return false;

  const words = line.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 5) return false;

  return words.every((word) => /^[A-Za-z][A-Za-z'`.-]*$/.test(word));
};

const toTitleCase = (text: string): string =>
  text
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const extractNameFromText = (text: string): string | null => {
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

const parseCandidateContactFromResume = (text: string) => ({
  name: extractNameFromText(text),
  email: extractEmailFromText(text),
  phone: extractPhoneFromText(text),
});

export const parseResumeProfile = async (file?: Express.Multer.File) => {
  if (!file) {
    throw new ApiError(400, "Resume file is required");
  }

  if (file.mimetype !== "application/pdf") {
    throw new ApiError(400, "Resume parsing currently supports PDF files only");
  }

  let parser: any;
  let parsedPdf: any;
  try {
    if (typeof PDFParse === "function" && PDFParse.prototype?.getText) {
      parser = new PDFParse({ data: file.buffer });
      parsedPdf = await parser.getText();
    } else {
      parsedPdf = await PDFParse(file.buffer);
    }
  } catch (error: any) {
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

const serializeCandidate = (candidate: any) => {
  if (!candidate) return candidate;

  return {
    ...candidate,
    resumeUrl: buildResumeViewUrl(candidate),
  };
};

const uploadResumeToCloudinary = async (file: Express.Multer.File): Promise<UploadedResume> => {
  try {
    const safePublicId = `${makeSafePublicId(file.originalname)}-${Date.now()}`;

    const result: any = await new Promise((resolve, reject) => {
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
  } catch (error: any) {
    throw new ApiError(500, `Failed to upload resume: ${error.message}`);
  }
};

export const addCandidate = async (
  user: UserContext,
  payload: { jobId: string; name: string; email: string; phone?: string; resumeUrl?: string },
  file?: Express.Multer.File
) => {
  const { jobId, name, email, phone, resumeUrl } = payload;

  if (!jobId || !name) {
    throw new ApiError(400, "Job id and candidate name are required");
  }

  const job = await jobRepository.findById(jobId);
  if (!job || job.organizationId !== user.organizationId) {
    throw new ApiError(404, "Job not found in your organization");
  }

  const uploadedResume = file
    ? await uploadResumeToCloudinary(file)
    : resumeUrl;

  const candidate = await candidateRepository.create({
    organizationId: user.organizationId,
    name,
    email,
    phone,
    resumeUrl: file ? (uploadedResume as UploadedResume).resumeUrl : (uploadedResume as string),
    resumePublicId: file
      ? (uploadedResume as UploadedResume).resumePublicId
      : extractCloudinaryPublicId(uploadedResume as string),
    jobId,
    addedById: user.id,
  });

  return serializeCandidate(candidate);
};

export const getCandidatesByJob = async (user: UserContext, jobId: string) => {
  const candidates = await candidateRepository.findByJobId(jobId);

  return candidates
    .filter((c) => c.organizationId === user.organizationId)
    .map(serializeCandidate);
};

export const getAllCandidates = async (
  user: UserContext,
  filters: { stage?: CandidateStage; jobId?: string }
) => {
  const { stage, jobId } = filters;

  const candidates = await candidateRepository.findByOrganizationIdWithFilters(
    user.organizationId,
    { stage, jobId }
  );

  return candidates.map(serializeCandidate);
};

export const getCandidateProfile = async (user: UserContext, candidateId: string) => {
  const candidate = await candidateRepository.findById(candidateId);

  if (!candidate || candidate.organizationId !== user.organizationId) {
    throw new ApiError(404, "Candidate not found in your organization");
  }

  return serializeCandidate(candidate);
};

const STAGE_ORDER: CandidateStage[] = [
  CandidateStage.APPLIED,
  CandidateStage.SCREENING,
  CandidateStage.INTERVIEW,
  CandidateStage.OFFER,
  CandidateStage.HIRED,
];
const VALID_STAGES: CandidateStage[] = [...STAGE_ORDER, CandidateStage.REJECTED];

export const updateCandidateStage = async (
  user: UserContext,
  candidateId: string,
  { newStage, note }: { newStage: CandidateStage; note?: string }
) => {
  if (!VALID_STAGES.includes(newStage)) {
    throw new ApiError(400, "Invalid stage");
  }

  return prisma.$transaction(async (tx) => {
    console.log("[DEBUG] updateCandidateStage - candidateId:", candidateId, "length:", candidateId.length);
    const candidate = await candidateRepository.findById(candidateId, tx);
    console.log("[DEBUG] updateCandidateStage - candidate found:", !!candidate);

    if (!candidate || candidate.organizationId !== user.organizationId) {
      console.log("[DEBUG] Candidate not found or org mismatch. candidate:", !!candidate, "orgId:", candidate?.organizationId, "userOrgId:", user.organizationId);
      throw new ApiError(404, "Candidate not found");
    }

    const fromStage = candidate.currentStage;

    if (fromStage === newStage) {
      throw new ApiError(400, "Candidate is already in this stage");
    }

    if (fromStage === CandidateStage.HIRED) {
      throw new ApiError(400, "A hired candidate cannot be moved. This is a final state.");
    }

    if (fromStage === CandidateStage.REJECTED) {
      throw new ApiError(
        400,
        "A rejected candidate cannot be moved directly. Use the 'Reopen Candidate' action to re-evaluate them."
      );
    }

    if (newStage !== CandidateStage.REJECTED) {
      const fromIdx = STAGE_ORDER.indexOf(fromStage);
      const toIdx = STAGE_ORDER.indexOf(newStage);

      if (toIdx <= fromIdx) {
        throw new ApiError(
          400,
          `Backward movement is not allowed. Cannot move from ${fromStage} to ${newStage}.`
        );
      }

      if (toIdx - fromIdx > 1) {
        const nextStage = STAGE_ORDER[fromIdx + 1];
        throw new ApiError(
          400,
          `Cannot skip stages. The next valid stage after ${fromStage} is ${nextStage}.`
        );
      }
    }

    if (newStage === CandidateStage.INTERVIEW) {
      const existingInterviews = await interviewRepository.findByCandidateId(candidateId, tx);
      if (!existingInterviews || existingInterviews.length === 0) {
        throw new ApiError(
          400,
          "An interview must be assigned to this candidate before moving them to the Interview stage."
        );
      }
    }

    await tx.candidate.update({
      where: { id: candidateId },
      data: { currentStage: newStage },
    });

    await decisionLogRepository.create(
      {
        organizationId: user.organizationId,
        candidateId: candidate.id,
        jobId: candidate.jobId,
        actionType: ActionType.STAGE_CHANGE,
        performedById: user.id,
        fromStage,
        toStage: newStage,
        note,
      },
      tx
    );

    const io = getIO();
    io.to(`org:${user.organizationId}`).emit("candidate:stage-updated", {
      candidateId: candidate.id,
      jobId: candidate.jobId,
      fromStage,
      toStage: newStage,
      updatedBy: user.id,
      updatedAt: new Date(),
    });

    io.to(`org:${user.organizationId}`).emit("decision:created", {
      type: ActionType.STAGE_CHANGE,
      candidateId: candidate.id,
      jobId: candidate.jobId,
      performedBy: user.id,
      fromStage,
      toStage: newStage,
      note,
      createdAt: new Date(),
    });

    if (candidate.email) {
      Promise.all([
        jobRepository.findById(candidate.jobId),
        organizationRepository.findById(user.organizationId),
      ])
        .then(([job, organization]) => {
          sendStageChangeEmail({
            candidateEmail: candidate.email,
            candidateName: candidate.name,
            jobTitle: job?.title || "the position",
            fromStage,
            toStage: newStage,
            organizationName: organization?.name || "HireLens",
            note,
          });
        })
        .catch((err) => console.error("[Email] Stage change email error:", err));
    }

    return {
      candidateId: candidate.id,
      fromStage,
      toStage: newStage,
    };
  }, {
    maxWait: 10000,
    timeout: 15000,
  });
};

export const reopenCandidate = async (
  user: UserContext,
  candidateId: string,
  { note }: { note?: string } = {}
) => {
  return prisma.$transaction(async (tx) => {
    const candidate = await candidateRepository.findById(candidateId, tx);

    if (!candidate || candidate.organizationId !== user.organizationId) {
      throw new ApiError(404, "Candidate not found");
    }

    if (candidate.currentStage !== CandidateStage.REJECTED) {
      throw new ApiError(400, "Only rejected candidates can be reopened.");
    }

    const fromStage = CandidateStage.REJECTED;
    const toStage: CandidateStage = CandidateStage.APPLIED;

    await tx.candidate.update({
      where: { id: candidateId },
      data: { currentStage: toStage },
    });

    await decisionLogRepository.create(
      {
        organizationId: user.organizationId,
        candidateId: candidate.id,
        jobId: candidate.jobId,
        actionType: ActionType.REOPENED,
        performedById: user.id,
        fromStage,
        toStage,
        note: note || "Candidate reopened for re-evaluation.",
      },
      tx
    );

    const io = getIO();
    io.to(`org:${user.organizationId}`).emit("candidate:stage-updated", {
      candidateId: candidate.id,
      jobId: candidate.jobId,
      fromStage,
      toStage,
      updatedBy: user.id,
      updatedAt: new Date(),
    });

    io.to(`org:${user.organizationId}`).emit("decision:created", {
      type: ActionType.REOPENED,
      candidateId: candidate.id,
      jobId: candidate.jobId,
      performedBy: user.id,
      fromStage,
      toStage,
      note: note || "Candidate reopened for re-evaluation.",
      createdAt: new Date(),
    });

    return {
      candidateId: candidate.id,
      fromStage,
      toStage,
    };
  });
};

export const getCandidateDecisionLogs = async (user: UserContext, candidateId: string) => {
  const candidate = await candidateRepository.findById(candidateId);

  if (!candidate || candidate.organizationId !== user.organizationId) {
    throw new ApiError(404, "Candidate not found");
  }

  const logs = await decisionLogRepository.findByCandidateId(candidateId);

  return logs.map((log: any) => ({
    action: log.actionType,
    from: log.fromStage,
    to: log.toStage,
    by: log.performedBy?.name || "System",
    note: log.note,
    timestamp: log.createdAt,
  }));
};

export const getInterviewsByCandidate = async (user: UserContext, candidateId: string) => {
  const candidate = await candidateRepository.findById(candidateId);
  if (!candidate || candidate.organizationId !== user.organizationId) {
    throw new ApiError(404, "Candidate not found in your organization");
  }

  return interviewRepository.findByCandidateId(candidateId);
};