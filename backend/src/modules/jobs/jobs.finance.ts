import { commission } from "../../config/business";

const round2 = (value: number) => Math.round(value * 100) / 100;

/** Job financial summary: the customer pays the agreed service amount plus the AMMERHA fee. */
export const computeFinancials = (labor: number, parts: number, rate = commission.rate) => {
  const subtotal = round2(labor + parts);
  const platformFee = round2(subtotal * rate);
  return {
    labor: round2(labor),
    parts: round2(parts),
    subtotal,
    commissionRate: rate,
    platformFee,
    total: round2(subtotal + platformFee),
    technicianEarning: subtotal
  };
};
