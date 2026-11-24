// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://syntho.moe',
  // Fully static output: the build is plain files served by nginx.
  output: 'static',
  // Clean URLs: /about is emitted as about.html and nginx resolves the extension
  // (see docker/nginx/default.conf). Canonical URLs never have a trailing slash.
  build: { format: 'file' },
  trailingSlash: 'never',
  integrations: [sitemap()],
  // Prefetch internal links on hover for snappy navigation.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  vite: {
    build: {
      // Three.js (~530 kB min, ~130 kB gzip) is one lazily-imported chunk that only
      // pages with a 3D scene request. Raise the limit so real regressions still warn.
      chunkSizeWarningLimit: 600,
    },
  },
});
