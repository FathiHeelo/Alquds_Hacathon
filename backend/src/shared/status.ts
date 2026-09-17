export const UserRole = {
  Customer: "customer",
  Technician: "technician",
  Admin: "admin"
} as const;

export const RepairRequestStatus = {
  Open: "open",
  Matched: "matched",
  Accepted: "accepted",
  Cancelled: "cancelled",
  Completed: "completed"
} as const;

export const OfferStatus = {
  Pending: "pending",
  Accepted: "accepted",
  Rejected: "rejected",
  Withdrawn: "withdrawn"
} as const;

export const JobStatus = {
  Accepted: "accepted",
  Scheduled: "scheduled",
  OnTheWay: "on_the_way",
  InProgress: "in_progress",
  Completed: "completed",
  Cancelled: "cancelled"
} as const;

export const Urgency = {
  Low: "low",
  Medium: "medium",
  High: "high"
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export type RepairRequestStatus = (typeof RepairRequestStatus)[keyof typeof RepairRequestStatus];
export type OfferStatus = (typeof OfferStatus)[keyof typeof OfferStatus];
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];
export type Urgency = (typeof Urgency)[keyof typeof Urgency];
