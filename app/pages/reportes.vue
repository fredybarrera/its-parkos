<!--
  Reportes — básico en ambos planes (reports.basic), avanzado solo Control
  (reports.advanced). Lo avanzado reutiliza datos reales que ya expone
  useParkingData (getPlazas, getSesiones) en vez de inventar métricas: la
  ocupación "por sector" agrupa las mismas plazas que pinta PlazasGrid, y
  la comparativa de ingresos agrupa las sesiones cerradas por origen.
  Todo el gating se decide con has(), nunca con el id de plan.
-->
<script setup lang="ts">
import { computed } from 'vue'

const { has } = useEntitlements()
const { getReporteDia, getPlazas, getSesiones } = useParkingData()

const reporte = computed(() => getReporteDia())

const ocupacionPorSector = computed(() => {
  const grupos = new Map<string, { ocupadas: number; total: number }>()
  for (const plaza of getPlazas()) {
    const sector = plaza.codigo[0] ?? '?'
    const grupo = grupos.get(sector) ?? { ocupadas: 0, total: 0 }
    grupo.total += 1
    if (plaza.estado === 'ocupada') grupo.ocupadas += 1
    grupos.set(sector, grupo)
  }
  return [...grupos.entries()]
    .map(([sector, g]) => ({ sector, ...g, porcentaje: Math.round((g.ocupadas / g.total) * 100) }))
    .sort((a, b) => a.sector.localeCompare(b.sector))
})

const comparativaOrigen = computed(() => {
  const resumen = {
    manual: { cantidad: 0, ingresos: 0 },
    lpr: { cantidad: 0, ingresos: 0 },
  }
  for (const sesion of getSesiones().filter((s) => s.estado === 'cerrada')) {
    resumen[sesion.origen].cantidad += 1
    resumen[sesion.origen].ingresos += sesion.monto ?? 0
  }
  return resumen
})
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="font-display text-2xl font-semibold uppercase tracking-wide text-asphalt-900">Reportes</h1>
      <p class="mt-1 text-sm text-asphalt-500">Resumen de la operación del día.</p>
    </div>

    <section v-if="has('reports.basic')" class="space-y-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ReportesMetricCard variant="primary" label="Ingresos del día" :value="formatCLP(reporte.ingresosTotales)" />
        <ReportesMetricCard label="Vehículos atendidos" :value="String(reporte.vehiculosAtendidos)" />
        <ReportesMetricCard label="Rotación" :value="`${reporte.rotacion}x`" hint="Sesiones por plaza" />
        <ReportesMetricCard label="Ocupación promedio" :value="`${reporte.ocupacionPromedio}%`" />
      </div>

      <div class="rounded-xl border border-asphalt-200 bg-white p-6">
        <h2 class="text-sm font-semibold text-asphalt-700">Horas punta</h2>
        <div class="mt-4">
          <ReportesHorasPicoChart :horas-pico="reporte.horasPico" />
        </div>
      </div>
    </section>

    <section class="space-y-4">
      <div>
        <h2 class="text-lg font-bold text-asphalt-800">Reportes avanzados</h2>
        <p class="mt-1 text-sm text-asphalt-500">Métricas adicionales para una visión completa de la operación.</p>
      </div>

      <div v-if="has('reports.advanced')" class="grid gap-4 lg:grid-cols-2">
        <div class="rounded-xl border border-asphalt-200 bg-white p-6">
          <h3 class="text-sm font-semibold text-asphalt-700">Ocupación por sector</h3>
          <div class="mt-4 space-y-3">
            <div v-for="s in ocupacionPorSector" :key="s.sector" class="flex items-center gap-3">
              <span class="w-16 shrink-0 text-xs font-medium text-asphalt-500">Sector {{ s.sector }}</span>
              <div class="h-2.5 flex-1 rounded-full bg-asphalt-100">
                <div class="h-2.5 rounded-full bg-signal-500" :style="{ width: `${s.porcentaje}%` }" />
              </div>
              <span class="w-16 shrink-0 text-right text-xs font-medium text-asphalt-700">{{ s.ocupadas }}/{{ s.total }}</span>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-asphalt-200 bg-white p-6">
          <h3 class="text-sm font-semibold text-asphalt-700">Ingresos por origen</h3>
          <div class="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-asphalt-500">Manual</p>
              <p class="mt-1 font-mono text-lg font-bold text-asphalt-800">{{ formatCLP(comparativaOrigen.manual.ingresos) }}</p>
              <p class="text-xs text-asphalt-400">{{ comparativaOrigen.manual.cantidad }} sesiones cerradas</p>
            </div>
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-asphalt-500">LPR</p>
              <p class="mt-1 font-mono text-lg font-bold text-asphalt-800">{{ formatCLP(comparativaOrigen.lpr.ingresos) }}</p>
              <p class="text-xs text-asphalt-400">{{ comparativaOrigen.lpr.cantidad }} sesiones cerradas</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="space-y-2 rounded-xl border border-asphalt-200 bg-white p-6">
        <CommonFeatureLock class="rounded-lg px-3 py-2">Ocupación por sector en tiempo real</CommonFeatureLock>
        <CommonFeatureLock class="rounded-lg px-3 py-2">Comparativa de ingresos por origen de ingreso</CommonFeatureLock>
        <CommonFeatureLock class="rounded-lg px-3 py-2">Tendencias de ocupación y rotación</CommonFeatureLock>
      </div>
    </section>
  </div>
</template>
