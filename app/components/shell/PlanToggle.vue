<!--
  PlanToggle — control segmentado Gestión ↔ Control.

  Es la herramienta de venta central del demo: la ÚNICA forma de cambiar el
  plan activo. Lee el plan del store (vía useEntitlements para reactividad) y
  lo cambia con la acción setPlan. El cambio se refleja al instante en todo
  lo que consume useEntitlements (el sidebar, etc.).
-->
<script setup lang="ts">
import type { PlanId } from '~/domain/types'
import { PLANS } from '~/domain/plans'

const store = usePlanStore()
const { plan } = useEntitlements()

// Opciones derivadas del catálogo de planes, no hardcodeadas.
const options = (Object.keys(PLANS) as PlanId[]).map((id) => ({
  id,
  name: PLANS[id].name,
}))
</script>

<template>
  <div
    role="tablist"
    aria-label="Plan activo"
    class="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1"
  >
    <button
      v-for="opt in options"
      :key="opt.id"
      type="button"
      role="tab"
      :aria-selected="plan.id === opt.id"
      class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150"
      :class="
        plan.id === opt.id
          ? 'bg-white text-emerald-700 shadow-sm'
          : 'text-slate-500 hover:text-slate-700'
      "
      @click="store.setPlan(opt.id)"
    >
      {{ opt.name }}
    </button>
  </div>
</template>
