import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageObject } from '../storage/durable-object';

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
    it('should store a flag via PUT endpoint', async () => {
      const testFlag = {
        id: 'test-id',
        key: 'test_flag',
        name: 'Test Flag',
        description: 'A test flag',
        enabled: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const request = new Request('http://internal/put/test-id', {
        method: 'PUT',
        body: JSON.stringify(testFlag),
      });

      const response = await storage.fetch(request);

      expect(response.status).toBe(200);
      expect(mockDurableObjectStorage.put).toHaveBeenCalledWith('flag:test-id', testFlag);
    });

    it('should get a flag via GET endpoint', async () => {
      const testFlag = {
        id: 'test-id',
        key: 'test_flag',
        name: 'Test Flag',
        description: 'A test flag',
        enabled: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      mockStorageMap.set('flag:test-id', testFlag);

      const request = new Request('http://internal/get/test-id');
      const response = await storage.fetch(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('test-id');
      expect(data.key).toBe('test_flag');
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

      const request = new Request('http://internal/list');

      const response = await storage.fetch(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(2);
    });

    it('should delete a flag via DELETE endpoint', async () => {
      const request = new Request('http://internal/delete/test-id', {
        method: 'DELETE',
      });

      const response = await storage.fetch(request);

      expect(response.status).toBe(200);
      expect(mockDurableObjectStorage.delete).toHaveBeenCalledWith('flag:test-id');
    });

    it('should return 404 for non-existent flag', async () => {
      const request = new Request('http://internal/get/non-existent');

      const response = await storage.fetch(request);

      expect(response.status).toBe(404);
    });

    it('should return 404 for unknown endpoints', async () => {
      const request = new Request('http://internal/unknown');

      const response = await storage.fetch(request);

      expect(response.status).toBe(404);
    });
  });
});
