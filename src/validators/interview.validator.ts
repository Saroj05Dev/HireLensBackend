import { z } from "zod";
import { Recommendation } from "@prisma/client";

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
export const interviewIdParamSchema = z.object({
  interviewId: z.string().uuid("Invalid interview ID format"),
});

export const jobIdParamSchema = z.object({
  jobId: z.string().uuid("Invalid job ID format"),
});
