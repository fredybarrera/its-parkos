<!--
  Barreras — bitácora real de aperturas automáticas. Cada sesión con
  origen 'lpr' implica que la barrera se levantó (ver
  OperacionAccesoAutomaticoPanel): esta pantalla es el registro de
  auditoría de esas mismas aperturas, vistas desde el lado de la barrera
  en vez del lado de la cámara (que se ve en /lpr). No es un mock paralelo.
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { Sesion } from '~/domain/types'

const { has } = useEntitlements()
const { getSesiones } = useParkingData()

const aperturas = computed<Sesion[]>(() =>
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
      <h1 class="font-display text-2xl font-semibold uppercase tracking-wide text-asphalt-900">Barreras</h1>
      <p v-if="has('access.barrier')" class="flex items-center gap-1.5 text-xs text-asphalt-500">
        <span class="h-2 w-2 rounded-full bg-signal-500" />
        Barrera operativa
      </p>
    </div>

    <template v-if="has('access.barrier')">
      <div class="overflow-hidden rounded-xl border border-asphalt-200 bg-white">
        <div class="border-b border-asphalt-200 px-4 py-3">
          <h2 class="text-sm font-semibold text-asphalt-800">Bitácora de aperturas</h2>
          <p class="text-xs text-asphalt-500">Cada apertura automática disparada por una lectura LPR válida.</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-asphalt-50 text-xs uppercase tracking-wide text-asphalt-500">
              <tr>
                <th class="px-4 py-3 font-medium">Hora</th>
                <th class="px-4 py-3 font-medium">Patente</th>
                <th class="px-4 py-3 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-asphalt-100">
              <tr v-if="aperturas.length === 0">
                <td colspan="3" class="px-4 py-6 text-center text-asphalt-400">
                  Todavía no hay aperturas automáticas registradas.
                </td>
              </tr>
              <tr v-for="apertura in aperturas" :key="apertura.id" class="hover:bg-asphalt-50">
                <td class="px-4 py-3 font-mono text-asphalt-600">{{ formatHora(apertura.horaEntrada) }}</td>
                <td class="px-4 py-3 font-mono font-semibold tracking-wide text-asphalt-800">{{ apertura.patente }}</td>
                <td class="px-4 py-3">
                  <span class="rounded-full bg-hazard-50 px-2 py-0.5 text-xs font-medium text-hazard-600">
                    Barrera abierta
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <div v-else class="space-y-2 rounded-xl border border-asphalt-200 bg-white p-6">
      <CommonFeatureLock class="rounded-lg px-3 py-2">Apertura automática de barrera con lectura LPR</CommonFeatureLock>
      <CommonFeatureLock class="rounded-lg px-3 py-2">Bitácora de aperturas para auditoría</CommonFeatureLock>
    </div>
  </div>
</template>
