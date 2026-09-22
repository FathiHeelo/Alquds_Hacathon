import "dotenv/config";

import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  JWT_SECRET: z.string().min(1).default("change-me"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  COMMISSION_RATE: z.coerce.number().min(0).max(1).default(0.1),
  URGENT_DISPATCH_RADII_KM: z.string().default("3,6,9"),
  CORS_ORIGINS: z.string().default(""),
  // Path to the downloaded Firebase service account key (never committed; see .gitignore).
  FIREBASE_SERVICE_ACCOUNT_PATH: z.string().default("./firebase-service-account.json"),
  FIREBASE_PROJECT_ID: z.string().optional()
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  jwtSecret: parsed.data.JWT_SECRET,
  jwtExpiresIn: parsed.data.JWT_EXPIRES_IN,
  commissionRate: parsed.data.COMMISSION_RATE,
  corsOrigins: parsed.data.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean),
  urgentDispatchRadiiKm: [...new Set(parsed.data.URGENT_DISPATCH_RADII_KM.split(",").map(Number).filter((value) => Number.isFinite(value) && value > 0))].sort((a, b) => a - b),
  firebaseServiceAccountPath: parsed.data.FIREBASE_SERVICE_ACCOUNT_PATH,
  firebaseProjectId: parsed.data.FIREBASE_PROJECT_ID
} as const;
