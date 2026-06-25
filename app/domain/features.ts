// Catálogo de funcionalidades como data tipada.
// El código nunca pregunta "¿es Control?"; pregunta por una funcionalidad de
// este catálogo. Esta es la única lista canónica de qué existe en el producto.

import type { FeatureCode, FeatureMeta, LimitCode, ToggleCode } from './types'

/**
 * Registro de toda funcionalidad conocida con su metadata.
 * `as const satisfies ...` garantiza, en tiempo de compilación, que estén
 * todos los códigos y que cada entrada tenga el tipo correcto.
 */
export const FEATURES = {
  // ── Núcleo (en ambos planes) ───────────────────────────────────────────
  'session.manual':   { code: 'session.manual',   label: 'Ingreso/salida manual',     type: 'toggle' },
  'billing.tariffs':  { code: 'billing.tariffs',  label: 'Configuración de tarifas',  type: 'toggle' },
  'billing.calculate':{ code: 'billing.calculate',label: 'Cálculo de cobro',          type: 'toggle' },
  'payment.register': { code: 'payment.register', label: 'Registro de pago',          type: 'toggle' },
  'occupancy.view':   { code: 'occupancy.view',   label: 'Mapa de ocupación',         type: 'toggle' },
  'reports.basic':    { code: 'reports.basic',    label: 'Reportes básicos',          type: 'toggle' },
  'ticket.barcode':   { code: 'ticket.barcode',   label: 'Ticket con código de barras', type: 'toggle' },

  // ── Límites ────────────────────────────────────────────────────────────
  'users.operators':  { code: 'users.operators',  label: 'Operadores',                type: 'limit'  },
  'branches.max':     { code: 'branches.max',     label: 'Sucursales',                type: 'limit'  },
  'subscribers.manage':{ code: 'subscribers.manage', label: 'Abonados gestionables',  type: 'limit'  },

  // ── Solo Control ───────────────────────────────────────────────────────
  'access.barrier':   { code: 'access.barrier',   label: 'Barrera automática',        type: 'toggle' },
  'lpr.camera':       { code: 'lpr.camera',        label: 'Lectura de patente (LPR)',  type: 'toggle' },
  'occupancy.sensors':{ code: 'occupancy.sensors',label: 'Sensores de ocupación',     type: 'toggle' },
  'signage.dynamic':  { code: 'signage.dynamic',  label: 'Señalización dinámica',     type: 'toggle' },
  'reports.advanced': { code: 'reports.advanced', label: 'Reportes avanzados',        type: 'toggle' },
} as const satisfies Record<FeatureCode, FeatureMeta>

/** Lista de metadata, útil para iterar (UI, debug). */
export const FEATURE_LIST: readonly FeatureMeta[] = Object.values(FEATURES)

/** Todos los códigos de tipo toggle. */
export const TOGGLE_CODES = FEATURE_LIST
  .filter((f): f is FeatureMeta & { code: ToggleCode } => f.type === 'toggle')
  .map((f) => f.code)

/** Todos los códigos de tipo límite. */
export const LIMIT_CODES = FEATURE_LIST
  .filter((f): f is FeatureMeta & { code: LimitCode } => f.type === 'limit')
  .map((f) => f.code)
