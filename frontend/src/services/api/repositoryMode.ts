import { appConfig } from "../../app/config/appConfig";
import { AppError } from "../../shared/errors/AppError";

const canFallback = (error: unknown) => error instanceof AppError && ["NETWORK_ERROR", "NETWORK_TIMEOUT"].includes(error.code);

export function selectRepository<T extends object>(api: T, demo: T): T {
  if (appConfig.demoMode) return demo;
  return new Proxy(api, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver);
      if (typeof value !== "function") return value;
      return async (...args: unknown[]) => {
        try { return await value.apply(target, args); }
        catch (error) {
          if (!appConfig.apiFallbackToDemo || !canFallback(error)) throw error;
          const fallback = Reflect.get(demo, property);
          if (typeof fallback !== "function") throw error;
          if (__DEV__) console.warn("[AMMERHA] API unavailable — using demo fallback");
          return fallback.apply(demo, args);
        }
      };
    }
  });
}
