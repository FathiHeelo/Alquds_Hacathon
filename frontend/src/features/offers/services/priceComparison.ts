import { evaluateOffer } from "@ammerha/ai";

export type PriceComparison = "good_value" | "within" | "slightly_above" | "above";
export function comparePrice(price: number, min?: number, max?: number): PriceComparison | undefined {
  if (min === undefined || max === undefined) return undefined;
  const status = evaluateOffer(price, { minPrice: min, maxPrice: max }).status;
  if (status === "low") return "good_value";
  if (status === "fair") return "within";
  if (status === "slightly_high") return "slightly_above";
  if (status === "high") return "above";
  return undefined;
}
export const priceLabelKeys: Record<PriceComparison, "fairPrice.goodValue" | "fairPrice.withinRange" | "fairPrice.slightlyAbove" | "fairPrice.aboveRange"> = {
  good_value: "fairPrice.goodValue",
  within: "fairPrice.withinRange",
  slightly_above: "fairPrice.slightlyAbove",
  above: "fairPrice.aboveRange"
};
