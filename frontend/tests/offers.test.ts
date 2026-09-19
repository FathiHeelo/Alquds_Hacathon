import assert from "node:assert/strict";
import { test } from "node:test";
import { DemoOfferRepository } from "../src/demo/adapters/DemoOfferRepository";
import { comparePrice } from "../src/features/offers/services/priceComparison";

test("demo offers are deterministic and reference the request", async () => {
  const repository = new DemoOfferRepository();
  const offers = await repository.getOffersForRequest("old_city_plumbing_leak");
  assert.equal(offers.length, 3);
  assert.deepEqual(offers.map(({ technicianId }) => technicianId), ["tech-tariq-maqdisi", "tech-mahmoud-khatib", "tech-yousef-najjar"]);
  assert.equal(comparePrice(120, 110, 150), "within");
  assert.equal(comparePrice(180, 110, 150), "above");
  assert.equal(comparePrice(95, 110, 150), "below");
});

test("acceptance is explicit, idempotent, and rejects competing offers", async () => {
  const repository = new DemoOfferRepository();
  const handoff = await repository.acceptOffer("offer-tariq-plumbing");
  assert.deepEqual(handoff, { jobId: "demo-job-offer-tariq-plumbing", requestId: "old_city_plumbing_leak", offerId: "offer-tariq-plumbing", technicianId: "tech-tariq-maqdisi" });
  assert.equal((await repository.getOffer("offer-tariq-plumbing"))?.status, "accepted");
  assert.equal((await repository.getOffer("offer-mahmoud-plumbing"))?.status, "rejected");
  assert.deepEqual(await repository.acceptOffer("offer-tariq-plumbing"), handoff);
  await assert.rejects(repository.acceptOffer("offer-mahmoud-plumbing"), /already accepted/);
});

test("missing and empty request states remain recoverable", async () => {
  const repository = new DemoOfferRepository();
  assert.deepEqual(await repository.getOffersForRequest("missing-request"), []);
  await assert.rejects(repository.getOffer("missing-offer").then((offer) => { if (!offer) throw new Error("offer not found"); }), /offer not found/);
  await assert.rejects(repository.acceptOffer("missing-offer"), /Offer not found/);
});
