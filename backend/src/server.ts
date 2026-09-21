import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./database/prisma";
import { logger } from "./shared/logger";

const server = app.listen(env.port, () => {
  logger.info(`AMMERHA backend listening on port ${env.port} (${env.nodeEnv})`);
});

const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
