import { prisma } from "../config/prisma";
import { AppError } from "../middlewares/error.middleware";

export interface CreateCourseDto {
  name: string;
  year: number;
  division: string;
  academicYear: number;
  institutionId: string;
  studentIds?: string[];
}

export interface UpdateCourseDto {
  name?: string;
  studentIds?: string[];
  isActive?: boolean;
}

export const coursesService = {
  async create(dto: CreateCourseDto) {
    return prisma.course.create({
      data: {
        name: dto.name,
        year: dto.year,
        division: dto.division,
        academicYear: dto.academicYear,
        institutionId: dto.institutionId,
        students: dto.studentIds
          ? { create: dto.studentIds.map((userId) => ({ userId })) }
          : undefined,
      },
      include: { students: { include: { user: { select: { id: true, firstName: true, lastName: true, dni: true } } } } },
    });
  },

  async findByInstitution(institutionId: string, academicYear?: number) {
    return prisma.course.findMany({
      where: {
        institutionId,
        isActive: true,
        ...(academicYear !== undefined && { academicYear }),
      },
      include: { students: { include: { user: { select: { id: true, firstName: true, lastName: true, dni: true } } } } },
    });
  },

  async findById(id: string) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: { students: { include: { user: { select: { id: true, firstName: true, lastName: true, dni: true } } } } },
    });
    if (!course || !course.isActive) throw new AppError(404, "Course not found");
    return course;
  },

  async update(id: string, dto: UpdateCourseDto) {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) throw new AppError(404, "Course not found");

    return prisma.$transaction(async (tx) => {
      if (dto.studentIds !== undefined) {
        await tx.courseStudent.deleteMany({ where: { courseId: id } });
        await tx.courseStudent.createMany({
          data: dto.studentIds.map((userId) => ({ courseId: id, userId })),
        });
      }
      return tx.course.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        },
      });
    });
  },

  async addStudent(courseId: string, userId: string) {
    await prisma.courseStudent.upsert({
      where: { courseId_userId: { courseId, userId } },
      create: { courseId, userId },
      update: {},
    });
    return prisma.course.findUnique({
      where: { id: courseId },
      include: { students: { include: { user: { select: { id: true, firstName: true, lastName: true, dni: true } } } } },
    });
  },

  async removeStudent(courseId: string, userId: string) {
    await prisma.courseStudent.delete({
      where: { courseId_userId: { courseId, userId } },
    });
    return prisma.course.findUnique({
      where: { id: courseId },
      include: { students: { include: { user: { select: { id: true, firstName: true, lastName: true, dni: true } } } } },
    });
  },
};
