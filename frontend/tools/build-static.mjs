/**
 * Build estático sin Astro (respaldo y pruebas).
 * Genera dist-static/ con el mismo HTML, CSS y JS que produce Astro,
 * usando solo esbuild. Útil para GitHub Pages o para revisar rápido.
 *
 *   npm run build:static
 */
import * as esbuild from 'esbuild';
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist-static');
const tmp = path.join(root, 'node_modules', '.cache', 'build-static');

await rm(out, { recursive: true, force: true });
await mkdir(path.join(out, 'assets'), { recursive: true });
await mkdir(tmp, { recursive: true });

// 1. Renderiza el HTML con las mismas funciones que usa Astro.
await esbuild.build({
  stdin: {
    contents: `export { renderBody } from './src/sections/index.ts'; export { headHtml, META } from './src/layouts/head.ts';`,
    resolveDir: root,
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: path.join(tmp, 'render.mjs'),
  // Las secciones no usan APIs del navegador; window no existe aquí.
  logLevel: 'warning',
  tsconfigRaw: {}, // no depende de que Astro esté instalado
});
const { renderBody, headHtml, META } = await import(pathToFileURL(path.join(tmp, 'render.mjs')).href + `?t=${Date.now()}`);

// 2. JS y CSS minificados.
await esbuild.build({
  entryPoints: { app: path.join(root, 'src/scripts/main.ts'), styles: path.join(root, 'src/styles/global.css') },
  bundle: true,
  minify: true,
  format: 'esm',
  target: ['es2020', 'safari15'],
  outdir: path.join(out, 'assets'),
  logLevel: 'warning',
  tsconfigRaw: {}, // no depende de que Astro esté instalado
});

// 3. Archivos públicos (logos, Max, íconos).
await cp(path.join(root, 'public'), out, { recursive: true });

// 4. Documento final.
const html = `<!doctype html>
<html lang="${META.lang}">
<head>${headHtml()}
<link rel="stylesheet" href="./assets/styles.css" />
</head>
<body>
${renderBody()}
<script type="module" src="./assets/app.js"></script>
</body>
</html>
`;
await writeFile(path.join(out, 'index.html'), html);
console.log('✓ dist-static/ listo');
