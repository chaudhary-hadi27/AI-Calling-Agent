import apiClient from "../client";
import { API_ENDPOINTS } from "../endpoints";

export const agentsService = {
  getAllAgents: () => apiClient.get(API_ENDPOINTS.AGENTS.LIST),
  
  getAgentById: (id: string) => apiClient.get(API_ENDPOINTS.AGENTS.DETAIL(id)),
  
  createAgent: (data: any) => apiClient.post(API_ENDPOINTS.AGENTS.CREATE, data),
  
  updateAgent: (id: string, data: any) =>
    apiClient.put(API_ENDPOINTS.AGENTS.UPDATE(id), data),
  
  deleteAgent: (id: string) => apiClient.delete(API_ENDPOINTS.AGENTS.DELETE(id)),
};
