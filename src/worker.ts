import { Hono, Context } from 'hono';
import { Env, ApiResponse } from './data';
import { StorageObject } from './storage';

export { StorageObject };

const app = new Hono<{ Bindings: Env }>();

// Handler functions
async function health(c: Context<{ Bindings: Env }>) {
  const response: ApiResponse<{ service: string; version: string; timestamp: string }> = {
    success: true,
    data: {
      service: 'cloth',
      version: '0.0.0',
      timestamp: new Date().toISOString(),
    },
  };
  return c.json(response);
}

async function flag(c: Context<{ Bindings: Env }>) {
  try {
    console.log('Flag API request:', c.req.method, c.req.path);

    if (!c.env.STORAGE) {
      console.error('STORAGE binding not available');
      return c.json({ success: false, error: 'Storage not configured' }, 500);
    }

    const storageId = c.env.STORAGE.idFromName('default');
    const storage = c.env.STORAGE.get(storageId);

    // Rewrite path for storage object (/api/flag/... -> /flag/...)
    const url = new URL(c.req.url);
    url.pathname = url.pathname.replace('/api/flag', '/flag');

    console.log('Storage request:', c.req.method, url.pathname);

    const storageRequest = new Request(url.toString(), {
      method: c.req.method,
      headers: c.req.raw.headers,
      body: c.req.raw.body,
    });

    const storageResponse = await storage.fetch(storageRequest);
    console.log('Storage response status:', storageResponse.status);

    let data = null;
    const contentType = storageResponse.headers.get('content-type');
    console.log('Storage response content-type:', contentType);

    // Only try to parse JSON if there's a content-type and it's JSON
    if (contentType && contentType.includes('application/json')) {
      const text = await storageResponse.text();
      console.log('Storage response text:', text.substring(0, 200));
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (error) {
          console.error('JSON parse error:', error, 'Response text:', text);
          data = { error: 'Invalid JSON response from storage' };
        }
      }
    } else if (storageResponse.status === 204) {
      // 204 No Content - successful operation with no response body
      data = null;
    }

    const response: ApiResponse<typeof data> = storageResponse.ok
      ? { success: true, data }
      : { success: false, error: data?.error || 'Storage error' };

    // For 204 responses, return a proper JSON response with 200 status
    // since the frontend expects JSON
    const responseStatus =
      storageResponse.status === 204 ? 200 : storageResponse.status;

    return c.json(response, responseStatus as any);
  } catch (error) {
    console.error('Flag API error:', error);
    return c.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
}

async function index(c: Context<{ Bindings: Env }>) {
  try {
    const indexResponse = await fetch(new URL('/assets/index.html', c.req.url));
    if (!indexResponse.ok) {
      return c.text('Application not found', 404);
    }

    return new Response(indexResponse.body, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache',
      },
    });
  } catch {
    return c.text('Application not found', 404);
  }
}

async function assets(c: Context<{ Bindings: Env }>) {
  try {
    const assetResponse = await fetch(c.req.url);
    return assetResponse;
  } catch {
    return c.text('Asset not found', 404);
  }
}

function notFound(c: Context<{ Bindings: Env }>) {
  return c.text('Not found', 404);
}

// Routes
app.get('/api/health', health);
app.all('/api/flag/*', flag);
app.get('/', index);
app.get('/assets/*', assets);
app.all('*', notFound);

export default app;
