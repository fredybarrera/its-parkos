<!--
  Mapa de plazas — UNA SOLA grilla (PlazasGrid) para ambos planes. Lo único
  que cambia por plan es quién actualiza el estado de las plazas:
  - Gestión: solo Operación (ingresos/salidas manuales) la modifica.
  - Control: además, sensores simulados la cambian solos, en vivo (la
    simulación vive en useSensoresSimulados, global, no acá: así sigue
    corriendo aunque el operador esté mirando /sensores en vez de este mapa).
  Todo gating se decide con has(); nunca con el id del plan.
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { Plaza } from '~/domain/types'

const { has } = useEntitlements()
const { getPlazas } = useParkingData()
const { ultimaLecturaHaceSegundos } = useSensoresSimulados()

const plazas = computed<Plaza[]>(() => getPlazas())
const totalPlazas = computed(() => plazas.value.length)
const ocupadas = computed(() => plazas.value.filter((p) => p.estado === 'ocupada').length)
const libres = computed(() => totalPlazas.value - ocupadas.value)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="font-display text-2xl font-semibold uppercase tracking-wide text-asphalt-900">Mapa de estacionamientos</h1>
      <p class="font-mono text-sm font-medium text-asphalt-600">
        <span class="text-asphalt-800">{{ ocupadas }}</span> / {{ totalPlazas }} ocupadas
      </p>
    </div>

    <section
      v-if="has('signage.dynamic')"
      class="rounded-xl border border-asphalt-700 bg-asphalt-900 p-6 text-center"
    >
      <p class="text-xs uppercase tracking-[0.2em] text-asphalt-400">Espacios libres</p>
      <p
        class="mt-1 font-mono text-6xl font-semibold tabular-nums text-signal-400 [text-shadow:0_0_18px_rgb(79_190_124_/_55%)]"
      >
        {{ libres }}
      </p>
    </section>

    <p v-if="has('occupancy.sensors')" class="flex items-center gap-1.5 text-xs text-asphalt-500">
      <span class="h-2 w-2 rounded-full bg-signal-500" />
      Sensores en vivo · última lectura hace {{ ultimaLecturaHaceSegundos }}s
    </p>

    <PlazasGrid :plazas="plazas" />
  </div>
</template>
