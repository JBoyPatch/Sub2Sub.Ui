import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // Serve //riot.txt in dev so verification links with double-slash work
    {
      name: 'serve-double-slash-riot',
      configureServer(server) {
        const riotPath = path.resolve(process.cwd(), 'public', 'riot.txt');
        server.middlewares.use((req, res, next) => {
          if (!req || !req.url) return next();
          try {
            const urlPath = req.url.split('?')[0];
            if (urlPath.endsWith('/riot.txt') || urlPath.endsWith('//riot.txt')) {
              fs.readFile(riotPath, 'utf8', (err, data) => {
                if (err) return next();
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.end(data);
              });
              return;
            }
          } catch (e) {
            // fallthrough to next
          }
          next();
        });
      },
    },
  ],
  server: {
    proxy: {
      // Proxy /api/* to the API Gateway to avoid CORS during development
      '/api': {
        target: process.env.VITE_API_BASE_URL ? String(process.env.VITE_API_BASE_URL).replace(/\/$/, '') : 'https://uuzjaspetg.execute-api.us-east-1.amazonaws.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
