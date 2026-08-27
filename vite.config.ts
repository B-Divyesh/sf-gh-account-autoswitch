import { defineConfig } from 'vite';

export default defineConfig({
  root: 'site',
  base: '/',
  build: {
    outDir: '../dist/site',
    emptyOutDir: true,
    target: 'es2022',
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        home: 'site/index.html',
        privacy: 'site/privacy/index.html',
        terms: 'site/terms/index.html'
      }
    }
  }
});
