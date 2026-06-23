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
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-800">Mapa de plazas</h1>
      <p class="text-sm font-medium text-slate-600">
        <span class="text-slate-800">{{ ocupadas }}</span> / {{ totalPlazas }} ocupadas
      </p>
    </div>

    <section v-if="has('signage.dynamic')" class="rounded-xl bg-slate-900 p-6 text-center">
      <p class="text-xs uppercase tracking-widest text-slate-400">Espacios libres</p>
      <p class="mt-1 text-6xl font-bold tabular-nums text-emerald-400">{{ libres }}</p>
    </section>

    <p v-if="has('occupancy.sensors')" class="flex items-center gap-1.5 text-xs text-slate-500">
      <span class="h-2 w-2 rounded-full bg-emerald-500" />
      Sensores en vivo · última lectura hace {{ ultimaLecturaHaceSegundos }}s
    </p>

    <PlazasGrid :plazas="plazas" />
  </div>
</template>
