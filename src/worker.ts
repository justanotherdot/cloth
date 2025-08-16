import { Hono, Context } from 'hono';
import { Env } from './service/types';
import { StorageObject } from './storage/durable-object';
import { createRoutes } from './service/routes';

export { StorageObject };

const app = new Hono<{ Bindings: Env }>();


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


// Register service routes
const serviceRoutes = createRoutes();
app.route('/', serviceRoutes);

// Static asset routes
app.get('/', index);
app.get('/assets/*', assets);
app.all('*', notFound);

export default app;
