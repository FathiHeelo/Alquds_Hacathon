import type { Job, JobStatus } from "../models/job";
export interface JobRepository { list(): Promise<readonly Job[]>; getJob(id: string): Promise<Job | undefined>; updateStatus(id: string, status: JobStatus): Promise<Job>; }
