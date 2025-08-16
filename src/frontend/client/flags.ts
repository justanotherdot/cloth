import {
  FlagListResponse,
  FlagCreateRequest,
  FlagCreateResponse,
  FlagUpdateRequest,
  FlagUpdateResponse,
  FlagDeleteResponse,
} from '../../service/api';
import { Flag } from '../../core/flag';

/**
 * Universal client layer
 * 
 * Design decisions:
 * - Configurable for different environments (browser, CLI, server)
 * - Framework agnostic (no React dependencies) 
 * - Returns domain types directly for clean interfaces
 * - Uses shared API contracts from src/service/api.ts
 * 
 * For templates:
 * Copy this pattern for other resources:
 * - src/frontend/client/Users.ts
 * - src/frontend/client/Orders.ts
 * - etc.
 * 
 * Benefits:
 * - Works across browser, CLI tools, server environments
 * - Testable without any framework
 * - Single source of truth for API interactions
 * - Clear separation of concerns (API vs state vs UI)
 * 
 * Note: This client could become an external package if multi-client 
 * scenarios emerge, but currently optimized for single-deployment use.
 */
export class Flags {
  constructor(
    private baseUrl: string = '',
    private apiKey?: string
  ) {}

  private async request<T>(path: string, options: { method?: string; body?: string; headers?: Record<string, string> } = {}): Promise<T> {
    const url = this.baseUrl ? `${this.baseUrl}${path}` : path;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
  /**
   * List all flags
   */
  async list(): Promise<Flag[]> {
    const response = await this.request<FlagListResponse>('/api/flag');
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error.message);
    }
  }

  /**
   * Create a new flag
   */
  async create(data: FlagCreateRequest): Promise<Flag> {
    const response = await this.request<FlagCreateResponse>('/api/flag', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error.message);
    }
  }

  /**
   * Update an existing flag
   */
  async update(id: string, data: Omit<FlagUpdateRequest, 'id'>): Promise<Flag> {
    const response = await this.request<FlagUpdateResponse>(`/api/flag/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error.message);
    }
  }

  /**
   * Delete a flag
   */
  async delete(id: string): Promise<void> {
    const response = await this.request<FlagDeleteResponse>(`/api/flag/${id}`, {
      method: 'DELETE',
    });
    if (!response.success) {
      throw new Error(response.error.message);
    }
  }
}

// Browser-specific instance for frontend use
export const flags = new Flags();