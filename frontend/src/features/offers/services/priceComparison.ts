export type PriceComparison = "within" | "above" | "below";
export function comparePrice(price: number, min?: number, max?: number): PriceComparison | undefined {
  if (min === undefined || max === undefined) return undefined;
  return price < min ? "below" : price > max ? "above" : "within";
}
export const priceLabels: Record<PriceComparison, string> = { within: "ضمن السعر العادل", above: "أعلى قليلاً من المتوقع", below: "أقل من النطاق" };
