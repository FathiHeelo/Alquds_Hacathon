import { appConfig } from "../../app/config/appConfig";

export interface ApiClient {
  baseUrl: string;
}

export const apiClient: ApiClient = {
  baseUrl: appConfig.apiUrl
};
