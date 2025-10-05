import apiClient from "../client";
import { API_ENDPOINTS } from "../endpoints";

export const authService = {
  login: (email: string, password: string) =>
    apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password }),

  register: (name: string, email: string, password: string) =>
    apiClient.post(API_ENDPOINTS.AUTH.REGISTER, { name, email, password }),

  logout: () => apiClient.post(API_ENDPOINTS.AUTH.LOGOUT),

  getProfile: () => apiClient.get(API_ENDPOINTS.AUTH.ME),

  forgotPassword: (email: string) =>
    apiClient.post("/api/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post("/api/auth/reset-password", { token, password }),

  refreshToken: () => apiClient.post(API_ENDPOINTS.AUTH.REFRESH),
};