import { prisma } from "../config/prisma";
import { AppError } from "../middlewares/error.middleware";

export interface AttendanceEntryDto {
  studentId: string;
  value: 0 | 0.5 | 1;
}

export interface CreateAttendanceDto {
  courseId: string;
  institutionId: string;
  date: string;
  entries: AttendanceEntryDto[];
  recordedById: string;
}

export const attendanceService = {
  async create(dto: CreateAttendanceDto) {
    const date = new Date(dto.date);

    const existing = await prisma.attendanceSession.findUnique({
      where: { courseId_date: { courseId: dto.courseId, date } },
    });
    if (existing)
      throw new AppError(
        409,
        "Attendance already recorded for this course on this date",
      );

    return prisma.attendanceSession.create({
      data: {
        courseId: dto.courseId,
        institutionId: dto.institutionId,
        date,
        recordedById: dto.recordedById,
        entries: {
          create: dto.entries.map((e) => ({
            studentId: e.studentId,
            value: e.value,
          })),
        },
      },
      include: { entries: true },
    });
  },

  async findByCourse(courseId: string, from?: string, to?: string) {
    return prisma.attendanceSession.findMany({
      where: {
        courseId,
        ...(from || to
          ? {
              date: {
                ...(from && { gte: new Date(from) }),
                ...(to && { lte: new Date(to) }),
              },
            }
          : {}),
      },
      include: { entries: true },
      orderBy: { date: "desc" },
    });
  },

  async findByStudent(
    studentId: string,
    institutionId: string,
    academicYear?: number,
  ) {
    const entries = await prisma.attendanceEntry.findMany({
      where: {
        studentId,
        session: { institutionId },
      },
      include: { session: { select: { date: true } } },
      orderBy: { session: { date: "desc" } },
    });
    return entries.map((e) => ({ date: e.session.date, value: e.value }));
  },

  async findById(id: string) {
    const session = await prisma.attendanceSession.findUnique({
      where: { id },
      include: { entries: true },
    });
    if (!session) throw new AppError(404, "Attendance record not found");
    return session;
  },

  async update(id: string, entries: AttendanceEntryDto[]) {
    const session = await prisma.attendanceSession.findUnique({
      where: { id },
    });
    if (!session) throw new AppError(404, "Attendance record not found");

    return prisma.$transaction(async (tx) => {
      await tx.attendanceEntry.deleteMany({
        where: { attendanceSessionId: id },
      });
      await tx.attendanceEntry.createMany({
        data: entries.map((e) => ({
          attendanceSessionId: id,
          studentId: e.studentId,
          value: e.value,
        })),
      });
      return tx.attendanceSession.findUnique({
        where: { id },
        include: { entries: true },
      });
    });
  },
};
