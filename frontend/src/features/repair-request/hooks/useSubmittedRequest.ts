import { useEffect, useState } from "react";
import type { RepairRequest } from "../../../domain/models/repairRequest";
import { repairRequestRepository } from "../services/requestService";

export function useSubmittedRequest(id: string) {
  const [request, setRequest] = useState<RepairRequest>();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setRequest(undefined);
    void repairRequestRepository.getRequest(id).then((value) => {
      if (active) setRequest(value);
    }).catch(() => {}).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  return { request, loading };
}
