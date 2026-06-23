<!--
  PlazasGrid — grilla visual de plazas. PRESENTACIONAL: pinta lo que recibe
  por props y nada más. No sabe qué plan está activo ni quién la actualiza
  (Operación registrando ingresos/salidas, o sensores simulados): solo
  detecta que el estado de una plaza cambió entre un render y el siguiente,
  y la resalta brevemente. Por eso sirve igual para Gestión y Control.
-->
<script setup lang="ts">
import { onUnmounted, reactive, watch } from 'vue'
import type { Plaza } from '~/domain/types'

const props = defineProps<{ plazas: Plaza[] }>()

const resaltadas = reactive(new Set<string>())
const timeouts = new Map<string, ReturnType<typeof setTimeout>>()
const estadoPrevio = new Map<string, Plaza['estado']>()

function resaltar(plazaId: string) {
  resaltadas.add(plazaId)
  const previo = timeouts.get(plazaId)
  if (previo) clearTimeout(previo)
  timeouts.set(
    plazaId,
    setTimeout(() => {
      resaltadas.delete(plazaId)
      timeouts.delete(plazaId)
    }, 1200),
  )
}

watch(
  () => props.plazas.map((p) => ({ id: p.id, estado: p.estado })),
  (actual) => {
    for (const { id, estado } of actual) {
      const prev = estadoPrevio.get(id)
      if (prev !== undefined && prev !== estado) {
        resaltar(id)
      }
      estadoPrevio.set(id, estado)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  for (const t of timeouts.values()) clearTimeout(t)
})
</script>

<template>
  <div class="space-y-3">
    <div
      class="grid gap-2"
      style="grid-template-columns: repeat(auto-fill, minmax(4.5rem, 1fr));"
    >
      <div
        v-for="plaza in plazas"
        :key="plaza.id"
        class="flex aspect-square flex-col items-center justify-center rounded-lg border font-mono text-sm font-semibold transition-all duration-300"
        :class="[
          plaza.estado === 'libre'
            ? 'border-signal-200 bg-signal-50 text-signal-700'
            : 'border-brake-200 bg-brake-50 text-brake-700',
          resaltadas.has(plaza.id) ? 'scale-110 ring-2 ring-hazard-400' : 'scale-100',
        ]"
      >
        {{ plaza.codigo }}
      </div>
    </div>

    <div class="flex items-center gap-4 text-xs text-asphalt-500">
      <span class="flex items-center gap-1.5">
        <span class="h-3 w-3 rounded-sm border border-signal-200 bg-signal-50" />
        Libre
      </span>
      <span class="flex items-center gap-1.5">
        <span class="h-3 w-3 rounded-sm border border-brake-200 bg-brake-50" />
        Ocupada
      </span>
    </div>
  </div>
</template>
