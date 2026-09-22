import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = join(root, 'dist', 'billerfast-app', 'browser', 'index.html');
const apiUrl = process.env.API_URL || 'https://billerfast-api.onrender.com';

const script = `<script>window.__billerfastEnv = { apiUrl: ${JSON.stringify(apiUrl)} };</script>`;

let html = readFileSync(indexPath, 'utf8');

if (/window\.__billerfastEnv/.test(html)) {
  html = html.replace(/<script>window\.__billerfastEnv[\s\S]*?<\/script>/, script);
} else {
  html = html.replace('</head>', `    ${script}\n  </head>`);
}

writeFileSync(indexPath, html);
console.log(`API_URL inyectado en index.html: ${apiUrl}`);