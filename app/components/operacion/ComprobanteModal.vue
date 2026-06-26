<!--
  ComprobanteModal — recibo de salida.

  Solo formatea lo que ya viene resuelto: el monto y el tiempo total los
  calculó domain/billing dentro de registrarSalida (Etapa 3). Esta capa no
  recalcula nada.
-->
<script setup lang="ts">
import type { Comprobante } from '~/domain/types'

defineProps<{
  comprobante: Comprobante
  horaEntrada: string
  pendiente?: boolean
}>()

defineEmits<{ cerrar: []; confirmar: [] }>()

function formatHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

function formatMonto(monto: number): string {
  return monto.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
}

function formatTiempo(minutos: number): string {
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  return horas > 0 ? `${horas}h ${resto}m` : `${resto}m`
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-asphalt-900/40 px-4">
    <div class="w-full max-w-xs rounded-lg bg-white shadow-xl">
      <div class="px-6 pt-6">
        <div class="flex items-center gap-2">
          <div
            class="flex h-9 w-9 items-center justify-center rounded-full"
            :class="pendiente ? 'bg-hazard-50 text-hazard-600' : 'bg-signal-50 text-signal-600'"
          >
            <!-- Ícono de cobro pendiente -->
            <svg
              v-if="pendiente"
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            <!-- Ícono de salida confirmada -->
            <svg
              v-else
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-asphalt-800">
              {{ pendiente ? 'Monto a cobrar' : 'Salida registrada' }}
            </h2>
            <p class="font-mono text-[11px] uppercase tracking-wide text-asphalt-400">
              {{ pendiente ? comprobante.patente : `Boleta · ${comprobante.id.slice(-6)}` }}
            </p>
          </div>
        </div>
      </div>

      <div class="my-4 border-t border-dashed border-asphalt-200" />

      <dl class="space-y-2 px-6 font-mono text-sm">
        <div class="flex justify-between">
          <dt class="text-asphalt-500">Patente</dt>
          <dd class="font-semibold tracking-wide text-asphalt-800">{{ comprobante.patente }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-asphalt-500">Entrada</dt>
          <dd class="text-asphalt-700">{{ formatHora(horaEntrada) }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-asphalt-500">Salida</dt>
          <dd class="text-asphalt-700">{{ formatHora(comprobante.fecha) }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-asphalt-500">Tiempo total</dt>
          <dd class="text-asphalt-700">{{ formatTiempo(comprobante.tiempoTotalMinutos) }}</dd>
        </div>
        <div class="flex justify-between border-t border-asphalt-100 pt-2 text-base">
          <dt class="font-sans font-medium text-asphalt-600">Monto a pagar</dt>
          <dd class="font-bold text-signal-700">{{ formatMonto(comprobante.monto) }}</dd>
        </div>
      </dl>

      <div class="px-6 pb-6 pt-5">
        <div v-if="pendiente" class="flex flex-col gap-2">
          <button
            type="button"
            class="flex-1 rounded-lg border border-asphalt-300 px-4 py-2 text-sm font-medium text-asphalt-700 transition-colors hover:bg-asphalt-100"
            @click="$emit('cerrar')"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="flex-1 rounded-lg bg-signal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-signal-700"
            @click="$emit('confirmar')"
          >
            Confirmar cobro
          </button>
        </div>
        <button
          v-else
          type="button"
          class="w-full rounded-lg bg-signal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-signal-700"
          @click="$emit('cerrar')"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>
