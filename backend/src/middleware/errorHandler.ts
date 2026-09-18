import type { ErrorRequestHandler, RequestHandler } from "express";

import { AppError } from "../errors/AppError";
import { ErrorCode } from "../errors/errorCodes";
import { logger } from "../shared/logger";

export const notFoundHandler: RequestHandler = (request, response) => {
  response.status(404).json({ code: ErrorCode.NotFound, message: `Route not found: ${request.method} ${request.originalUrl}` });
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ code: error.code, message: error.message });
    return;
  }

  if (error?.type === "entity.parse.failed") {
    response.status(400).json({ code: ErrorCode.ValidationError, message: "Invalid JSON body" });
    return;
  }

  logger.error("Unhandled error", error);
  response.status(500).json({ code: ErrorCode.InternalError, message: "Unexpected server error" });
};
