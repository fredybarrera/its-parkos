<!--
  TicketBarcode — modal con el ticket de entrada imprimible.

  Recibe una sesión con ticketCode y muestra un recibo térmico de 58 mm
  con código de barras CODE128 (JsBarcode). Se carga solo en cliente para
  no romper el SSR. El botón Imprimir usa window.print() con CSS de impresión
  que oculta todo excepto el área del ticket.
-->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Sesion } from '~/domain/types'

const props = defineProps<{ sesion: Sesion }>()
defineEmits<{ cerrar: [] }>()

const svgRef = ref<SVGElement | null>(null)
const barcodeGenerado = ref(false)

onMounted(async () => {
  if (!svgRef.value || !props.sesion.ticketCode) return
  const JsBarcode = (await import('jsbarcode')).default
  JsBarcode(svgRef.value, props.sesion.ticketCode, {
    format: 'CODE128',
    width: 2,
    height: 56,
    displayValue: false,
    margin: 0,
    background: '#ffffff',
    lineColor: '#000000',
  })
  barcodeGenerado.value = true
})

function formatHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function imprimir() {
  window.print()
}
</script>

<template>
  <div class="ticket-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-asphalt-900/60 px-4">
    <!-- Ticket area (58mm térmico) -->
    <div class="flex flex-col items-center gap-4">

      <!-- El papelito -->
      <div
        id="ticket-print-area"
        class="ticket-print-area w-[220px] bg-white font-mono shadow-2xl"
        style="border-radius: 2px;"
      >
        <!-- Encabezado -->
        <div class="px-4 pt-5 text-center">
          <div class="text-[10px] font-bold uppercase tracking-[0.2em] text-asphalt-400">
            ParkOS
          </div>
          <div class="mt-0.5 text-[13px] font-bold uppercase tracking-wider text-asphalt-900">
            Estacionamiento
          </div>
          <div class="mt-0.5 text-[9px] text-asphalt-400">
            Ticket de entrada
          </div>
        </div>

        <!-- Separador -->
        <div class="mx-4 my-3 border-t border-dashed border-asphalt-300" />

        <!-- Datos del vehículo -->
        <div class="px-4 pb-1 text-[10px] text-asphalt-500">
          <div class="flex items-baseline justify-between">
            <span>PATENTE</span>
            <span class="text-[13px] font-bold tracking-widest text-asphalt-900">
              {{ sesion.patente }}
            </span>
          </div>
          <div class="mt-1.5 flex items-baseline justify-between">
            <span>FECHA</span>
            <span class="text-asphalt-700">{{ formatFecha(sesion.horaEntrada) }}</span>
          </div>
          <div class="mt-1 flex items-baseline justify-between">
            <span>HORA ENTRADA</span>
            <span class="text-asphalt-700">{{ formatHora(sesion.horaEntrada) }}</span>
          </div>
        </div>

        <!-- Separador -->
        <div class="mx-4 my-3 border-t border-dashed border-asphalt-300" />

        <!-- Código de barras -->
        <div class="px-3 pb-1">
          <svg
            ref="svgRef"
            class="w-full"
            :class="barcodeGenerado ? 'opacity-100' : 'opacity-0'"
            aria-label="Código de barras del ticket"
          />
          <!-- Fallback skeleton mientras carga -->
          <div
            v-if="!barcodeGenerado"
            class="h-14 w-full animate-pulse rounded bg-asphalt-100"
          />
        </div>

        <!-- Código en texto -->
        <div class="pb-4 text-center text-[9px] tracking-[0.15em] text-asphalt-500">
          {{ sesion.ticketCode }}
        </div>

        <!-- Footer -->
        <div class="border-t border-dashed border-asphalt-200 px-4 py-3 text-center text-[8px] text-asphalt-400">
          Conserve este ticket hasta su salida.<br>
          Sin ticket, tarifa máxima.
        </div>
      </div>

      <!-- Botones (fuera del área imprimible) -->
      <div class="ticket-actions flex gap-2">
        <button
          type="button"
          class="rounded-lg bg-asphalt-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-asphalt-700"
          @click="imprimir"
        >
          Imprimir
        </button>
        <button
          type="button"
          class="rounded-lg border border-asphalt-300 bg-white px-4 py-2 text-sm font-medium text-asphalt-700 transition-colors hover:bg-asphalt-50"
          @click="$emit('cerrar')"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<style>
@media print {
  .ticket-modal-overlay {
    position: static !important;
    background: none !important;
    display: block !important;
    padding: 0 !important;
  }

  .ticket-modal-overlay > div {
    display: block !important;
  }

  .ticket-print-area {
    width: 58mm !important;
    margin: 0 auto !important;
    box-shadow: none !important;
  }

  .ticket-actions {
    display: none !important;
  }

  /* Ocultar todo lo que no sea el modal del ticket */
  body > *:not(#__nuxt) {
    display: none !important;
  }
}
</style>
