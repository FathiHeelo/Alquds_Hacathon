/**
 * Removes documents created by e2e-smoke.mjs (or similar manual/CI runs against the real
 * database) so the demo dataset stays exactly what `npm run seed` produces. Matches by the
 * distinctive "e2e"/"smoke" markers those runs tag their records with. Safe to re-run.
 */
import { Collections, col, firestore } from "../database/firestore";

async function main() {
  let deleted = 0;

  const requests = await col(Collections.repairRequests).get();
  const taggedRequestIds = new Set<string>();
  for (const doc of requests.docs) {
    const description = (doc.data() as { description?: string }).description ?? "";
    if (/e2e/i.test(description)) {
      taggedRequestIds.add(doc.id);
      await doc.ref.delete();
      deleted++;
    }
  }

  const offers = await col(Collections.offers).get();
  for (const doc of offers.docs) {
    if (taggedRequestIds.has((doc.data() as { requestId?: string }).requestId ?? "")) {
      await doc.ref.delete();
      deleted++;
    }
  }

  const jobs = await col(Collections.jobs).get();
  const taggedJobIds = new Set<string>();
  for (const doc of jobs.docs) {
    if (taggedRequestIds.has((doc.data() as { requestId?: string }).requestId ?? "")) {
      taggedJobIds.add(doc.id);
      await doc.ref.delete();
      deleted++;
    }
  }

  for (const collection of [Collections.reviews, Collections.conversations] as const) {
    const snap = await col(collection).get();
    for (const doc of snap.docs) {
      if (taggedJobIds.has(doc.id)) {
        if (collection === Collections.conversations) await firestore.recursiveDelete(doc.ref);
        else await doc.ref.delete();
        deleted++;
      }
    }
  }

  const risks = await col(Collections.riskAssessments).get();
  for (const doc of risks.docs) {
    const flags = (doc.data() as { flags?: { code?: string }[] }).flags ?? [];
    if (flags.some((f) => /smoke/i.test(f.code ?? ""))) {
      await doc.ref.delete();
      deleted++;
    }
  }

  const dispatches = await col(Collections.urgentDispatches).get();
  for (const doc of dispatches.docs) {
    if (taggedRequestIds.has(doc.id)) {
      await doc.ref.delete();
      deleted++;
    }
  }

  const users = await col(Collections.users).get();
  for (const doc of users.docs) {
    const email = (doc.data() as { email?: string }).email ?? "";
    if (email.includes("@e2e.dev")) {
      await col(Collections.userEmailIndex).doc(email).delete();
      const phone = (doc.data() as { phone?: string }).phone;
      if (phone) await col(Collections.userPhoneIndex).doc(phone).delete();
      await doc.ref.delete();
      deleted++;
    }
  }

  console.log(`Cleaned up ${deleted} e2e/smoke-test document(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
