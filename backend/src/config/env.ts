export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  port: Number(process.env.PORT ?? 3000)
} as const;
