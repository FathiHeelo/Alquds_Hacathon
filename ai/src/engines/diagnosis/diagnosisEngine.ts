import type { DiagnosisAnswer, DiagnosisInput, DiagnosisResult, FollowUpQuestion } from "../../contracts/diagnosis.types";
import type { RepairCategory, TechnicianType, Urgency } from "../../contracts/ai.types";
import { recommendAssistance } from "../routing/routingEngine";

const answerMap = (answers: readonly DiagnosisAnswer[] = []) => new Map(answers.map(({ questionId, value }) => [questionId, value]));
const hasAny = (text: string, terms: readonly string[]) => terms.some((term) => text.includes(term));
const option = (value: string, labelAr: string, labelEn: string) => ({ value, labelAr, labelEn });

const questions = {
  plumbingFlow: {
    id: "leak_when_off",
    promptAr: "هل يستمر التسريب عندما تكون الحنفية مغلقة؟",
    promptEn: "Does the leak continue when the faucet is off?",
    options: [option("yes", "نعم، يستمر", "Yes, it continues"), option("no", "لا، يتوقف", "No, it stops"), option("unknown", "غير متأكد", "Not sure")]
  },
  plumbingSource: {
    id: "leak_source",
    promptAr: "من أين يبدو أن الماء يخرج؟",
    promptEn: "Where does the water appear to come from?",
    options: [option("drain", "وصلة التصريف أسفل الحوض", "Drain connection below the sink"), option("supply", "خرطوم أو وصلة تغذية المياه", "Water supply hose or connection"), option("basin", "من جسم الحوض نفسه", "From the sink basin itself"), option("unknown", "غير واضح", "Not clear")]
  },
  electricalDanger: {
    id: "electrical_danger",
    promptAr: "هل يوجد دخان أو شرر أو رائحة احتراق؟",
    promptEn: "Is there smoke, sparking, or a burning smell?",
    options: [option("smoke_or_sparks", "نعم", "Yes"), option("none", "لا", "No"), option("unknown", "غير متأكد", "Not sure")]
  },
  electricalScope: {
    id: "electrical_scope",
    promptAr: "هل العطل في مقبس واحد أم في أكثر من جزء؟",
    promptEn: "Is the problem limited to one outlet or affecting several areas?",
    options: [option("single", "مقبس واحد", "One outlet"), option("multiple", "عدة مقابس أو غرف", "Several outlets or rooms"), option("main_breaker", "القاطع الرئيسي يفصل", "Main breaker trips")]
  },
  acAirflow: {
    id: "ac_airflow",
    promptAr: "هل يخرج هواء من المكيّف لكنه غير بارد؟",
    promptEn: "Is the AC blowing air that is not cold?",
    options: [option("warm_air", "نعم، الهواء غير بارد", "Yes, the air is not cold"), option("no_air", "لا يخرج هواء", "No air comes out"), option("intermittent", "التبريد متقطع", "Cooling is intermittent")]
  },
  applianceTiming: {
    id: "appliance_leak_timing",
    promptAr: "متى يظهر تسريب الغسالة؟",
    promptEn: "When does the washing-machine leak appear?",
    options: [option("fill", "عند تعبئة المياه", "While filling"), option("drain", "عند التصريف", "While draining"), option("door", "من الباب أثناء التشغيل", "From the door while running"), option("unknown", "غير واضح", "Not clear")]
  },
  generalArea: {
    id: "problem_area",
    promptAr: "أي نوع من الأنظمة يبدو مرتبطاً بالمشكلة؟",
    promptEn: "Which system seems related to the problem?",
    options: [option("plumbing", "مياه أو صرف", "Water or drainage"), option("electrical", "كهرباء", "Electrical"), option("appliances", "جهاز منزلي", "Home appliance"), option("general", "غير متأكد", "Not sure")]
  }
} satisfies Record<string, FollowUpQuestion>;

function unanswered(items: FollowUpQuestion[], answers: Map<string, string>): FollowUpQuestion[] {
  return items.filter(({ id }) => !answers.has(id)).slice(0, 3);
}

function technicianFor(category: RepairCategory): TechnicianType {
  if (category === "plumbing") return "plumber";
  if (category === "electrical") return "electrician";
  if (category === "ac") return "ac_technician";
  if (category === "appliances") return "appliance_technician";
  return "general_technician";
}

