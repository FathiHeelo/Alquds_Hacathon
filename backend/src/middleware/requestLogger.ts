import type { RequestHandler } from "express";

import { logger } from "../shared/logger";

export const requestLogger: RequestHandler = (request, response, next) => {
  const start = Date.now();
  response.on("finish", () => {
    logger.info(`${request.method} ${request.originalUrl} ${response.statusCode} ${Date.now() - start}ms`);
  });
  next();
};
