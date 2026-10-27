import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { networkInterfaces } from 'node:os';
const root = resolve('.');
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || '0.0.0.0';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2' };
http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    // LAN preview exposes the website, keeping development files private.
    if (pathname.includes('\\') || !['/', '/index.html'].includes(pathname) && !pathname.startsWith('/src/') && !pathname.startsWith('/assets/')) { res.writeHead(404).end('Not found'); return; }
    const path = resolve(root, '.' + pathname);
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    const file = (await stat(path)).isDirectory() ? resolve(path, 'index.html') : path;
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  } catch { res.writeHead(404).end('Not found'); }
}).listen(port, host, () => {
  console.log(`Local: http://localhost:${port}`);
  if (host === '0.0.0.0') {
    const addresses = new Set(Object.values(networkInterfaces()).flat().filter(info => info && info.family === 'IPv4' && !info.internal).map(info => info.address));
    for (const address of addresses) console.log(`Celular / misma red Wi-Fi: http://${address}:${port}`);
  }
});
