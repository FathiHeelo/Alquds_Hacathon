import { AppError } from "../../errors/AppError";
import { ErrorCode } from "../../errors/errorCodes";
import { publicUser, userRepository } from "./users.repository";

export const userService = {
  async me(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError(ErrorCode.NotFound, "User not found", 404);
    return publicUser(user);
  },
  async updateMe(id: string, input: { name?: string; phone?: string }) {
    if (input.phone) {
      const existing = await userRepository.findByPhone(input.phone);
      if (existing && existing.id !== id) throw new AppError(ErrorCode.Conflict, "Phone already in use", 409);
    }
    const updated = await userRepository.update(id, input);
    return publicUser(updated!);
  }
};
