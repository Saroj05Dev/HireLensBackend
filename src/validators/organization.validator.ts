import { z } from "zod";
import { InviteRole } from "@prisma/client";

export const inviteUserSchema = z.object({
  email: z.string().trim().email("Valid email is required"),
  role: z.nativeEnum(InviteRole, {
    message: "Role must be either RECRUITER or INTERVIEWER",
  }),
});

// Reusable param schemas
export const orgIdParamSchema = z.object({
  orgId: z.string().uuid("Invalid organization ID format"),
});

export const userIdParamSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
});
