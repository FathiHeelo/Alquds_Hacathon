import type { AcceptedOfferHandoff, Offer } from "../../domain/models/offer";
import { demoOffers } from "../fixtures/offers";
import type { OfferRepository } from "../../domain/contracts/offerRepository";

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }

export class DemoOfferRepository implements OfferRepository {
  private offers = new Map(demoOffers.map((offer) => [offer.id, clone(offer)]));
  async getOffersForRequest(requestId: string): Promise<readonly Offer[]> {
    return [...this.offers.values()].filter((offer) => offer.repairRequestId === requestId).map(clone);
  }
  async getOffer(id: string): Promise<Offer | undefined> {
    const offer = this.offers.get(id); return offer ? clone(offer) : undefined;
  }
  async acceptOffer(id: string): Promise<AcceptedOfferHandoff> {
    const selected = this.offers.get(id);
    if (!selected) throw new Error("Offer not found");
    if (selected.status === "accepted") return { jobId: `demo-job-${id}`, requestId: selected.repairRequestId, offerId: id, technicianId: selected.technicianId };
    if (this.getAccepted(selected.repairRequestId)) throw new Error("Offer already accepted");
    for (const offer of this.offers.values()) if (offer.repairRequestId === selected.repairRequestId) offer.status = offer.id === id ? "accepted" : "rejected";
    return { jobId: `demo-job-${id}`, requestId: selected.repairRequestId, offerId: id, technicianId: selected.technicianId };
  }
  private getAccepted(requestId: string) { return [...this.offers.values()].find(({ repairRequestId, status }) => repairRequestId === requestId && status === "accepted"); }
}
