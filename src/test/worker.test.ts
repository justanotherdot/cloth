import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the storage class
const mockStorage = {
  fetch: vi.fn(),
};

const mockEnv = {
  STORAGE: {
    idFromName: vi.fn(() => 'test-id'),
    get: vi.fn(() => mockStorage),
  },
};

// Import worker after mocking
const worker = await import('../worker');

describe('Worker API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Health endpoint', () => {
    it('should return healthy status', async () => {
      const request = new Request('https://test.com/api/health');

      const response = await worker.default.fetch(request, mockEnv as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.service).toBe('cloth');
      expect(data.data.version).toBe('0.0.0');
      expect(data.data.timestamp).toBeTruthy();
    });
  });

  describe('Flag API', () => {
    it('should proxy flag requests to storage', async () => {
      mockStorage.fetch.mockResolvedValue(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const request = new Request('https://test.com/api/flag');

      const response = await worker.default.fetch(request, mockEnv as any);
      const data = await response.json();

      expect(mockStorage.fetch).toHaveBeenCalledWith(expect.stringContaining('/list'));
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle storage errors', async () => {
      mockStorage.fetch.mockResolvedValue(
        new Response(JSON.stringify({ error: 'Storage failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const request = new Request('https://test.com/api/flag');

      const response = await worker.default.fetch(request, mockEnv as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeTruthy();
    });
  });

  describe('App routes', () => {
    it('should serve index for root path', async () => {
      // Mock fetch for assets
      global.fetch = vi.fn().mockResolvedValue(
        new Response('<html></html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        })
      );

      const request = new Request('https://test.com/');

      const response = await worker.default.fetch(request, mockEnv as any);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/html');
    });

    it('should return 404 for unknown routes', async () => {
      const request = new Request('https://test.com/unknown');

      const response = await worker.default.fetch(request, mockEnv as any);

      expect(response.status).toBe(404);
    });
  });
});
