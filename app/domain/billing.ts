// Cálculo de cobro. Vive acá (no en el store) para que sea una función pura
// y testeable: dada una Tarifa y un tiempo, siempre el mismo monto.

import type { Tarifa } from './types'

/** Minutos transcurridos entre dos timestamps ISO, nunca negativos. */
export function calcularMinutosTranscurridos(horaEntrada: string, horaSalida: string): number {
  const ms = new Date(horaSalida).getTime() - new Date(horaEntrada).getTime()
  return Math.max(0, Math.round(ms / 60_000))
}

/** Monto en CLP para una estadía de `minutos`, según la Tarifa vigente. */
export function calcularMonto(tarifa: Tarifa, minutos: number): number {
  if (tarifa.tipo === 'plana') {
    return tarifa.valorPlano ?? 0
  }

  // Por hora/fracción: toda fracción iniciada se cobra completa.
  const fraccion = tarifa.fraccionMinutos
  const minutosCobrados = minutos <= 0 ? fraccion : Math.ceil(minutos / fraccion) * fraccion
  return Math.round((minutosCobrados / 60) * tarifa.valorHora)
}
