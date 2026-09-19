export const AMMERHA_PLATFORM_FEE_RATE = 0.07;

export function calculatePlatformFee(servicePrice: number): number {
  return Math.round(servicePrice * AMMERHA_PLATFORM_FEE_RATE * 100) / 100;
}

export function calculateCustomerTotal(servicePrice: number): number {
  return Math.round((servicePrice + calculatePlatformFee(servicePrice)) * 100) / 100;
}

export function formatShekels(value: number): string {
  return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2)} ₪`;
}
