import { DemoOfferRepository } from "../src/demo/adapters/DemoOfferRepository";
import { comparePrice } from "../src/features/offers/services/priceComparison";

test("demo offers are deterministic and reference the request", async () => {
  const repository = new DemoOfferRepository();
  const offers = await repository.getOffersForRequest("old_city_plumbing_leak");
  expect(offers.length).toBe(3);
  expect(offers.map(({ technicianId }) => technicianId)).toEqual(["tech-tariq-maqdisi", "tech-mahmoud-khatib", "tech-yousef-najjar"]);
  expect(comparePrice(120, 110, 150)).toBe("within");
  expect(comparePrice(180, 110, 150)).toBe("above");
  expect(comparePrice(155, 110, 150)).toBe("slightly_above");
  expect(comparePrice(95, 110, 150)).toBe("good_value");
});

test("acceptance is explicit, idempotent, and rejects competing offers", async () => {
  const repository = new DemoOfferRepository();
  const handoff = await repository.acceptOffer("offer-tariq-plumbing");
  expect(handoff).toEqual({ jobId: "demo-job-offer-tariq-plumbing", requestId: "old_city_plumbing_leak", offerId: "offer-tariq-plumbing", technicianId: "tech-tariq-maqdisi" });
  expect((await repository.getOffer("offer-tariq-plumbing"))?.status).toBe("accepted");
  expect((await repository.getOffer("offer-mahmoud-plumbing"))?.status).toBe("rejected");
  expect(await repository.acceptOffer("offer-tariq-plumbing")).toEqual(handoff);
  await expect(repository.acceptOffer("offer-mahmoud-plumbing")).rejects.toThrow(/already accepted/);
});

test("missing and empty request states remain recoverable", async () => {
  const repository = new DemoOfferRepository();
  expect(await repository.getOffersForRequest("missing-request")).toEqual([]);
  await expect(repository.getOffer("missing-offer").then((offer) => { if (!offer) throw new Error("offer not found"); })).rejects.toThrow(/offer not found/);
  await expect(repository.acceptOffer("missing-offer")).rejects.toThrow(/Offer not found/);
});
