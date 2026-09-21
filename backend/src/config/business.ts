import { env } from "./env";

/** Central commission configuration (platform fee as a fraction of the job subtotal). */
export const commission = {
  rate: env.commissionRate
};

/** Points awarded for approved MVP events. */
export const rewardPoints = {
  customerRatedJob: 50,
  technicianCompletedJob: 30
};

export const proPlanDays = 30;
