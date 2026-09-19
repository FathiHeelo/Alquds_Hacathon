import { Router } from "express";
import { z } from "zod";

import { guard } from "../../middleware/auth";
import { validate, validated } from "../../middleware/validate";
import { userService } from "../users/users.service";
import { authService, type RegisterInput } from "./auth.service";

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  phone: z.string().trim().min(6).max(20).optional(),
  password: z.string().min(8).max(100),
  role: z.enum(["customer", "technician"]),
  specialty: z.string().trim().max(50).optional()
});

const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(1) });

authRouter.post("/register", validate("body", registerSchema), async (request, response) => {
  response.status(201).json(await authService.register(validated<RegisterInput>(request, "body")));
});

authRouter.post("/login", validate("body", loginSchema), async (request, response) => {
  const { email, password } = validated<z.infer<typeof loginSchema>>(request, "body");
  response.json(await authService.login(email, password));
});

authRouter.get("/me", guard(), async (request, response) => {
  response.json(await userService.me(request.auth!.id));
});
