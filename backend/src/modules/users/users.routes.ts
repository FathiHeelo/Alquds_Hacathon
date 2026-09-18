import { Router } from "express";
import { z } from "zod";

import { guard } from "../../middleware/auth";
import { validate, validated } from "../../middleware/validate";
import { userService } from "./users.service";

export const usersRouter = Router();
usersRouter.use(guard());

const updateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().min(6).max(20).nullable().optional()
});

usersRouter.get("/me", async (request, response) => {
  response.json(await userService.me(request.auth!.id));
});

usersRouter.patch("/me", validate("body", updateSchema), async (request, response) => {
  response.json(await userService.updateMe(request.auth!.id, validated(request, "body")));
});
