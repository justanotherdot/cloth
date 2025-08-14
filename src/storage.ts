import { Flag } from './data';

export class StorageObject implements DurableObject {
  private storage: DurableObjectStorage;

  constructor(state: DurableObjectState) {
    this.storage = state.storage;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    console.log('StorageObject fetch:', method, url.pathname);

    try {
      if (method === 'GET' && url.pathname === '/flag') {
        const flags = await this.getAllFlags();
        return new Response(JSON.stringify(flags), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (method === 'POST' && url.pathname === '/flag') {
        const body = (await request.json()) as {
          key: string;
          name: string;
          description?: string;
          enabled?: boolean;
        };
        const flag = await this.createFlag(
          body.key,
          body.name,
          body.description,
          body.enabled
        );
        return new Response(JSON.stringify(flag), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (method === 'GET' && url.pathname.startsWith('/flag/')) {
        const id = url.pathname.split('/')[2];
        const flag = await this.getFlag(id);
        if (!flag) {
          return new Response('Flag not found', { status: 404 });
        }
        return new Response(JSON.stringify(flag), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (method === 'PUT' && url.pathname.startsWith('/flag/')) {
        const id = url.pathname.split('/')[2];
        const body = (await request.json()) as {
          key?: string;
          name?: string;
          description?: string;
          enabled?: boolean;
        };
        const flag = await this.updateFlag(id, body);
        if (!flag) {
          return new Response('Flag not found', { status: 404 });
        }
        return new Response(JSON.stringify(flag), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (method === 'DELETE' && url.pathname.startsWith('/flag/')) {
        const id = url.pathname.split('/')[2];
        const deleted = await this.deleteFlag(id);
        if (!deleted) {
          return new Response('Flag not found', { status: 404 });
        }
        return new Response(null, { status: 204 });
      }

      return new Response('Method not allowed', { status: 405 });
    } catch (error) {
      console.error('StorageObject error:', error);
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  private async getAllFlags(): Promise<Flag[]> {
    const flags = await this.storage.list<Flag>({ prefix: 'flag:' });
    return Array.from(flags.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  private async getFlag(id: string): Promise<Flag | null> {
    return (await this.storage.get<Flag>(`flag:${id}`)) || null;
  }

  private async getFlagByKey(key: string): Promise<Flag | null> {
    const flags = await this.getAllFlags();
    return flags.find((f) => f.key === key) || null;
  }

  private async createFlag(
    key: string,
    name: string,
    description?: string,
    enabled: boolean = false
  ): Promise<Flag> {
    const existing = await this.getFlagByKey(key);
    if (existing) {
      throw new Error(`Flag with key "${key}" already exists`);
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const flag: Flag = {
      id,
      key,
      name,
      description,
      enabled,
      createdAt: now,
      updatedAt: now,
    };

    await this.storage.put(`flag:${id}`, flag);
    return flag;
  }

  private async updateFlag(
    id: string,
    updates: {
      key?: string;
      name?: string;
      description?: string;
      enabled?: boolean;
    }
  ): Promise<Flag | null> {
    const existing = await this.getFlag(id);
    if (!existing) return null;

    if (updates.key && updates.key !== existing.key) {
      const keyExists = await this.getFlagByKey(updates.key);
      if (keyExists && keyExists.id !== id) {
        throw new Error(`Flag with key "${updates.key}" already exists`);
      }
    }

    const updated: Flag = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.storage.put(`flag:${id}`, updated);
    return updated;
  }

  private async deleteFlag(id: string): Promise<boolean> {
    const existing = await this.getFlag(id);
    if (!existing) return false;

    await this.storage.delete(`flag:${id}`);
    return true;
  }
}
