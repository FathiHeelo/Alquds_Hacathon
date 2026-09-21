import type { RequestHandler } from "express";

import { env } from "../config/env";

const localhostOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export const cors: RequestHandler = (request, response, next) => {
  const origin = request.headers.origin;
  const allowed = origin && (env.corsOrigins.includes(origin) || (env.nodeEnv !== "production" && localhostOrigin.test(origin)));

  if (allowed) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
    response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,POST,PATCH,PUT,DELETE,OPTIONS");
  }
  if (request.method === "OPTIONS") {
    response.status(allowed ? 204 : 403).end();
    return;
  }
  next();
};
