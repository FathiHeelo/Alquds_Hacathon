import { useEffect, useRef, useState } from "react";
import { Urgency } from "../../../domain/enums/status";
import { PreferredTime, type RepairRequestDraft } from "../../../domain/models/repairRequest";
import { suggestVoiceRequest, type VoiceSuggestion } from "../../../services/ai/requestVoiceAdapter";
import { getCustomerLocation, jerusalemDemoLocation } from "../../../services/location/locationService";
import { pickRequestMedia } from "../../../services/media/mediaAdapter";
import { mapToAppError } from "../../../shared/errors/mapToAppError";
import { repairRequestRepository } from "../services/requestService";
import { validateRepairRequest, type RequestErrors } from "../services/requestValidation";

let nextDraft = 1;

export type VoiceDemoState =
  | "idle"
  | "recording"
  | "processing"
  | "transcript_ready"
  | "ai_analysis"
  | "follow_up";


export function useRepairRequest(technicianId?: string) {
  const [draft, setDraft] = useState<RepairRequestDraft>(() => ({
    localId: `draft-${Date.now()}-${nextDraft++}`,
    customerId: "demo-customer",
    technicianId,
    description: "",
    urgency: Urgency.Medium,
    preferredTime: PreferredTime.Asap,
    location: { ...jerusalemDemoLocation },
    media: [],
    createdAt: new Date().toISOString(),
  }));

  const [errors, setErrors] = useState<RequestErrors>({});
  const [error, setError] = useState<string>();
  const [reviewing, setReviewing] = useState(false);
  const [busy, setBusy] = useState<"media" | "voice" | "submit">();
  const [suggestion, setSuggestion] = useState<VoiceSuggestion>();
  const [voiceState, setVoiceState] = useState<VoiceDemoState>("idle");
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const locked = useRef(false);
  const locationEdited = useRef(false);
  const recordingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const processingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
    let active = true;

    void getCustomerLocation().then((location) => {
      if (active && location && !locationEdited.current) {
        setDraft((value) => ({ ...value, location }));
      }
    });

    return () => {
      active = false;
      if (recordingTimer.current) clearInterval(recordingTimer.current);
      if (processingTimer.current) clearTimeout(processingTimer.current);
    };
  }, []);

  function update(patch: Partial<RepairRequestDraft>) {
    if (patch.location) locationEdited.current = true;
    setDraft((value) => ({ ...value, ...patch }));
    setErrors({});
  }

  async function run<T>(
    kind: NonNullable<typeof busy>,
    action: () => Promise<T>,
  ): Promise<T | undefined> {
    if (locked.current) return;

    locked.current = true;
    setBusy(kind);
    setError(undefined);

    try {
      return await action();
    } catch (caught) {
      const mapped = mapToAppError(caught);
      setError(
        mapped.code === "VALIDATION_ERROR"
          ? mapped.message
          : "تعذر إكمال العملية. تفاصيل طلبك محفوظة، حاول مجدداً.",
      );
    } finally {
      locked.current = false;
      setBusy(undefined);
    }
  }

  function review() {
    const validation = validateRepairRequest(draft);
    setErrors(validation);

    if (Object.keys(validation).length === 0) {
      setReviewing(true);
    }
  }

  function clearVoiceTimers() {
  if (recordingTimer.current !== null) {
    clearInterval(recordingTimer.current);
    recordingTimer.current = null;
  }

  if (processingTimer.current !== null) {
    clearTimeout(processingTimer.current);
    processingTimer.current = null;
  }
}
  function resetVoiceDemo() {
    clearVoiceTimers();
    setVoiceState("idle");
    setRecordingSeconds(0);
    setSuggestion(undefined);
    setError(undefined);
  }

  function startVoiceDemo() {
    if (locked.current || voiceState === "recording" || voiceState === "processing" || voiceState === "ai_analysis") {
      return;
    }

    clearVoiceTimers();
    setSuggestion(undefined);
    setRecordingSeconds(0);
    setVoiceState("recording");

    recordingTimer.current = setInterval(() => {
      setRecordingSeconds((seconds) => seconds + 1);
    }, 1000);
  }

  function stopVoiceDemo() {
    if (voiceState !== "recording") return;

    clearVoiceTimers();
    setVoiceState("processing");

    processingTimer.current = setTimeout(() => {
      processingTimer.current = null;
      setVoiceState("transcript_ready");

      // The transcript itself is deterministic demo data.
      // The next step sends it through the existing Jaber AI structure flow.
      void run("voice", async () => {
        setVoiceState("ai_analysis");

        const result = await suggestVoiceRequest();

setDraft((value) => ({
  ...value,
  description: result.description,
  category: result.category ?? value.category,
  urgency: result.urgency,
  voice: result.voice,
}));

setSuggestion(result);
setVoiceState("transcript_ready");

        return result;
      });
    }, 900);
  }
  return {
    draft,
    errors,
    error,
    reviewing,
    busy,
    suggestion,
    voiceState,
    recordingSeconds,

    update,
    review,

    edit: () => setReviewing(false),

    dismissVoice: resetVoiceDemo,

    resetVoiceDemo,

    startVoiceDemo,
    stopVoiceDemo,

    applyVoice: () => {
      if (suggestion) {
        update({
          description: suggestion.description,
          category: suggestion.category ?? draft.category,
          urgency: suggestion.urgency,
          voice: suggestion.voice,
        });
      }

      setSuggestion(undefined);
    },
    attachMedia: () =>
      run("media", async () => {
        const media = await pickRequestMedia();

        setDraft((value) => ({
          ...value,
          media: [
            ...value.media,
            ...media.filter(
              (item) => !value.media.some(({ uri }) => uri === item.uri),
            ),
          ],
        }));
      }),

    removeMedia: (uri: string) =>
      setDraft((value) => ({
        ...value,
        media: value.media.filter((item) => item.uri !== uri),
      })),

    submit: () =>
      run("submit", async () => {
        const validation = validateRepairRequest(draft);

        if (Object.keys(validation).length) {
          setErrors(validation);
          setReviewing(false);
          return;
        }

        return repairRequestRepository.create(draft);
      }),
  };
}