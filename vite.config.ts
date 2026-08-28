import { defineConfig } from 'vite';
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

async function filesIn(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  }));
  return files.flat();
}

/**
 * The worker is deliberately emitted after Vite has named every asset. This
 * makes its cache identity a function of the release and its exact shell,
 * rather than a hand-maintained version string.
 */
function releaseServiceWorker() {
  let outputDirectory = '';
  return {
    name: 'release-service-worker',
    apply: 'build' as const,
    configResolved(config: { root: string; build: { outDir: string } }) {
      outputDirectory = resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      const template = await readFile('site/public/sw.js', 'utf8');
      const outputFiles = (await filesIn(outputDirectory))
        .map(file => relative(outputDirectory, file).replaceAll('\\', '/'))
        .filter(file => file !== 'sw.js' && file !== 'staticwebapp.config.json' && !file.endsWith('.map'))
        .sort();
      const release = (process.env.RELEASE_ID || process.env.GITHUB_SHA || '0.1.0')
        .replaceAll(/[^a-zA-Z0-9._-]/g, '-')
        .slice(0, 48);
      const digest = createHash('sha256').update(release);
      digest.update(template);
      for (const file of outputFiles) {
        digest.update(file);
        digest.update(await readFile(join(outputDirectory, file)));
      }
      const cache = `gh-account-autoswitch-${release}-${digest.digest('hex').slice(0, 12)}`;
      const precache = [...new Set(['/', '/index.html', '/demo/', '/privacy/', '/terms/', '/404.html', '/sw.js', ...outputFiles.map(file => `/${file}`)])];
      await writeFile(
        join(outputDirectory, 'sw.js'),
        template.replace('__CACHE_NAME__', cache).replace('__PRECACHE__', JSON.stringify(precache))
      );
    }
  };
}

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
        demo: 'site/demo/index.html',
        privacy: 'site/privacy/index.html',
        terms: 'site/terms/index.html',
        notFound: 'site/404.html'
      }
    }
  },
  plugins: [releaseServiceWorker()]
});
