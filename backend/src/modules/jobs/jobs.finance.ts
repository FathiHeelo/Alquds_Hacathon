import { commission } from "../../config/business";

const round2 = (value: number) => Math.round(value * 100) / 100;

/** Job financial summary: labor + parts = subtotal; platform fee is commission on the subtotal. */
export const computeFinancials = (labor: number, parts: number, rate = commission.rate) => {
  const subtotal = round2(labor + parts);
  const platformFee = round2(subtotal * rate);
  return {
    labor: round2(labor),
    parts: round2(parts),
    subtotal,
    commissionRate: rate,
    platformFee,
    total: subtotal, // customer pays the subtotal; the fee is deducted from the technician's side
    technicianEarning: round2(subtotal - platformFee)
  };
};
