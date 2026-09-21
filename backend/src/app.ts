import express from "express";

import { cors } from "./middleware/cors";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { apiV1Router } from "./routes";

export const app = express();

app.use(cors);
app.use(express.json());
app.use(requestLogger);

// Liveness (no DB) for simple probes; DB-aware health lives at /api/v1/health.
app.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "ammerha-backend" });
});
app.use("/api/v1", apiV1Router);

app.use(notFoundHandler);
app.use(errorHandler);
