import { Router } from "express";

import { prisma } from "../../database/prisma";

export const healthRouter = Router();

healthRouter.get("/", async (_request, response) => {
  let database: "up" | "down" = "up";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = "down";
  }
  response.status(database === "up" ? 200 : 503).json({
    status: database === "up" ? "ok" : "degraded",
    service: "ammerha-backend",
    database
  });
});
