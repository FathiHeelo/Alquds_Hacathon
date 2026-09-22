import { Router } from "express";

import { Collections, col } from "../../database/firestore";

export const healthRouter = Router();

healthRouter.get("/", async (_request, response) => {
  let database: "up" | "down" = "up";
  try {
    // Cheap connectivity probe: a single-document read against Firestore.
    await col(Collections.serviceCategories).limit(1).get();
  } catch {
    database = "down";
  }
  response.status(database === "up" ? 200 : 503).json({
    status: database === "up" ? "ok" : "degraded",
    service: "ammerha-backend",
    database
  });
});
