import { prisma } from "../config/prisma";
import { AppError } from "../middlewares/error.middleware";
import { IInstitutionConfig } from "../interfaces/institution.interface";
import { UpdateInstitutionInput } from "../schemas/institution.validation";

export const institutionService = {
  /** Single-institution deployment: the configuration lives in one seeded row. */
  async getConfig(): Promise<IInstitutionConfig> {
    const institution = await prisma.institution.findFirst({
      orderBy: { createdAt: "asc" },
    });
    if (!institution) {
      throw new AppError(500, "Institution configuration is not initialized");
    }
    return institution;
  },

  async update(dto: UpdateInstitutionInput): Promise<IInstitutionConfig> {
    const current = await institutionService.getConfig();

    const allowsPromotion = dto.allowsPromotion ?? current.allowsPromotion;
    const passingGrade = dto.passingGrade ?? current.passingGrade;
    const promotionGrade =
      dto.promotionGrade !== undefined ? dto.promotionGrade : current.promotionGrade;

    if (allowsPromotion && (promotionGrade === null || promotionGrade < passingGrade)) {
      throw new AppError(
        422,
        "promotionGrade must be set and >= passingGrade when allowsPromotion is true",
      );
    }

    return prisma.institution.update({ where: { id: current.id }, data: dto });
  },
};
