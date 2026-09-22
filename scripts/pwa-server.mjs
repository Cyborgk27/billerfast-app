// Servidor estático de la PWA en producción con proxy hacia la API.
// Sirve dist/billerfast-app/browser y reenvía /api/* a https://localhost:7259
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { request as httpsRequest } from 'node:https';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DIST = normalize(join(__dirname, '..', 'dist', 'billerfast-app', 'browser'));
const PORT = process.env.PORT || 4300;
const API_TARGET = 'localhost:7259';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

function proxyApi(req, res) {
  const options = {
    hostname: 'localhost',
    port: 7259,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: 'localhost:7259' },
    rejectUnauthorized: false,
  };
  const proxy = httpsRequest(options, (upstream) => {
    res.writeHead(upstream.statusCode, upstream.headers);
    upstream.pipe(res);
  });
  proxy.on('error', () => {
    res.writeHead(502, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ code: 502, success: false, message: 'No se pudo conectar con la API.', data: null, errors: [] }));
  });
  req.pipe(proxy);
}

const server = createServer(async (req, res) => {
  try {
    if (req.url.startsWith('/api/')) {
      return proxyApi(req, res);
    }

    let path = decodeURIComponent((req.url || '/').split('?')[0]);
    if (path.endsWith('/')) path += 'index.html';

    let filePath = normalize(join(DIST, path));
    if (!filePath.startsWith(DIST)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    if (!existsSync(filePath) || (await stat(filePath)).isDirectory()) {
      filePath = join(DIST, 'index.html');
    }

    const data = await readFile(filePath);
    res.writeHead(200, { 'content-type': MIME[extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(500);
    res.end('Error interno');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\nPWA servida en  http://localhost:${PORT}`);
  console.log(`En tu celular (misma red Wi-Fi): http://<IP-DE-ESTA-PC>:${PORT}`);
  console.log('Para instalarla necesitas HTTPS: usa el script "pwa:tunnel".\n');
});