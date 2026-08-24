import "./types/express.types";
import { connectDatabase } from "./config/database";
import { createApp } from "./config/app";
import { env } from "./config/env";
import { logger } from "./utils/logger.utils";

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const app = createApp();

  app.listen(env.PORT, () => {
    logger.info(`Classment API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
