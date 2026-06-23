// Estado de UI del flujo de salida en Operación (qué comprobante está
// mostrándose). Vive fuera de la página para que tanto un click real del
// operador como un paso del modo demo disparen exactamente el mismo camino:
// useParkingData().registrarSalida -> mostrar ComprobanteModal.
//
// No es una fuente de datos del dominio (eso sigue siendo useParkingData);
// es orquestación de qué se ve en pantalla en este instante.

import { ref } from 'vue'
import { createGlobalState } from '@vueuse/core'
import type { Comprobante } from '~/domain/types'

export const useOperacionFlujo = createGlobalState(() => {
  const comprobanteActivo = ref<{ comprobante: Comprobante; horaEntrada: string } | null>(null)

  function registrarSalida(sesionId: string) {
    const { registrarSalida: registrar, getSesiones } = useParkingData()
    const sesion = getSesiones().find((s) => s.id === sesionId)
    const comprobante = registrar(sesionId)
    comprobanteActivo.value = {
      comprobante,
      horaEntrada: sesion?.horaEntrada ?? comprobante.fecha,
    }
  }

  function cerrarComprobante() {
    comprobanteActivo.value = null
  }

  return { comprobanteActivo, registrarSalida, cerrarComprobante }
})
