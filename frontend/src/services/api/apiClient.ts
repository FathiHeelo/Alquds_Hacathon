import { appConfig } from "../../app/config/appConfig";
import { mapToAppError } from "../../shared/errors/mapToAppError";
import { apiSession, type ApiRole } from "./apiSession";
import { fetchWithTimeout } from "./fetchWithTimeout";

export interface ApiClient {
  baseUrl: string;
  request<T>(path: string, init?: RequestInit, role?: ApiRole): Promise<T>;
}

export const apiClient: ApiClient = {
  baseUrl: appConfig.apiBaseUrl,
  async request<T>(path: string, init?: RequestInit, role?: ApiRole): Promise<T> {
    try {
      const token = role ? await apiSession.token(role) : undefined;
      const response = await fetchWithTimeout(`${appConfig.apiBaseUrl}${path}`, {
        ...init,
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers }
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { code?: string; message?: string };
        throw { status: response.status, code: body.code, message: body.message ?? `Request failed with status ${response.status}` };
      }
      if (response.status === 204) return undefined as T;
      return await response.json() as T;
    } catch (error) {
      throw mapToAppError(error);
    }
  }
};
