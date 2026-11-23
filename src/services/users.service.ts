import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { hashPassword } from "../utils/hash.utils";
import { AppError } from "../middlewares/error.middleware";
import { IUserPublic } from "../interfaces/user.interface";
import { JwtPayload } from "../types/common.types";
import { RoleLevel } from "../types/rbac.types";
import {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
} from "../schemas/user.validation";
import { careersService } from "./careers.service";

const userSelect = {
  id: true,
  email: true,
  dni: true,
  firstName: true,
  lastName: true,
  role: true,
  status: true,
  createdAt: true,
  studentCareers: {
    select: {
      cohortYear: true,
      studyPlan: {
        select: {
          id: true,
          code: true,
          career: { select: { id: true, name: true } },
        },
      },
    },
  },
} satisfies Prisma.UserSelect;

type UserWithCareers = Prisma.UserGetPayload<{ select: typeof userSelect }>;

function toPublic(user: UserWithCareers): IUserPublic {
  return {
    id: user.id,
    email: user.email,
    dni: user.dni,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    careers: user.studentCareers.map((sc) => ({
      studyPlanId: sc.studyPlan.id,
      studyPlanCode: sc.studyPlan.code,
      careerId: sc.studyPlan.career.id,
      careerName: sc.studyPlan.career.name,
      cohortYear: sc.cohortYear,
    })),
  };
}

/** Only SUPER_ADMIN may manage Directivo / SuperAdmin accounts. */
function assertCanManageRole(actor: JwtPayload, targetRole: string): void {
  const privileged = targetRole === RoleLevel.DIRECTIVO || targetRole === RoleLevel.SUPER_ADMIN;
  if (privileged && actor.role !== RoleLevel.SUPER_ADMIN) {
    throw new AppError(403, "Forbidden: only SuperAdmin can manage Directivo accounts");
  }
}

export const usersService = {
  async findAll(query: ListUsersQuery): Promise<IUserPublic[]> {
    const users = await prisma.user.findMany({
      where: {
        role: query.role,
        status: query.status,
        ...(query.careerId && {
          studentCareers: { some: { studyPlan: { careerId: query.careerId } } },
        }),
      },
      select: userSelect,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
    return users.map(toPublic);
  },

  async findById(id: string): Promise<IUserPublic> {
    const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
    if (!user) throw new AppError(404, "User not found");
    return toPublic(user);
  },

  async create(dto: CreateUserInput, actor: JwtPayload): Promise<IUserPublic> {
    assertCanManageRole(actor, dto.role);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { dni: dto.dni }] },
    });
    if (existing) throw new AppError(409, "A user with this email or DNI already exists");

    let studyPlanId: string | null = null;
    if (dto.role === "Alumno") {
      if (!dto.careerId) throw new AppError(422, "careerId is required for students");
      const plan = await careersService.getActiveStudyPlan(dto.careerId);
      studyPlanId = plan.id;
    }

    const password = dto.password ? await hashPassword(dto.password) : null;

    const user = await prisma.user.create({
      data: {
        email: dto.email,
        dni: dto.dni,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        password,
        status: password ? "ACTIVE" : "INVITED",
        ...(studyPlanId && {
          studentCareers: {
            create: {
              studyPlanId,
              cohortYear: dto.cohortYear ?? new Date().getFullYear(),
            },
          },
        }),
      },
      select: userSelect,
    });

    return toPublic(user);
  },

  async update(id: string, dto: UpdateUserInput, actor: JwtPayload): Promise<IUserPublic> {
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) throw new AppError(404, "User not found");
    assertCanManageRole(actor, target.role);

    if (dto.status && dto.status !== "ACTIVE" && target.id === actor.userId) {
      throw new AppError(422, "You cannot deactivate your own account");
    }

    const { password, ...rest } = dto;
    const data: Prisma.UserUpdateInput = { ...rest };
    if (password) {
      data.password = await hashPassword(password);
      // Defining a password activates an invited account unless a status is given explicitly.
      if (!dto.status && target.status === "INVITED") data.status = "ACTIVE";
    }
    if (dto.status === "ACTIVE" && !target.password && !password) {
      throw new AppError(422, "Cannot activate a user without a password");
    }

    // Revoke every outstanding token when credentials or account status change.
    const statusChanged = dto.status !== undefined && dto.status !== target.status;
    if (password || statusChanged) data.tokenVersion = { increment: 1 };

    const user = await prisma.user.update({ where: { id }, data, select: userSelect });
    return toPublic(user);
  },

  async deactivate(id: string, actor: JwtPayload): Promise<void> {
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) throw new AppError(404, "User not found");
    assertCanManageRole(actor, target.role);
    if (target.id === actor.userId) {
      throw new AppError(422, "You cannot deactivate your own account");
    }
    await prisma.user.update({
      where: { id },
      data: { status: "INACTIVE", tokenVersion: { increment: 1 } },
    });
  },
};
