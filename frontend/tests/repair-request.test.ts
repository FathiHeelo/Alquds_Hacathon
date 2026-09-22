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
  expect(validateRepairRequest(draft)).toEqual({});
  const invalid = validateRepairRequest({ ...draft, description: " ", category: undefined,
    location: { ...draft.location, latitude: NaN } });
  expect(Object.keys(invalid).sort()).toEqual(["category", "description", "location"]);
});

test("manual submit, technician context, media and idempotent repository retrieval", async () => {
  const repository = new DemoRepairRequestRepository();
  const input = { ...draft, technicianId: "tariq", media: [{ type: "video" as const, uri: "file:///video.mp4", mimeType: "video/mp4" }] };
  const request = await repository.create(input);
  expect(request.id).toBe("demo-request-1");
  expect(request.technicianId).toBe("tariq");
  expect((await repository.create(input)).id).toBe(request.id);
  input.media.length = 0;
  expect((await repository.getRequest(request.id))?.media.length).toBe(1);
  expect(await repository.getRequest("missing")).toBeUndefined();
  await expect(repository.create({ ...draft, description: "" })).rejects.toThrow();
});

test("voice facade and unavailable AI fallback leave manual submission usable", async () => {
  const original = aiAdapter.structureVoiceRequest;
  try {
    const ready = await suggestVoiceRequest();
    expect(ready.description.trim()).toBeTruthy();
    aiAdapter.structureVoiceRequest = async () => { throw new Error("unavailable"); };
    const fallback = await suggestVoiceRequest();
    expect(fallback.voice.source).toBe("demo");
    expect(fallback.description).toBe(demoVoiceRequest.description);
    const repository = new DemoRepairRequestRepository();
    const request = await repository.create({ ...draft, ...fallback });
    expect(request.voice?.transcript).toBe(demoVoiceRequest.transcript);
    expect(validateRepairRequest({ ...draft, voice: undefined })).toEqual({});
  } finally { aiAdapter.structureVoiceRequest = original; }
});
