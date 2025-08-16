import { Context } from 'hono';
import { Env } from '../types';
import { HealthGetResponse } from '../api';

export async function health(c: Context<{ Bindings: Env }>): Promise<Response> {
  const response: HealthGetResponse = {
    success: true,
    data: {
      service: 'cloth',
      version: '0.0.0',
      timestamp: new Date().toISOString(),
    },
  };
  return c.json(response);
}