import { randomUUID } from "node:crypto";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "../../config/env";
import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/errorCodes";
import { technicianRepository } from "../technicians/technicians.repository";
import { publicUser, userRepository } from "../users/users.repository";

export interface RegisterInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: "customer" | "technician";
  specialty?: string;
}

const signToken = (userId: string, role: string) =>
  jwt.sign({ sub: userId, role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] });

export const authService = {
  async register(input: RegisterInput) {
    const email = input.email.toLowerCase();
    if (await userRepository.findByEmail(email)) throw new AppError(ErrorCode.Conflict, "Email already registered", 409);
    if (input.phone && (await userRepository.findByPhone(input.phone))) throw new AppError(ErrorCode.Conflict, "Phone already registered", 409);

    const id = randomUUID();
    let user;
    try {
      user = await userRepository.create(id, {
        role: input.role,
        name: input.name,
        email,
        phone: input.phone,
        passwordHash: await bcrypt.hash(input.password, 10),
        status: "active",
        pointsEarned: 0,
        pointsRedeemed: 0
      });
    } catch {
      // Two concurrent registrations for the same email/phone: the index doc `create()` lost the race.
      throw new AppError(ErrorCode.Conflict, "Email or phone already registered", 409);
    }

    if (input.role === "technician") {
      await technicianRepository.createProfile(id, { specialty: input.specialty, serviceAreas: [] });
    }
    return { token: signToken(user.id, user.role), user: publicUser(user) };
  },

  async login(emailInput: string, password: string) {
    const user = await userRepository.findByEmail(emailInput.toLowerCase());
    if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AppError(ErrorCode.InvalidCredentials, "Invalid email or password", 401);
    }
    if (user.status !== "active") throw new AppError(ErrorCode.AccountInactive, `Account is ${user.status}`, 403);
    return { token: signToken(user.id, user.role), user: publicUser(user) };
  }
};
