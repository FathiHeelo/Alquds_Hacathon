import express from "express";

import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { healthRouter } from "./modules/health.routes";

const app = express();

app.use(express.json());
app.use("/health", healthRouter);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`AMMERHA backend listening on port ${env.port}`);
});
