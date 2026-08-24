import dotenv from "dotenv";

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
  JWT_SECRET: requireEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env["JWT_EXPIRES_IN"] ?? "7d",
  BCRYPT_ROUNDS: parseInt(process.env["BCRYPT_ROUNDS"] ?? "12", 10),
} as const;
