import {
  FlagListResponse,
  FlagCreateRequest,
  FlagCreateResponse,
  FlagUpdateRequest,
  FlagUpdateResponse,
  FlagDeleteResponse,
} from '../../service/api';

/**
 * Pure API Client Layer
 * 
 * ARCHITECTURAL PATTERN:
 * This client layer separates API calls from React state management:
 * - Pure functions (no React hooks, no state)
 * - Framework agnostic (can be used outside React)
 * - Returns typed promises for TanStack Query
 * - Uses shared API contracts from src/service/api.ts
 * 
 * FOR TEMPLATES:
 * Copy this pattern for other resources:
 * - src/frontend/client/user-client.ts
 * - src/frontend/client/order-client.ts
 * - etc.
 * 
 * BENEFITS:
 * - Testable without React
 * - Reusable across different state management solutions
 * - Clear separation of concerns (API vs state vs UI)
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