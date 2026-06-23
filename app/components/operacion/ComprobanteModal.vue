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
}>()

defineEmits<{ cerrar: [] }>()

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
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
    <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
      <div class="mb-4 flex items-center gap-2">
        <div class="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <svg
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
        <h2 class="text-lg font-semibold text-slate-800">Salida registrada</h2>
      </div>

      <dl class="space-y-2 text-sm">
        <div class="flex justify-between">
          <dt class="text-slate-500">Patente</dt>
          <dd class="font-semibold tracking-wide text-slate-800">{{ comprobante.patente }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-slate-500">Entrada</dt>
          <dd class="text-slate-700">{{ formatHora(horaEntrada) }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-slate-500">Salida</dt>
          <dd class="text-slate-700">{{ formatHora(comprobante.fecha) }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-slate-500">Tiempo total</dt>
          <dd class="text-slate-700">{{ formatTiempo(comprobante.tiempoTotalMinutos) }}</dd>
        </div>
        <div class="flex justify-between border-t border-slate-100 pt-2 text-base">
          <dt class="font-medium text-slate-600">Monto a pagar</dt>
          <dd class="font-bold text-emerald-700">{{ formatMonto(comprobante.monto) }}</dd>
        </div>
      </dl>

      <button
        type="button"
        class="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        @click="$emit('cerrar')"
      >
        Cerrar
      </button>
    </div>
  </div>
</template>
