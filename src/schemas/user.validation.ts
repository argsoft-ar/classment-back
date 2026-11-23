import { z } from "zod";
import { cuid, emailString, LIMITS, nameString, passwordString } from "./common.validation";

export const userRoleValues = ["SuperAdmin", "Directivo", "Docente", "Alumno"] as const;
export const creatableRoleValues = ["Directivo", "Docente", "Alumno"] as const;
export const userStatusValues = ["INVITED", "ACTIVE", "INACTIVE"] as const;

const dniString = z
  .string()
  .max(LIMITS.CODE)
  .regex(/^\d{7,10}$/, "DNI must contain 7 to 10 digits");

/** Base object (no refinements) so it can be extended by the register schema. */
export const createUserBaseSchema = z
  .object({
    email: emailString,
    dni: dniString,
    firstName: nameString,
    lastName: nameString,
    role: z.enum(creatableRoleValues),
    /** Optional in Fase 0: without password the user stays INVITED (activation email in Fase 1). */
    password: passwordString.optional(),
    careerId: cuid.optional(),
    cohortYear: z.number().int().min(1990).max(2100).optional(),
  })
  .strict();

type CreateUserShape = z.infer<typeof createUserBaseSchema>;

export const studentNeedsCareer = (data: Pick<CreateUserShape, "role" | "careerId">) =>
  data.role !== "Alumno" || !!data.careerId;

export const createUserSchema = createUserBaseSchema.refine(studentNeedsCareer, {
  message: "careerId is required for students",
  path: ["careerId"],
});

export const updateUserSchema = z
  .object({
    email: emailString,
    dni: dniString,
    firstName: nameString,
    lastName: nameString,
    password: passwordString,
    status: z.enum(userStatusValues),
  })
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const listUsersQuerySchema = z.object({
  role: z.enum(userRoleValues).optional(),
  status: z.enum(userStatusValues).optional(),
  careerId: cuid.optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
