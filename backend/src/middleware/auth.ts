import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env";
import { Collections, col } from "../database/firestore";
import { AppError } from "../errors/AppError";
import { ErrorCode } from "../errors/errorCodes";
import type { AccountStatus, UserRole } from "../shared/status";

/** Verifies the bearer token and loads the account (so suspension takes effect immediately). */
export const authenticate: RequestHandler = async (request, _response, next) => {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw new AppError(ErrorCode.AuthRequired, "Authentication required", 401);

  let userId: string;
  try {
    userId = (jwt.verify(header.slice(7), env.jwtSecret) as { sub: string }).sub;
  } catch {
    throw new AppError(ErrorCode.AuthRequired, "Invalid or expired token", 401);
  }

  const snap = await col(Collections.users).doc(userId).get();
  if (!snap.exists) throw new AppError(ErrorCode.AuthRequired, "Account not found", 401);
  const data = snap.data() as { role: UserRole; status: AccountStatus };
  if (data.status !== "active") throw new AppError(ErrorCode.AccountInactive, `Account is ${data.status}`, 403);

  request.auth = { id: userId, role: data.role, status: data.status };
  next();
};

export const requireRole =
  (...roles: UserRole[]): RequestHandler =>
  (request, _response, next) => {
    if (!request.auth || !roles.includes(request.auth.role)) {
      throw new AppError(ErrorCode.PermissionDenied, "You do not have access to this resource", 403);
    }
    next();
  };

/** Route guard: authenticated + one of the given roles. */
export const guard = (...roles: UserRole[]): RequestHandler => {
  const roleCheck = requireRole(...roles);
  return async (request, response, next) => {
    await authenticate(request, response, () => undefined);
    if (roles.length) roleCheck(request, response, () => undefined);
    next();
  };
};
