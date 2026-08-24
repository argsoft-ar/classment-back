import { prisma } from "../config/prisma";
import { hashPassword } from "../utils/hash.utils";
import { AppError } from "../middlewares/error.middleware";
import { IUserPublic } from "../interfaces/user.interface";

function toPublic(user: {
  id: string;
  email: string;
  dni: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}): IUserPublic {
  return {
    id: user.id,
    email: user.email,
    dni: user.dni,
    firstName: user.firstName,
    lastName: user.lastName,
    isActive: user.isActive,
  };
}

export const usersService = {
  async findAll(): Promise<IUserPublic[]> {
    const users = await prisma.user.findMany({ where: { isActive: true } });
    return users.map(toPublic);
  },

  async findById(id: string): Promise<IUserPublic> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || !user.isActive) throw new AppError(404, "User not found");
    return toPublic(user);
  },

  async update(
    id: string,
    data: Partial<{ firstName: string; lastName: string; email: string; password: string }>,
  ): Promise<IUserPublic> {
    if (data.password) {
      data.password = await hashPassword(data.password);
    }
    const user = await prisma.user.update({ where: { id }, data });
    return toPublic(user);
  },

  async deactivate(id: string): Promise<void> {
    await prisma.user.update({ where: { id }, data: { isActive: false } });
  },
};
