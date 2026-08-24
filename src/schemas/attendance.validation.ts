import { z } from "zod";

const attendanceValueSchema = z.union([
  z.literal(0),
  z.literal(0.5),
  z.literal(1),
]);

const attendanceEntrySchema = z.object({
  studentId: z.string().length(24),
  value: attendanceValueSchema,
});

export const createAttendanceSchema = z.object({
  courseId: z.string().length(24),
  institutionId: z.string().length(24),
  date: z.string().datetime(),
  entries: z.array(attendanceEntrySchema).min(1),
});

export const updateAttendanceSchema = z.object({
  entries: z.array(attendanceEntrySchema).min(1),
});

export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>;
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;
