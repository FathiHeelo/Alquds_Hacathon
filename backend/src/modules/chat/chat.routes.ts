import { Router } from "express";
import { z } from "zod";

import { guard } from "../../middleware/auth";
import { validate, validated } from "../../middleware/validate";
import { chatService, type MessageInput } from "./chat.service";

/** Nested under /jobs/:id/conversation */
export const chatRouter = Router({ mergeParams: true });

const listQuery = z.object({ after: z.coerce.date().optional() });

const messageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), body: z.string().trim().min(1).max(2000) }),
  z.object({ type: z.literal("image"), body: z.string().url().max(2000) }),
  z.object({
    type: z.literal("location"),
    payload: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180), label: z.string().max(200).optional() })
  })
]);

chatRouter.get("/", guard(), validate("query", listQuery), async (request, response) => {
  const { after } = validated<z.infer<typeof listQuery>>(request, "query");
  response.json(await chatService.get(String(request.params.id), request.auth!, after));
});

chatRouter.post("/messages", guard("customer", "technician", "admin"), validate("body", messageSchema), async (request, response) => {
  response.status(201).json(await chatService.send(String(request.params.id), request.auth!, validated<MessageInput>(request, "body")));
});
