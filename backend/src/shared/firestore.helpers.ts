import { Timestamp } from "firebase-admin/firestore";

/** `{ id, ...data }` from a doc snapshot; throws if the caller already checked `.exists`. */
export const withId = <T extends FirebaseFirestore.DocumentData>(snap: FirebaseFirestore.DocumentSnapshot<T>) =>
  ({ id: snap.id, ...(snap.data() as T) }) as T & { id: string };

/**
 * Firestore stores dates as Timestamp; API responses use ISO strings like the old Prisma DateTime
 * fields did. Applied once, globally, as response middleware (see app.ts) so no route/service has
 * to remember to convert.
 */
export const serializeFirestore = (value: unknown): unknown => {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serializeFirestore);
  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(Object.entries(value).map(([key, v]) => [key, serializeFirestore(v)]));
  }
  return value;
};

/** Round a rating/average to 1 decimal place; 0 when there is no data yet. */
export const round1 = (sum: number, count: number) => (count > 0 ? Math.round((sum / count) * 10) / 10 : 0);

/** Milliseconds since epoch for a Firestore Timestamp/Date field, for in-memory sorting (newest first, etc.). */
export const tsMillis = (value: FirebaseFirestore.Timestamp | Date | undefined | null): number => {
  if (!value) return 0;
  return value instanceof Timestamp ? value.toMillis() : value.getTime();
};
