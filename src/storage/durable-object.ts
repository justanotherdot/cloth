import { Flag } from '../core/flag';
import { FlagStorage } from '../core/flag-service';
import type { DurableObjectState, DurableObjectStorage } from '@cloudflare/workers-types';

// Durable Object implementation of FlagStorage interface
export class DurableFlagStorage implements FlagStorage {
  constructor(private storage: DurableObjectStorage) {}

  async list(): Promise<Flag[]> {
    const flags = await this.storage.list<Flag>({ prefix: 'flag:' });
    return Array.from(flags.values());
  }

  async get(id: string): Promise<Flag | null> {
    return (await this.storage.get<Flag>(`flag:${id}`)) || null;
  }

  async put(id: string, flag: Flag): Promise<void> {
    await this.storage.put(`flag:${id}`, flag);
  }

  async delete(id: string): Promise<void> {
    await this.storage.delete(`flag:${id}`);
  }
}

// Durable Object class that exposes internal storage API  
export class StorageObject {
  private flagStorage: DurableFlagStorage;

  constructor(state: DurableObjectState) {
    this.flagStorage = new DurableFlagStorage(state.storage);
  }

  // Internal API for the service layer  
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    
    try {
      if (method === 'GET' && url.pathname === '/list') {
        const flags = await this.flagStorage.list();
        return new Response(JSON.stringify(flags), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (method === 'GET' && url.pathname.startsWith('/get/')) {
        const id = url.pathname.split('/')[2];
        const flag = await this.flagStorage.get(id);
        if (!flag) {
          return new Response('Not found', { status: 404 });
        }
        return new Response(JSON.stringify(flag), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (method === 'PUT' && url.pathname.startsWith('/put/')) {
        const id = url.pathname.split('/')[2];
        const flag = await request.json() as Flag;
        await this.flagStorage.put(id, flag);
        return new Response('OK');
      }
      
      if (method === 'DELETE' && url.pathname.startsWith('/delete/')) {
        const id = url.pathname.split('/')[2];
        await this.flagStorage.delete(id);
        return new Response('OK');
      }
      
      return new Response('Not found', { status: 404 });
    } catch (error) {
      console.error('Storage error:', error);
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
}