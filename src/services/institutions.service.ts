import { prisma } from "../config/prisma";
import { AppError } from "../middlewares/error.middleware";
import { IInstitution } from "../interfaces/institution.interface";

export interface CreateInstitutionDto {
  name: string;
  cue: string;
  address: string;
  institutionType: "secondary" | "tertiary";
  activeAcademicYear: number;
}

export interface UpdateInstitutionDto {
  name?: string;
  address?: string;
  activeAcademicYear?: number;
  gradingPeriodOpen?: boolean;
}

export const institutionsService = {
  async create(dto: CreateInstitutionDto): Promise<IInstitution> {
    const existing = await prisma.institution.findUnique({ where: { cue: dto.cue } });
    if (existing) throw new AppError(409, "Institution with this CUE already exists");
    return prisma.institution.create({ data: dto });
  },

  async findAll(): Promise<IInstitution[]> {
    return prisma.institution.findMany({ where: { isActive: true } });
  },

  async findById(id: string): Promise<IInstitution> {
    const institution = await prisma.institution.findUnique({ where: { id } });
    if (!institution || !institution.isActive) throw new AppError(404, "Institution not found");
    return institution;
  },

  async update(id: string, dto: UpdateInstitutionDto): Promise<IInstitution> {
    const institution = await prisma.institution.findUnique({ where: { id } });
    if (!institution) throw new AppError(404, "Institution not found");
    return prisma.institution.update({ where: { id }, data: dto });
  },

  async toggleGradingPeriod(id: string, open: boolean): Promise<IInstitution> {
    const institution = await prisma.institution.findUnique({ where: { id } });
    if (!institution) throw new AppError(404, "Institution not found");
    return prisma.institution.update({ where: { id }, data: { gradingPeriodOpen: open } });
  },

  async deactivate(id: string): Promise<void> {
    const institution = await prisma.institution.findUnique({ where: { id } });
    if (!institution) throw new AppError(404, "Institution not found");
    await prisma.institution.update({ where: { id }, data: { isActive: false } });
  },
};
