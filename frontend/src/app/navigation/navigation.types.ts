import type { NavigatorScreenParams } from "@react-navigation/native";

export type CustomerTabParamList = {
  CustomerMap: undefined;
  CustomerRequests: undefined;
  CustomerMessages: undefined;
  CustomerRewards: undefined;
  CustomerAccount: undefined;
};

export type CustomerStackParamList = {
  CustomerTabs: NavigatorScreenParams<CustomerTabParamList> | undefined;
  CustomerTechnicianProfile: { technicianId: string; requestId?: string; offerId?: string };
  CustomerRepairRequest: { technicianId?: string };
  CustomerAiEntry: { requestId: string };
  CustomerOffersEntry: { requestId: string; technicianId?: string };
  CustomerOfferDetails: { requestId: string; offerId: string; technicianId?: string };
  CustomerJobEntry: { jobId: string; requestId: string; offerId: string; technicianId: string };
  CustomerJob: { jobId: string; requestId: string; offerId: string; technicianId: string };
  CustomerRating: { jobId: string; technicianId: string };
  CustomerNotifications: undefined;
  CustomerChat: { jobId: string; requestId: string; technicianId: string };
  CustomerRequestDetails: { requestId: string };
  CustomerSettings: undefined;
};

export type TechnicianTabParamList = {
  TechnicianRequests: undefined;
  TechnicianJobs: undefined;
  TechnicianMessages: undefined;
  TechnicianAccount: undefined;
};

export type TechnicianStackParamList = {
  TechnicianTabs: NavigatorScreenParams<TechnicianTabParamList> | undefined;
  TechnicianProfile: undefined;
  TechnicianPro: undefined;
  TechnicianAiAssistant: { requestId?: string; isPro?: boolean };
  TechnicianRequestDetails: { requestId: string };
  TechnicianCreateOffer: { requestId: string; suggestedPrice?: number; suggestedMessage?: string };
  TechnicianChat: { conversationId: string; requestId: string; customerName: string; problem: string };
  TechnicianJobDetails: { jobId: string };
  TechnicianAccountDetail: { section: "earnings" | "services" | "verification" | "settings" | "support" };
  TechnicianPreferences: undefined;
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminVerification: undefined;
  AdminReports: undefined;
  AdminRisk: undefined;
  AdminFinance: undefined;
  AdminUsers: undefined;
  AdminAudit: undefined;
  AdminSettings: undefined;
  AdminCaseDetails: { caseId: string; kind: "risk" | "verification" | "report" };
};
