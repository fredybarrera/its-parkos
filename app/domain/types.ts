// Tipos del dominio de entitlements.
// Esto es lo que se reutiliza en el producto real, por eso vive en domain/.

/** Naturaleza de una funcionalidad: un interruptor on/off o un límite numérico. */
export type FeatureType = 'toggle' | 'limit'

/** Funcionalidades on/off (se preguntan con `has()`). */
export type ToggleCode =
  // Núcleo (en ambos planes)
  | 'session.manual'
  | 'billing.tariffs'
  | 'billing.calculate'
  | 'payment.register'
  | 'occupancy.view'
  | 'reports.basic'
  // Solo Control
  | 'access.barrier'
  | 'lpr.camera'
  | 'occupancy.sensors'
  | 'signage.dynamic'
  | 'reports.advanced'

/** Funcionalidades con valor numérico (se preguntan con `getLimit()`). */
export type LimitCode =
  | 'users.operators'
  | 'branches.max'
  | 'subscribers.manage'

/** Cualquier código de funcionalidad del catálogo. */
export type FeatureCode = ToggleCode | LimitCode

/** Metadata de una funcionalidad del catálogo. */
export interface FeatureMeta {
  code: FeatureCode
  /** Nombre legible para humanos (UI, futuro). */
  label: string
  type: FeatureType
}

/**
 * Convención explícita para "ilimitado" en un límite.
 * Usamos Infinity (es un `number` real, comparable y sin números mágicos).
 * Para preguntar usar el helper `isUnlimited()` del composable.
 */
export const UNLIMITED = Number.POSITIVE_INFINITY

/** Valor de un límite: un número finito, o UNLIMITED. */
export type LimitValue = number

/** Identificadores de plan. Agregar un plan nuevo = agregar otro literal aquí. */
export type PlanId = 'gestion' | 'control'

/**
 * Un plan es pura data: qué toggles están encendidos y el valor de cada límite.
 * No hay lógica acá; las consultas viven en `useEntitlements`.
 */
export interface Plan {
  id: PlanId
  name: string
  toggles: Record<ToggleCode, boolean>
  limits: Record<LimitCode, LimitValue>
}
