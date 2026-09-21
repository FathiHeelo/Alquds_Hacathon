import { createMockAiService } from "../src/index";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function main(): Promise<void> {
  const ai = createMockAiService();

  const input = {
    transcript: "المي بتسرب من تحت المجلى",
  };

  const firstResult = await ai.structureVoiceRequest(input);
  const secondResult = await ai.structureVoiceRequest(input);

  assert(
    JSON.stringify(firstResult) === JSON.stringify(secondResult),
    "The same input must produce the same output.",
  );

  assert(
    firstResult.category === "plumbing",
    "The plumbing demo should be detected as plumbing.",
  );

  assert(
    firstResult.technicianType === "plumber",
    "The plumbing demo should recommend a plumber.",
  );

  assert(
    firstResult.requiresConfirmation === false,
    "The known plumbing demo should not require confirmation.",
  );

  console.log("A00 facade smoke test passed.");
  console.log(firstResult);
}

void main().catch((error) => {
  console.error("A00 facade smoke test failed.");
  console.error(error);
  throw error;
});