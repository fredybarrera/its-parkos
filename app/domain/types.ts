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

// ─────────────────────────────────────────────────────────────────────────
// Dominio de parking (Etapa 3). Tipos del negocio real: lo que sobrevive
// cuando el mock se reemplace por una API.
// ─────────────────────────────────────────────────────────────────────────

export type SesionEstado = 'activa' | 'cerrada'
export type SesionOrigen = 'manual' | 'lpr'

/** Un vehículo dentro del estacionamiento, desde que entra hasta que paga y sale. */
export interface Sesion {
  id: string
  patente: string
  horaEntrada: string
  horaSalida: string | null
  estado: SesionEstado
  origen: SesionOrigen
  /** Se calcula al cerrar (registrarSalida); null mientras la sesión está activa. */
  monto: number | null
}

export type PlazaEstado = 'libre' | 'ocupada'

/** Una posición física numerada de la grilla del estacionamiento. */
export interface Plaza {
  id: string
  codigo: string
  estado: PlazaEstado
  /** Sesión que la ocupa, si la ocupación viene de un ingreso registrado. */
  sesionId: string | null
}

export type AbonadoEstado = 'activo' | 'inactivo'

/** Cliente con convenio mensual (no paga por sesión individual). */
export interface Abonado {
  id: string
  nombre: string
  patente: string
  estado: AbonadoEstado
  vigenteHasta: string
}

/** Tipo de cobro que define una Tarifa. Deja espacio a 'plana' sin forzarlo. */
export type TarifaTipo = 'hora_fraccion' | 'plana'

/** Modelo de cobro vigente. Un solo objeto activo a la vez (ver useParkingData). */
export interface Tarifa {
  id: string
  tipo: TarifaTipo
  /** CLP por hora completa. Usado cuando tipo === 'hora_fraccion'. */
  valorHora: number
  /** Tamaño de la fracción de cobro en minutos (ej. 15 = cobra cada 15 min iniciados). */
  fraccionMinutos: number
  /** CLP fijos por estadía. Usado cuando tipo === 'plana'; null si no aplica. */
  valorPlano: number | null
}

/** Recibo emitido al cerrar una sesión (registrarSalida). */
export interface Comprobante {
  id: string
  sesionId: string
  patente: string
  tiempoTotalMinutos: number
  monto: number
  fecha: string
}

/** Métrica de un punto en el día, para identificar horas pico en ReporteDia. */
export interface HoraPico {
  hora: number
  vehiculos: number
}

/** Resumen del día para la pantalla de Reportes (Etapa 6). */
export interface ReporteDia {
  fecha: string
  ingresosTotales: number
  vehiculosAtendidos: number
  /** Sesiones por plaza en el día: a mayor número, más rotación. */
  rotacion: number
  /** Porcentaje (0-100) de plazas ocupadas en el momento del cálculo. */
  ocupacionPromedio: number
  horasPico: HoraPico[]
}
