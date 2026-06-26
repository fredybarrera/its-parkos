// Estado de UI del flujo de salida en Operación (qué comprobante está
// mostrándose). Vive fuera de la página para que tanto un click real del
// operador como un paso del modo demo disparen exactamente el mismo camino.
//
// Flujo normal UI:
//   iniciarSalida → muestra modal con monto (sin cerrar sesión)
//   confirmarSalida → cierra sesión y cierra modal
//
// Flujo demo tour:
//   registrarSalida → cierra sesión y muestra modal como comprobante final

import { ref } from 'vue'
import { createGlobalState } from '@vueuse/core'
import type { Comprobante } from '~/domain/types'
import { calcularMinutosTranscurridos, calcularMonto } from '~/domain/billing'
import { useParkingData } from '~/composables/useParkingData'

export const useOperacionFlujo = createGlobalState(() => {
  const comprobanteActivo = ref<{
    comprobante: Comprobante
    horaEntrada: string
    /** true = preview pendiente de confirmar; false = salida ya registrada */
    pendiente: boolean
  } | null>(null)

  /** ID de la sesión cuya fila está en transición de salida en la tabla. */
  const sesionSaliendo = ref<string | null>(null)

  // Calcula el monto sin cerrar la sesión. La sesión se cierra solo al confirmar.
  function iniciarSalida(sesionId: string) {
    const { getSesiones, getTarifa } = useParkingData()
    const sesion = getSesiones().find((s) => s.id === sesionId)
    if (!sesion) return

    const ahora = new Date().toISOString()
    const minutos = calcularMinutosTranscurridos(sesion.horaEntrada, ahora)
    const monto = calcularMonto(getTarifa(), minutos)

    comprobanteActivo.value = {
      comprobante: {
        id: sesionId,
        sesionId,
        patente: sesion.patente,
        fecha: ahora,
        tiempoTotalMinutos: minutos,
        monto,
      },
      horaEntrada: sesion.horaEntrada,
      pendiente: true,
    }
  }

  // Cierra el modal, resalta la fila 700ms y luego registra la salida.
  function confirmarSalida() {
    if (!comprobanteActivo.value?.pendiente) return
    const sesionId = comprobanteActivo.value.comprobante.sesionId
    comprobanteActivo.value = null
    sesionSaliendo.value = sesionId
    setTimeout(() => {
      useParkingData().registrarSalida(sesionId)
      sesionSaliendo.value = null
    }, 700)
  }

  // Para el demo tour: registra directamente y muestra comprobante final.
  function registrarSalida(sesionId: string) {
    const { registrarSalida: registrar, getSesiones } = useParkingData()
    const sesion = getSesiones().find((s) => s.id === sesionId)
    const comprobante = registrar(sesionId)
    comprobanteActivo.value = {
      comprobante,
      horaEntrada: sesion?.horaEntrada ?? comprobante.fecha,
      pendiente: false,
    }
  }

  function cerrarComprobante() {
    comprobanteActivo.value = null
  }

  return { comprobanteActivo, sesionSaliendo, iniciarSalida, confirmarSalida, registrarSalida, cerrarComprobante }
})
