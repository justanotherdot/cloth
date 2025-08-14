import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import HomePage from './HomePage';

// Mock fetch globally
globalThis.fetch = vi.fn();

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for successful flag loading
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          success: true,
          data: [],
        }),
    });
  });

  it('should render the page title', async () => {
    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Feature flags')).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    render(<HomePage />);

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
      text: async () =>
        JSON.stringify({
          success: true,
          data: mockFlags,
        }),
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Test Flag')).toBeInTheDocument();
      expect(screen.getByText('test_flag')).toBeInTheDocument();
      expect(screen.getByText('A test flag')).toBeInTheDocument();
    });
  });

  it('should show empty state when no flags exist', async () => {
    render(<HomePage />);

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
      text: async () => '',
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(
        screen.getByText(/API error: 500 Internal Server Error/)
      ).toBeInTheDocument();
    });
  });

  it('should show new flag button', async () => {
    render(<HomePage />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /new flag/i })
      ).toBeInTheDocument();
    });
  });
});
