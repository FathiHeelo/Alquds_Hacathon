import { appConfig } from "../../app/config/appConfig";
import { mapToAppError } from "../../shared/errors/mapToAppError";

export type ApiRole = "customer" | "technician" | "admin";

const credentials: Record<ApiRole, { email: string; password: string }> = {
  customer: { email: process.env.EXPO_PUBLIC_DEMO_CUSTOMER_EMAIL ?? "customer@ammerha.demo", password: process.env.EXPO_PUBLIC_DEMO_PASSWORD ?? "Demo1234!" },
  technician: { email: process.env.EXPO_PUBLIC_DEMO_TECHNICIAN_EMAIL ?? "technician@ammerha.demo", password: process.env.EXPO_PUBLIC_DEMO_PASSWORD ?? "Demo1234!" },
  admin: { email: process.env.EXPO_PUBLIC_DEMO_ADMIN_EMAIL ?? "admin@ammerha.demo", password: process.env.EXPO_PUBLIC_DEMO_PASSWORD ?? "Demo1234!" }
};

const tokens = new Map<ApiRole, Promise<string>>();

export const apiSession = {
  token(role: ApiRole): Promise<string> {
    const cached = tokens.get(role);
    if (cached) return cached;
    const pending = fetch(`${appConfig.apiBaseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials[role])
    }).then(async (response) => {
      const body = await response.json().catch(() => ({})) as { token?: string; code?: string; message?: string };
      if (!response.ok || !body.token) throw { status: response.status, code: body.code, message: body.message ?? "Unable to start API demo session." };
      return body.token;
    }).catch((error) => { tokens.delete(role); throw mapToAppError(error); });
    tokens.set(role, pending);
    return pending;
  },
  clear(role?: ApiRole) { if (role) tokens.delete(role); else tokens.clear(); }
};
