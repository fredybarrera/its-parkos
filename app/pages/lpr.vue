<!--
  Lectura de patente — bitácora real de sesiones originadas por LPR
  (origen === 'lpr'). No reinventa la simulación de cámara/barrera, que ya
  vive en OperacionAccesoAutomaticoPanel: esta pantalla es el registro de
  auditoría de esas mismas lecturas reales, no un mock paralelo.
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { Sesion } from '~/domain/types'

const { has } = useEntitlements()
const { getSesiones } = useParkingData()

const lecturas = computed<Sesion[]>(() =>
  getSesiones()
    .filter((s) => s.origen === 'lpr')
    .sort((a, b) => new Date(b.horaEntrada).getTime() - new Date(a.horaEntrada).getTime()),
)

function formatHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="font-display text-2xl font-semibold uppercase tracking-wide text-asphalt-900">Lectura de patente</h1>
      <p v-if="has('lpr.camera')" class="font-mono text-sm font-medium text-asphalt-600">
        <span class="text-asphalt-800">{{ lecturas.length }}</span> lecturas registradas
      </p>
    </div>

    <template v-if="has('lpr.camera')">
      <div class="overflow-hidden rounded-xl border border-asphalt-200 bg-white">
        <div class="border-b border-asphalt-200 px-4 py-3">
          <h2 class="text-sm font-semibold text-asphalt-800">Bitácora de lecturas</h2>
          <p class="text-xs text-asphalt-500">Cada ingreso autorizado por la cámara LPR, más reciente primero.</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-asphalt-50 text-xs uppercase tracking-wide text-asphalt-500">
              <tr>
                <th class="px-4 py-3 font-medium">Patente</th>
                <th class="px-4 py-3 font-medium">Hora de lectura</th>
                <th class="px-4 py-3 font-medium">Resultado</th>
                <th class="px-4 py-3 font-medium">Sesión</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-asphalt-100">
              <tr v-if="lecturas.length === 0">
                <td colspan="4" class="px-4 py-6 text-center text-asphalt-400">
                  Todavía no hay lecturas de cámara registradas.
                </td>
              </tr>
              <tr v-for="lectura in lecturas" :key="lectura.id" class="hover:bg-asphalt-50">
                <td class="px-4 py-3 font-mono font-semibold tracking-wide text-asphalt-800">{{ lectura.patente }}</td>
                <td class="px-4 py-3 text-asphalt-600">{{ formatHora(lectura.horaEntrada) }}</td>
                <td class="px-4 py-3">
                  <span class="rounded-full bg-signal-50 px-2 py-0.5 text-xs font-medium text-signal-700">
                    Ingreso autorizado
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="lectura.estado === 'activa' ? 'bg-hazard-50 text-hazard-600' : 'bg-asphalt-100 text-asphalt-500'"
                  >
                    {{ lectura.estado === 'activa' ? 'Dentro' : 'Salió' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <div v-else class="space-y-2 rounded-xl border border-asphalt-200 bg-white p-6">
      <CommonFeatureLock class="rounded-lg px-3 py-2">Bitácora de lecturas de patente con cámara LPR</CommonFeatureLock>
      <CommonFeatureLock class="rounded-lg px-3 py-2">Ingreso automático sin intervención del operador</CommonFeatureLock>
    </div>
  </div>
</template>
