import { z } from "zod";

// Reusable param schemas for analytics routes
export const candidateIdParamSchema = z.object({
  candidateId: z.string().uuid("Invalid candidate ID format"),
});

export const jobIdParamSchema = z.object({
  jobId: z.string().uuid("Invalid job ID format"),
});
