import { prisma } from "../config/prisma";
import { hashPassword, comparePassword } from "../utils/hash.utils";
import { signToken } from "../utils/jwt.utils";
import { AppError } from "../middlewares/error.middleware";
import { RoleLevel } from "../types/rbac.types";

export interface RegisterDto {
  email: string;
  password: string;
  dni: string;
  firstName: string;
  lastName: string;
  institutionId: string;
  roleLevel: RoleLevel;
}

export interface LoginDto {
  email: string;
  password: string;
  institutionId: string;
}

export const authService = {
  async register(dto: RegisterDto) {
    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new AppError(409, "Email already registered");

    const institution = await prisma.institution.findUnique({ where: { id: dto.institutionId } });
    if (!institution) throw new AppError(404, "Institution not found");

    const hashedPassword = await hashPassword(dto.password);

    const user = await prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        dni: dto.dni,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });

    await prisma.role.create({
      data: {
        userId: user.id,
        institutionId: dto.institutionId,
        level: dto.roleLevel,
      },
    });

    return { userId: user.id };
  },

  async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new AppError(401, "Invalid credentials");

    const valid = await comparePassword(dto.password, user.password);
    if (!valid) throw new AppError(401, "Invalid credentials");

    const role = await prisma.role.findFirst({
      where: {
        userId: user.id,
        institutionId: dto.institutionId,
        isActive: true,
      },
    });
    if (!role) throw new AppError(403, "No active role for this institution");

    const token = signToken({
      userId: user.id,
      institutionId: dto.institutionId,
      role: role.level,
      email: user.email,
    });

    return { token };
  },
};
