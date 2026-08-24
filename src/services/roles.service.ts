import { prisma } from "../config/prisma";
import { AppError } from "../middlewares/error.middleware";
import { RoleLevel } from "../types/rbac.types";

export interface CreateRoleDto {
  userId: string;
  institutionId: string;
  level: RoleLevel;
  assignedCourseIds?: string[];
  assignedSubjectIds?: string[];
}

export interface UpdateRoleDto {
  level?: RoleLevel;
  assignedCourseIds?: string[];
  assignedSubjectIds?: string[];
  isActive?: boolean;
}

export const rolesService = {
  async create(dto: CreateRoleDto) {
    const existing = await prisma.role.findUnique({
      where: {
        userId_institutionId: {
          userId: dto.userId,
          institutionId: dto.institutionId,
        },
      },
    });
    if (existing)
      throw new AppError(
        409,
        "Role already exists for this user in this institution",
      );

    return prisma.role.create({
      data: {
        userId: dto.userId,
        institutionId: dto.institutionId,
        level: dto.level,
        assignedCourses: dto.assignedCourseIds
          ? { create: dto.assignedCourseIds.map((id) => ({ courseId: id })) }
          : undefined,
        assignedSubjects: dto.assignedSubjectIds
          ? { create: dto.assignedSubjectIds.map((id) => ({ subjectId: id })) }
          : undefined,
      },
      include: { assignedCourses: true, assignedSubjects: true },
    });
  },

  async findByInstitution(institutionId: string) {
    return prisma.role.findMany({
      where: { institutionId, isActive: true },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        assignedCourses: {
          include: {
            course: {
              select: { id: true, name: true, year: true, division: true },
            },
          },
        },
        assignedSubjects: {
          include: { subject: { select: { id: true, name: true } } },
        },
      },
    });
  },

  async findById(id: string) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        assignedCourses: { include: { course: true } },
        assignedSubjects: { include: { subject: true } },
      },
    });
    if (!role) throw new AppError(404, "Role not found");
    return role;
  },

  async update(id: string, dto: UpdateRoleDto) {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) throw new AppError(404, "Role not found");

    return prisma.$transaction(async (tx) => {
      if (dto.assignedCourseIds !== undefined) {
        await tx.roleCourse.deleteMany({ where: { roleId: id } });
        await tx.roleCourse.createMany({
          data: dto.assignedCourseIds.map((courseId) => ({
            roleId: id,
            courseId,
          })),
        });
      }
      if (dto.assignedSubjectIds !== undefined) {
        await tx.roleSubject.deleteMany({ where: { roleId: id } });
        await tx.roleSubject.createMany({
          data: dto.assignedSubjectIds.map((subjectId) => ({
            roleId: id,
            subjectId,
          })),
        });
      }
      return tx.role.update({
        where: { id },
        data: {
          ...(dto.level !== undefined && { level: dto.level }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        },
        include: { assignedCourses: true, assignedSubjects: true },
      });
    });
  },

  async deactivate(id: string): Promise<void> {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) throw new AppError(404, "Role not found");
    await prisma.role.update({ where: { id }, data: { isActive: false } });
  },
};
