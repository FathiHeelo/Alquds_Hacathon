export type CustomerTabParamList = {
  CustomerMap: undefined;
  CustomerRequests: undefined;
  CustomerMessages: undefined;
  CustomerRewards: undefined;
  CustomerAccount: undefined;
};

export type CustomerStackParamList = {
  CustomerTabs: undefined;
  CustomerTechnicianProfile: { technicianId: string; requestId?: string; offerId?: string };
  CustomerRepairRequest: { technicianId?: string };
  CustomerAiEntry: { requestId: string };
  CustomerOffersEntry: { requestId: string; technicianId?: string };
  CustomerOfferDetails: { requestId: string; offerId: string; technicianId?: string };
  CustomerJobEntry: { jobId: string; requestId: string; offerId: string; technicianId: string };
};

export type TechnicianTabParamList = {
  TechnicianRequests: undefined;
  TechnicianJobs: undefined;
  TechnicianMessages: undefined;
  TechnicianAccount: undefined;
};

export type TechnicianStackParamList = {
  TechnicianTabs: undefined;
  TechnicianProfile: undefined;
  TechnicianPro: undefined;
  TechnicianAiAssistant: undefined;
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
};
