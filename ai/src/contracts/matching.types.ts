export interface TechnicianCandidate {
  id: string;
  distanceKm: number;
  rating: number;
  completedJobs: number;
}

export interface TechnicianMatch {
  technicianId: string;
  score: number;
  reasons: string[];
}
