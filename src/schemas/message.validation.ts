import { z } from "zod";

export const createMessageSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  targetCourseId: z.string().length(24).nullable().optional(),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
