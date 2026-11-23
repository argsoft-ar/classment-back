import { z } from "zod";
import { emailString, LIMITS, passwordString } from "./common.validation";
import { createUserBaseSchema, studentNeedsCareer } from "./user.validation";

export const loginSchema = z
  .object({
    email: emailString,
    password: z.string().min(1).max(LIMITS.PASSWORD),
  })
  .strict();

/** Administrative registration of a user that can log in immediately (password required). */
export const registerSchema = createUserBaseSchema
  .extend({ password: passwordString })
  .strict()
  .refine(studentNeedsCareer, {
    message: "careerId is required for students",
    path: ["careerId"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
