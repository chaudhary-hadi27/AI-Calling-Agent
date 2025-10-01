// Base API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// User & Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'manager';
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Call Types
export interface Call {
  id: string;
  campaignId: string;
  contactId: string;
  status: CallStatus;
  direction: 'inbound' | 'outbound';
  phoneNumber: string;
  contactName?: string;
  duration: number; // seconds
  startTime: string;
  endTime?: string;
  recordingUrl?: string;
  transcriptUrl?: string;
  transcript?: string;
  summary?: string;
  sentiment?: SentimentAnalysis;
  outcome?: CallOutcome;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type CallStatus =
  | 'queued'
  | 'initiating'
  | 'ringing'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'no_answer'
  | 'busy'
  | 'canceled';

export type CallOutcome =
  | 'successful'
  | 'callback_requested'
  | 'not_interested'
  | 'wrong_number'
  | 'voicemail'
  | 'busy'
  | 'no_answer'
  | 'disconnected';

export interface SentimentAnalysis {
  score: number; // -1 to 1
  label: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0 to 1
}

// Campaign Types
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  type: CampaignType;
  script: string;
  voiceId?: string;
  settings: CampaignSettings;
  schedule?: CampaignSchedule;
  contactListId?: string;
  totalContacts: number;
  completedCalls: number;
  successfulCalls: number;
  failedCalls: number;
  successRate: number;
  avgDuration: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'canceled';

export type CampaignType =
  | 'outbound_sales'
  | 'lead_qualification'
  | 'appointment_setting'
  | 'survey'
  | 'follow_up'
  | 'customer_service';

export interface CampaignSettings {
  maxCallsPerDay?: number;
  callRetries: number;
  retryDelay: number; // minutes
  workingHours: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
    timezone: string;
    daysOfWeek: number[]; // 0-6, Sunday = 0
  };
  detectAnsweringMachine: boolean;
  leaveVoicemail: boolean;
  voicemailScript?: string;
  transferOptions?: {
    enabled: boolean;
    phoneNumber?: string;
    conditions?: string[];
  };
}

export interface CampaignSchedule {
  startDate: string;
  endDate?: string;
  startTime?: string;
  isRecurring: boolean;
  recurringPattern?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
  };
}

// Contact Types
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  company?: string;
  jobTitle?: string;
  address?: ContactAddress;
  customFields?: Record<string, any>;
  tags?: string[];
  status: ContactStatus;
  source?: string;
  leadScore?: number;
  lastContactedAt?: string;
  notes?: string;
  timezone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export type ContactStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'interested'
  | 'not_interested'
  | 'callback'
  | 'converted'
  | 'do_not_call';

// Analytics Types
export interface AnalyticsData {
  calls: CallAnalytics;
  campaigns: CampaignAnalytics;
  contacts: ContactAnalytics;
  performance: PerformanceAnalytics;
  timeRange: {
    start: string;
    end: string;
  };
}

export interface CallAnalytics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  successRate: number;
  avgDuration: number;
  totalDuration: number;
  callsByStatus: Record<CallStatus, number>;
  callsByOutcome: Record<CallOutcome, number>;
  callsByHour: Array<{
    hour: number;
    count: number;
    successRate: number;
  }>;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface CampaignAnalytics {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  avgSuccessRate: number;
  topPerformingCampaigns: Array<{
    id: string;
    name: string;
    successRate: number;
    totalCalls: number;
  }>;
  campaignsByType: Record<CampaignType, number>;
}

export interface ContactAnalytics {
  totalContacts: number;
  newContacts: number;
  qualifiedContacts: number;
  convertedContacts: number;
  conversionRate: number;
  contactsBySource: Record<string, number>;
  contactsByStatus: Record<ContactStatus, number>;
}

export interface PerformanceAnalytics {
  callVolumeOverTime: Array<{
    date: string;
    calls: number;
    successful: number;
  }>;
  successRateOverTime: Array<{
    date: string;
    successRate: number;
  }>;
  avgDurationOverTime: Array<{
    date: string;
    avgDuration: number;
  }>;
  peakHours: Array<{
    hour: number;
    callCount: number;
    successRate: number;
  }>;
}

// Settings Types
export interface AppSettings {
  general: GeneralSettings;
  calling: CallingSettings;
  notifications: NotificationSettings;
  integrations: IntegrationSettings;
  security: SecuritySettings;
}

export interface GeneralSettings {
  companyName: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  language: string;
  currency: string;
}

export interface CallingSettings {
  defaultVoiceId: string;
  maxConcurrentCalls: number;
  callRecording: boolean;
  transcription: boolean;
  sentimentAnalysis: boolean;
  workingHours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
    daysOfWeek: number[];
  };
  callRetrySettings: {
    maxRetries: number;
    retryDelay: number;
    retryOnStatuses: CallStatus[];
  };
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    campaignUpdates: boolean;
    systemAlerts: boolean;
    dailySummary: boolean;
  };
  webhook: {
    enabled: boolean;
    url?: string;
    events: string[];
  };
  inApp: {
    enabled: boolean;
    callUpdates: boolean;
    systemNotifications: boolean;
  };
}

export interface IntegrationSettings {
  crm: {
    provider?: 'salesforce' | 'hubspot' | 'pipedrive';
    apiKey?: string;
    enabled: boolean;
    syncContacts: boolean;
    syncCalls: boolean;
  };
  calendar: {
    provider?: 'google' | 'outlook';
    enabled: boolean;
    createMeetings: boolean;
  };
  zapier: {
    enabled: boolean;
    webhookUrl?: string;
  };
}

export interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number; // minutes
  allowedIpAddresses?: string[];
  apiRateLimit: number;
  dataRetention: {
    calls: number; // days
    recordings: number; // days
    transcripts: number; // days
  };
}

// Webhook Types
export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  enabled: boolean;
  headers?: Record<string, string>;
  retrySettings: {
    maxRetries: number;
    retryDelay: number;
  };
  lastTriggeredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type WebhookEvent =
  | 'call.started'
  | 'call.completed'
  | 'call.failed'
  | 'campaign.started'
  | 'campaign.completed'
  | 'campaign.paused'
  | 'contact.created'
  | 'contact.updated';

export interface WebhookPayload {
  id: string;
  event: WebhookEvent;
  timestamp: string;
  data: any;
  webhookId: string;
}

// File Upload Types
export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

// System Health Types
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  services: {
    database: ServiceStatus;
    aiEngine: ServiceStatus;
    voiceService: ServiceStatus;
    webhooks: ServiceStatus;
    storage: ServiceStatus;
  };
  lastCheckedAt: string;
}

export interface ServiceStatus {
  status: 'online' | 'degraded' | 'offline';
  responseTime?: number; // milliseconds
  lastCheckedAt: string;
  message?: string;
}

// Request/Response wrapper types for common operations
export interface ListRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface BulkOperationRequest {
  ids: string[];
  operation: string;
  data?: Record<string, any>;
}

export interface BulkOperationResponse {
  successCount: number;
  failureCount: number;
  errors?: Array<{
    id: string;
    error: string;
  }>;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: any;
}