import type { DurableObjectNamespace } from '@cloudflare/workers-types';

export interface Env {
  STORAGE: DurableObjectNamespace;
  CF_ACCESS_AUD: string;
  CF_ACCESS_TEAM_DOMAIN: string;
}