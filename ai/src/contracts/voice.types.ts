export interface VoiceRequestInput {
  transcript: string;
}

export interface StructuredVoiceRequest {
  category: string;
  description: string;
  urgency: "low" | "medium" | "high";
}
