export interface Env {
  STORAGE: DurableObjectNamespace;
  CF_ACCESS_AUD: string;
  CF_ACCESS_TEAM_DOMAIN: string;
}

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
