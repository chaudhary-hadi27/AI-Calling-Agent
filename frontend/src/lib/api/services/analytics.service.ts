import apiClient from "../client";
import { API_ENDPOINTS } from "../endpoints";

export const analyticsService = {
  getOverview: () => apiClient.get(API_ENDPOINTS.ANALYTICS.OVERVIEW),
  
  getCallAnalytics: (dateRange?: any) =>
    apiClient.get(API_ENDPOINTS.ANALYTICS.CALLS, { params: dateRange }),
  
  getPerformanceMetrics: () =>
    apiClient.get(API_ENDPOINTS.ANALYTICS.PERFORMANCE),
};
