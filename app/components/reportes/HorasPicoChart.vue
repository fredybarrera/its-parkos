<!--
  HorasPicoChart — barras horizontales livianas en CSS (sin librería de
  charts). PRESENTACIONAL: pinta el array que recibe y nada más.
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { HoraPico } from '~/domain/types'

const props = defineProps<{ horasPico: HoraPico[] }>()

const maxVehiculos = computed(() => Math.max(1, ...props.horasPico.map((h) => h.vehiculos)))

function formatHora(hora: number): string {
  return `${hora.toString().padStart(2, '0')}:00`
}
</script>

<template>
  <div class="space-y-3">
    <p v-if="horasPico.length === 0" class="text-sm text-asphalt-400">Sin datos suficientes todavía.</p>
    <div v-for="h in horasPico" :key="h.hora" class="flex items-center gap-3">
      <span
        class="w-12 shrink-0 text-xs font-medium"
        :class="h.vehiculos === maxVehiculos ? 'text-asphalt-700 font-semibold' : 'text-asphalt-500'"
      >
        {{ formatHora(h.hora) }}
      </span>
      <div class="h-2.5 flex-1 rounded-full bg-asphalt-100">
        <div
          class="h-2.5 rounded-full transition-all duration-300"
          :class="h.vehiculos === maxVehiculos ? 'bg-signal-600' : 'bg-signal-400'"
          :style="{ width: `${(h.vehiculos / maxVehiculos) * 100}%` }"
        />
      </div>
      <span
        class="w-16 shrink-0 text-right text-xs"
        :class="h.vehiculos === maxVehiculos ? 'font-semibold text-signal-700' : 'font-medium text-asphalt-500'"
      >
        {{ h.vehiculos }} veh.
      </span>
    </div>
  </div>
</template>
