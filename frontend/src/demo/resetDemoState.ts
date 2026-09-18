import { resetDemoChat } from "./adapters/demoChatRepository";
import { resetDemoJobs } from "./adapters/demoJobRepository";
import { resetDemoReviews } from "./adapters/demoReviewRepository";
import { resetDemoRewards } from "./adapters/demoRewardRepository";
import { resetDemoOffers } from "../features/offers/services/offerService";
export function resetDemoState() { resetDemoOffers(); resetDemoJobs(); resetDemoChat(); resetDemoReviews(); resetDemoRewards(); }
