import { prisma } from "../config/prisma";
import { AppError } from "../middlewares/error.middleware";

export interface CreateSubjectDto {
  name: string;
  courseId: string;
  teacherId: string;
  institutionId: string;
  academicYear: number;
}

export interface UpdateSubjectDto {
  name?: string;
  teacherId?: string;
  isActive?: boolean;
}

export const subjectsService = {
  async create(dto: CreateSubjectDto) {
    return prisma.subject.create({ data: dto });
  },

  async findByCourse(courseId: string) {
    return prisma.subject.findMany({
      where: { courseId, isActive: true },
      include: { teacher: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
  },

  async findByTeacher(teacherId: string) {
    return prisma.subject.findMany({
      where: { teacherId, isActive: true },
      include: { course: { select: { id: true, name: true, year: true, division: true } } },
    });
  },

  async findById(id: string) {
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        teacher: { select: { id: true, firstName: true, lastName: true, email: true } },
        course: { select: { id: true, name: true, year: true, division: true } },
      },
    });
    if (!subject || !subject.isActive) throw new AppError(404, "Subject not found");
    return subject;
  },

  async update(id: string, dto: UpdateSubjectDto) {
    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject) throw new AppError(404, "Subject not found");
    return prisma.subject.update({ where: { id }, data: dto });
  },

  async deactivate(id: string): Promise<void> {
    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject) throw new AppError(404, "Subject not found");
    await prisma.subject.update({ where: { id }, data: { isActive: false } });
  },
};