export function diagnoseProblem(input: DiagnosisInput): DiagnosisResult {
  const combined = `${input.description} ${input.voiceTranscript ?? ""} ${input.photoContext ?? ""}`.trim();
  const text = combined.toLowerCase();
  const answers = answerMap(input.answers);
  let category = input.category;
  const areaAnswer = answers.get("problem_area");
  if (areaAnswer && areaAnswer !== "general") category = areaAnswer as RepairCategory;

  let initialHypothesis = "Unclear repair issue";
  let issueTitle = "Unclear repair issue";
  let probableCause = "The available details are not specific enough to identify a probable cause.";
  let urgency: Urgency = input.urgency ?? "medium";
  let likelyParts: string[] = [];
  let estimatedDuration = "Unknown";
  let confidence = 0.3;
  let selectedQuestions: FollowUpQuestion[] = [questions.generalArea];
  let durationBucket: DiagnosisResult["fairPriceContext"]["durationBucket"] = "medium";
  let partsBucket: DiagnosisResult["fairPriceContext"]["partsBucket"] = "minor";
  let caution: string | null = "Manual confirmation is recommended before assigning a technician.";

  const isFire = hasAny(text, ["fire", "flame", "burning", "حريق", "نار", "لهب"]);
  if (isFire) {
    category = category === "electrical" ? "electrical" : "general";
    initialHypothesis = issueTitle = "Immediate fire danger";
    probableCause = "The description indicates an active fire or immediate serious danger.";
    urgency = "high"; estimatedDuration = "Emergency response required"; confidence = 0.98;
    selectedQuestions = []; durationBucket = "short"; partsBucket = "none";
    caution = "Emergency-service guidance takes priority over technician dispatch.";
  } else if (category === "plumbing" && hasAny(text, ["leak", "water", "sink", "مجلى", "مي", "ماء", "تسريب"])) {
    initialHypothesis = "Kitchen sink water leak";
    issueTitle = "Kitchen sink water leak";
    probableCause = "A sink supply or drain connection is likely leaking.";
    urgency = hasAny(text, ["flood", "burst", "غرق", "انفجار", "غزارة"]) ? "high" : "medium";
    likelyParts = ["drain seal", "flexible hose", "pipe connector"];
    estimatedDuration = "1–2 hours"; confidence = 0.68;
    selectedQuestions = [questions.plumbingFlow, questions.plumbingSource];
    const source = answers.get("leak_source");
    const continues = answers.get("leak_when_off");
    if (source === "drain") {
      issueTitle = "Drain connection leak";
      probableCause = "The drain seal, trap, or drain connector is likely loose or damaged.";
      likelyParts = ["drain seal", "pipe connector"];
      estimatedDuration = "30–60 minutes"; confidence = continues === "no" ? 0.93 : 0.86;
      urgency = "medium"; durationBucket = "short";
    } else if (source === "supply" || continues === "yes") {
      issueTitle = "Water supply connection leak";
      probableCause = "A pressurized supply hose or valve connection is likely leaking.";
      likelyParts = ["flexible hose", "pipe connector"];
      estimatedDuration = "30–60 minutes"; confidence = source === "supply" && continues === "yes" ? 0.95 : 0.84;
      urgency = "high"; durationBucket = "short";
    } else if (source === "basin") {
      issueTitle = "Sink basin seal leak";
      probableCause = "Water is likely escaping around the sink seal or basin body.";
      likelyParts = ["drain seal"];
      estimatedDuration = "1–2 hours"; confidence = 0.82;
    }
    caution = "The exact source should be confirmed on site before parts are replaced.";
  } else if (category === "electrical" && hasAny(text, ["outlet", "socket", "plug", "electric", "breaker", "كهرب", "فيشة", "مقبس", "قاطع"])) {
    initialHypothesis = "Electrical circuit or outlet fault";
    issueTitle = "Electrical outlet not working";
    probableCause = "A faulty outlet connection, damaged outlet, or local circuit issue is likely.";
    likelyParts = ["electrical outlet", "terminal connector", "wire connector"];
    estimatedDuration = "30–60 minutes"; confidence = 0.72; durationBucket = "short";
    selectedQuestions = [questions.electricalDanger, questions.electricalScope];
    const danger = answers.get("electrical_danger");
    const scope = answers.get("electrical_scope");
    if (danger === "smoke_or_sparks") {
      issueTitle = "Dangerous electrical fault"; probableCause = "Smoke or sparking indicates an immediate electrical hazard.";
      urgency = "high"; confidence = 0.97; estimatedDuration = "Emergency response required"; likelyParts = [];
    } else if (scope === "main_breaker" || scope === "multiple") {
      issueTitle = scope === "main_breaker" ? "Main circuit overload or fault" : "Multi-circuit electrical fault";
      probableCause = "The fault may affect a circuit rather than a single outlet.";
      urgency = "high"; estimatedDuration = "1–2 hours"; confidence = 0.9; durationBucket = "medium"; partsBucket = "major";
    } else if (scope === "single") {
      confidence = 0.92; urgency = "medium";
    }
    caution = "Keep clear of exposed wiring and let a qualified person isolate and test the circuit.";
  } else if (category === "ac" && hasAny(text, ["cooling", "air conditioner", "ac", "مكيف", "تبريد"])) {
    initialHypothesis = "AC cooling or airflow problem";
    issueTitle = "AC not cooling properly";
    probableCause = "A filter, airflow, capacitor, or refrigerant issue may be reducing cooling.";
    likelyParts = ["air filter", "capacitor", "refrigerant"];
    estimatedDuration = "1–2 hours"; confidence = 0.74; selectedQuestions = [questions.acAirflow]; partsBucket = "major";
    const airflow = answers.get("ac_airflow");
    if (airflow === "warm_air") { issueTitle = "AC cooling-system fault"; probableCause = "Airflow is present, so the filter, refrigerant, or cooling circuit is the likely cause."; confidence = 0.9; }
    if (airflow === "no_air") { issueTitle = "AC airflow or fan fault"; probableCause = "The indoor fan, control, or airflow path is likely blocked or faulty."; likelyParts = ["air filter", "capacitor"]; confidence = 0.89; }
    if (airflow === "intermittent") { issueTitle = "Intermittent AC cooling fault"; probableCause = "A sensor, capacitor, or refrigerant condition may be interrupting cooling."; confidence = 0.85; }
    caution = "On-site pressure and electrical checks are required before replacing parts.";
  } else if (category === "appliances" && hasAny(text, ["washing machine", "washer", "غسالة"]) && hasAny(text, ["leak", "water", "مي", "ماء", "تسريب"])) {
    initialHypothesis = "Washing-machine water leak";
    issueTitle = "Washing-machine water leak";
    probableCause = "A hose, drain connection, or door seal may be leaking.";
    likelyParts = ["water inlet hose", "drain hose", "door seal"];
    estimatedDuration = "1–2 hours"; confidence = 0.7; selectedQuestions = [questions.applianceTiming]; partsBucket = "major";
    const timing = answers.get("appliance_leak_timing");
    if (timing === "fill") { issueTitle = "Washing-machine inlet leak"; probableCause = "The inlet hose or fill connection is the likely source."; likelyParts = ["water inlet hose"]; confidence = 0.92; }
    if (timing === "drain") { issueTitle = "Washing-machine drain leak"; probableCause = "The drain hose or pump connection is the likely source."; likelyParts = ["drain hose"]; confidence = 0.92; }
    if (timing === "door") { issueTitle = "Washing-machine door-seal leak"; probableCause = "The door seal is likely worn, displaced, or damaged."; likelyParts = ["door seal"]; confidence = 0.94; }
    caution = "Disconnect the appliance if water is near an electrical connection.";
  }

  let pendingQuestions = unanswered(selectedQuestions, answers);
  const answeredRelevant = selectedQuestions.some(({ id }) => answers.has(id));
  const routing = recommendAssistance({ description: `${combined} ${[...answers.values()].join(" ")}`, category, urgency, answers: input.answers });
  if (["EMERGENCY_SERVICE", "PUBLIC_SERVICE", "SOCIAL_ASSISTANCE"].includes(routing.type)) {
    pendingQuestions = [];
  }
  if (routing.type === "EMERGENCY_SERVICE") urgency = "high";
  const needsConfirmation = pendingQuestions.length > 0 || confidence < 0.65;

  return {
    initialHypothesis,
    issueTitle,
    probableCause,
    category,
    urgency,
    recommendedTechnicianType: technicianFor(category),
    likelyParts,
    estimatedDuration,
    confidence,
    confidenceLevel: confidence >= 0.8 ? "high" : confidence >= 0.55 ? "medium" : "low",
    caution,
    needsConfirmation,
    missingInformation: pendingQuestions.map(({ id }) => id),
    followUpQuestions: pendingQuestions,
    refined: answeredRelevant || selectedQuestions.length === 0,
    routing,
    fairPriceContext: { durationBucket, partsBucket },
    likelyIssue: issueTitle
  };
}
