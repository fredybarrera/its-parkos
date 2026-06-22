// Semilla del demo. Datos con movimiento, no "test1, test2": son los que se
// ven en pantalla al abrir el demo, así que tienen que parecer un
// estacionamiento real a media tarde.
//
// Nadie debe importar este módulo fuera de stores/parking.ts: el contrato
// público de lectura/escritura es useParkingData.

import type { Abonado, Plaza, Sesion, Tarifa } from '~/domain/types'

const AHORA = Date.now()

/** Timestamp ISO de hace `min` minutos, relativo al momento en que carga el seed. */
function haceMinutos(min: number): string {
  return new Date(AHORA - min * 60_000).toISOString()
}

/** Patente plausible (formato chileno LLLLNN), determinística por índice. */
function generarPatente(index: number): string {
  const letras = 'BCDFGHJKLPRSTVWXYZ'
  const l = (n: number) => letras[n % letras.length]
  const d = (n: number) => n % 10
  return (
    l(index) + l(index * 3 + 1) + l(index * 5 + 2) + l(index * 7 + 3) +
    d(index * 2) + d(index * 9 + 1)
  )
}

// ── Tarifa ──────────────────────────────────────────────────────────────
// $1.500 CLP por hora, cobrada por fracción de 15 minutos iniciados.
export const SEED_TARIFA: Tarifa = {
  id: 'tarifa-1',
  tipo: 'hora_fraccion',
  valorHora: 1500,
  fraccionMinutos: 15,
  valorPlano: null,
}

// ── Sesiones ────────────────────────────────────────────────────────────
// Entradas escalonadas para que el tiempo transcurrido se vea variado.
// Las primeras 11 quedan asociadas 1:1 a una plaza ocupada (ver abajo).
export const SEED_SESIONES: Sesion[] = [
  { id: 'ses-1', patente: 'RBYL34', horaEntrada: haceMinutos(8), horaSalida: null, estado: 'activa', origen: 'manual', monto: null },
  { id: 'ses-2', patente: 'CFKT07', horaEntrada: haceMinutos(15), horaSalida: null, estado: 'activa', origen: 'lpr', monto: null },
  { id: 'ses-3', patente: 'GHSP91', horaEntrada: haceMinutos(22), horaSalida: null, estado: 'activa', origen: 'manual', monto: null },
  { id: 'ses-4', patente: 'DLWZ48', horaEntrada: haceMinutos(34), horaSalida: null, estado: 'activa', origen: 'lpr', monto: null },
  { id: 'ses-5', patente: 'KVRG65', horaEntrada: haceMinutos(41), horaSalida: null, estado: 'activa', origen: 'manual', monto: null },
  { id: 'ses-6', patente: 'TXBC12', horaEntrada: haceMinutos(53), horaSalida: null, estado: 'activa', origen: 'manual', monto: null },
  { id: 'ses-7', patente: 'PZFH89', horaEntrada: haceMinutos(67), horaSalida: null, estado: 'activa', origen: 'lpr', monto: null },
  { id: 'ses-8', patente: 'SGLK23', horaEntrada: haceMinutos(78), horaSalida: null, estado: 'activa', origen: 'manual', monto: null },
  { id: 'ses-9', patente: 'WCVT56', horaEntrada: haceMinutos(95), horaSalida: null, estado: 'activa', origen: 'manual', monto: null },
  { id: 'ses-10', patente: 'HBRD70', horaEntrada: haceMinutos(112), horaSalida: null, estado: 'activa', origen: 'lpr', monto: null },
  { id: 'ses-11', patente: 'LFPS84', horaEntrada: haceMinutos(130), horaSalida: null, estado: 'activa', origen: 'manual', monto: null },
  // Historial del día: ya cerradas, alimentan getReporteDia.
  { id: 'ses-12', patente: 'VKGZ19', horaEntrada: haceMinutos(240), horaSalida: haceMinutos(195), estado: 'cerrada', origen: 'manual', monto: 1125 },
  { id: 'ses-13', patente: 'XDTB62', horaEntrada: haceMinutos(310), horaSalida: haceMinutos(280), estado: 'cerrada', origen: 'lpr', monto: 750 },
  { id: 'ses-14', patente: 'JRWN37', horaEntrada: haceMinutos(420), horaSalida: haceMinutos(330), estado: 'cerrada', origen: 'manual', monto: 2250 },
]

// ── Plazas ──────────────────────────────────────────────────────────────
// 30 plazas en 5 sectores de 6. Ocupadas: las 11 con sesión activa más 2
// ocupadas sin sesión (abonados con espacio fijo, no pasan por Operación).
const SECTORES = ['A', 'B', 'C', 'D', 'E']
const SESION_POR_PLAZA: Record<string, string> = {
  A1: 'ses-1', A3: 'ses-2', A5: 'ses-3',
  B2: 'ses-4', B4: 'ses-5', B6: 'ses-6',
  C1: 'ses-7', C3: 'ses-8',
  D2: 'ses-9', D5: 'ses-10',
  E4: 'ses-11',
}
const OCUPADAS_SIN_SESION = new Set(['C5', 'D6'])

export const SEED_PLAZAS: Plaza[] = SECTORES.flatMap((sector) =>
  Array.from({ length: 6 }, (_, i) => {
    const codigo = `${sector}${i + 1}`
    const sesionId = SESION_POR_PLAZA[codigo] ?? null
    const estado = sesionId || OCUPADAS_SIN_SESION.has(codigo) ? 'ocupada' : 'libre'
    return { id: `plz-${codigo}`, codigo, estado, sesionId } satisfies Plaza
  }),
)

// ── Abonados ────────────────────────────────────────────────────────────
// 49 a propósito: en Gestión el límite del plan es 50 (Etapa 6), así que el
// próximo que se agregue es justo el que choca con el límite.
const NOMBRES = [
  'María', 'José', 'Carlos', 'Ana', 'Luis', 'Carmen', 'Pedro', 'Francisca',
  'Jorge', 'Valentina', 'Diego', 'Camila', 'Andrés', 'Javiera', 'Felipe',
  'Daniela', 'Cristián', 'Paula', 'Sebastián', 'Antonia', 'Matías',
  'Catalina', 'Rodrigo', 'Fernanda', 'Gonzalo',
]
const APELLIDOS = [
  'González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Soto', 'Contreras',
  'Silva', 'Martínez', 'Sepúlveda', 'Morales', 'Rodríguez', 'López',
  'Fuentes', 'Hernández', 'Torres', 'Araya', 'Flores', 'Espinoza',
  'Valenzuela', 'Castillo', 'Reyes', 'Gutiérrez', 'Cárdenas',
]

export const SEED_ABONADOS: Abonado[] = Array.from({ length: 49 }, (_, i) => {
  const nombre = `${NOMBRES[i % NOMBRES.length]} ${APELLIDOS[(i * 7) % APELLIDOS.length]}`
  // Casi todos vigentes; un puñado vencido la semana pasada para que la
  // lista no se vea artificialmente perfecta.
  const vigenteHasta = i % 11 === 0 ? haceMinutos(7 * 24 * 60) : haceMinutos(-20 * 24 * 60)
  return {
    id: `abo-${i + 1}`,
    nombre,
    patente: generarPatente(i + 100),
    estado: i % 11 === 0 ? 'inactivo' : 'activo',
    vigenteHasta,
  } satisfies Abonado
})
