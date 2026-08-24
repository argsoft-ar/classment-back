import { prisma } from "../config/prisma";
import { AppError } from "../middlewares/error.middleware";

export interface CreateMessageDto {
  title: string;
  body: string;
  senderId: string;
  institutionId: string;
  targetCourseId?: string | null;
}

export const messagingService = {
  async create(dto: CreateMessageDto) {
    if (dto.targetCourseId) {
      const course = await prisma.course.findUnique({ where: { id: dto.targetCourseId } });
      if (!course) throw new AppError(404, "Target course not found");
    }

    return prisma.message.create({
      data: {
        title: dto.title,
        body: dto.body,
        senderId: dto.senderId,
        institutionId: dto.institutionId,
        targetCourseId: dto.targetCourseId ?? null,
      },
      include: { sender: { select: { id: true, firstName: true, lastName: true } } },
    });
  },

  async findForUser(institutionId: string, courseIds: string[]) {
    return prisma.message.findMany({
      where: {
        institutionId,
        OR: [
          { targetCourseId: null },
          { targetCourseId: { in: courseIds } },
        ],
      },
      include: { sender: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string) {
    const message = await prisma.message.findUnique({
      where: { id },
      include: { sender: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!message) throw new AppError(404, "Message not found");
    return message;
  },

  async markAsRead(messageId: string, userId: string) {
    await prisma.messageRead.upsert({
      where: { messageId_userId: { messageId, userId } },
      create: { messageId, userId },
      update: {},
    });
    return prisma.message.findUnique({
      where: { id: messageId },
      include: { reads: { select: { userId: true, readAt: true } } },
    });
  },

  async delete(id: string): Promise<void> {
    const message = await prisma.message.findUnique({ where: { id } });
    if (!message) throw new AppError(404, "Message not found");
    await prisma.message.delete({ where: { id } });
  },
};
