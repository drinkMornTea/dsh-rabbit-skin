/**
 * Bundle `src/client/index.tsx` into the single CommonJS bundle the client
 * module loader expects:
 *
 *     window.__ModuleLoader__.load({ id, factory: (require) => { ... } })
 *
 * The bundle registers a factory and nothing else, so loading it has no side
 * effects: React, the JSX runtime and the primitives package stay external and
 * are resolved from the shell's baseline module table at materialization time.
 * CSS and WebP assets are inlined (text / data URL) — a skin has no business
 * owning an HTTP route for five small pictures.
 */
import { build } from 'esbuild';
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));

if (typeof pkg.name !== 'string' || pkg.name.length === 0) {
  throw new Error('package.json is missing a name');
}

const outfile = join(root, 'lib', 'client.js');
await mkdir(dirname(outfile), { recursive: true });

await build({
  absWorkingDir: root,
  entryPoints: [join(root, 'src', 'client', 'index.tsx')],
  outfile,
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  jsx: 'automatic',
  charset: 'utf8',
  legalComments: 'none',
  sourcemap: true,
  sourcesContent: true,
  loader: {
    '.css': 'text',
    '.webp': 'dataurl',
  },
  external: ['react', 'react/jsx-runtime', '@deepseek-ai/dsh-client-ui-primitives'],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  banner: {
    js: `window.__ModuleLoader__.load({ id: ${JSON.stringify(pkg.name)}, factory: (require) => { var module = { exports: {} }; var exports = module.exports;`,
  },
  footer: {
    js: 'return module.exports; } });',
  },
});

const stat = await readFile(outfile);
console.log(`built lib/client.js (${(stat.byteLength / 1024).toFixed(1)} KB) for ${pkg.name}`);
