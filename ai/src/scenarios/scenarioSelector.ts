import type { RepairCategory } from "../contracts/ai.types";
import { oldCityPlumbingLeakScenario } from "./old_city_plumbing_leak";
import { electricalOutletScenario } from "./electrical_outlet";
import { acNotCoolingScenario } from "./ac_not_cooling";
import { washingMachineLeakScenario } from "./washing_machine_leak";

export type DemoScenarioKey =
  | "old_city_plumbing_leak"
  | "electrical_outlet"
  | "ac_not_cooling"
  | "washing_machine_leak";

export interface DemoScenario {
  id: DemoScenarioKey;
  transcript: string;
  category: RepairCategory;
}

const scenarios: Record<DemoScenarioKey, DemoScenario> = {
  old_city_plumbing_leak: oldCityPlumbingLeakScenario,
  electrical_outlet: electricalOutletScenario,
  ac_not_cooling: acNotCoolingScenario,
  washing_machine_leak: washingMachineLeakScenario,
};

export function getDemoScenario(
  key: DemoScenarioKey,
): DemoScenario {
  return scenarios[key];
}