export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Flag {
  id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}
