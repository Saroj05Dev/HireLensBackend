import { z } from "zod";
import { CandidateStage } from "@prisma/client";

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

// Reusable param schemas
export const candidateIdParamSchema = z.object({
  candidateId: z.string().uuid("Invalid candidate ID format"),
});

export const jobIdParamSchema = z.object({
  jobId: z.string().uuid("Invalid job ID format"),
});