<!--
  DemoControls — control discreto del modo demo (recorrido guiado), montado
  en la barra de consola oscura del TopBar.

  Usa useDemoTour, que reproduce el guion de venta llamando a las mismas
  acciones reales que un presentador dispararía a mano (useParkingData,
  usePlanStore). "Reiniciar datos" vuelve sesiones/plazas/abonados/tarifa y
  el plan activo al estado semilla, para repetir el demo con el próximo
  prospecto.
-->
<script setup lang="ts">
const { estado, iniciar, pausar, reanudar, detener } = useDemoTour()
const { reset } = useParkingData()
const planStore = usePlanStore()

function reiniciarDatos() {
  detener()
  reset()
  planStore.setPlan('gestion')
}
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      v-if="estado === 'idle'"
      type="button"
      class="flex items-center gap-1.5 rounded-full bg-hazard-400 px-3 py-2 text-sm font-bold text-asphalt-900 shadow-sm transition-colors hover:bg-hazard-300 sm:px-4"
      title="Iniciar recorrido guiado"
      @click="iniciar"
    >
      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
      <span class="hidden sm:inline">Iniciar recorrido</span>
    </button>

    <template v-else>
      <button
        v-if="estado === 'running'"
        type="button"
        class="rounded-full border border-asphalt-700 p-1.5 text-asphalt-300 transition-colors hover:border-asphalt-500 hover:text-white"
        title="Pausar recorrido"
        @click="pausar"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      </button>
      <button
        v-else
        type="button"
        class="rounded-full border border-asphalt-700 p-1.5 text-asphalt-300 transition-colors hover:border-asphalt-500 hover:text-white"
        title="Reanudar recorrido"
        @click="reanudar"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </button>
      <button
        type="button"
        class="rounded-full border border-asphalt-700 p-1.5 text-asphalt-300 transition-colors hover:border-brake-500 hover:text-brake-400"
        title="Detener recorrido"
        @click="detener"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="5" y="5" width="14" height="14" rx="1.5" />
        </svg>
      </button>
    </template>

    <button
      type="button"
      class="rounded-full border border-asphalt-700 p-1.5 text-asphalt-500 transition-colors hover:border-asphalt-500 hover:text-asphalt-200"
      title="Reiniciar datos del demo"
      @click="reiniciarDatos"
    >
      <svg
        class="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    </button>
  </div>
</template>
