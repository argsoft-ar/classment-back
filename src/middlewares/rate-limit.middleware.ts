import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { env } from "../config/env";
import { sendError } from "../utils/response.utils";
import { buildLoginRateLimitKey } from "../utils/rate-limit.utils";

/**
 * Brute-force protection for POST /auth/login, keyed by client IP + lowercased email.
 * In-memory store: limits are per process. `req.ip` is only the real client address when
 * `trust proxy` is configured for the deployment (see README).
 */
export const loginRateLimiter = rateLimit({
  windowMs: env.LOGIN_RATE_LIMIT_WINDOW_MS,
  limit: env.LOGIN_RATE_LIMIT_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => buildLoginRateLimitKey(ipKeyGenerator(req.ip ?? ""), req.body),
  handler: (_req, res, _next, options) => {
    sendError(res, "Too many login attempts, please try again later", options.statusCode);
  },
});
