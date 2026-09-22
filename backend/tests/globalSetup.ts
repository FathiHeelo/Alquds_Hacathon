/**
 * Prepares the isolated test dataset: NODE_ENV=test makes every Firestore collection resolve to a
 * `test_`-prefixed name (see src/database/firestore.ts), so this never touches demo data — same
 * Firestore project/database, separate namespace.
 *
 * Vitest runs the function this returns as the matching teardown, once all tests finish.
 */
export default async function setup() {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET ??= "test-secret";
  const { seedDemoData } = await import("../src/seed/seed");
  await seedDemoData();

  return async function teardown() {
    const { firestore, Collections } = await import("../src/database/firestore");
    // Wipes every test_-prefixed collection so repeated runs don't accumulate stray documents.
    await Promise.all(Object.values(Collections).map((name) => firestore.recursiveDelete(firestore.collection(`test_${name}`))));
  };
}
