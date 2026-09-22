import { calculateCustomerTotal, calculatePlatformFee, AMMERHA_PLATFORM_FEE_RATE } from "../src/shared/constants/platformFee";
import { mapJob, mapOffer, mapRepairRequest, mapTechnician } from "../src/services/api/repositories/mappers";
import { mapToAppError } from "../src/shared/errors/mapToAppError";

test("AMMERHA fee adds ten percent while preserving the service amount", () => {
  expect(AMMERHA_PLATFORM_FEE_RATE).toBe(0.1);
  expect(calculatePlatformFee(150)).toBe(15);
  expect(calculateCustomerTotal(150)).toBe(165);
});

test("backend DTOs map to existing mobile domain contracts", () => {
  const technician = mapTechnician({ userId: "demo-technician", specialty: "hvac", availability: "available", isVerified: true, isPro: true, user: { name: "Demo Tech" }, reputation: { ratingAvg: 4.8, completedJobs: 12 } });
  expect(technician.name).toBe("Demo Tech");
  expect(technician.categoryIds).toEqual(["ac"]);

  const request = mapRepairRequest({ id: "r1", customerId: "c1", categoryId: "plumbing", description: "Leaking kitchen pipe", urgency: "high", createdAt: "2026-09-18T00:00:00.000Z", locationSummary: "Old City", lat: 31.78, lng: 35.23 });
  expect(request.category).toBe("plumbing");
  expect(request.location.label).toBe("Old City");

  const offer = mapOffer({ id: "o1", requestId: "r1", technicianId: "t1", price: 150, message: "Ready", etaMinutes: 30, status: "pending", createdAt: "2026-09-18T00:00:00.000Z" });
  expect(offer.repairRequestId).toBe("r1");
  const job = mapJob({ id: "j1", requestId: "r1", offerId: "o1", technicianId: "t1", status: "accepted", offer: { price: 150, etaMinutes: 30 }, request: { locationSummary: "Old City" } });
  expect(job.agreedPrice).toBe(150);
});

test("backend conflicts map to actionable mobile error codes", () => {
  expect(mapToAppError({ status: 409, code: "CONFLICT", message: "You already sent an offer for this request" }).code).toBe("DUPLICATE_OFFER");
  expect(mapToAppError({ status: 409, code: "CONFLICT", message: "You already reviewed this job" }).code).toBe("DUPLICATE_REVIEW");
  expect(mapToAppError({ status: 409, code: "INVALID_JOB_TRANSITION" }).code).toBe("INVALID_JOB_TRANSITION");
});
