import { Hono } from 'hono';
import { Env } from '../types';
import { health } from './health';
import { listFlags, createFlag, getFlag, updateFlag, deleteFlag } from './flag';

export function createRoutes(): Hono<{ Bindings: Env }> {
  const app = new Hono<{ Bindings: Env }>();

  // Health endpoint
  app.get('/api/health', health);

  // Flag endpoints
  app.get('/api/flag', listFlags);
  app.post('/api/flag', createFlag);
  app.get('/api/flag/:id', getFlag);
  app.put('/api/flag/:id', updateFlag);
  app.delete('/api/flag/:id', deleteFlag);

  return app;
}

// Re-export individual handlers for testing
export { health, listFlags, createFlag, getFlag, updateFlag, deleteFlag };