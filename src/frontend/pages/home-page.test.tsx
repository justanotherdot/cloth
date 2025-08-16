import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from './home-page';

// Mock fetch globally
globalThis.fetch = vi.fn();

// Test wrapper with QueryClient
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for tests
        gcTime: 0, // Disable caching for tests
      },
    },
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for successful flag loading
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
      }),
    });
  });

  it('should render the page title', async () => {
    render(<HomePage />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('Feature flags')).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    render(<HomePage />, { wrapper: TestWrapper });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display flags after loading', async () => {
    const mockFlags = [
      {
        id: '1',
        key: 'test_flag',
        name: 'Test Flag',
        description: 'A test flag',
        enabled: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ];

    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: mockFlags,
      }),
    });

    render(<HomePage />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('Test Flag')).toBeInTheDocument();
      expect(screen.getByText('test_flag')).toBeInTheDocument();
      expect(screen.getByText('A test flag')).toBeInTheDocument();
    });
  });

  it('should show empty state when no flags exist', async () => {
    render(<HomePage />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('No feature flags yet')).toBeInTheDocument();
      expect(
        screen.getByText('Create your first flag to get started')
      ).toBeInTheDocument();
    });
  });

  it('should handle API errors', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({}),
    });

    render(<HomePage />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(
        screen.getByText(/Request failed: 500 Internal Server Error/)
      ).toBeInTheDocument();
    });
  });

  it('should show new flag button', async () => {
    render(<HomePage />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /new flag/i })
      ).toBeInTheDocument();
    });
  });
});
