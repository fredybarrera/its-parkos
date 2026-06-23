<!--
  Mapa de plazas — UNA SOLA grilla (PlazasGrid) para ambos planes. Lo único
  que cambia por plan es quién actualiza el estado de las plazas:
  - Gestión: solo Operación (ingresos/salidas manuales) la modifica.
  - Control: además, sensores simulados la cambian solos, en vivo.
  Todo gating se decide con has(); nunca con el id del plan.
-->
<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import type { Plaza } from '~/domain/types'

const { has } = useEntitlements()
const { getPlazas, setEstadoPlaza } = useParkingData()

const plazas = computed<Plaza[]>(() => getPlazas())
const totalPlazas = computed(() => plazas.value.length)
const ocupadas = computed(() => plazas.value.filter((p) => p.estado === 'ocupada').length)
const libres = computed(() => totalPlazas.value - ocupadas.value)

// Sensores simulados (solo Control, occupancy.sensors). Solo tocan plazas
// sin sesión activa asociada (sesionId === null): si tocaran una plaza con
// sesión real, desincronizarían el sensor del registro de Operación (al
// cerrar esa sesión, registrarSalida ya no la encontraría para liberarla).
const ultimaLecturaHaceSegundos = ref(0)

function leerSensores() {
  const candidatas = plazas.value.filter((p) => p.sesionId === null)
  if (candidatas.length === 0) return

  const cantidad = Math.min(candidatas.length, Math.random() < 0.5 ? 1 : 2)
  const elegidas = [...candidatas].sort(() => Math.random() - 0.5).slice(0, cantidad)
  for (const plaza of elegidas) {
    setEstadoPlaza(plaza.id, plaza.estado === 'libre' ? 'ocupada' : 'libre')
  }
  ultimaLecturaHaceSegundos.value = 0
}

const { pause: pausarSensores, resume: reanudarSensores } = useIntervalFn(
  leerSensores,
  5000,
  { immediate: false },
)
const { pause: pausarReloj, resume: reanudarReloj } = useIntervalFn(
  () => {
    ultimaLecturaHaceSegundos.value += 1
  },
  1000,
  { immediate: false },
)

watch(
  () => has('occupancy.sensors'),
  (activo) => {
    if (activo) {
      ultimaLecturaHaceSegundos.value = 0
      reanudarSensores()
      reanudarReloj()
    } else {
      pausarSensores()
      pausarReloj()
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  pausarSensores()
  pausarReloj()
})
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
