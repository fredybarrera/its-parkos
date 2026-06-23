<!--
  Operación en vivo — el recorrido. Gestión y Control crean LA MISMA sesión
  (useParkingData.registrarIngreso); solo cambia el disparador (manual vs.
  "hardware" simulado) y el campo origen. Todo el armado condicional se
  decide con has(), nunca con el id de plan.
-->
<script setup lang="ts">
import { ref } from 'vue'
import type { Comprobante } from '~/domain/types'

const { has } = useEntitlements()
const parkingData = useParkingData()

const comprobanteActivo = ref<{ comprobante: Comprobante; horaEntrada: string } | null>(null)

function onSalida(sesionId: string) {
  const comprobante = parkingData.registrarSalida(sesionId)
  const sesion = parkingData.getSesiones().find((s) => s.id === sesionId)
  comprobanteActivo.value = {
    comprobante,
    horaEntrada: sesion?.horaEntrada ?? comprobante.fecha,
  }
}

function cerrarComprobante() {
  comprobanteActivo.value = null
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-800">Operación en vivo</h1>
      <OperacionIngresoManualForm :primary="!has('access.barrier')" />
    </div>

    <OperacionAccesoAutomaticoPanel v-if="has('access.barrier')" />

    <OperacionSesionesTable @salida="onSalida" />

    <OperacionComprobanteModal
      v-if="comprobanteActivo"
      :comprobante="comprobanteActivo.comprobante"
      :hora-entrada="comprobanteActivo.horaEntrada"
      @cerrar="cerrarComprobante"
    />
  </div>
</template>
