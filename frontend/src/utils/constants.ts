// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Application Info
export const APP_INFO = {
  NAME: import.meta.env.VITE_APP_NAME || 'AI Calling Agent',
  VERSION: window.__APP_VERSION__ || '1.0.0',
  BUILD_TIME: window.__BUILD_TIME__ || new Date().toISOString(),
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// Call Status Configuration
export const CALL_STATUS = {
  QUEUED: 'queued',
  INITIATING: 'initiating',
  RINGING: 'ringing',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  NO_ANSWER: 'no_answer',
  BUSY: 'busy',
  CANCELED: 'canceled',
} as const;

export const CALL_STATUS_COLORS = {
  [CALL_STATUS.QUEUED]: 'bg-gray-100 text-gray-800',
  [CALL_STATUS.INITIATING]: 'bg-blue-100 text-blue-800',
  [CALL_STATUS.RINGING]: 'bg-yellow-100 text-yellow-800',
  [CALL_STATUS.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [CALL_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
  [CALL_STATUS.FAILED]: 'bg-red-100 text-red-800',
  [CALL_STATUS.NO_ANSWER]: 'bg-orange-100 text-orange-800',
  [CALL_STATUS.BUSY]: 'bg-purple-100 text-purple-800',
  [CALL_STATUS.CANCELED]: 'bg-gray-100 text-gray-800',
} as const;

export const CALL_STATUS_LABELS = {
  [CALL_STATUS.QUEUED]: 'Queued',
  [CALL_STATUS.INITIATING]: 'Initiating',
  [CALL_STATUS.RINGING]: 'Ringing',
  [CALL_STATUS.IN_PROGRESS]: 'In Progress',
  [CALL_STATUS.COMPLETED]: 'Completed',
  [CALL_STATUS.FAILED]: 'Failed',
  [CALL_STATUS.NO_ANSWER]: 'No Answer',
  [CALL_STATUS.BUSY]: 'Busy',
  [CALL_STATUS.CANCELED]: 'Canceled',
} as const;

// Campaign Status
export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const CAMPAIGN_STATUS_COLORS = {
  [CAMPAIGN_STATUS.DRAFT]: 'bg-gray-100 text-gray-800',
  [CAMPAIGN_STATUS.SCHEDULED]: 'bg-blue-100 text-blue-800',
  [CAMPAIGN_STATUS.RUNNING]: 'bg-green-100 text-green-800',
  [CAMPAIGN_STATUS.PAUSED]: 'bg-yellow-100 text-yellow-800',
  [CAMPAIGN_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
  [CAMPAIGN_STATUS.FAILED]: 'bg-red-100 text-red-800',
} as const;

// Sentiment Colors
export const SENTIMENT_COLORS = {
  POSITIVE: 'text-green-600',
  NEUTRAL: 'text-gray-600',
  NEGATIVE: 'text-red-600',
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  INPUT_WITH_TIME: 'yyyy-MM-dd HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  TIME_ONLY: 'HH:mm',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'ai-calling-agent-theme',
  AUTH_TOKEN: 'ai-calling-agent-token',
  USER: 'ai-calling-agent-user',
  FILTERS: 'ai-calling-agent-filters',
  TABLE_SETTINGS: 'ai-calling-agent-table-settings',
  DASHBOARD_LAYOUT: 'ai-calling-agent-dashboard-layout',
} as const;

// WebSocket Event Types
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  CALL_STATUS_UPDATE: 'call_status_update',
  SESSION_UPDATE: 'session_update',
  CAMPAIGN_UPDATE: 'campaign_update',
  DASHBOARD_UPDATE: 'dashboard_update',
} as const;

// Form Validation
export const VALIDATION = {
  PHONE_REGEX: /^\+[1-9]\d{1,14}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_PASSWORD_LENGTH: 8,
  MAX_TEXT_LENGTH: 1000,
  MAX_SCRIPT_LENGTH: 5000,
} as const;

// File Upload
export const UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    CSV: ['text/csv', 'application/csv'],
    AUDIO: ['audio/wav', 'audio/mp3', 'audio/ogg'],
    IMAGE: ['image/jpeg', 'image/png', 'image/gif'],
  },
} as const;

// Chart Configuration
export const CHART_COLORS = {
  PRIMARY: '#1e40af',
  SECONDARY: '#10b981',
  ACCENT: '#f59e0b',
  SUCCESS: '#22c55e',
  WARNING: '#eab308',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
} as const;

export const CHART_DEFAULTS = {
  ANIMATION_DURATION: 300,
  POINT_RADIUS: 3,
  POINT_HOVER_RADIUS: 5,
  BORDER_WIDTH: 2,
} as const;

// Navigation Routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  CALLS: '/calls',
  CAMPAIGNS: '/campaigns',
  CONTACTS: '/contacts',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  LOGIN: '/login',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION: 'Please check your input and try again.',
  PHONE_INVALID: 'Please enter a valid phone number (e.g., +1234567890).',
  EMAIL_INVALID: 'Please enter a valid email address.',
  REQUIRED_FIELD: 'This field is required.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Successfully created.',
  UPDATED: 'Successfully updated.',
  DELETED: 'Successfully deleted.',
  SAVED: 'Changes saved successfully.',
  IMPORTED: 'Data imported successfully.',
  EXPORTED: 'Data exported successfully.',
} as const;

// Notification Settings
export const NOTIFICATION_SETTINGS = {
  DEFAULT_DURATION: 4000,
  SUCCESS_DURATION: 3000,
  ERROR_DURATION: 6000,
  WARNING_DURATION: 5000,
} as const;

// Animation Durations (in milliseconds)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Dashboard Refresh Intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  DASHBOARD: 30000, // 30 seconds
  CALLS: 10000, // 10 seconds
  CAMPAIGNS: 60000, // 1 minute
  ANALYTICS: 300000, // 5 minutes
} as const;

// Voice Options for TTS
export const VOICE_OPTIONS = [
  { value: 'alloy', label: 'Alloy (Neutral, balanced)' },
  { value: 'echo', label: 'Echo (Male, professional)' },
  { value: 'fable', label: 'Fable (British accent)' },
  { value: 'onyx', label: 'Onyx (Deep male, authoritative)' },
  { value: 'nova', label: 'Nova (Young female, energetic)' },
  { value: 'shimmer', label: 'Shimmer (Soft female, gentle)' },
] as const;

// Language Options
export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
] as const;

// Time Zone Options (common ones)
export const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'America/Chicago', label: 'Central Time (US)' },
  { value: 'America/Denver', label: 'Mountain Time (US)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
] as const;

// Feature Flags (for controlling feature rollouts)
export const FEATURES = {
  ANALYTICS_EXPORT: true,
  BULK_OPERATIONS: true,
  CAMPAIGN_TEMPLATES: true,
  VOICE_CLONING: false,
  ADVANCED_FILTERS: true,
  REAL_TIME_TRANSCRIPTION: true,
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  API_CALLS_PER_MINUTE: 100,
  CALLS_PER_HOUR: 1000,
  FILE_UPLOADS_PER_HOUR: 10,
} as const;