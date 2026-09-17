export interface OfferAssistantInput {
  diagnosis: string;
  fairPriceMin: number;
  fairPriceMax: number;
}

export interface OfferAssistantResult {
  suggestedMessage: string;
  suggestedPrice: number;
}
