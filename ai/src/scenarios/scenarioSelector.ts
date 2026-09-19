import { oldCityPlumbingLeakScenario } from "./old_city_plumbing_leak";

export type DemoScenarioKey = "old_city_plumbing_leak";

export interface DemoScenario {
  id: DemoScenarioKey;
  transcript: string;
  category: "plumbing" | "electrical" | "ac" | "appliance" | "general";
}

const scenarios: Record<DemoScenarioKey, DemoScenario> = {
  old_city_plumbing_leak: oldCityPlumbingLeakScenario,
};

export function getDemoScenario(
  key: DemoScenarioKey,
): DemoScenario {
  return scenarios[key];
}