import { Flag } from './flag';
import { FlagNotFoundError, FlagKeyExistsError, ValidationError, StorageError } from './error';

// Storage interface that core depends on
export interface FlagStorage {
  list(): Promise<Flag[]>;
  get(id: string): Promise<Flag | null>;
  put(id: string, flag: Flag): Promise<void>;
  delete(id: string): Promise<void>;
}

export class FlagService {
  constructor(private storage: FlagStorage) {}

  async getAllFlags(): Promise<Flag[]> {
    try {
      const flags = await this.storage.list();
      return flags.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      throw new StorageError('list flags', error instanceof Error ? error : undefined);
    }
  }

  async getFlag(id: string): Promise<Flag> {
    try {
      const flag = await this.storage.get(id);
      if (!flag) {
        throw new FlagNotFoundError(id);
      }
      return flag;
    } catch (error) {
      if (error instanceof FlagNotFoundError) {
        throw error;
      }
      throw new StorageError(`get flag ${id}`, error instanceof Error ? error : undefined);
    }
  }

  async getFlagByKey(key: string): Promise<Flag | null> {
    const flags = await this.getAllFlags();
    return flags.find((f) => f.key === key) || null;
  }

  async createFlag(
    key: string,
    name: string,
    description?: string,
    enabled: boolean = false
  ): Promise<Flag> {
    // Validation
    if (!key?.trim()) {
      throw new ValidationError('key', 'Key is required and cannot be empty');
    }
    if (!name?.trim()) {
      throw new ValidationError('name', 'Name is required and cannot be empty');
    }

    const existing = await this.getFlagByKey(key);
    if (existing) {
      throw new FlagKeyExistsError(key, existing.id);
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const flag: Flag = {
      id,
      key: key.trim(),
      name: name.trim(),
      description: description?.trim(),
      enabled,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await this.storage.put(id, flag);
      return flag;
    } catch (error) {
      throw new StorageError(`create flag ${key}`, error instanceof Error ? error : undefined);
    }
  }

  async updateFlag(
    id: string,
    updates: {
      key?: string;
      name?: string;
      description?: string;
      enabled?: boolean;
    }
  ): Promise<Flag> {
    const existing = await this.getFlag(id); // This will throw if not found

    // Validation
    if (updates.key !== undefined && !updates.key?.trim()) {
      throw new ValidationError('key', 'Key cannot be empty');
    }
    if (updates.name !== undefined && !updates.name?.trim()) {
      throw new ValidationError('name', 'Name cannot be empty');
    }

    if (updates.key && updates.key !== existing.key) {
      const keyExists = await this.getFlagByKey(updates.key);
      if (keyExists && keyExists.id !== id) {
        throw new FlagKeyExistsError(updates.key, keyExists.id);
      }
    }

    const updated: Flag = {
      ...existing,
      ...updates,
      key: updates.key?.trim() ?? existing.key,
      name: updates.name?.trim() ?? existing.name,
      description: updates.description?.trim() ?? existing.description,
      updatedAt: new Date().toISOString(),
    };

    try {
      await this.storage.put(id, updated);
      return updated;
    } catch (error) {
      throw new StorageError(`update flag ${id}`, error instanceof Error ? error : undefined);
    }
  }

  async deleteFlag(id: string): Promise<void> {
    await this.getFlag(id); // This will throw if not found

    try {
      await this.storage.delete(id);
    } catch (error) {
      throw new StorageError(`delete flag ${id}`, error instanceof Error ? error : undefined);
    }
  }
}