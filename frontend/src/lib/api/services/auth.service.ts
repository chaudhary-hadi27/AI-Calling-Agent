import apiClient from "../client";
import { API_ENDPOINTS } from "../endpoints";

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    mfaEnabled?: boolean;
  };
  token: string;
  mfaRequired?: boolean;
  tempToken?: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

export interface MFASetupResponse {
  qrCodeUrl: string;
  secret: string;
  backupCodes: string[];
}

export const authService = {
  /**
   * Enhanced login with device trust
   */
  login: (
    email: string,
    password: string,
    options?: {
      deviceFingerprint?: string;
      trustDevice?: boolean;
    }
  ): Promise<LoginResponse> =>
    apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
      deviceFingerprint: options?.deviceFingerprint,
      trustDevice: options?.trustDevice,
    }),

  /**
   * Register new account
   */
  register: (
    name: string,
    email: string,
    password: string
  ): Promise<RegisterResponse> =>
    apiClient.post(API_ENDPOINTS.AUTH.REGISTER, { name, email, password }),

  /**
   * Logout current session
   */
  logout: (): Promise<void> =>
    apiClient.post(API_ENDPOINTS.AUTH.LOGOUT),

  /**
   * Get current user profile
   */
  getProfile: (): Promise<{ user: LoginResponse['user'] }> =>
    apiClient.get(API_ENDPOINTS.AUTH.ME),

  /**
   * Refresh authentication token
   */
  refreshToken: (): Promise<{ token: string }> =>
    apiClient.post(API_ENDPOINTS.AUTH.REFRESH),

  /**
   * Request password reset email
   */
  forgotPassword: (email: string): Promise<{ message: string }> =>
    apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),

  /**
   * Reset password with token
   */
  resetPassword: (token: string, password: string): Promise<{ message: string }> =>
    apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password }),

  /**
   * Change password (authenticated)
   */
  changePassword: (
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> =>
    apiClient.post('/api/auth/change-password', {
      currentPassword,
      newPassword,
    }),

  /**
   * Verify MFA code during login
   */
  verifyMFA: (
    tempToken: string,
    code: string
  ): Promise<LoginResponse> =>
    apiClient.post('/api/auth/mfa/verify', { tempToken, code }),

  /**
   * Initiate MFA setup
   */
  initiateMFA: (): Promise<MFASetupResponse> =>
    apiClient.post('/api/auth/mfa/setup'),

  /**
   * Verify MFA setup with code
   */
  verifyMFASetup: (code: string): Promise<{ message: string }> =>
    apiClient.post('/api/auth/mfa/verify-setup', { code }),

  /**
   * Disable MFA
   */
  disableMFA: (password: string): Promise<{ message: string }> =>
    apiClient.post('/api/auth/mfa/disable', { password }),

  /**
   * Verify email with token
   */
  verifyEmail: (token: string): Promise<{ message: string }> =>
    apiClient.post('/api/auth/verify-email', { token }),

  /**
   * Resend verification email
   */
  resendVerificationEmail: (): Promise<{ message: string }> =>
    apiClient.post('/api/auth/resend-verification'),

  /**
   * Get user's trusted devices
   */
  getTrustedDevices: (): Promise<{
    devices: Array<{
      id: string;
      name: string;
      fingerprint: string;
      lastUsed: string;
      trusted: boolean;
    }>;
  }> => apiClient.get('/api/auth/devices'),

  /**
   * Trust current device
   */
  trustDevice: (
    deviceFingerprint: string,
    deviceName: string
  ): Promise<{ message: string }> =>
    apiClient.post('/api/auth/devices/trust', {
      deviceFingerprint,
      deviceName,
    }),

  /**
   * Revoke device trust
   */
  revokeDeviceTrust: (deviceId: string): Promise<{ message: string }> =>
    apiClient.delete(`/api/auth/devices/${deviceId}`),

  /**
   * Get active sessions
   */
  getActiveSessions: (): Promise<{
    sessions: Array<{
      id: string;
      deviceInfo: string;
      ipAddress: string;
      location: string;
      lastActivity: string;
      current: boolean;
    }>;
  }> => apiClient.get('/api/auth/sessions'),

  /**
   * Logout specific session
   */
  logoutSession: (sessionId: string): Promise<{ message: string }> =>
    apiClient.delete(`/api/auth/sessions/${sessionId}`),

  /**
   * Logout all other sessions
   */
  logoutAllDevices: (): Promise<{ message: string }> =>
    apiClient.post('/api/auth/sessions/logout-all'),
};

export default authService;