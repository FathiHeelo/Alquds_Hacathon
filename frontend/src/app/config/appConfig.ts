export const appConfig = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
  aiMode: process.env.EXPO_PUBLIC_AI_MODE ?? "simulation"
} as const;
