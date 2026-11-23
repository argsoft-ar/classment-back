import { prisma } from "../config/prisma";
import { comparePasswordConstantTime } from "../utils/hash.utils";
import { signToken } from "../utils/jwt.utils";
import { AppError } from "../middlewares/error.middleware";
import { JwtPayload } from "../types/common.types";
import { LoginInput, RegisterInput } from "../schemas/auth.validation";
import { ILoginResult, IUserPublic } from "../interfaces/user.interface";
import { usersService } from "./users.service";

export type LoginDto = LoginInput;
export type RegisterDto = RegisterInput;

const INVALID_CREDENTIALS = "Invalid credentials";

export const authService = {
  async register(dto: RegisterDto, actor: JwtPayload): Promise<IUserPublic> {
    return usersService.create(dto, actor);
  },

  /**
   * Unknown email, missing password, wrong password and non-ACTIVE accounts all produce the same
   * 401 after exactly one bcrypt comparison, so responses do not reveal which accounts exist.
   */
  async login(dto: LoginDto): Promise<ILoginResult> {
    const user = await prisma.user.findUnique({ where: { email: dto.email } });

    const passwordOk = await comparePasswordConstantTime(dto.password, user?.password);
    if (!user || !passwordOk || user.status !== "ACTIVE") {
      throw new AppError(401, INVALID_CREDENTIALS);
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
      email: user.email,
      tv: user.tokenVersion,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  },

  /**
   * Returns the current principal for a verified token, or null when the user no longer exists,
   * is not ACTIVE, or the token was issued before the last tokenVersion bump.
   */
  async resolvePrincipal(userId: string, tokenVersion: number): Promise<JwtPayload | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true, status: true, tokenVersion: true },
    });
    if (!user || user.status !== "ACTIVE" || user.tokenVersion !== tokenVersion) return null;
    return { userId: user.id, role: user.role, email: user.email };
  },
};
