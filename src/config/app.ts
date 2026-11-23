import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import router from "../routes/index";
import { errorMiddleware } from "../middlewares/error.middleware";
import { swaggerSpec } from "../docs/index";
import { env } from "./env";

export function createApp(): Application {
  const app = express();

  // NOTE: `trust proxy` is intentionally NOT enabled. When deployed behind a reverse proxy / load
  // balancer, set it to the exact number of hops (e.g. app.set("trust proxy", 1)) so req.ip — and
  // therefore the login rate limiter — sees the real client address. See README.
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (env.NODE_ENV !== "production") {
    app.use(
      "/docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        customSiteTitle: "Classment API Docs",
        swaggerOptions: { persistAuthorization: true },
      }),
    );
  }

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api/v1", router);

  app.use(errorMiddleware);

  return app;
}
