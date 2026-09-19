import { DemoRepairRequestRepository } from "../../../demo/adapters/demoRepairRequestRepository";
import type { RepairRequestRepository } from "../../../domain/contracts/repairRequestRepository";

// One repository instance preserves submitted requests across navigation and role switches.
export const repairRequestRepository: RepairRequestRepository = new DemoRepairRequestRepository();
