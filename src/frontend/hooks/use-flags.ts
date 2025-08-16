import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flagClient } from '../client/flag-client';
import { FlagCreateRequest, FlagUpdateRequest } from '../../service/api';
import { Flag } from '../../core/flag';

// Query keys for cache management
export const flagKeys = {
  all: ['flags'] as const,
  lists: () => [...flagKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown> = {}) => [...flagKeys.lists(), filters] as const,
};

/**
 * Hook to fetch all flags
 */
export function useFlags() {
  return useQuery({
    queryKey: flagKeys.list(),
    queryFn: async () => {
      const response = await flagClient.list();
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error.message);
      }
    },
  });
}

/**
 * Hook to create a new flag
 */
export function useCreateFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FlagCreateRequest): Promise<Flag> => {
      const response = await flagClient.create(data);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error.message);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch flags list
      queryClient.invalidateQueries({ queryKey: flagKeys.lists() });
    },
  });
}

/**
 * Hook to update an existing flag
 */
export function useUpdateFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Omit<FlagUpdateRequest, 'id'> }): Promise<Flag> => {
      const response = await flagClient.update(id, updates);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error.message);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch flags list
      queryClient.invalidateQueries({ queryKey: flagKeys.lists() });
    },
  });
}

/**
 * Hook to delete a flag
 */
export function useDeleteFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await flagClient.delete(id);
      if (!response.success) {
        throw new Error(response.error.message);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch flags list
      queryClient.invalidateQueries({ queryKey: flagKeys.lists() });
    },
  });
}