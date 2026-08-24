import { prisma } from "../config/prisma";
import { AppError } from "../middlewares/error.middleware";

export interface UpdateGradeDto {
  firstQuarterPreInforme?: string;
  firstQuarterExcludeFromReport?: boolean;
  firstQuarterFinalGrade?: number | null;
  secondQuarterPreInforme?: string;
  secondQuarterExcludeFromReport?: boolean;
  secondQuarterFinalGrade?: number | null;
  finalYearGrade?: number | null;
}

export const gradesService = {
  async findOrCreate(studentId: string, subjectId: string, institutionId: string, academicYear: number) {
    return prisma.grade.upsert({
      where: { studentId_subjectId_academicYear: { studentId, subjectId, academicYear } },
      create: { studentId, subjectId, institutionId, academicYear },
      update: {},
      include: { modificationLog: true },
    });
  },

  async findByStudent(studentId: string, academicYear: number) {
    return prisma.grade.findMany({
      where: { studentId, academicYear },
      include: { subject: { select: { id: true, name: true } } },
    });
  },

  async findBySubject(subjectId: string, academicYear: number) {
    return prisma.grade.findMany({
      where: { subjectId, academicYear },
      include: { student: { select: { id: true, firstName: true, lastName: true, dni: true } } },
    });
  },

  async findById(id: string) {
    const grade = await prisma.grade.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, dni: true } },
        subject: { select: { id: true, name: true } },
        modificationLog: true,
      },
    });
    if (!grade) throw new AppError(404, "Grade not found");
    return grade;
  },

  async update(
    id: string,
    dto: UpdateGradeDto,
    institutionId: string,
    modifiedById: string,
    isDirectivo: boolean,
  ) {
    const institution = await prisma.institution.findUnique({ where: { id: institutionId } });
    if (!institution) throw new AppError(404, "Institution not found");

    if (!institution.gradingPeriodOpen && !isDirectivo) {
      throw new AppError(403, "Grading period is closed");
    }

    const grade = await prisma.grade.findUnique({ where: { id } });
    if (!grade) throw new AppError(404, "Grade not found");

    return prisma.$transaction(async (tx) => {
      if (isDirectivo) {
        await tx.gradeModificationLog.create({
          data: {
            gradeId: id,
            modifiedById,
            previousValue: grade as object,
            newValue: { ...grade, ...dto } as object,
          },
        });
      }

      return tx.grade.update({
        where: { id },
        data: dto,
        include: { modificationLog: true },
      });
    });
  },
};
