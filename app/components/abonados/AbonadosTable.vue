<!--
  AbonadosTable — lista de abonados. PRESENTACIONAL: pinta lo que recibe
  por props y nada más. No conoce límites de plan ni entitlements.
-->
<script setup lang="ts">
import type { Abonado } from '~/domain/types'

defineProps<{ abonados: Abonado[] }>()
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-asphalt-200 bg-white">
    <div class="max-h-[32rem] overflow-auto">
      <table class="w-full text-left text-sm">
        <thead class="sticky top-0 bg-asphalt-50 text-xs uppercase tracking-wide text-asphalt-500">
          <tr>
            <th class="px-4 py-3 font-medium">Nombre</th>
            <th class="px-4 py-3 font-medium">Patente</th>
            <th class="px-4 py-3 font-medium">Estado</th>
            <th class="px-4 py-3 font-medium">Vigente hasta</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-asphalt-100">
          <tr v-if="abonados.length === 0">
            <td colspan="4" class="px-4 py-6 text-center text-asphalt-400">
              No hay abonados registrados.
            </td>
          </tr>
          <tr v-for="abonado in abonados" :key="abonado.id" class="hover:bg-asphalt-50">
            <td class="px-4 py-3 text-asphalt-800">{{ abonado.nombre }}</td>
            <td class="px-4 py-3 font-mono font-semibold tracking-wide text-asphalt-700">{{ abonado.patente }}</td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2 py-0.5 text-xs font-medium"
                :class="abonado.estado === 'activo' ? 'bg-signal-50 text-signal-700' : 'bg-asphalt-100 text-asphalt-500'"
              >
                {{ abonado.estado === 'activo' ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="px-4 py-3 text-asphalt-600">{{ formatFecha(abonado.vigenteHasta) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
