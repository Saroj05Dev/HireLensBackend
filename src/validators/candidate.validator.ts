import { z } from "zod";
import { CandidateStage, Recommendation } from "@prisma/client";

export const addCandidateSchema = z.object({
  jobId: z.string().uuid("Invalid job ID format"),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Valid email is required"),
  phone: z.string().trim().optional(),
  resumeUrl: z.string().url("Must be a valid URL").optional(),
});

export const updateStageSchema = z.object({
  newStage: z.nativeEnum(CandidateStage, {
    message: "Invalid candidate stage",
  }),
  note: z.string().trim().max(500).optional(),
});

export const assignInterviewSchema = z.object({
  candidateId: z.string().uuid("Invalid candidate ID format"),
  interviewerId: z.string().uuid("Invalid interviewer ID format"),
  scheduledAt: z.coerce.date().optional(),
});

export const submitFeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  strengths: z.string().trim().min(3, "Strengths are required"),
  weaknesses: z.string().trim().min(3, "Weaknesses are required"),
  recommendation: z.nativeEnum(Recommendation, {
    message: "Invalid recommendation value",
  }),
});

// Reusable param schemas
export const candidateIdParamSchema = z.object({
  candidateId: z.string().uuid("Invalid candidate ID format"),
});

export const jobIdParamSchema = z.object({
  jobId: z.string().uuid("Invalid job ID format"),
});