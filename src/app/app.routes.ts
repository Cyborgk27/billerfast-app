import { Routes } from '@angular/router';
import { AppShell } from './shared/layout/app-shell';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login').then((m) => m.Login) },
  { path: 'registro', loadComponent: () => import('./features/auth/register').then((m) => m.Register) },
  {
    path: 'tienda/:slug',
    loadComponent: () =>
      import('./features/storefront/storefront').then((m) => m.Storefront),
  },
  {
    path: '',
    component: AppShell,
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/products/products').then((m) => m.Products),
      },
      {
        path: 'productos/nuevo',
        loadComponent: () =>
          import('./features/products/product-form').then((m) => m.ProductForm),
      },
      {
        path: 'productos/:id/editar',
        loadComponent: () =>
          import('./features/products/product-form').then((m) => m.ProductForm),
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/clients/clients').then((m) => m.Clients),
      },
      {
        path: 'clientes/nuevo',
        loadComponent: () =>
          import('./features/clients/client-form').then((m) => m.ClientForm),
      },
      {
        path: 'clientes/:id/editar',
        loadComponent: () =>
          import('./features/clients/client-form').then((m) => m.ClientForm),
      },
      {
        path: 'facturas',
        loadComponent: () =>
          import('./features/invoices/invoices').then((m) => m.Invoices),
      },
      {
        path: 'facturas/nueva',
        loadComponent: () =>
          import('./features/invoices/invoice-form').then((m) => m.InvoiceForm),
      },
      {
        path: 'facturas/:id',
        loadComponent: () =>
          import('./features/invoices/invoice-detail').then(
            (m) => m.InvoiceDetail,
          ),
      },
      {
        path: 'ajustes',
        loadComponent: () =>
          import('./features/settings/settings').then((m) => m.Settings),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/admin/users').then((m) => m.Users),
      },
      { path: '**', redirectTo: '' },
    ],
  },
];