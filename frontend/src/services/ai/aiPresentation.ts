const arabicTerms: Record<string, string> = {
  "Kitchen sink water leak": "تسريب مياه من حوض المطبخ",
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
  Unknown: "تُحدّد بعد المعاينة"
};

export const presentAiTerm = (value: string): string => arabicTerms[value] ?? value;
export const presentAiList = (values: readonly string[]): string => values.map(presentAiTerm).join("، ");

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
