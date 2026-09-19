export type AiMode = "simulation" | "remote";

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

function readAiMode(value: string | undefined): AiMode {
  return value === "remote" ? "remote" : "simulation";
}

export const appConfig = Object.freeze({
  apiBaseUrl: (process.env.EXPO_PUBLIC_API_BASE_URL ?? process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.1.13:3000/api/v1").replace(/\/$/, ""),
  aiMode: readAiMode(process.env.EXPO_PUBLIC_AI_MODE),
  demoMode: readBoolean(process.env.EXPO_PUBLIC_DEMO_MODE, false),
  apiFallbackToDemo: readBoolean(process.env.EXPO_PUBLIC_API_FALLBACK_TO_DEMO, true),
  logLevel: process.env.EXPO_PUBLIC_LOG_LEVEL ?? "info"
});
