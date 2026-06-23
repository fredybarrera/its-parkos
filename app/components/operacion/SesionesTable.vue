<!--
  SesionesTable — sesiones activas, en vivo. Manual y LPR crean la misma
  sesión; la columna Origen (gated por lpr.camera) es la única diferencia
  visible entre Gestión y Control.
-->
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { Sesion } from '~/domain/types'

const emit = defineEmits<{ salida: [sesionId: string] }>()

const { has } = useEntitlements()
const { getSesiones } = useParkingData()

const mostrarOrigen = computed(() => has('lpr.camera'))

const sesionesActivas = computed<Sesion[]>(() =>
  getSesiones()
    .filter((s) => s.estado === 'activa')
    .sort((a, b) => new Date(a.horaEntrada).getTime() - new Date(b.horaEntrada).getTime()),
)

// Tick reactivo para que el tiempo transcurrido corra en vivo. Arranca solo
// en el cliente (immediate: false + onMounted): si corriera durante el SSR,
// el timestamp del render de servidor no coincidiría con el del cliente y
// Vue marcaría un hydration mismatch en cada celda de tiempo. Se limpia al
// desmontar para no dejar el intervalo corriendo fuera de esta pantalla.
const ahora = ref<number | null>(null)
const { pause, resume } = useIntervalFn(
  () => {
    ahora.value = Date.now()
  },
  1000,
  { immediate: false },
)
onMounted(() => {
  ahora.value = Date.now()
  resume()
})
onUnmounted(pause)

function tiempoTranscurrido(horaEntrada: string): string {
  if (ahora.value === null) return '—'
  const ms = ahora.value - new Date(horaEntrada).getTime()
  const totalMin = Math.max(0, Math.floor(ms / 60_000))
  const horas = Math.floor(totalMin / 60)
  const minutos = totalMin % 60
  if (horas > 0) return `${horas}h ${minutos}m`
  const segundos = Math.floor((Math.max(0, ms) % 60_000) / 1000)
  return `${minutos}m ${segundos.toString().padStart(2, '0')}s`
}

function formatHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

function origenLabel(origen: Sesion['origen']): string {
  return origen === 'lpr' ? 'LPR' : 'Manual'
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
    <table class="w-full text-left text-sm">
      <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th class="px-4 py-3 font-medium">Patente</th>
          <th class="px-4 py-3 font-medium">Hora de entrada</th>
          <th class="px-4 py-3 font-medium">Tiempo transcurrido</th>
          <th v-if="mostrarOrigen" class="px-4 py-3 font-medium">Origen</th>
          <th class="px-4 py-3 font-medium text-right">Acción</th>
        </tr>
      </thead>
      <TransitionGroup
        tag="tbody"
        class="divide-y divide-slate-100"
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        leave-active-class="transition-all duration-200 ease-in"
        leave-to-class="opacity-0"
        move-class="transition-transform duration-300 ease-out"
      >
        <tr v-if="sesionesActivas.length === 0" key="empty">
          <td :colspan="mostrarOrigen ? 5 : 4" class="px-4 py-6 text-center text-slate-400">
            No hay vehículos dentro del estacionamiento.
          </td>
        </tr>
        <tr v-for="sesion in sesionesActivas" :key="sesion.id" class="hover:bg-slate-50">
          <td class="px-4 py-3 font-semibold tracking-wide text-slate-800">{{ sesion.patente }}</td>
          <td class="px-4 py-3 text-slate-600">{{ formatHora(sesion.horaEntrada) }}</td>
          <td class="px-4 py-3 font-mono text-slate-700">{{ tiempoTranscurrido(sesion.horaEntrada) }}</td>
          <td v-if="mostrarOrigen" class="px-4 py-3">
            <span
              class="rounded-full px-2 py-0.5 text-xs font-medium"
              :class="sesion.origen === 'lpr' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'"
            >
              {{ origenLabel(sesion.origen) }}
            </span>
          </td>
          <td class="px-4 py-3 text-right">
            <button
              type="button"
              class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
              @click="emit('salida', sesion.id)"
            >
              Salida
            </button>
          </td>
        </tr>
      </TransitionGroup>
    </table>
  </div>
</template>
