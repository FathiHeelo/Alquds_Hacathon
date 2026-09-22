import { DemoRepairRequestRepository } from "../src/demo/adapters/demoRepairRequestRepository";
import { DemoTechnicianRepository } from "../src/demo/adapters/DemoTechnicianRepository";
import type { CustomerAiClient } from "../src/domain/contracts/customerAiClient";
import { loadCustomerAiFlow, isLowConfidence, RequestNotFoundError } from "../src/features/ai-diagnosis/services/loadCustomerAiFlow";
import { customerAiClient } from "../src/services/ai/customerAiClient";

async function setup(ai: CustomerAiClient = customerAiClient) {
  const requests = new DemoRepairRequestRepository();
  const saved = await requests.create({ localId: "old_city_plumbing_leak", customerId: "demo-customer",
    description: "تسريب مياه من تحت المجلى في المطبخ", category: "plumbing", urgency: "high", preferredTime: "asap",
    location: { latitude: 31.7804, longitude: 35.2332, label: "البلدة القديمة، القدس", source: "demo" },
    media: [], createdAt: "2026-09-18T00:00:00.000Z" });
  return { saved, deps: { requests, technicians: new DemoTechnicianRepository(), ai, timeoutMs: 500 } };
}

test("old_city_plumbing_leak: saved request to public facade, price and existing technician", async () => {
  const { saved, deps } = await setup();
  const initial = await loadCustomerAiFlow(saved.id, deps);
  expect(initial.awaitingAnswers).toBe(true);
  expect(initial.diagnosis?.followUpQuestions.length).toBe(2);
  const answers = [{ questionId: "leak_when_off", value: "no" }, { questionId: "leak_source", value: "drain" }];
  const result = await loadCustomerAiFlow(saved.id, deps, undefined, answers);
  expect(result.unavailable).toEqual([]);
  expect(result.request.id).toBe(saved.id);
  expect(result.structured?.normalizedDescription).toBe(saved.description);
  expect(result.diagnosis?.likelyIssue).toBeTruthy();
  expect(result.price && result.price.max >= result.price.min).toBeTruthy();
  expect(result.price?.currency).toBe("ILS");
  expect(result.recommendations[0]?.technician.id).toBe("tech-tariq-maqdisi");
  expect(result.recommendations[0]?.match).toBeTruthy();
  expect(await loadCustomerAiFlow(saved.id, deps, undefined, answers)).toEqual(result);
});

test("AI unavailable preserves manual request and unranked F02 technicians", async () => {
  const fail = async (): Promise<never> => { throw new Error("offline"); };
  const { saved, deps } = await setup({ structureRequest: fail, diagnose: fail, estimatePrice: fail, match: fail, assessRisk: fail });
  const result = await loadCustomerAiFlow(saved.id, deps);
  expect(result.request.description).toBe(saved.description);
  expect(result.diagnosis).toBeUndefined();
  expect(result.price).toBeUndefined();
  expect(result.recommendations[0]?.technician.id).toBe("tech-tariq-maqdisi");
  expect(result.recommendations[0]?.match).toBeUndefined();
  expect([...result.unavailable].sort()).toEqual(["diagnosis", "risk", "structure"]);
});

test("missing request is recoverable and never calls AI", async () => {
  const { deps } = await setup();
  deps.ai = { ...customerAiClient, diagnose: async () => { throw new Error("AI should not run"); } };
  await expect(loadCustomerAiFlow("missing", deps)).rejects.toBeInstanceOf(RequestNotFoundError);
});

test("low confidence and independent price failure keep diagnosis", async () => {
  const { saved, deps } = await setup({ ...customerAiClient,
    diagnose: async (request, answers) => ({ ...(await customerAiClient.diagnose(request, answers)), confidence: 0.2 }),
    estimatePrice: async () => { throw new Error("price unavailable"); } });
  const result = await loadCustomerAiFlow(saved.id, deps, undefined, [{ questionId: "leak_when_off", value: "no" }, { questionId: "leak_source", value: "drain" }]);
  expect(result.diagnosis && isLowConfidence(result.diagnosis.confidence)).toBeTruthy();
  expect(isLowConfidence(0.9)).toBe(false);
  expect(result.price).toBeUndefined();
  expect(result.recommendations.length).toBeTruthy();
});

test("repository failure and empty matching both keep the saved request", async () => {
  const { saved, deps } = await setup();
  const answers = [{ questionId: "leak_when_off", value: "no" }, { questionId: "leak_source", value: "drain" }];
  const failed = await loadCustomerAiFlow(saved.id, { ...deps, technicians: {
    ...deps.technicians, getById: async () => null, findNearby: async () => { throw new Error("offline"); }
  } }, undefined, answers);
  expect(failed.unavailable.includes("technicians")).toBeTruthy();
  expect(failed.diagnosis).toBeTruthy();
  const empty = await loadCustomerAiFlow(saved.id, { ...deps, ai: { ...customerAiClient, match: async () => [] } }, undefined, answers);
  expect(empty.recommendations).toEqual([]);
  expect(empty.request.id).toBe(saved.id);
});

test("hung AI times out without blocking the manual journey", async () => {
  const { saved, deps } = await setup({ ...customerAiClient, diagnose: () => new Promise(() => {}) });
  const result = await loadCustomerAiFlow(saved.id, { ...deps, timeoutMs: 30 });
  expect(result.unavailable.includes("diagnosis")).toBeTruthy();
  expect(result.request.id).toBe(saved.id);
});
