// Minimal static server for local use: npm run serve (port 4173).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const appDir = join(root, 'app');
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.pdf': 'application/pdf', '.woff2': 'font/woff2' };

createServer(async (req, res) => {
  try {
    let url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    // Serve documents/ and data/ next to the app for previews.
    let base = appDir;
    if (url.startsWith('/documents/') || url.startsWith('/data/')) base = root;
    if (url === '/') url = '/index.html';
    const path = normalize(join(base, url));
    if (!path.startsWith(base)) { res.writeHead(403); return res.end(); }
    const s = await stat(path).catch(() => null);
    const file = s && s.isDirectory() ? join(path, 'index.html') : path;
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  } catch (e) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Niet gevonden');
  }
}).listen(port, () => console.log(`App draait op http://localhost:${port}`));
