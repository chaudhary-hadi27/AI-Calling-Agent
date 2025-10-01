import { API_CONFIG } from '@/utils/constants';

// Types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

interface RequestOptions extends RequestInit {
  timeout?: number;
}

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;

  constructor(baseURL: string = API_CONFIG.BASE_URL, timeout: number = API_CONFIG.TIMEOUT) {
    this.baseURL = baseURL.replace(/\/$/, ''); // Remove trailing slash
    this.defaultTimeout = timeout;
  }

  // Get auth token from storage
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('ai-calling-agent-token');
  }

  // Create headers with auth token
  private createHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  // Handle API response
  private async handleResponse<T>(response: Response): Promise<T> {
    let data: any;

    // Try to parse JSON response
    try {
      data = await response.json();
    } catch (error) {
      // If response is not JSON, use text
      data = { message: await response.text() };
    }

    if (!response.ok) {
      const error: ApiError = {
        message: data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        code: data?.code,
      };
      throw error;
    }

    return data;
  }

  // Make HTTP request with timeout
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const timeout = options.timeout || this.defaultTimeout;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: this.createHeaders(options.headers as Record<string, string>),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }

      throw error;
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // File upload
  async upload<T>(
    endpoint: string,
    file: File,
    additionalData: Record<string, any> = {},
    options?: RequestOptions
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    // Add additional form data
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
    });

    // Don't set Content-Type for FormData, let browser set it
    const headers = this.createHeaders();
    delete headers['Content-Type'];

    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      headers,
    });
  }

  // API Endpoints

  // Health check
  async getHealth(): Promise<{ status: string; timestamp: string }> {
    return this.get('/health');
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    return this.post('/auth/login', credentials);
  }

  async logout() {
    return this.post('/auth/logout');
  }

  async refreshToken() {
    return this.post('/auth/refresh');
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  // Calls endpoints
  async getCalls(params?: Record<string, any>) {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/calls${queryParams}`);
  }

  async getCall(id: string) {
    return this.get(`/calls/${id}`);
  }

  async createCall(data: any) {
    return this.post('/calls', data);
  }

  async updateCall(id: string, data: any) {
    return this.put(`/calls/${id}`, data);
  }

  async deleteCall(id: string) {
    return this.delete(`/calls/${id}`);
  }

  // Campaigns endpoints
  async getCampaigns(params?: Record<string, any>) {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/campaigns${queryParams}`);
  }

  async getCampaign(id: string) {
    return this.get(`/campaigns/${id}`);
  }

  async createCampaign(data: any) {
    return this.post('/campaigns', data);
  }

  async updateCampaign(id: string, data: any) {
    return this.put(`/campaigns/${id}`, data);
  }

  async deleteCampaign(id: string) {
    return this.delete(`/campaigns/${id}`);
  }

  async startCampaign(id: string) {
    return this.post(`/campaigns/${id}/start`);
  }

  async pauseCampaign(id: string) {
    return this.post(`/campaigns/${id}/pause`);
  }

  async stopCampaign(id: string) {
    return this.post(`/campaigns/${id}/stop`);
  }

  // Contacts endpoints
  async getContacts(params?: Record<string, any>) {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/contacts${queryParams}`);
  }

  async getContact(id: string) {
    return this.get(`/contacts/${id}`);
  }

  async createContact(data: any) {
    return this.post('/contacts', data);
  }

  async updateContact(id: string, data: any) {
    return this.put(`/contacts/${id}`, data);
  }

  async deleteContact(id: string) {
    return this.delete(`/contacts/${id}`);
  }

  async importContacts(file: File, campaignId?: string) {
    return this.upload('/contacts/import', file, { campaignId });
  }

  async exportContacts(params?: Record<string, any>) {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/contacts/export${queryParams}`);
  }

  // Analytics endpoints
  async getAnalytics(params?: Record<string, any>) {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/analytics${queryParams}`);
  }

  async getDashboardMetrics() {
    return this.get('/analytics/dashboard');
  }

  async getCallMetrics(params?: Record<string, any>) {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/analytics/calls${queryParams}`);
  }

  async getCampaignMetrics(id: string, params?: Record<string, any>) {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/analytics/campaigns/${id}${queryParams}`);
  }

  // Settings endpoints
  async getSettings() {
    return this.get('/settings');
  }

  async updateSettings(data: any) {
    return this.put('/settings', data);
  }

  async getApiKeys() {
    return this.get('/settings/api-keys');
  }

  async createApiKey(data: { name: string; permissions: string[] }) {
    return this.post('/settings/api-keys', data);
  }

  async deleteApiKey(id: string) {
    return this.delete(`/settings/api-keys/${id}`);
  }

  // Webhooks endpoints
  async getWebhooks() {
    return this.get('/webhooks');
  }

  async createWebhook(data: any) {
    return this.post('/webhooks', data);
  }

  async updateWebhook(id: string, data: any) {
    return this.put(`/webhooks/${id}`, data);
  }

  async deleteWebhook(id: string) {
    return this.delete(`/webhooks/${id}`);
  }

  async testWebhook(id: string) {
    return this.post(`/webhooks/${id}/test`);
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export { ApiClient };
export type { ApiResponse, ApiError };