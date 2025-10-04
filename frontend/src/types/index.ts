export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Call {
  id: string;
  phoneNumber: string;
  status: "active" | "completed" | "failed";
  duration: number;
  createdAt: string;
  transcript?: string;
}

export interface Agent {
  id: string;
  name: string;
  voice: string;
  personality: string;
  isActive: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  status: string;
  totalCalls: number;
  completedCalls: number;
}
