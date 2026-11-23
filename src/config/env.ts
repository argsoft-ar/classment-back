import dotenv from "dotenv";
import { parseCorsOrigins, validateJwtSecret } from "../utils/env.utils";

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  NODE_ENV: (process.env["NODE_ENV"] ?? "development") as
    | "development"
    | "production"
    | "test",
  PORT: parseInt(process.env["PORT"] ?? "3000", 10),
  DATABASE_URL: requireEnv("DATABASE_URL"),
  JWT_SECRET: validateJwtSecret(requireEnv("JWT_SECRET")),
  JWT_EXPIRES_IN: process.env["JWT_EXPIRES_IN"] ?? "8h",
  JWT_ISSUER: "classment-api",
  JWT_AUDIENCE: "classment-web",
  BCRYPT_ROUNDS: parseInt(process.env["BCRYPT_ROUNDS"] ?? "12", 10),
  CORS_ORIGINS: parseCorsOrigins(process.env["CORS_ORIGINS"], "http://localhost:5173"),
  LOGIN_RATE_LIMIT_MAX: parseInt(process.env["LOGIN_RATE_LIMIT_MAX"] ?? "10", 10),
  LOGIN_RATE_LIMIT_WINDOW_MS: parseInt(
    process.env["LOGIN_RATE_LIMIT_WINDOW_MS"] ?? String(15 * 60 * 1000),
    10,
  ),
} as const;
