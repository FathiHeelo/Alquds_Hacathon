import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./shared/logger";

const server = app.listen(env.port, () => {
  logger.info(`AMMERHA backend listening on port ${env.port} (${env.nodeEnv})`);
});

const shutdown = () => {
  server.close();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
