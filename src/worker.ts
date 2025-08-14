import { Env, ApiResponse } from './data';
import { StorageObject } from './storage';

export { StorageObject };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      return handleApi(request, env);
    }

    return handleApp(request, url);
  },
};

async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  // Health endpoint doesn't require auth
  if (url.pathname === '/api/health') {
    const response: ApiResponse = {
      success: true,
      data: { status: 'healthy', timestamp: new Date().toISOString() },
    };
    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // CF Access authentication is handled at the edge level
  // The presence of cf-access-* headers indicates the user is authenticated

  if (url.pathname.startsWith('/api/flag')) {
    try {
      console.log('Flag API request:', request.method, url.pathname);

      if (!env.STORAGE) {
        console.error('STORAGE binding not available');
        const response: ApiResponse = {
          success: false,
          error: 'Storage not configured',
        };
        return new Response(JSON.stringify(response), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const storageId = env.STORAGE.idFromName('default');
      const storage = env.STORAGE.get(storageId);

      const storageUrl = new URL(request.url);
      storageUrl.pathname = storageUrl.pathname.replace('/api/flag', '/flag');

      console.log('Storage request:', request.method, storageUrl.pathname);

      const storageRequest = new Request(storageUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
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

      const response: ApiResponse = {
        success: storageResponse.ok,
        data: storageResponse.ok ? data : undefined,
        error: storageResponse.ok ? undefined : data?.error || 'Storage error',
      };

      // For 204 responses, return a proper JSON response with 200 status
      // since the frontend expects JSON
      const responseStatus =
        storageResponse.status === 204 ? 200 : storageResponse.status;

      return new Response(JSON.stringify(response), {
        status: responseStatus,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Flag API error:', error);
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      return new Response(JSON.stringify(response), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response('Not found', { status: 404 });
}

async function handleApp(request: Request, url: URL): Promise<Response> {
  if (url.pathname === '/') {
    // For now, let CF Access handle the authentication at the edge
    // The JWT verification can be added later if needed for additional security
    try {
      const indexResponse = await fetch(
        new URL('/assets/index.html', request.url)
      );
      if (!indexResponse.ok) {
        return new Response('Application not found', { status: 404 });
      }

      return new Response(indexResponse.body, {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache',
        },
      });
    } catch {
      return new Response('Application not found', { status: 404 });
    }
  }

  if (url.pathname.startsWith('/assets/')) {
    try {
      const assetResponse = await fetch(request.url);
      return assetResponse;
    } catch {
      return new Response('Asset not found', { status: 404 });
    }
  }

  return new Response('Not found', { status: 404 });
}
