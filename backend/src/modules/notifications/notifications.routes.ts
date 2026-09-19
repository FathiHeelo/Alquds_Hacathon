import { Router } from "express";
import { z } from "zod";

import { guard } from "../../middleware/auth";
import { validate, validated } from "../../middleware/validate";
import { notificationService } from "./notifications.service";

export const notificationsRouter = Router();
notificationsRouter.use(guard());

const listQuery = z.object({ unread: z.enum(["true", "false"]).optional() });

notificationsRouter.get("/", validate("query", listQuery), async (request, response) => {
  const { unread } = validated<z.infer<typeof listQuery>>(request, "query");
  response.json(await notificationService.list(request.auth!.id, unread === "true"));
});

notificationsRouter.post("/read-all", async (request, response) => {
  response.json(await notificationService.markAllRead(request.auth!.id));
});

notificationsRouter.post("/:id/read", async (request, response) => {
  response.json(await notificationService.markRead(String(request.params.id), request.auth!.id));
});
