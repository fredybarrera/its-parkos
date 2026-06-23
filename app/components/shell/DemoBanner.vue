<!--
  DemoBanner — feedback de "el recorrido guiado está corriendo", visible en
  cualquier pantalla, con un control siempre a mano para devolver el manejo
  al presentador. Solo lee useDemoTour; no dispara ninguna acción por sí
  mismo.
-->
<script setup lang="ts">
const { estado, pasoActual, totalPasos, labelActual, pausar, reanudar, detener } = useDemoTour()
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-200 ease-in"
    enter-from-class="translate-y-4 opacity-0"
    leave-to-class="translate-y-4 opacity-0"
  >
    <div
      v-if="estado !== 'idle'"
      class="fixed bottom-4 left-1/2 z-40 flex w-fit max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-full border border-asphalt-200 bg-white/95 px-4 py-2 shadow-lg backdrop-blur"
    >
      <span
        class="h-2 w-2 shrink-0 rounded-full animate-pulse"
        :class="estado === 'running' ? 'bg-signal-500' : 'bg-hazard-500'"
      />
      <span class="truncate text-xs font-medium text-asphalt-600">
        Recorrido {{ pasoActual + 1 }}/{{ totalPasos }} · {{ labelActual }}
      </span>
      <button
        type="button"
        class="shrink-0 rounded-full bg-asphalt-100 px-2.5 py-1 text-xs font-medium text-asphalt-600 transition-colors hover:bg-asphalt-200"
        @click="estado === 'running' ? pausar() : reanudar()"
      >
        {{ estado === 'running' ? 'Pausar' : 'Reanudar' }}
      </button>
      <button
        type="button"
        class="shrink-0 rounded-full bg-brake-50 px-2.5 py-1 text-xs font-medium text-brake-600 transition-colors hover:bg-brake-100"
        @click="detener"
      >
        Detener
      </button>
    </div>
  </Transition>
</template>
