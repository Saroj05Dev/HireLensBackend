import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters").optional(),
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(100, "Title must be at most 100 characters").optional(),
}).refine((data) => data.name !== undefined || data.title !== undefined, {
  message: "At least one field (name or title) must be provided",
});
