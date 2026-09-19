import assert from "node:assert/strict";
import { test } from "node:test";
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
  const result = await loadCustomerAiFlow(saved.id, deps);
  assert.deepEqual(result.unavailable, []);
  assert.equal(result.request.id, saved.id);
  assert.equal(result.structured?.description, saved.description);
  assert.ok(result.diagnosis?.likelyIssue);
  assert.ok(result.price && result.price.max >= result.price.min);
  assert.equal(result.price?.currency, "ILS");
  assert.equal(result.recommendations[0]?.technician.id, "tech-tariq-maqdisi");
  assert.ok(result.recommendations[0]?.match);
  assert.deepEqual(await loadCustomerAiFlow(saved.id, deps), result);
});

test("AI unavailable preserves manual request and unranked F02 technicians", async () => {
  const fail = async (): Promise<never> => { throw new Error("offline"); };
  const { saved, deps } = await setup({ structureRequest: fail, diagnose: fail, estimatePrice: fail, match: fail });
  const result = await loadCustomerAiFlow(saved.id, deps);
  assert.equal(result.request.description, saved.description);
  assert.equal(result.diagnosis, undefined);
  assert.equal(result.price, undefined);
  assert.equal(result.recommendations[0]?.technician.id, "tech-tariq-maqdisi");
  assert.equal(result.recommendations[0]?.match, undefined);
  assert.deepEqual([...result.unavailable].sort(), ["diagnosis", "matching", "price", "structure"]);
});

test("missing request is recoverable and never calls AI", async () => {
  const { deps } = await setup();
  deps.ai = { ...customerAiClient, diagnose: async () => { assert.fail("AI should not run"); } };
  await assert.rejects(loadCustomerAiFlow("missing", deps), RequestNotFoundError);
});

test("low confidence and independent price failure keep diagnosis", async () => {
  const { saved, deps } = await setup({ ...customerAiClient,
    diagnose: async (request) => ({ ...(await customerAiClient.diagnose(request)), confidence: 0.2 }),
    estimatePrice: async () => { throw new Error("price unavailable"); } });
  const result = await loadCustomerAiFlow(saved.id, deps);
  assert.ok(result.diagnosis && isLowConfidence(result.diagnosis.confidence));
  assert.equal(isLowConfidence(0.9), false);
  assert.equal(result.price, undefined);
  assert.ok(result.recommendations.length);
});

test("repository failure and empty matching both keep the saved request", async () => {
  const { saved, deps } = await setup();
  const failed = await loadCustomerAiFlow(saved.id, { ...deps, technicians: {
    ...deps.technicians, getById: async () => null, findNearby: async () => { throw new Error("offline"); }
  } });
  assert.ok(failed.unavailable.includes("technicians"));
  assert.ok(failed.diagnosis);
  const empty = await loadCustomerAiFlow(saved.id, { ...deps, ai: { ...customerAiClient, match: async () => [] } });
  assert.deepEqual(empty.recommendations, []);
  assert.equal(empty.request.id, saved.id);
});

test("hung AI times out without blocking the manual journey", async () => {
  const { saved, deps } = await setup({ ...customerAiClient, diagnose: () => new Promise(() => {}) });
  const result = await loadCustomerAiFlow(saved.id, { ...deps, timeoutMs: 30 });
  assert.ok(result.unavailable.includes("diagnosis"));
  assert.equal(result.request.id, saved.id);
});
