// URL del backend en producción (Render). Reemplázala por la URL real antes de `npm run build`.
// Si defines window.__billerfastEnv.apiUrl en index.html, tiene prioridad sobre este valor.
const DEPLOYED_API_URL = 'https://billerfast-api.onrender.com';

export const environment = {
  production: true,
  apiUrl: (globalThis as any).__billerfastEnv?.apiUrl ?? DEPLOYED_API_URL,
};