import express, { Application } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import router from "../routes/index";
import { errorMiddleware } from "../middlewares/error.middleware";
import { swaggerSpec } from "../docs/index";

export function createApp(): Application {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: "Classment API Docs",
      swaggerOptions: { persistAuthorization: true },
    }),
  );

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api/v1", router);

  app.use(errorMiddleware);

  return app;
}
