import apiClient from "../client";
import { API_ENDPOINTS } from "../endpoints";

export const callsService = {
  getAllCalls: (filters?: any) =>
    apiClient.get(API_ENDPOINTS.CALLS.LIST, { params: filters }),
  
  getCallById: (id: string) =>
    apiClient.get(API_ENDPOINTS.CALLS.DETAIL(id)),
  
  getLiveCalls: () =>
    apiClient.get(API_ENDPOINTS.CALLS.LIVE),
  
  terminateCall: (id: string) =>
    apiClient.post(API_ENDPOINTS.CALLS.TERMINATE(id)),
  
  getTranscript: (id: string) =>
    apiClient.get(API_ENDPOINTS.CALLS.TRANSCRIPT(id)),
};
