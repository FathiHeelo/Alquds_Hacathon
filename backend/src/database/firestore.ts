import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore, Timestamp, type Firestore } from "firebase-admin/firestore";

import { env } from "../config/env";
import { logger } from "../shared/logger";

const keyPath = resolve(process.cwd(), env.firebaseServiceAccountPath);

if (!getApps().length) {
  if (existsSync(keyPath)) {
    const serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    // Falls back to GOOGLE_APPLICATION_CREDENTIALS / ADC if the key file isn't present.
    logger.warn(`Firebase service account key not found at ${keyPath}; falling back to application default credentials`);
    initializeApp(env.firebaseProjectId ? { projectId: env.firebaseProjectId } : undefined);
  }
}

export const firestore: Firestore = getFirestore();
// Undefined fields are simply omitted on write (matches the old Prisma "skip if undefined" behaviour).
firestore.settings({ ignoreUndefinedProperties: true });

export { FieldValue, Timestamp };
export type Tx = FirebaseFirestore.Transaction;

/**
 * Test runs get their own collection namespace inside the same Firestore project/database,
 * so `npm test` never touches demo data. See tests/globalSetup.ts / globalTeardown.ts.
 */
const prefix = env.nodeEnv === "test" ? "test_" : "";

export const col = (name: string) => firestore.collection(`${prefix}${name}`);

/** All collection names in one place, so a rename only happens here. */
export const Collections = {
  users: "users",
  userEmailIndex: "userEmailIndex",
  userPhoneIndex: "userPhoneIndex",
  technicianProfiles: "technicianProfiles",
  subscriptions: "subscriptions",
  serviceCategories: "serviceCategories",
  repairRequests: "repairRequests",
  urgentDispatches: "urgentDispatches",
  offers: "offers",
  jobs: "jobs",
  conversations: "conversations",
  notifications: "notifications",
  reviews: "reviews",
  rewardTransactions: "rewardTransactions",
  partners: "partners",
  partnerRewards: "partnerRewards",
  redemptions: "redemptions",
  reports: "reports",
  riskAssessments: "riskAssessments",
  adminActions: "adminActions",
  stats: "stats"
} as const;

/** Singleton doc holding platform-wide counters (see technicianRepository.onCompletedJob for the per-technician equivalent). */
export const globalStatsRef = () => col(Collections.stats).doc("global");
