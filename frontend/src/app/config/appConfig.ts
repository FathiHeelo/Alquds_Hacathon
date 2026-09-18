export type AiMode = "simulation" | "remote";

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

function readAiMode(value: string | undefined): AiMode {
  return value === "remote" ? "remote" : "simulation";
}

export const appConfig = Object.freeze({
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
  aiMode: readAiMode(process.env.EXPO_PUBLIC_AI_MODE),
  demoMode: readBoolean(process.env.EXPO_PUBLIC_DEMO_MODE, true),
  logLevel: process.env.EXPO_PUBLIC_LOG_LEVEL ?? "info"
});
