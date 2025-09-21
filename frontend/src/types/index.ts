// Export all API types
export * from './api';

// Common utility types
export interface PaginationParams {
  skip?: number;
  limit?: number;
  page?: number;
}

export interface SearchParams {
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface DateRangeFilter {
  start_date?: string;
  end_date?: string;
}

export interface FilterParams extends PaginationParams, SearchParams, DateRangeFilter {}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface AsyncState<T> extends LoadingState {
  data?: T;
  lastUpdated?: Date;
}

// Form types
export interface FormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  current?: boolean;
  children?: NavItem[];
}

export interface Breadcrumb {
  name: string;
  href?: string;
  current?: boolean;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';
export type ColorScheme = 'light' | 'dark';

// Notification types
export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
  read?: boolean;
}

// Modal types
export interface ModalState {
  isOpen: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  onClose?: () => void;
}

// Table types
export interface TableColumn<T = any> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

export interface TableState {
  sortColumn?: string;
  sortDirection: 'asc' | 'desc';
  selectedRows: string[];
  currentPage: number;
  pageSize: number;
}

// Chart data types
export interface ChartDataPoint {
  x: string | number | Date;
  y: number;
  label?: string;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
}

// WebSocket types
export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: string;
  id?: string;
}

export interface WebSocketState {
  connected: boolean;
  reconnectAttempts: number;
  lastMessage?: WebSocketMessage;
  error?: string;
}

// File upload types
export interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

// Auth types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user';
  permissions?: string[];
}

export interface AuthState {
  user?: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  token?: string;
}

// API Response wrapper types
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  details?: Record<string, any>;
}

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiFailure {
  success: false;
  error: ApiError;
  message: string;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiFailure;

// Utility type helpers
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Component props helpers
export type ComponentWithChildren<P = {}> = P & {
  children: React.ReactNode;
};

export type ComponentWithClassName<P = {}> = P & {
  className?: string;
};

// Event handler types
export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;
export type ChangeHandler<T = any> = (value: T) => void;
export type FormSubmitHandler<T = any> = (data: T) => void | Promise<void>;

// Environment types
export interface Environment {
  API_URL: string;
  WS_URL?: string;
  APP_NAME: string;
  APP_VERSION: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

declare global {
  interface Window {
    __APP_VERSION__: string;
    __BUILD_TIME__: string;
  }
}