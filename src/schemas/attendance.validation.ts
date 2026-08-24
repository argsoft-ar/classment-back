import { z } from "zod";

const attendanceValueSchema = z.union([
  z.literal(0),
  z.literal(0.5),
  z.literal(1),
]);

const attendanceEntrySchema = z.object({
  studentId: z.string().min(1),
  value: attendanceValueSchema,
});

export const createAttendanceSchema = z.object({
  courseId: z.string().min(1),
  institutionId: z.string().min(1),
  date: z.string().datetime(),
  entries: z.array(attendanceEntrySchema).min(1),
});

export const updateAttendanceSchema = z.object({
  entries: z.array(attendanceEntrySchema).min(1),
});

export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>;
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;
