import type { AccountStatus, UserRole } from "../shared/status";

declare global {
  namespace Express {
    interface Request {
      auth?: { id: string; role: UserRole; status: AccountStatus };
    }
  }
}

export {};
