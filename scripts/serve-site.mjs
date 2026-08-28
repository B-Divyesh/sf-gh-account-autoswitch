import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = new URL('../dist/site/', import.meta.url).pathname;
const port = Number(process.env.PORT || 4173);
const types = { '.css': 'text/css', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.xml': 'application/xml' };

createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || '/', `http://${request.headers.host}`).pathname);
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  const candidates = [relative, join(relative, 'index.html')];
  let file;
  for (const candidate of candidates) {
    const safe = normalize(candidate).replace(/^(\.\.(\/|\\|$))+/, '');
    try {
      if ((await stat(join(root, safe))).isFile()) { file = join(root, safe); break; }
    } catch {}
  }
  const status = file ? 200 : 404;
  file ||= join(root, '404.html');
  try {
    const body = await readFile(file);
    response.writeHead(status, {
      'Content-Type': types[extname(file)] || 'application/octet-stream',
      'Cache-Control': file.includes('/assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate',
      'Content-Security-Policy': "default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self'; manifest-src 'self'; object-src 'none'; script-src 'self'; style-src 'self'; worker-src 'self'",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Content-Type-Options': 'nosniff'
    });
    response.end(body);
  } catch {
    response.writeHead(500).end('Unable to read built site.');
  }
}).listen(port, '127.0.0.1', () => console.log(`Site ready at http://127.0.0.1:${port}`));
