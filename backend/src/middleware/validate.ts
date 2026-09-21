import type { Request, RequestHandler } from "express";
import type { ZodType } from "zod";

import { AppError } from "../errors/AppError";
import { ErrorCode } from "../errors/errorCodes";

type Source = "body" | "query" | "params";
type WithValidated = { validated?: Partial<Record<Source, unknown>> };

/**
 * Validation pattern: `router.post("/", validate("body", schema), handler)`,
 * then read the typed result with `validated<T>(request, "body")`.
 */
export const validate =
  (source: Source, schema: ZodType): RequestHandler =>
  (request, _response, next) => {
    const result = schema.safeParse(request[source]);
    if (!result.success) {
      const message = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
      next(new AppError(ErrorCode.ValidationError, message, 400));
      return;
    }
    const target = request as unknown as WithValidated;
    target.validated = { ...target.validated, [source]: result.data };
    next();
  };

export const validated = <T>(request: Request, source: Source): T =>
  (request as unknown as WithValidated).validated?.[source] as T;
