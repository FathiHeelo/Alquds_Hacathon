import { useCallback, useEffect, useState } from "react";
import type { Offer } from "../../../domain/models/offer";
import { offerRepository } from "../services/offerService";
export function useOffers(requestId: string) {
  const [offers, setOffers] = useState<readonly Offer[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string>();
  const load = useCallback(async () => { setLoading(true); setError(undefined); try { setOffers(await offerRepository.getOffersForRequest(requestId)); } catch { setError("تعذر تحميل العروض حالياً."); } finally { setLoading(false); } }, [requestId]);
  useEffect(() => { void load(); }, [load]); return { offers, loading, error, retry: load };
}
