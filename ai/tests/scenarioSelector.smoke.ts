import { getDemoScenario } from "../src/scenarios/scenarioSelector";

const firstPlumbing = getDemoScenario("old_city_plumbing_leak");
const secondPlumbing = getDemoScenario("old_city_plumbing_leak");

if (JSON.stringify(firstPlumbing) !== JSON.stringify(secondPlumbing)) {
  throw new Error("Plumbing scenario selection is not deterministic.");
}

if (firstPlumbing.id !== "old_city_plumbing_leak") {
  throw new Error("Unexpected plumbing scenario ID.");
}

const firstElectrical = getDemoScenario("electrical_outlet");
const secondElectrical = getDemoScenario("electrical_outlet");

if (
  JSON.stringify(firstElectrical) !==
  JSON.stringify(secondElectrical)
) {
  throw new Error("Electrical scenario selection is not deterministic.");
}

if (firstElectrical.id !== "electrical_outlet") {
  throw new Error("Unexpected electrical scenario ID.");
}

if (firstElectrical.category !== "electrical") {
  throw new Error("Electrical scenario has an unexpected category.");
}

if (!firstElectrical.transcript.toLowerCase().includes("outlet")) {
  throw new Error("Electrical scenario transcript should mention outlet.");
}

console.log("Scenario selector smoke test passed.");

const firstAc = getDemoScenario("ac_not_cooling");
const secondAc = getDemoScenario("ac_not_cooling");

if (JSON.stringify(firstAc) !== JSON.stringify(secondAc)) {
  throw new Error("AC scenario selection is not deterministic.");
}

if (firstAc.id !== "ac_not_cooling") {
  throw new Error("Unexpected AC scenario ID.");
}

if (firstAc.category !== "ac") {
  throw new Error("AC scenario has an unexpected category.");
}

if (!firstAc.transcript.toLowerCase().includes("cooling")) {
  throw new Error("AC scenario transcript should mention cooling.");
}
const firstWashingMachine = getDemoScenario("washing_machine_leak");
const secondWashingMachine = getDemoScenario("washing_machine_leak");

if (
  JSON.stringify(firstWashingMachine) !==
  JSON.stringify(secondWashingMachine)
) {
  throw new Error(
    "Washing-machine scenario selection is not deterministic.",
  );
}

if (firstWashingMachine.id !== "washing_machine_leak") {
  throw new Error("Unexpected washing-machine scenario ID.");
}

if (firstWashingMachine.category !== "appliances") {
  throw new Error(
    "Washing-machine scenario has an unexpected category.",
  );
}

if (
  !firstWashingMachine.transcript
    .toLowerCase()
    .includes("washing machine")
) {
  throw new Error(
    "Washing-machine scenario transcript should mention washing machine.",
  );
}

console.log({
  plumbing: firstPlumbing,
  electrical: firstElectrical,
  ac: firstAc,
  washingMachine: firstWashingMachine,
});