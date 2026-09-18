import { useCallback, useEffect, useRef, useState } from "react";
import { DemoTechnicianRepository } from "../../../demo/adapters/DemoTechnicianRepository";
import type { RepairRequest } from "../../../domain/models/repairRequest";
import { customerAiClient } from "../../../services/ai/customerAiClient";
import { repairRequestRepository } from "../../repair-request/services/requestService";
import { loadCustomerAiFlow, type CustomerAiFlowResult } from "../services/loadCustomerAiFlow";

const dependencies = { requests: repairRequestRepository, technicians: new DemoTechnicianRepository(), ai: customerAiClient };

export function useAiCustomerFlow(requestId: string) {
  const [request, setRequest] = useState<RepairRequest>();
  const [result, setResult] = useState<CustomerAiFlowResult>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const generation = useRef(0);
  const retry = useCallback(async () => {
    const current = ++generation.current;
    setLoading(true);
    setError(undefined);
    setResult(undefined);
    try {
      const value = await loadCustomerAiFlow(requestId, dependencies, (saved) => {
        if (current === generation.current) setRequest(saved);
      });
      if (current === generation.current) setResult(value);
    } catch (caught) { if (current === generation.current) setError(caught); }
    finally { if (current === generation.current) setLoading(false); }
  }, [requestId]);

  useEffect(() => {
    setRequest(undefined);
    void retry();
    return () => { generation.current++; };
  }, [retry]);
  return { request, result, loading, error, retry };
}
