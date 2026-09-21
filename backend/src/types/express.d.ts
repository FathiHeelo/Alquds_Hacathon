import type { AccountStatus, UserRole } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      auth?: { id: string; role: UserRole; status: AccountStatus };
    }
  }
}

export {};
