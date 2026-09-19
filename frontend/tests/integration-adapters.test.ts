import assert from "node:assert/strict";
import { test } from "node:test";

import { calculateCustomerTotal, calculatePlatformFee, AMMERHA_PLATFORM_FEE_RATE } from "../src/shared/constants/platformFee";
import { mapJob, mapOffer, mapRepairRequest, mapTechnician } from "../src/services/api/repositories/mappers";
import { mapToAppError } from "../src/shared/errors/mapToAppError";

test("AMMERHA fee adds ten percent while preserving the service amount", () => {
  assert.equal(AMMERHA_PLATFORM_FEE_RATE, 0.1);
  assert.equal(calculatePlatformFee(150), 15);
  assert.equal(calculateCustomerTotal(150), 165);
});

test("backend DTOs map to existing mobile domain contracts", () => {
  const technician = mapTechnician({ userId: "demo-technician", specialty: "hvac", availability: "available", isVerified: true, isPro: true, user: { name: "Demo Tech" }, reputation: { ratingAvg: 4.8, completedJobs: 12 } });
  assert.equal(technician.name, "Demo Tech");
  assert.deepEqual(technician.categoryIds, ["ac"]);

  const request = mapRepairRequest({ id: "r1", customerId: "c1", categoryId: "plumbing", description: "Leaking kitchen pipe", urgency: "high", createdAt: "2026-09-18T00:00:00.000Z", locationSummary: "Old City", lat: 31.78, lng: 35.23 });
  assert.equal(request.category, "plumbing");
  assert.equal(request.location.label, "Old City");

  const offer = mapOffer({ id: "o1", requestId: "r1", technicianId: "t1", price: 150, message: "Ready", etaMinutes: 30, status: "pending", createdAt: "2026-09-18T00:00:00.000Z" });
  assert.equal(offer.repairRequestId, "r1");
  const job = mapJob({ id: "j1", requestId: "r1", offerId: "o1", technicianId: "t1", status: "accepted", offer: { price: 150, etaMinutes: 30 }, request: { locationSummary: "Old City" } });
  assert.equal(job.agreedPrice, 150);
});

test("backend conflicts map to actionable mobile error codes", () => {
  assert.equal(mapToAppError({ status: 409, code: "CONFLICT", message: "You already sent an offer for this request" }).code, "DUPLICATE_OFFER");
  assert.equal(mapToAppError({ status: 409, code: "CONFLICT", message: "You already reviewed this job" }).code, "DUPLICATE_REVIEW");
  assert.equal(mapToAppError({ status: 409, code: "INVALID_JOB_TRANSITION" }).code, "INVALID_JOB_TRANSITION");
});
