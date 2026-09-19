import { useEffect, useRef, useState } from "react";
import { Urgency } from "../../../domain/enums/status";
import { PreferredTime, type RepairRequestDraft } from "../../../domain/models/repairRequest";
import { suggestVoiceRequest, type VoiceSuggestion } from "../../../services/ai/requestVoiceAdapter";
import { getCustomerLocation, jerusalemDemoLocation } from "../../../services/location/locationService";
import { pickRequestMedia } from "../../../services/media/mediaAdapter";
import { mapToAppError } from "../../../shared/errors/mapToAppError";
import { repairRequestRepository } from "../services/requestService";
import { validateRepairRequest, type RequestErrors } from "../services/requestValidation";
import { appConfig } from "../../../app/config/appConfig";

let nextDraft = 1;

export function useRepairRequest(technicianId?: string) {
  const [draft, setDraft] = useState<RepairRequestDraft>(() => ({ localId: `draft-${Date.now()}-${nextDraft++}`,
    customerId: "demo-customer", technicianId, description: "", urgency: Urgency.Medium,
    preferredTime: PreferredTime.Asap, location: appConfig.demoMode ? { ...jerusalemDemoLocation } : { label: "", source: "device" }, media: [], createdAt: new Date().toISOString() }));
  const [errors, setErrors] = useState<RequestErrors>({});
  const [error, setError] = useState<string>();
  const [reviewing, setReviewing] = useState(false);
  const [busy, setBusy] = useState<"media" | "voice" | "submit">();
  const [suggestion, setSuggestion] = useState<VoiceSuggestion>();
  const locked = useRef(false);
  const locationEdited = useRef(false);

  useEffect(() => {
    let active = true;
    void getCustomerLocation().then((location) => {
      if (active && location && !locationEdited.current) setDraft((value) => ({ ...value, location }));
    });
    return () => { active = false; };
  }, []);

  function update(patch: Partial<RepairRequestDraft>) {
    if (patch.location) locationEdited.current = true;
    setDraft((value) => ({ ...value, ...patch }));
    setErrors({});
  }

  async function run<T,>(kind: NonNullable<typeof busy>, action: () => Promise<T>): Promise<T | undefined> {
    if (locked.current) return;
    locked.current = true;
    setBusy(kind);
    setError(undefined);
    try { return await action(); }
    catch (caught) {
      const mapped = mapToAppError(caught);
      setError(mapped.code === "VALIDATION_ERROR" ? mapped.message : "تعذر إكمال العملية. تفاصيل طلبك محفوظة، حاول مجدداً.");
    } finally { locked.current = false; setBusy(undefined); }
  }

  function review() {
    const validation = validateRepairRequest(draft);
    setErrors(validation);
    if (Object.keys(validation).length === 0) setReviewing(true);
  }

  return { draft, errors, error, reviewing, busy, suggestion, update, review,
    edit: () => setReviewing(false),
    dismissVoice: () => setSuggestion(undefined),
    applyVoice: () => {
      if (suggestion) update({ description: suggestion.description, category: suggestion.category ?? draft.category,
        urgency: suggestion.urgency, voice: suggestion.voice });
      setSuggestion(undefined);
    },
    loadVoice: () => run("voice", async () => setSuggestion(await suggestVoiceRequest())),
    attachMedia: () => run("media", async () => {
      const media = await pickRequestMedia();
      setDraft((value) => ({ ...value, media: [...value.media, ...media.filter((item) => !value.media.some(({ uri }) => uri === item.uri))] }));
    }),
    removeMedia: (uri: string) => setDraft((value) => ({ ...value, media: value.media.filter((item) => item.uri !== uri) })),
    submit: () => run("submit", async () => {
      const validation = validateRepairRequest(draft);
      if (Object.keys(validation).length) { setErrors(validation); setReviewing(false); return; }
      return repairRequestRepository.create(draft);
    })
  };
}
