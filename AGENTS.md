# BillerFast App (Angular) — Guía para agentes

PWA responsive (Angular 22 standalone + signals + Material 3) para la API `BillerFast.WebApi` (multi-tenant, JWT). Incluye app de gestión + tienda pública.

## Comandos

```bash
npm install
npm start              # dev en http://localhost:4200 (proxy /api -> https://localhost:7259)
npm run build / npm test
npm run start:lan      # dev accesible desde el celular en la misma red (--host 0.0.0.0)
npx ng serve --host 0.0.0.0 --port 4200   # equivalente

# PWA en producción (instalable en el celular):
npm run build          # genera dist/ con service worker (ngsw.json) + manifest
npm run pwa:serve      # sirve la PWA en http://localhost:4300 con proxy /api -> API
npm run pwa:tunnel     # publica https (Cloudflare) hacia localhost:4300 para instalar en el cel
npm run pwa:all        # build + serve
```

- **Instalable**: `manifest.webmanifest` completo (icons, theme/background color, shortcuts). SW activo en producción. Para instalarla el teléfono necesita HTTPS (usar `pwa:tunnel` o un hosting). Botón de instalación + ayuda en el toolbar.
- **Accesibilidad**: botón de tamaño de letra (`A`, `A+`, `A++`) persistido (`data-font` en `<html>`); toques grandes en botones.

## Estructura

```
src/app/
├─ core/         models, services (Auth, Dashboard, Products, Clients, Invoices, Settings, Storefront),
│                interceptors (auth-token + http-error), guards (auth.guard)
├─ shared/       layout (AppShell: toolbar + bottom-nav móvil) + ConfirmDialog
└─ features/     auth (login/registro), dashboard, products, clients, invoices, settings, storefront
```

- **Rutas públicas**: `/login`, `/registro`, `/tienda/:slug` (landing de compra). El resto vive dentro del shell y está protegido por `authGuard`.
- Token en `localStorage` (`billerfast_token`/`billerfast_user`). Un `401` hace logout y redirige a `/login`.
- Proxy dev en `proxy.conf.json`; en producción `environment.prod.ts` usa `apiUrl: 'https://localhost:7259'`.

## Contrato (resumen; detalles en `repos/billerfast/AGENTS.md`)

| Operación | Request `data` |
|---|---|
| Login/Registro | `LoginResponse` (token+usuario) / `string`. Login: `{ identificador, contrasena }` — `identificador` = nombre de usuario (apodo) o correo |
| Resumen | `DashboardSummary` (`total_facturado`, `por_cobrar`, …) |
| Productos/Clientes | CRUD scoped por emisor; `ProductDto` incluye `stock`. Producto simplificado: `presentacion` (`Paca`/`Unidad`), `precio_venta` (único), `precio_costo?`, `cantidad_por_paca` (solo Paca). Export: `GET /api/Products/export?formato=excel\|json` |
| Facturas | listado paginado con `estado` y `saldo_pendiente` |
| Detalle factura | `InvoiceDto` + `pagos[]`, `cuotas[]`, `pagado`, `saldo_pendiente`, `estado` |
| Pago | `POST /api/Invoices/{id}/payments` `{ monto, metodo, referencia?, fecha_pago?, cuota_id_publico? }` |
| Plan cuotas | `POST /api/Invoices/{id}/plans` `{ tipo: auto\|custom, numero_cuotas?, periodo?, fecha_inicio? }` |
| Ajustes | `GET/PUT /api/Settings/notifications`, `POST .../test`, `GET /api/Settings/issuer` (slug tienda) |
| Tienda pública | `GET /api/public/issuers/{slug}`, `GET .../products`, `POST .../orders` |

- `PaymentMethod`: `Efectivo | Transferencia | Tarjeta | Cheque | Otro`.
- Estado factura: `Pendiente | Parcial | Pagada | Vencida`.
- `presentacion` en detalles de factura/orden: `"Box"` o `"Unit"`.

## Notas
- **Íconos**: `primeicons` (`<i class="pi pi-…">`). **Fuentes**: Poppins + Inter. **Modo oscuro**: toggle en el toolbar (`.dark` en `<html>`, persistido en localStorage).
- **Panel de usuarios** (`/usuarios`): listar, aprobar, desactivar, desbloquear y ver logs por usuario (avatares tipo GitLab desde `/api/images/user/{id}`).
- **Componentes reutilizables**: `app-estado-badge` y `app-page-header` en `shared/components`.
- **Compartir por WhatsApp**: botón en el detalle de factura → abre `wa.me` con el teléfono del cliente (no hay API de WhatsApp).
- La tienda pública (`/tienda/:slug`) no requiere login para comprar; el pedido crea/usa un cliente del emisor y deja la factura en `Pendiente`.
- El registro/login de clientes en la tienda se abre en un **diálogo** (`AuthDialog`); "Mis pedidos" también es un diálogo (`OrdersDialog`).
- Los clientes pueden **registrarse/iniciar sesión** en la tienda (token en `billerfast_customer_token`, rol `Customer`).
- **Tokens por contexto**: el interceptor usa el token del cliente en rutas `/api/public/` y el del vendedor en el resto. El guard del panel rechaza `Role=Customer`.
- **Imágenes**: placeholders SVG servidos por la API (`/api/images/...`). En el panel se puede subir imagen de producto (formulario) y logo/perfil de la tienda (`/ajustes`).
- Las notificaciones se envían en `modo_demo` (log) hasta configurar SMTP/WhatsApp reales en `/ajustes`.
- El detalle de factura permite registrar pagos directos, pagar cuotas y crear planes (auto). Las cuotas personalizadas se crean solo vía API por ahora.