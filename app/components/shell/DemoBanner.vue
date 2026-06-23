<!--
  DemoBanner — feedback de "el recorrido guiado está corriendo".

  Vive pegado al TopBar (no flotando sobre el contenido) para que sea
  imposible no verlo: misma franja de consola oscura, con una barra de
  progreso real debajo que se llena escena a escena. Solo lee useDemoTour;
  no dispara ninguna acción por sí mismo.
-->
<script setup lang="ts">
import { computed } from 'vue'

const { estado, pasoActual, totalPasos, labelActual, pausar, reanudar, detener } = useDemoTour()

const porcentaje = computed(() => Math.round(((pasoActual.value + 1) / totalPasos) * 100))
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-200 ease-in"
    enter-from-class="-translate-y-full opacity-0"
    leave-to-class="-translate-y-full opacity-0"
  >
    <div v-if="estado !== 'idle'" class="bg-asphalt-800 text-white shadow-md">
      <div class="flex flex-wrap items-center gap-2 px-3 py-2 sm:gap-3 sm:px-6 sm:py-2.5">
        <span
          class="h-2.5 w-2.5 shrink-0 rounded-full animate-pulse"
          :class="estado === 'running' ? 'bg-signal-400' : 'bg-hazard-400'"
        />
        <span class="shrink-0 font-mono text-xs font-semibold uppercase tracking-wide text-hazard-300">
          Recorrido {{ pasoActual + 1 }}/{{ totalPasos }}
        </span>
        <span class="min-w-0 flex-1 truncate text-sm text-asphalt-100">{{ labelActual }}</span>

        <div class="flex shrink-0 items-center gap-2">
          <button
            type="button"
            class="rounded-full bg-asphalt-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-asphalt-600"
            @click="estado === 'running' ? pausar() : reanudar()"
          >
            {{ estado === 'running' ? 'Pausar' : 'Reanudar' }}
          </button>
          <button
            type="button"
            class="rounded-full bg-brake-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brake-700"
            @click="detener"
          >
            Detener
          </button>
        </div>
      </div>

      <div class="h-1.5 bg-asphalt-900">
        <div
          class="h-1.5 bg-hazard-400 transition-all duration-500 ease-out"
          :style="{ width: `${porcentaje}%` }"
        />
      </div>
    </div>
  </Transition>
</template>
