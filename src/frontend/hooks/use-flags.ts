import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flags } from '../client/flags';
import { FlagCreateRequest, FlagUpdateRequest } from '../../service/api';

/**
 * TanStack Query Hooks
 * 
 * ARCHITECTURAL DECISION:
 * We chose TanStack Query over manual useState because:
 * - Separates data fetching from state management 
 * - Provides caching, background updates, error handling
 * - Declarative approach vs imperative useState/useEffect
 * - Template-friendly pattern across projects
 * 
 * ALTERNATIVE CONSIDERED:
 * - tRPC: More DX but more complex setup, less template-friendly
 * - Manual useState: What we had before, mixed concerns
 * 
 * FOR TEMPLATES:
 * Copy this pattern for other resources:
 * - src/frontend/hooks/use-users.ts  
 * - src/frontend/hooks/use-orders.ts
 * - etc.
 * 
 * CACHE INVALIDATION:
 * Mutations automatically invalidate queries to keep UI in sync.
 * See onSuccess callbacks in mutation hooks below.
 */

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
    queryFn: () => flags.list(),
  });
}

/**
 * Hook to create a new flag
 */
export function useCreateFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FlagCreateRequest) => flags.create(data),
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
    mutationFn: ({ id, updates }: { id: string; updates: Omit<FlagUpdateRequest, 'id'> }) => 
      flags.update(id, updates),
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
    mutationFn: (id: string) => flags.delete(id),
    onSuccess: () => {
      // Invalidate and refetch flags list
      queryClient.invalidateQueries({ queryKey: flagKeys.lists() });
    },
  });
}