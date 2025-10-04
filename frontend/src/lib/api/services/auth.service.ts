import apiClient from "../client";
import { API_ENDPOINTS } from "../endpoints";

export const authService = {
  login: (email: string, password: string) =>
    apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password }),
  
  register: (name: string, email: string, password: string) =>
    apiClient.post(API_ENDPOINTS.AUTH.REGISTER, { name, email, password }),
  
  logout: () => apiClient.post(API_ENDPOINTS.AUTH.LOGOUT),
  
  getProfile: () => apiClient.get(API_ENDPOINTS.AUTH.ME),
};
