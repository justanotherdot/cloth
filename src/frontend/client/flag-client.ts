import {
  FlagListResponse,
  FlagCreateRequest,
  FlagCreateResponse,
  FlagUpdateRequest,
  FlagUpdateResponse,
  FlagDeleteResponse,
} from '../../service/api';

/**
 * Pure API client for flag operations.
 * No React dependencies, no state management.
 * Returns typed promises that can be used with TanStack Query.
 */
export const flagClient = {
  /**
   * List all flags
   */
  list: async (): Promise<FlagListResponse> => {
    const response = await fetch('/api/flag');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch flags: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * Create a new flag
   */
  create: async (data: FlagCreateRequest): Promise<FlagCreateResponse> => {
    const response = await fetch('/api/flag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create flag: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Update an existing flag
   */
  update: async (id: string, data: Omit<FlagUpdateRequest, 'id'>): Promise<FlagUpdateResponse> => {
    const response = await fetch(`/api/flag/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update flag: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Delete a flag
   */
  delete: async (id: string): Promise<FlagDeleteResponse> => {
    const response = await fetch(`/api/flag/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete flag: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },
};