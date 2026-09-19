import type { TechnicianRequestItem } from "../../features/technician/technicianData";
import { aiAdapter } from "./aiAdapter";

export interface TechnicianVoiceOfferResult {
  transcript: string;
  suggestedPrice: number;
  suggestedMessage: string;
}

export async function analyzeTechnicianVoice(request: TechnicianRequestItem): Promise<TechnicianVoiceOfferResult> {
  const transcript = `أنا قريب من ${request.area}، فهمت المشكلة ومعي القطع اللازمة. بقدر أوصل خلال عشرين دقيقة، والشغل تقريباً من نص ساعة لأربعين دقيقة وبعطي ضمان أسبوعين.`;
  const aiResult = await aiAdapter.generateOfferAssistant({
    diagnosis: `${request.description}\nملاحظات الفني الصوتية: ${transcript}`,
    fairPriceMin: 110,
    fairPriceMax: 150
  });
  return {
    transcript,
    suggestedPrice: aiResult.suggestedPrice,
    suggestedMessage: `أهلاً ${request.customerName}، أنا قريب من ${request.area} وفهمت المشكلة. معي القطع اللازمة وبقدر أوصل خلال 20 دقيقة، ومدة الشغل المتوقعة 30–40 دقيقة مع ضمان أسبوعين. عرضي ${aiResult.suggestedPrice} ₪ شامل أجرة اليد.`
  };
}
