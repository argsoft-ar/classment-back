import { prisma } from "./prisma";
import { logger } from "../utils/logger.utils";

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info("PostgreSQL connected successfully via Prisma");
  } catch (error) {
    logger.error("PostgreSQL connection failed", error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
