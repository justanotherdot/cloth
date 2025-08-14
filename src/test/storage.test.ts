import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageObject } from '../storage';

// Mock DurableObjectStorage
const mockStorageMap = new Map();

const mockDurableObjectStorage = {
  list: vi.fn(async ({ prefix }: { prefix: string }) => {
    const filtered = new Map();
    for (const [key, value] of mockStorageMap.entries()) {
      if (key.startsWith(prefix)) {
        filtered.set(key, value);
      }
    }
    return filtered;
  }),
  get: vi.fn(async (key: string) => mockStorageMap.get(key)),
  put: vi.fn(async (key: string, value: any) => mockStorageMap.set(key, value)),
  delete: vi.fn(async (key: string) => mockStorageMap.delete(key)),
};

const mockDurableObjectState = {
  storage: mockDurableObjectStorage,
};

describe('StorageObject', () => {
  let storage: StorageObject;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStorageMap.clear();
    storage = new StorageObject(mockDurableObjectState as any);
  });

  describe('Flag operations', () => {
    it('should create a new flag', async () => {
      const request = new Request('https://test.com/flag', {
        method: 'POST',
        body: JSON.stringify({
          key: 'test_flag',
          name: 'Test Flag',
          description: 'A test flag',
        }),
      });

      const response = await storage.fetch(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.key).toBe('test_flag');
      expect(data.name).toBe('Test Flag');
      expect(data.enabled).toBe(false);
      expect(data.id).toBeTruthy();
      expect(mockDurableObjectStorage.put).toHaveBeenCalled();
    });

    it('should prevent duplicate flag keys', async () => {
      // First, create a flag
      await storage.fetch(
        new Request('https://test.com/flag', {
          method: 'POST',
          body: JSON.stringify({
            key: 'duplicate_key',
            name: 'First Flag',
          }),
        })
      );

      // Try to create another with same key
      const request = new Request('https://test.com/flag', {
        method: 'POST',
        body: JSON.stringify({
          key: 'duplicate_key',
          name: 'Second Flag',
        }),
      });

      const response = await storage.fetch(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('already exists');
    });

    it('should list all flags', async () => {
      // Create some test flags
      const flag1 = {
        id: '1',
        key: 'flag1',
        name: 'Flag 1',
        enabled: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      const flag2 = {
        id: '2',
        key: 'flag2',
        name: 'Flag 2',
        enabled: true,
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      };

      mockStorageMap.set('flag:1', flag1);
      mockStorageMap.set('flag:2', flag2);

      const request = new Request('https://test.com/flag');

      const response = await storage.fetch(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(2);
    });

    it('should update a flag', async () => {
      // Create a flag first
      const flag = {
        id: 'test-id',
        key: 'test',
        name: 'Test',
        enabled: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      mockStorageMap.set('flag:test-id', flag);

      const request = new Request('https://test.com/flag/test-id', {
        method: 'PUT',
        body: JSON.stringify({ enabled: true }),
      });

      const response = await storage.fetch(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.enabled).toBe(true);
      expect(data.updatedAt).not.toBe(flag.updatedAt);
    });

    it('should delete a flag', async () => {
      // Create a flag first
      const flag = {
        id: 'test-id',
        key: 'test',
        name: 'Test',
        enabled: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      mockStorageMap.set('flag:test-id', flag);

      const request = new Request('https://test.com/flag/test-id', {
        method: 'DELETE',
      });

      const response = await storage.fetch(request);

      expect(response.status).toBe(204);
      expect(mockDurableObjectStorage.delete).toHaveBeenCalledWith(
        'flag:test-id'
      );
    });

    it('should return 404 for non-existent flag operations', async () => {
      const request = new Request('https://test.com/flag/non-existent', {
        method: 'PUT',
        body: JSON.stringify({ enabled: true }),
      });

      const response = await storage.fetch(request);

      expect(response.status).toBe(404);
    });
  });
});
