// New File Gnenerated by Claude
// File: frontend/src/lib/api/endpoints.ts
// ✅ UPDATED: Added email verification endpoints

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    ME: "/api/auth/me",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
    VERIFY_EMAIL: "/api/auth/verify-email", // ✅ NEW
    RESEND_VERIFICATION: "/api/auth/resend-verification", // ✅ NEW
    CHANGE_PASSWORD: "/api/auth/change-password",
  },

  // Calls
  CALLS: {
    LIST: "/api/calls",
    DETAIL: (id: string) => `/api/calls/${id}`,
    LIVE: "/api/calls/live",
    TERMINATE: (id: string) => `/api/calls/${id}/terminate`,
    TRANSCRIPT: (id: string) => `/api/calls/${id}/transcript`,
  },

  // Agents
  AGENTS: {
    LIST: "/api/agents",
    CREATE: "/api/agents",
    DETAIL: (id: string) => `/api/agents/${id}`,
    UPDATE: (id: string) => `/api/agents/${id}`,
    DELETE: (id: string) => `/api/agents/${id}`,
  },

  // Analytics
  ANALYTICS: {
    OVERVIEW: "/api/analytics/overview",
    CALLS: "/api/analytics/calls",
    PERFORMANCE: "/api/analytics/performance",
  },

  // Campaigns
  CAMPAIGNS: {
    LIST: "/api/campaigns",
    CREATE: "/api/campaigns",
    DETAIL: (id: string) => `/api/campaigns/${id}`,
    UPDATE: (id: string) => `/api/campaigns/${id}`,
    DELETE: (id: string) => `/api/campaigns/${id}`,
  },
};

// Previous File

// export const API_ENDPOINTS = {
//   // Auth
//   AUTH: {
//     LOGIN: "/api/auth/login",
//     REGISTER: "/api/auth/register",
//     LOGOUT: "/api/auth/logout",
//     REFRESH: "/api/auth/refresh",
//     ME: "/api/auth/me",
//     FORGOT_PASSWORD: "/api/auth/forgot-password",
//     RESET_PASSWORD: "/api/auth/reset-password",
//   },
//
//   // Calls
//   CALLS: {
//     LIST: "/api/calls",
//     DETAIL: (id: string) => `/api/calls/${id}`,
//     LIVE: "/api/calls/live",
//     TERMINATE: (id: string) => `/api/calls/${id}/terminate`,
//     TRANSCRIPT: (id: string) => `/api/calls/${id}/transcript`,
//   },
//
//   // Agents
//   AGENTS: {
//     LIST: "/api/agents",
//     CREATE: "/api/agents",
//     DETAIL: (id: string) => `/api/agents/${id}`,
//     UPDATE: (id: string) => `/api/agents/${id}`,
//     DELETE: (id: string) => `/api/agents/${id}`,
//   },
//
//   // Analytics
//   ANALYTICS: {
//     OVERVIEW: "/api/analytics/overview",
//     CALLS: "/api/analytics/calls",
//     PERFORMANCE: "/api/analytics/performance",
//   },
//
//   // Campaigns
//   CAMPAIGNS: {
//     LIST: "/api/campaigns",
//     CREATE: "/api/campaigns",
//     DETAIL: (id: string) => `/api/campaigns/${id}`,
//     UPDATE: (id: string) => `/api/campaigns/${id}`,
//     DELETE: (id: string) => `/api/campaigns/${id}`,
//   },
// };