import { Platform } from "react-native";

export type AiMode = "simulation" | "remote";

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

function readAiMode(value: string | undefined): AiMode {
  return value === "remote" ? "remote" : "simulation";
}

function readPositiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const apiBaseUrl = Platform.OS === "web"
  ? process.env.EXPO_PUBLIC_WEB_API_BASE_URL ?? "http://localhost:3000/api/v1"
  : process.env.EXPO_PUBLIC_API_BASE_URL ?? process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.1.13:3000/api/v1";

export const appConfig = Object.freeze({
  apiBaseUrl: apiBaseUrl.replace(/\/$/, ""),
  apiTimeoutMs: readPositiveNumber(process.env.EXPO_PUBLIC_API_TIMEOUT_MS, 4000),
  aiMode: readAiMode(process.env.EXPO_PUBLIC_AI_MODE),
  demoMode: readBoolean(process.env.EXPO_PUBLIC_DEMO_MODE, false),
  apiFallbackToDemo: readBoolean(process.env.EXPO_PUBLIC_API_FALLBACK_TO_DEMO, true),
  logLevel: process.env.EXPO_PUBLIC_LOG_LEVEL ?? "info"
});
