<!--
  Sensores — bitácora real de lecturas de ocupación (occupancy.sensors).
  No es un mock paralelo: muestra exactamente los cambios de estado que
  useSensoresSimulados aplica sobre las plazas reales, las mismas que
  pinta PlazasGrid en /plazas. Si el plan no la incluye, vende el candado
  (mismo lenguaje que Reportes avanzados).
-->
<script setup lang="ts">
import { computed } from 'vue'

const { has } = useEntitlements()
const { getPlazas } = useParkingData()
const { bitacora, ultimaLecturaHaceSegundos } = useSensoresSimulados()

const plazas = computed(() => getPlazas())
const conSensor = computed(() => plazas.value.length)
const ocupadas = computed(() => plazas.value.filter((p) => p.estado === 'ocupada').length)

function formatHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="font-display text-2xl font-semibold uppercase tracking-wide text-asphalt-900">Sensores</h1>
      <p v-if="has('occupancy.sensors')" class="flex items-center gap-1.5 text-xs text-asphalt-500">
        <span class="h-2 w-2 rounded-full bg-signal-500" />
        En vivo · última lectura hace {{ ultimaLecturaHaceSegundos }}s
      </p>
    </div>

    <template v-if="has('occupancy.sensors')">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ReportesMetricCard label="Plazas con sensor" :value="String(conSensor)" />
        <ReportesMetricCard label="Ocupadas ahora" :value="String(ocupadas)" />
        <ReportesMetricCard label="Lecturas en bitácora" :value="String(bitacora.length)" hint="Últimas 20" />
      </div>

      <div class="overflow-hidden rounded-xl border border-asphalt-200 bg-white">
        <div class="border-b border-asphalt-200 px-4 py-3">
          <h2 class="text-sm font-semibold text-asphalt-800">Bitácora de lecturas</h2>
          <p class="text-xs text-asphalt-500">Cambios de ocupación detectados por los sensores, más reciente primero.</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-asphalt-50 text-xs uppercase tracking-wide text-asphalt-500">
              <tr>
                <th class="px-4 py-3 font-medium">Hora</th>
                <th class="px-4 py-3 font-medium">Plaza</th>
                <th class="px-4 py-3 font-medium">Nuevo estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-asphalt-100">
              <tr v-if="bitacora.length === 0">
                <td colspan="3" class="px-4 py-6 text-center text-asphalt-400">
                  Todavía no hay lecturas. La próxima llega en unos segundos.
                </td>
              </tr>
              <tr v-for="lectura in bitacora" :key="lectura.id" class="hover:bg-asphalt-50">
                <td class="px-4 py-3 font-mono text-asphalt-600">{{ formatHora(lectura.timestamp) }}</td>
                <td class="px-4 py-3 font-mono font-semibold text-asphalt-800">{{ lectura.plazaCodigo }}</td>
                <td class="px-4 py-3">
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="lectura.estado === 'libre' ? 'bg-signal-50 text-signal-700' : 'bg-brake-50 text-brake-700'"
                  >
                    {{ lectura.estado === 'libre' ? 'Liberada' : 'Ocupada' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <div v-else class="space-y-2 rounded-xl border border-asphalt-200 bg-white p-6">
      <CommonFeatureLock class="rounded-lg px-3 py-2">Sensores de ocupación en tiempo real por plaza</CommonFeatureLock>
      <CommonFeatureLock class="rounded-lg px-3 py-2">Bitácora de lecturas para auditoría</CommonFeatureLock>
    </div>
  </div>
</template>
