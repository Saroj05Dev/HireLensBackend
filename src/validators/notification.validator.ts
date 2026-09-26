import { z } from "zod";

// Reusable param schema for notification ID
export const notificationIdParamSchema = z.object({
  id: z.string().uuid("Invalid notification ID format"),
});
