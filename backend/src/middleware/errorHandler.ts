import type { ErrorRequestHandler } from "express";

import { AppError } from "../errors/AppError";
import { ErrorCode } from "../errors/errorCodes";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ code: error.code, message: error.message });
    return;
  }

  response.status(500).json({
    code: ErrorCode.NetworkError,
    message: "Unexpected server error"
  });
};
