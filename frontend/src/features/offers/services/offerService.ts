import { DemoOfferRepository } from "../../../demo/adapters/DemoOfferRepository";
import type { OfferRepository } from "../../../domain/contracts/offerRepository";
export const offerRepository = new DemoOfferRepository();
export function resetDemoOffers() { offerRepository.reset(); }
