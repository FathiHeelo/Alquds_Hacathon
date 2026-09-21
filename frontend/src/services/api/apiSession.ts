import { appConfig } from "../../app/config/appConfig";
import { mapToAppError } from "../../shared/errors/mapToAppError";
import { fetchWithTimeout } from "./fetchWithTimeout";
import { sessionStorage } from "./sessionStorage";

export type ApiRole = "customer" | "technician" | "admin";

const credentials: Record<ApiRole, { email: string; password: string }> = {
  customer: { email: process.env.EXPO_PUBLIC_DEMO_CUSTOMER_EMAIL ?? "customer@ammerha.demo", password: process.env.EXPO_PUBLIC_DEMO_PASSWORD ?? "Demo1234!" },
  technician: { email: process.env.EXPO_PUBLIC_DEMO_TECHNICIAN_EMAIL ?? "technician@ammerha.demo", password: process.env.EXPO_PUBLIC_DEMO_PASSWORD ?? "Demo1234!" },
  admin: { email: process.env.EXPO_PUBLIC_DEMO_ADMIN_EMAIL ?? "admin@ammerha.demo", password: process.env.EXPO_PUBLIC_DEMO_PASSWORD ?? "Demo1234!" }
};

const storageKey = "ammerha.api.session.v1";
type StoredSession = { role: ApiRole; token: string };
const tokens = new Map<ApiRole, string>();
const pendingTokens = new Map<ApiRole, Promise<string>>();
let persistedSession: Promise<StoredSession | null> | undefined;

async function readSession(): Promise<StoredSession | null> {
  if (!persistedSession) {
    persistedSession = sessionStorage.getItem(storageKey).then((value) => {
      if (!value) return null;
      const parsed = JSON.parse(value) as Partial<StoredSession>;
      if (!parsed.token || !parsed.role || !(parsed.role in credentials)) return null;
      return parsed as StoredSession;
    }).catch(() => null);
  }
  return persistedSession;
}

async function saveSession(session: StoredSession | null): Promise<void> {
  persistedSession = Promise.resolve(session);
  if (session) await sessionStorage.setItem(storageKey, JSON.stringify(session));
  else await sessionStorage.removeItem(storageKey);
}

async function login(role: ApiRole): Promise<string> {
  const response = await fetchWithTimeout(`${appConfig.apiBaseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials[role])
  });
  const body = await response.json().catch(() => ({})) as { token?: string; code?: string; message?: string; user?: { role?: string } };
  if (!response.ok || !body.token) throw { status: response.status, code: body.code, message: body.message ?? "Unable to start API session." };
  if (body.user?.role && body.user.role !== role) throw { status: 403, message: "The account role does not match the selected app." };
  tokens.set(role, body.token);
  await saveSession({ role, token: body.token });
  return body.token;
}

export const apiSession = {
  async login(role: ApiRole): Promise<string> {
    try { return await login(role); } catch (error) { throw mapToAppError(error); }
  },
  async restore(): Promise<ApiRole | null> {
    const stored = await readSession();
    if (!stored) return null;
    try {
      const response = await fetchWithTimeout(`${appConfig.apiBaseUrl}/auth/me`, { headers: { Authorization: `Bearer ${stored.token}` } });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) await apiSession.clear();
        return response.status === 401 || response.status === 403 ? null : stored.role;
      }
      const user = await response.json() as { role?: ApiRole };
      if (user.role !== stored.role) { await apiSession.clear(); return null; }
      tokens.set(stored.role, stored.token);
      return stored.role;
    } catch { return stored.role; }
  },
  async token(role: ApiRole): Promise<string> {
    const cached = tokens.get(role);
    if (cached) return cached;
    const existing = pendingTokens.get(role);
    if (existing) return existing;
    const pending = (async () => {
      const stored = await readSession();
      if (stored?.role === role) {
        tokens.set(role, stored.token);
        return stored.token;
      }
      return login(role);
    })().catch((error) => { tokens.delete(role); throw mapToAppError(error); }).finally(() => pendingTokens.delete(role));
    pendingTokens.set(role, pending);
    return pending;
  },
  async clear(role?: ApiRole): Promise<void> {
    if (role) {
      tokens.delete(role);
      const stored = await readSession();
      if (stored?.role === role) await saveSession(null);
      return;
    }
    tokens.clear();
    pendingTokens.clear();
    await saveSession(null);
  }
};
