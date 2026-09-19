import type { JobRepository } from "../../../domain/contracts/jobRepository";
import type { JobStatus } from "../../../domain/models/job";
import type { ApiRole } from "../apiSession";
import { apiClient } from "../apiClient";
import { AppError } from "../../../shared/errors/AppError";
import { mapJob, type JobDto } from "./mappers";
export class ApiJobRepository implements JobRepository { constructor(private readonly role: ApiRole) {} async list() { return (await apiClient.request<JobDto[]>("/jobs", undefined, this.role)).map(mapJob); } async getJob(id: string) { try { return mapJob(await apiClient.request<JobDto>(`/jobs/${id}`, undefined, this.role)); } catch (error) { if (error instanceof AppError && error.code === "NOT_FOUND") return undefined; throw error; } } async updateStatus(id: string, status: JobStatus) { return mapJob(await apiClient.request<JobDto>(`/jobs/${id}/status`, { method: "POST", body: JSON.stringify({ status }) }, this.role)); } }
