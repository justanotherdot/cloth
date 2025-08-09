export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Serve static assets using Workers Assets
    try {
      const response = await env.ASSETS.fetch(request.url);
      
      // For SPA routing - serve index.html for routes that don't match static files
      if (response.status === 404 && !url.pathname.includes('.')) {
        return await env.ASSETS.fetch(new URL('/index.html', request.url));
      }
      
      return response;
    } catch (error) {
      return new Response('Internal Server Error', { status: 500 });
    }
  }
} as ExportedHandler<Env>;

interface Env {
  ASSETS: Fetcher;
}