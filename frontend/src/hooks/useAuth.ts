import { useAuthStore } from "@/lib/store/authStore";
import { authService } from "@/lib/api/services/auth.service";
import { useToast } from "./useToast";
import { useRouter } from "next/navigation";

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

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);

      // Assuming API returns: { user: {...}, token: "..." }
      setLogin(response.user, response.token);

      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.register(name, email, password);

      setLogin(response.user, response.token);

      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Registration failed. Please try again.";
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLogout();
      toast.info("You have been logged out");
      router.push("/login");
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await authService.getProfile();
      useAuthStore.getState().setUser(response.user);
    } catch (error) {
      console.error("Failed to refresh profile:", error);
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshProfile,
  };
};