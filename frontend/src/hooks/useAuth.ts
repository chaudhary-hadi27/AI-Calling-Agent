"use client";

import { useAuthStore } from "@/lib/store/authStore";
import { authService } from "@/lib/api/services/auth.service";
import { useToast } from "./useToast";
import { useRouter } from "next/navigation";
import { useSecurityMonitor } from "./useSecurityMonitor";
import { validatePasswordEnterprise } from "@/lib/utils/validators";

interface LoginOptions {
  trustDevice?: boolean;
  deviceFingerprint?: string;
}

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
    updateUser,
  } = useAuthStore();

  const {
    logLoginAttempt,
    logLoginSuccess,
    logLoginFailure,
  } = useSecurityMonitor();

  /**
   * Enhanced login with device trust
   */
  const login = async (
    email: string,
    password: string,
    options?: LoginOptions
  ) => {
    try {
      setLoading(true);

      // Log attempt
      await logLoginAttempt(email, 'password');

      // Call API with device info
      const response = await authService.login(email, password, {
        deviceFingerprint: options?.deviceFingerprint,
        trustDevice: options?.trustDevice,
      });

      // Check if MFA is required
      if (response.mfaRequired && !response.token) {
        setLoading(false);
        return {
          requiresMFA: true,
          tempToken: response.tempToken,
        };
      }

      // Store auth data
      setLogin(response.user, response.token);

      // Log success
      await logLoginSuccess(response.user.email, 'password');

      toast.success(`Welcome back, ${response.user.name}!`);

      return { success: true };
    } catch (error: any) {
      // Log failure
      const reason = error?.response?.data?.message || 'Unknown error';
      await logLoginFailure(email, reason);

      // Re-throw to be handled by component
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

      // Call API
      const response = await authService.register(name, email, password);

      // Store auth data
      setLogin(response.user, response.token);

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
      updateUser(response.user);
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

    // Session actions
    checkSession,
  };
};