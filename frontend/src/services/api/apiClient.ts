import { appConfig } from "../../app/config/appConfig";
import { mapToAppError } from "../../shared/errors/mapToAppError";

export interface ApiClient {
  baseUrl: string;
  request<T>(path: string, init?: RequestInit): Promise<T>;
}

export const apiClient: ApiClient = {
  baseUrl: appConfig.apiUrl,
  async request<T>(path: string, init?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${appConfig.apiUrl}${path}`, {
        ...init,
        headers: { "Content-Type": "application/json", ...init?.headers }
      });

      if (!response.ok) {
        throw { status: response.status, message: `Request failed with status ${response.status}` };
      }

      return (await response.json()) as T;
    } catch (error) {
      throw mapToAppError(error);
    }
  }
};
