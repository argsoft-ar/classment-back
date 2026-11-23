export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}

/** Authenticated principal exposed as `req.user` (always re-loaded from the DB by authMiddleware). */
export interface JwtPayload {
  userId: string;
  role: string;
  email: string;
}

/**
 * Claims signed into the JWT. role/email are informational for the frontend only; the server
 * re-loads them from the DB. `tv` must match User.tokenVersion for the token to be accepted.
 */
export interface TokenClaims extends JwtPayload {
  tv: number;
}
