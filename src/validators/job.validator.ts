import { z } from "zod";

export const createJobSchema = z.object({
    title: z.string().trim().min(3, "Title must be at least 3 characters long").max(100, "Title must be at most 100 characters long"),
    description: z.string().trim().min(10, "Description must be at least 10 characters long").max(1000, "Description must be at most 1000 characters long"),
    skills: z.array(z.string().trim()).min(1, "At least one skill is required").max(20, "At most 20 skills are allowed"),
    experience: z.string().trim().min(1, "Experience is required").max(100, "Experience must be at most 100 characters long"),
    location: z.string().trim().min(1, "Location is required").max(100, "Location must be at most 100 characters long"),
});

export const updateJobSchema = createJobSchema.partial();

// Reusable param schema
export const jobIdParamSchema = z.object({
    jobId: z.string().uuid("Invalid job ID format"),
});