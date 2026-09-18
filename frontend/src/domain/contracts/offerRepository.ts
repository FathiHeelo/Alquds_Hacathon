import type { AcceptedOfferHandoff, Offer } from "../models/offer";

export interface OfferRepository {
  getOffersForRequest(requestId: string): Promise<readonly Offer[]>;
  getOffer(id: string): Promise<Offer | undefined>;
  acceptOffer(id: string): Promise<AcceptedOfferHandoff>;
}
