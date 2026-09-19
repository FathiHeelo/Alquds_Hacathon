import { getDemoScenario } from "../src/scenarios/scenarioSelector";

const first = getDemoScenario("old_city_plumbing_leak");
const second = getDemoScenario("old_city_plumbing_leak");

if (JSON.stringify(first) !== JSON.stringify(second)) {
  throw new Error("Scenario selection is not deterministic.");
}

if (first.id !== "old_city_plumbing_leak") {
  throw new Error("Unexpected scenario ID.");
}

console.log("Scenario selector smoke test passed.");
console.log(first);