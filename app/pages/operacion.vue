<!--
  Operación en vivo — el recorrido. Gestión y Control crean LA MISMA sesión
  (useParkingData.registrarIngreso); solo cambia el disparador (manual vs.
  "hardware" simulado) y el campo origen. Todo el armado condicional se
  decide con has(), nunca con el id de plan.

  El estado de "qué comprobante se está mostrando" vive en useOperacionFlujo
  (no en un ref local) para que el modo demo pueda disparar exactamente el
  mismo camino que un click real del operador.
-->
<script setup lang="ts">
const { has } = useEntitlements()
const { comprobanteActivo, registrarSalida, cerrarComprobante } = useOperacionFlujo()
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="font-display text-2xl font-semibold uppercase tracking-wide text-asphalt-900">Operación en vivo</h1>
      <OperacionIngresoManualForm :primary="!has('access.barrier')" />
    </div>

    <OperacionAccesoAutomaticoPanel v-if="has('access.barrier')" />

    <OperacionEscanearTicketSalida v-if="has('ticket.barcode')" />

    <OperacionSesionesTable @salida="registrarSalida" />

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <OperacionComprobanteModal
        v-if="comprobanteActivo"
        :comprobante="comprobanteActivo.comprobante"
        :hora-entrada="comprobanteActivo.horaEntrada"
        @cerrar="cerrarComprobante"
      />
    </Transition>
  </div>
</template>
