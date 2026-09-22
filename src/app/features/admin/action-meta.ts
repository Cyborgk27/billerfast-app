export interface ActionMeta {
  label: string;
  icon: string;
  tone: 'ok' | 'warn' | 'danger' | 'info' | 'muted';
}

const ACTIONS: Record<string, ActionMeta> = {
  Login: { label: 'Inicio de sesión', icon: 'pi-sign-in', tone: 'ok' },
  LoginFallido: { label: 'Intento fallido', icon: 'pi-times-circle', tone: 'danger' },
  Registro: { label: 'Registro', icon: 'pi-user-plus', tone: 'info' },
  PedidoCreado: { label: 'Pedido', icon: 'pi-shopping-cart', tone: 'info' },
  FacturaCreada: { label: 'Factura emitida', icon: 'pi-file', tone: 'info' },
  PagoRegistrado: { label: 'Pago registrado', icon: 'pi-dollar', tone: 'ok' },
  UsuarioAprobado: { label: 'Usuario aprobado', icon: 'pi-check-circle', tone: 'ok' },
  UsuarioDesactivado: { label: 'Usuario desactivado', icon: 'pi-ban', tone: 'danger' },
  UsuarioDesbloqueado: { label: 'Usuario desbloqueado', icon: 'pi-lock-open', tone: 'warn' },
  ClienteCreado: { label: 'Cliente creado', icon: 'pi-user-plus', tone: 'ok' },
  ClienteActualizado: { label: 'Cliente actualizado', icon: 'pi-pencil', tone: 'info' },
  ClienteEliminado: { label: 'Cliente eliminado', icon: 'pi-trash', tone: 'danger' },
  ProductoCreado: { label: 'Producto creado', icon: 'pi-box', tone: 'ok' },
  ProductoActualizado: { label: 'Producto actualizado', icon: 'pi-pencil', tone: 'info' },
  ProductoEliminado: { label: 'Producto eliminado', icon: 'pi-trash', tone: 'danger' },
  StockActualizado: { label: 'Stock actualizado', icon: 'pi-hashtag', tone: 'info' },
  ProductosImportados: { label: 'Productos importados', icon: 'pi-upload', tone: 'info' },
  AjustesActualizados: { label: 'Ajustes actualizados', icon: 'pi-cog', tone: 'info' },
  PerfilActualizado: { label: 'Perfil actualizado', icon: 'pi-user-edit', tone: 'info' },
  ContrasenaCambiada: { label: 'Contraseña cambiada', icon: 'pi-key', tone: 'info' },
  PerfilEmisorActualizado: { label: 'Tienda actualizada', icon: 'pi-building', tone: 'info' },
  LogoActualizado: { label: 'Logo actualizado', icon: 'pi-image', tone: 'info' },
  AvatarActualizado: { label: 'Foto de perfil', icon: 'pi-image', tone: 'info' },
  AvatarRestablecido: { label: 'Avatar por defecto', icon: 'pi-refresh', tone: 'info' },
};

export function actionMeta(action: string): ActionMeta {
  return (
    ACTIONS[action] ?? {
      label: action || 'Actividad',
      icon: 'pi-history',
      tone: 'muted',
    }
  );
}

export function actionList(): string[] {
  return Object.keys(ACTIONS);
}