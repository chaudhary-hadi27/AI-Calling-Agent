/**
 * Enhanced useAuth Hook
 * Production-ready authentication with security features
 */

import { useAuthStore } from "@/lib/store/authStore";
import { authService } from "@/lib/api/services/auth.service";
import { useToast } from "./useToast";
import { useRouter } from "next/navigation";
import { useLoginRateLimit } from "./useRateLimit";
import { useSecurityMonitor } from "./useSecurityMonitor";
import { getDeviceFingerprint, trustCurrentDevice } from "@/lib/security/deviceFingerprint";
import { validatePasswordEnterprise } from "@/lib/utils/validators";

export const useAuth = () => {
  const router = useRouter();
  const { toast } = useToast();
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: setLogin,
    logout: setLogout,
    setLoading,
  } = useAuthStore();

  const {
    logLoginAttempt,
    logLoginSuccess,
    logLoginFailure,
    logSuspiciousActivity,
  } = useSecurityMonitor();

  /**
   * Login with email and password
   */
  const login = async (
    email: string,
    password: string,
    options?: {
      trustDevice?: boolean;
      mfaCode?: string;
    }
  ) => {
    try {
      setLoading(true);

      // Get device fingerprint
      const deviceFingerprint = await getDeviceFingerprint();

      // Log attempt
      await logLoginAttempt(email, 'password');

      // Call API
      const response = await authService.login(email, password);

      // Check if MFA is required
      if (response.mfaRequired && !options?.mfaCode) {
        setLoading(false);
        return {
          requiresMFA: true,
          tempToken: response.tempToken,
        };
      }

      // Store auth data
      setLogin(response.user, response.token);

      // Trust device if requested
      if (options?.trustDevice) {
        await trustCurrentDevice(response.user.id);
      }

      // Log success
      await logLoginSuccess(response.user.email, 'password');

      toast.success("Welcome back!");
      router.push("/dashboard");

      return { success: true };
    } catch (error: any) {
      // Log failure
      const reason = error?.response?.data?.message || 'Unknown error';
      await logLoginFailure(email, reason);

      // Check for specific error types
      if (error?.response?.status === 423) {
        // Account locked
        await logSuspiciousActivity('Account locked after multiple failed attempts', {
          email,
        });
        toast.error("Account locked. Please try again later or reset your password.");
      } else if (error?.response?.status === 429) {
        // Rate limited
        toast.error("Too many login attempts. Please try again later.");
      } else {
        const message = error?.response?.data?.message || "Login failed. Please try again.";
        toast.error(message);
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new account
   */
  const register = async (
    name: string,
    email: string,
    password: string,
    options?: {
      marketingConsent?: boolean;
    }
  ) => {
    try {
      setLoading(true);

      // Validate password strength
      const passwordValidation = await validatePasswordEnterprise(password, {
        checkPwned: true,
        minLength: 12,
      });

      if (!passwordValidation.isValid) {
        toast.error(passwordValidation.message);
        throw new Error(passwordValidation.message);
      }

      // Warning for medium strength passwords
      if (passwordValidation.strength === 'medium') {
        toast.warning('Password strength is medium. Consider using a stronger password.');
      }

      // Get device fingerprint
      const deviceFingerprint = await getDeviceFingerprint();

      // Call API
      const response = await authService.register(name, email, password);

      // Store auth data
      setLogin(response.user, response.token);

      // Auto-trust first device
      await trustCurrentDevice(response.user.id);

      toast.success("Account created successfully!");
      router.push("/dashboard");

      return { success: true };
    } catch (error: any) {
      const message = error?.response?.data?.message || "Registration failed. Please try again.";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async (reason?: string) => {
    try {
      // Call logout API
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local state
      setLogout();

      // Show appropriate message
      if (reason === 'session_expired') {
        toast.warning("Your session has expired. Please log in again.");
      } else if (reason === 'security') {
        toast.error("Logged out due to security reasons.");
      } else {
        toast.info("You have been logged out");
      }

      router.push("/login");
    }
  };

  /**
   * Verify MFA code
   */
  const verifyMFA = async (tempToken: string, mfaCode: string) => {
    try {
      setLoading(true);

      const response = await authService.verifyMFA(tempToken, mfaCode);

      // Store auth data
      setLogin(response.user, response.token);

      toast.success("MFA verification successful!");
      router.push("/dashboard");

      return { success: true };
    } catch (error: any) {
      const message = error?.response?.data?.message || "MFA verification failed.";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh user profile data
   */
  const refreshProfile = async () => {
    try {
      const response = await authService.getProfile();
      useAuthStore.getState().setUser(response.user);
    } catch (error) {
      console.error("Failed to refresh profile:", error);
    }
  };

  /**
   * Change password
   */
  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      setLoading(true);

      // Validate new password strength
      const passwordValidation = await validatePasswordEnterprise(newPassword, {
        checkPwned: true,
        minLength: 12,
      });

      if (!passwordValidation.isValid) {
        toast.error(passwordValidation.message);
        throw new Error(passwordValidation.message);
      }

      // Call API
      await authService.changePassword(currentPassword, newPassword);

      toast.success("Password changed successfully!");
      return { success: true };
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to change password.";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Request password reset
   */
  const requestPasswordReset = async (email: string) => {
    try {
      setLoading(true);

      await authService.forgotPassword(email);

      toast.success("Password reset email sent!");
      return { success: true };
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to send reset email.";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset password with token
   */
  const resetPassword = async (token: string, newPassword: string) => {
    try {
      setLoading(true);

      // Validate password strength
      const passwordValidation = await validatePasswordEnterprise(newPassword, {
        checkPwned: true,
        minLength: 12,
      });

      if (!passwordValidation.isValid) {
        toast.error(passwordValidation.message);
        throw new Error(passwordValidation.message);
      }

      await authService.resetPassword(token, newPassword);

      toast.success("Password reset successful! Please log in.");
      router.push("/login");

      return { success: true };
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to reset password.";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Enable MFA
   */
  const enableMFA = async () => {
    try {
      setLoading(true);

      const response = await authService.initiateMFA();

      return {
        qrCodeUrl: response.qrCodeUrl,
        secret: response.secret,
        backupCodes: response.backupCodes,
      };
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to enable MFA.";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify MFA setup
   */
  const verifyMFASetup = async (code: string) => {
    try {
      setLoading(true);

      await authService.verifyMFASetup(code);

      // Refresh profile to get updated MFA status
      await refreshProfile();

      toast.success("Two-factor authentication enabled successfully!");
      return { success: true };
    } catch (error: any) {
      const message = error?.response?.data?.message || "Invalid verification code.";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Disable MFA
   */
  const disableMFA = async (password: string) => {
    try {
      setLoading(true);

      await authService.disableMFA(password);

      // Refresh profile
      await refreshProfile();

      toast.success("Two-factor authentication disabled.");
      return { success: true };
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to disable MFA.";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if session is valid
   */
  const checkSession = async (): Promise<boolean> => {
    try {
      await authService.getProfile();
      return true;
    } catch {
      return false;
    }
  };

  /**
   * Force logout from all devices
   */
  const logoutAllDevices = async () => {
    try {
      setLoading(true);

      await authService.logoutAllDevices();

      setLogout();
      toast.info("Logged out from all devices.");
      router.push("/login");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to logout all devices.";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,

    // Authentication actions
    login,
    register,
    logout,
    verifyMFA,

    // Profile actions
    refreshProfile,

    // Password actions
    changePassword,
    requestPasswordReset,
    resetPassword,

    // MFA actions
    enableMFA,
    verifyMFASetup,
    disableMFA,

    // Session actions
    checkSession,
    logoutAllDevices,
  };
};

/**
 * Hook for checking authentication status
 */
export const useAuthCheck = () => {
  const { isAuthenticated, isLoading, checkSession } = useAuth();
  const router = useRouter();

  const requireAuth = async (redirectTo: string = '/login') => {
    if (!isAuthenticated) {
      router.push(redirectTo);
      return false;
    }

    // Verify session is still valid
    const isValid = await checkSession();
    if (!isValid) {
      router.push(redirectTo);
      return false;
    }

    return true;
  };

  return {
    isAuthenticated,
    isLoading,
    requireAuth,
  };
};

/**
 * Hook for protected routes
 */
export const useProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  if (!isLoading && !isAuthenticated) {
    router.push('/login');
  }

  return { isAuthenticated, isLoading };
};