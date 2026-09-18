import { DemoOfferRepository } from "../../../demo/adapters/DemoOfferRepository";
import type { OfferRepository } from "../../../domain/contracts/offerRepository";
export const offerRepository: OfferRepository = new DemoOfferRepository();
export function resetDemoOffers() { (offerRepository as DemoOfferRepository).reset(); }
