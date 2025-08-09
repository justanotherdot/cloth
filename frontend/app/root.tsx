import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  LiveReload,
} from "@remix-run/react";
import "./tailwind.css";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <title>Cloth - Feature Flags</title>
      </head>
      <body className="bg-background text-foreground">
        <div className="container mx-auto p-6">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Cloth Feature Flags
            </h1>
            <nav className="flex gap-4">
              <a 
                href="/" 
                className="text-primary hover:text-primary/80 font-medium"
              >
                Flags
              </a>
              <a 
                href="/admin" 
                className="text-primary hover:text-primary/80 font-medium"
              >
                Admin
              </a>
            </nav>
          </header>
          
          <main>
            <Outlet />
          </main>
        </div>
        
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}