<!--
  AbonadosTable — lista de abonados. PRESENTACIONAL: pinta lo que recibe
  por props y nada más. No conoce límites de plan ni entitlements.
-->
<script setup lang="ts">
import type { Abonado } from '~/domain/types'

defineProps<{ abonados: Abonado[] }>()
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
    <div class="max-h-[32rem] overflow-y-auto">
      <table class="w-full text-left text-sm">
        <thead class="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th class="px-4 py-3 font-medium">Nombre</th>
            <th class="px-4 py-3 font-medium">Patente</th>
            <th class="px-4 py-3 font-medium">Estado</th>
            <th class="px-4 py-3 font-medium">Vigente hasta</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="abonados.length === 0">
            <td colspan="4" class="px-4 py-6 text-center text-slate-400">
              No hay abonados registrados.
            </td>
          </tr>
          <tr v-for="abonado in abonados" :key="abonado.id" class="hover:bg-slate-50">
            <td class="px-4 py-3 text-slate-800">{{ abonado.nombre }}</td>
            <td class="px-4 py-3 font-semibold tracking-wide text-slate-700">{{ abonado.patente }}</td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2 py-0.5 text-xs font-medium"
                :class="abonado.estado === 'activo' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
              >
                {{ abonado.estado === 'activo' ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="px-4 py-3 text-slate-600">{{ formatFecha(abonado.vigenteHasta) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
