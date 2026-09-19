import { structureVoiceRequest } from "../src/engines/voice/voiceEngine";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function main(): Promise<void> {
  // 1. Plumbing — Arabic/Palestinian-style transcript
  const plumbing = structureVoiceRequest({
    transcript: "المي بتسرب من تحت المجلى",
  });

  assert(
    plumbing.category === "plumbing",
    "Plumbing transcript should be classified as plumbing.",
  );

  assert(
    plumbing.technicianType === "plumber",
    "Plumbing should recommend a plumber.",
  );

  assert(
    plumbing.requiresConfirmation === false,
    "Known plumbing case should not require confirmation.",
  );

  // 2. Electrical
  const electrical = structureVoiceRequest({
    transcript: "The electrical outlet is not working.",
  });

  assert(
    electrical.category === "electrical",
    "Electrical transcript should be classified as electrical.",
  );

  assert(
    electrical.technicianType === "electrician",
    "Electrical issue should recommend an electrician.",
  );

  // 3. AC
  const ac = structureVoiceRequest({
    transcript: "The AC is not cooling the room.",
  });

  assert(
    ac.category === "ac",
    "AC transcript should be classified as AC.",
  );

  assert(
    ac.technicianType === "ac_technician",
    "AC issue should recommend an AC technician.",
  );

  // 4. Appliance
  const appliance = structureVoiceRequest({
    transcript: "الغسالة بتسرب مي",
  });

  assert(
    appliance.category === "appliance",
    "Appliance transcript should be classified as appliance.",
  );

  assert(
    appliance.technicianType === "appliance_technician",
    "Appliance issue should recommend an appliance technician.",
  );

  // 5. Unknown / fallback
  const unknown = structureVoiceRequest({
    transcript: "I have a problem at home.",
  });

  assert(
    unknown.category === "general",
    "Unknown request should fall back to general.",
  );

  assert(
    unknown.requiresConfirmation === true,
    "Unknown request should require manual confirmation.",
  );

  console.log("A01 voice engine smoke test passed.");
  console.log({
    plumbing,
    electrical,
    ac,
    appliance,
    unknown,
  });
}

void main().catch((error) => {
  console.error("A01 voice engine smoke test failed.");
  console.error(error);
  throw error;
});