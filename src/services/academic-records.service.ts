import { prisma } from "../config/prisma";
import { AppError } from "../middlewares/error.middleware";
import { CycleStatus } from "../interfaces/academic-record.interface";

export interface CreateAcademicRecordDto {
  studentId: string;
  institutionId: string;
  courseId: string;
  academicYear: number;
}

export interface UpdateAcademicRecordDto {
  cycleStatus?: CycleStatus;
  previaIds?: string[];
}

export const academicRecordsService = {
  async create(dto: CreateAcademicRecordDto) {
    const existing = await prisma.academicRecord.findUnique({
      where: {
        studentId_institutionId_academicYear: {
          studentId: dto.studentId,
          institutionId: dto.institutionId,
          academicYear: dto.academicYear,
        },
      },
    });
    if (existing) throw new AppError(409, "Academic record already exists for this student and year");

    return prisma.academicRecord.create({
      data: dto,
      include: { previas: { include: { subject: { select: { id: true, name: true } } } } },
    });
  },

  async findByStudent(studentId: string) {
    return prisma.academicRecord.findMany({
      where: { studentId },
      include: {
        course: { select: { id: true, name: true, year: true, division: true } },
        previas: { include: { subject: { select: { id: true, name: true } } } },
      },
    });
  },

  async findByCourse(courseId: string, academicYear: number) {
    return prisma.academicRecord.findMany({
      where: { courseId, academicYear },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, dni: true } },
        previas: { include: { subject: { select: { id: true, name: true } } } },
      },
    });
  },

  async findById(id: string) {
    const record = await prisma.academicRecord.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, dni: true } },
        course: { select: { id: true, name: true, year: true, division: true } },
        previas: { include: { subject: { select: { id: true, name: true } } } },
      },
    });
    if (!record) throw new AppError(404, "Academic record not found");
    return record;
  },

  async update(id: string, dto: UpdateAcademicRecordDto) {
    const record = await prisma.academicRecord.findUnique({ where: { id } });
    if (!record) throw new AppError(404, "Academic record not found");

    return prisma.$transaction(async (tx) => {
      if (dto.previaIds !== undefined) {
        await tx.academicRecordPrevia.deleteMany({ where: { academicRecordId: id } });
        await tx.academicRecordPrevia.createMany({
          data: dto.previaIds.map((subjectId) => ({ academicRecordId: id, subjectId })),
        });
      }
      return tx.academicRecord.update({
        where: { id },
        data: { ...(dto.cycleStatus !== undefined && { cycleStatus: dto.cycleStatus }) },
        include: { previas: { include: { subject: { select: { id: true, name: true } } } } },
      });
    });
  },
};
