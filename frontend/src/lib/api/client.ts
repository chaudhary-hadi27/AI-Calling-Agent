import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // Try to get token from localStorage (Zustand persist)
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          const token = state?.token;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error("Error parsing auth storage:", error);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Clear auth storage
        localStorage.removeItem("auth-storage");
        // Clear cookie
        document.cookie = "auth-token=; path=/; max-age=0";
        // Redirect to login
        window.location.href = "/login";
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default apiClient;