import { useCallback, useEffect, useRef, useState } from "react";
import { technicianRepository } from "../../../services/repositories";
import type { RepairRequest } from "../../../domain/models/repairRequest";
import { customerAiClient } from "../../../services/ai/customerAiClient";
import { repairRequestRepository } from "../../repair-request/services/requestService";
import { loadCustomerAiFlow, type CustomerAiFlowResult } from "../services/loadCustomerAiFlow";
import type { DiagnosisAnswer } from "../../../domain/contracts/customerAiClient";

const dependencies = { requests: repairRequestRepository, technicians: technicianRepository, ai: customerAiClient };

export function useAiCustomerFlow(requestId: string) {
  const [request, setRequest] = useState<RepairRequest>();
  const [result, setResult] = useState<CustomerAiFlowResult>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const generation = useRef(0);
  const run = useCallback(async (answers: readonly DiagnosisAnswer[] = []) => {
    const current = ++generation.current;
    setLoading(true);
    setError(undefined);
    setResult(undefined);
    try {
      const value = await loadCustomerAiFlow(requestId, dependencies, (saved) => {
        if (current === generation.current) setRequest(saved);
      }, answers);
      if (current === generation.current) setResult(value);
    } catch (caught) { if (current === generation.current) setError(caught); }
    finally { if (current === generation.current) setLoading(false); }
  }, [requestId]);
  const retry = useCallback(() => run(), [run]);
  const refine = useCallback((answers: readonly DiagnosisAnswer[]) => run(answers), [run]);

  useEffect(() => {
    setRequest(undefined);
    void retry();
    return () => { generation.current++; };
  }, [retry]);
  return { request, result, loading, error, retry, refine };
}
