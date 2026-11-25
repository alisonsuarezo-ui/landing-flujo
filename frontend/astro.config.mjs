import { defineConfig } from 'astro/config';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // Cambia `site` (y `base` si publicas en un subdirectorio de GitHub Pages).
  // site: 'https://tu-usuario.github.io',
  // base: '/ai-academy-landing',
  compressHTML: true,
  build: {
    inlineStylesheets: 'always', // CSS crítico en línea: mejor LCP en móvil
  },
  // Reto 4: en `npm run dev`, /api se redirige al backend Spring Boot local.
  // En Docker, Nginx hace este mismo trabajo (frontend/nginx/default.conf).
  vite: {
    server: {
      proxy: {
        '/api': process.env.API_PROXY_TARGET ?? 'http://localhost:8081',
      },
    },
  },
});
