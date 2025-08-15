export type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

export interface Flag {
  id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}
