const arabicTerms: Record<string, string> = {
  "Kitchen sink water leak": "تسريب مياه من حوض المطبخ",
  "Drain connection leak": "تسريب في وصلة التصريف",
  "Water supply connection leak": "تسريب في وصلة تغذية المياه",
  "Sink basin seal leak": "تسريب في عازل حوض المطبخ",
  "Electrical circuit or outlet fault": "عطل في دائرة أو مقبس كهربائي",
  "Dangerous electrical fault": "عطل كهربائي خطِر",
  "Main circuit overload or fault": "حمل زائد أو عطل في الدائرة الرئيسية",
  "Multi-circuit electrical fault": "عطل يؤثر في أكثر من دائرة كهربائية",
  "AC cooling or airflow problem": "مشكلة في تبريد المكيّف أو تدفق الهواء",
  "AC cooling-system fault": "عطل في نظام تبريد المكيّف",
  "AC airflow or fan fault": "عطل في تدفق الهواء أو مروحة المكيّف",
  "Intermittent AC cooling fault": "عطل متقطع في تبريد المكيّف",
  "Washing-machine inlet leak": "تسريب من مدخل مياه الغسالة",
  "Washing-machine drain leak": "تسريب من تصريف الغسالة",
  "Washing-machine door-seal leak": "تسريب من جلدة باب الغسالة",
  "Immediate fire danger": "خطر حريق فوري",
  "Electrical outlet not working": "عطل في المقبس الكهربائي",
  "AC not cooling properly": "المكيّف لا يبرّد بالشكل المطلوب",
  "Washing-machine water leak": "تسريب مياه من الغسالة",
  "Unclear repair issue": "العطل يحتاج إلى معاينة لتحديده",
  "drain seal": "جلدة صرف",
  "flexible hose": "خرطوم مرن",
  "pipe connector": "وصلة أنبوب",
  "electrical outlet": "مقبس كهربائي",
  "terminal connector": "وصلة طرفية",
  "wire connector": "وصلة أسلاك",
  "air filter": "فلتر هواء",
  capacitor: "مكثّف كهربائي",
  refrigerant: "غاز تبريد",
  "water inlet hose": "خرطوم دخول مياه",
  "drain hose": "خرطوم صرف",
  "door seal": "جلدة الباب",
  "1–2 hours": "ساعة إلى ساعتين",
  "30–60 minutes": "30 إلى 60 دقيقة",
  "Emergency response required": "تحتاج استجابة طارئة فورية",
  Unknown: "تُحدّد بعد المعاينة"
};

export const presentAiTerm = (value: string, language: "ar" | "en" = "ar"): string => language === "ar" ? arabicTerms[value] ?? value : value;
export const presentAiList = (values: readonly string[]): string => values.map((value) => presentAiTerm(value)).join("، ");

const matchingReasons: Record<string, string> = {
  specialty_match: "تخصصه يطابق نوع الطلب",
  nearby: "قريب من موقع الطلب",
  reasonable_distance: "ضمن مسافة مناسبة",
  high_rating: "تقييمه مرتفع",
  good_rating: "تقييمه جيد",
  available: "متاح حالياً",
  unavailable: "غير متاح حالياً",
  strong_job_history: "لديه سجل أعمال قوي",
  established_job_history: "لديه خبرة مثبتة"
};

export const presentMatchingReason = (value: string): string => matchingReasons[value] ?? value;

const technicianTypes: Record<string, { ar: string; en: string }> = {
  plumber: { ar: "سبّاك", en: "Plumber" },
  electrician: { ar: "كهربائي مؤهل", en: "Qualified electrician" },
  ac_technician: { ar: "فني تكييف وتبريد", en: "AC technician" },
  appliance_technician: { ar: "فني أجهزة منزلية", en: "Appliance technician" },
  general_technician: { ar: "فني صيانة عامة", en: "General technician" }
};

export const presentTechnicianType = (value: string, language: "ar" | "en") => technicianTypes[value]?.[language] ?? value;
export const presentUrgency = (value: string, language: "ar" | "en") => ({ low: language === "ar" ? "منخفضة" : "Low", medium: language === "ar" ? "متوسطة" : "Medium", high: language === "ar" ? "عالية" : "High" }[value] ?? value);
