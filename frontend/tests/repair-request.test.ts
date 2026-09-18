import assert from "node:assert/strict";
import { test } from "node:test";
import { DemoRepairRequestRepository } from "../src/demo/adapters/demoRepairRequestRepository";
import { demoVoiceRequest } from "../src/demo/fixtures/voiceRequest";
import type { RepairRequestDraft } from "../src/domain/models/repairRequest";
import { validateRepairRequest } from "../src/features/repair-request/services/requestValidation";
import { aiAdapter } from "../src/services/ai/aiAdapter";
import { suggestVoiceRequest } from "../src/services/ai/requestVoiceAdapter";

const draft: RepairRequestDraft = {
  localId: "test-draft", customerId: "demo-customer", description: "تسريب مياه", category: "plumbing",
  urgency: "medium", preferredTime: "today", createdAt: "2026-09-18T00:00:00.000Z",
  location: { latitude: 31.7834, longitude: 35.2304, label: "القدس", source: "demo" }, media: []
};

test("required fields and location validation", () => {
  assert.deepEqual(validateRepairRequest(draft), {});
  const invalid = validateRepairRequest({ ...draft, description: " ", category: undefined,
    location: { ...draft.location, latitude: NaN } });
  assert.deepEqual(Object.keys(invalid).sort(), ["category", "description", "location"]);
});

test("manual submit, technician context, media and idempotent repository retrieval", async () => {
  const repository = new DemoRepairRequestRepository();
  const input = { ...draft, technicianId: "tariq", media: [{ type: "video" as const, uri: "file:///video.mp4", mimeType: "video/mp4" }] };
  const request = await repository.create(input);
  assert.equal(request.id, "demo-request-1");
  assert.equal(request.technicianId, "tariq");
  assert.equal((await repository.create(input)).id, request.id);
  input.media.length = 0;
  assert.equal((await repository.getRequest(request.id))?.media.length, 1);
  assert.equal(await repository.getRequest("missing"), undefined);
  await assert.rejects(repository.create({ ...draft, description: "" }));
});

test("voice facade and unavailable AI fallback leave manual submission usable", async () => {
  const original = aiAdapter.structureVoiceRequest;
  try {
    const ready = await suggestVoiceRequest();
    assert.ok(ready.description.trim());
    aiAdapter.structureVoiceRequest = async () => { throw new Error("unavailable"); };
    const fallback = await suggestVoiceRequest();
    assert.equal(fallback.voice.source, "demo");
    assert.equal(fallback.description, demoVoiceRequest.description);
    const repository = new DemoRepairRequestRepository();
    const request = await repository.create({ ...draft, ...fallback });
    assert.equal(request.voice?.transcript, demoVoiceRequest.transcript);
    assert.deepEqual(validateRepairRequest({ ...draft, voice: undefined }), {});
  } finally { aiAdapter.structureVoiceRequest = original; }
});
