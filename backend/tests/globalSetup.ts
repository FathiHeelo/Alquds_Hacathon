import { execSync } from "node:child_process";

/** Prepares the isolated test database: apply migrations, then (re)seed demo data. */
export default function setup() {
  const url = process.env.TEST_DATABASE_URL ?? "mysql://root:@localhost:3306/ammerha_test";
  const env = { ...process.env, DATABASE_URL: url };
  execSync("npx prisma migrate deploy", { env, stdio: "ignore" });
  execSync("npx prisma db seed", { env, stdio: "ignore" });
}
