import apiClient from "../client";
import { API_ENDPOINTS } from "../endpoints";

export const campaignsService = {
  getAllCampaigns: () => apiClient.get(API_ENDPOINTS.CAMPAIGNS.LIST),
  
  getCampaignById: (id: string) =>
    apiClient.get(API_ENDPOINTS.CAMPAIGNS.DETAIL(id)),
  
  createCampaign: (data: any) =>
    apiClient.post(API_ENDPOINTS.CAMPAIGNS.CREATE, data),
  
  updateCampaign: (id: string, data: any) =>
    apiClient.put(API_ENDPOINTS.CAMPAIGNS.UPDATE(id), data),
  
  deleteCampaign: (id: string) =>
    apiClient.delete(API_ENDPOINTS.CAMPAIGNS.DELETE(id)),
};
