import apiClient from "../client";

export interface SocialAuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  token: string;
}

export const socialAuthService = {
  /**
   * Initiate Google OAuth flow
   */
  googleLogin: () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback/google`;
    const scope = "openid email profile";
    const responseType = "code";
    const state = generateState();

    // Store state in sessionStorage for validation
    sessionStorage.setItem("oauth_state", state);

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: clientId!,
      redirect_uri: redirectUri,
      response_type: responseType,
      scope: scope,
      state: state,
      access_type: "offline",
      prompt: "consent",
    })}`;

    window.location.href = authUrl;
  },

  /**
   * Initiate Microsoft OAuth flow
   */
  microsoftLogin: () => {
    const clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback/microsoft`;
    const scope = "openid email profile";
    const responseType = "code";
    const state = generateState();

    sessionStorage.setItem("oauth_state", state);

    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${new URLSearchParams({
      client_id: clientId!,
      redirect_uri: redirectUri,
      response_type: responseType,
      scope: scope,
      state: state,
    })}`;

    window.location.href = authUrl;
  },

  /**
   * Handle OAuth callback and exchange code for token
   */
  handleCallback: async (provider: string, code: string, state: string): Promise<SocialAuthResponse> => {
    // Validate state
    const storedState = sessionStorage.getItem("oauth_state");
    if (state !== storedState) {
      throw new Error("Invalid state parameter");
    }

    // Clear stored state
    sessionStorage.removeItem("oauth_state");

    // Exchange code for token via backend
    const response = await apiClient.post(`/api/auth/${provider}/callback`, {
      code,
      redirect_uri: `${window.location.origin}/auth/callback/${provider}`,
    });

    return response;
  },

  /**
   * Link social account to existing user account
   */
  linkAccount: async (provider: string, code: string) => {
    return apiClient.post(`/api/auth/${provider}/link`, { code });
  },

  /**
   * Unlink social account from user account
   */
  unlinkAccount: async (provider: string) => {
    return apiClient.delete(`/api/auth/${provider}/unlink`);
  },
};

/**
 * Generate random state for OAuth security
 */
function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}