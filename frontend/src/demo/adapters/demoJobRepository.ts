import type { JobRepository } from "../../domain/contracts/jobRepository";
import type { Job, JobStatus } from "../../domain/models/job";
import { demoOffers } from "../fixtures/offers";
const jobs = new Map<string, Job>();
export class DemoJobRepository implements JobRepository {
  async list() { return [...jobs.values()].map((job) => ({ ...job })); }
  async getJob(id: string) { let job = jobs.get(id); if (!job) { const offer = demoOffers.find((item) => `demo-job-${item.id}` === id); if (!offer) return undefined; job = { id, requestId: offer.repairRequestId, offerId: offer.id, technicianId: offer.technicianId, status: "accepted", agreedPrice: offer.price, expectedArrival: `${offer.etaMinutes} دقيقة`, durationMinutes: offer.estimatedDurationMinutes, locationLabel: "البلدة القديمة، القدس" }; jobs.set(id, job); } return { ...job }; }
  async updateStatus(id: string, status: JobStatus) { const job = await this.getJob(id); if (!job) throw new Error("Job not found"); const updated = { ...job, status }; jobs.set(id, updated); return updated; }
}
export const jobRepository = new DemoJobRepository();

export function createDemoUrgentJob(input: {
  requestId: string;
  technicianId: string;
  price: number;
  etaMinutes?: number;
}) {
  const id = `demo-job-urgent-${input.requestId}`;

  const job: Job = {
    id,
    requestId: input.requestId,
    offerId: `demo-urgent-offer-${input.requestId}`,
    technicianId: input.technicianId,
    status: "accepted",
    agreedPrice: input.price,
    expectedArrival: `${input.etaMinutes ?? 20} دقيقة`,
    durationMinutes: 45,
    locationLabel: "موقع العميل"
  };

  jobs.set(id, job);
  return job;
}

export function resetDemoJobs() {
  jobs.clear();
}
