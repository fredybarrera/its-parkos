<!--
  Abonados — el cruce clave de la Etapa 6: el límite de abonados es un
  argumento de venta vivo. El tope SIEMPRE sale de
  getLimit('subscribers.manage') / isUnlimited(...), nunca de un número
  fijo ni del id de plan. Cuando el plan activo está al tope, el alta se
  bloquea en la UI (el store siempre agrega; el guardia vive aquí) y se
  muestra con CommonFeatureLock, el mismo lenguaje visual que el sidebar
  usa para funcionalidades no contratadas.
-->
<script setup lang="ts">
import { computed } from 'vue'
import type { Abonado } from '~/domain/types'

const { getLimit, isUnlimited } = useEntitlements()
const { getAbonados, agregarAbonado } = useParkingData()

const abonados = computed<Abonado[]>(() => getAbonados())
const total = computed(() => abonados.value.length)

const limite = computed(() => getLimit('subscribers.manage'))
const ilimitado = computed(() => isUnlimited('subscribers.manage'))
const enElLimite = computed(() => !ilimitado.value && total.value >= limite.value)

const porcentajeUso = computed(() => {
  if (ilimitado.value) return 0
  return Math.min(100, Math.round((total.value / limite.value) * 100))
})

const mensajeLimite = computed(
  () => `Alcanzaste el límite de ${limite.value} abonados de tu plan. Pasa a Control para gestionar abonados ilimitados.`,
)

function onAgregar({ nombre, patente }: { nombre: string; patente: string }) {
  if (enElLimite.value) return
  const vigenteHasta = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  agregarAbonado({ nombre, patente, vigenteHasta })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="font-display text-2xl font-semibold uppercase tracking-wide text-asphalt-900">Abonados</h1>
        <p class="mt-1 text-sm text-asphalt-500">Clientes con convenio mensual.</p>
      </div>

      <div v-if="!ilimitado" class="text-right">
        <p class="text-sm font-medium" :class="enElLimite ? 'text-brake-600' : 'text-asphalt-600'">
          <span class="font-mono text-lg font-bold" :class="enElLimite ? 'text-brake-600' : 'text-asphalt-800'">{{ total }}</span>
          / {{ limite }} abonados
        </p>
        <div class="mt-1 h-1.5 w-36 rounded-full bg-asphalt-100">
          <div
            class="h-1.5 rounded-full transition-all duration-300"
            :class="enElLimite ? 'bg-brake-500' : 'bg-signal-500'"
            :style="{ width: `${porcentajeUso}%` }"
          />
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <p class="text-sm text-asphalt-500">
        {{ total }} {{ total === 1 ? 'abonado registrado' : 'abonados registrados' }}
      </p>

      <AbonadosAgregarAbonadoForm v-if="!enElLimite" @agregar="onAgregar" />

      <CommonFeatureLock
        v-else
        :message="mensajeLimite"
        class="rounded-lg border border-asphalt-200 bg-white px-4 py-2"
      >
        <span class="font-medium text-asphalt-500">Agregar abonado</span>
      </CommonFeatureLock>
    </div>

    <AbonadosTable :abonados="abonados" />
  </div>
</template>
