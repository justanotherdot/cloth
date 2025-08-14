#!/usr/bin/env node

import { build } from 'esbuild';

await build({
  entryPoints: ['src/worker.ts'],
  bundle: true,
  minify: true,
  outfile: 'dist/worker.js',
  format: 'esm',
  target: 'es2020',
  platform: 'browser',
  conditions: ['worker', 'browser'],
  external: [],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});

console.log('Worker built successfully');
