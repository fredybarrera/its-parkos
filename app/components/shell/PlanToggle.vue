<!--
  PlanToggle — control segmentado Gestión ↔ Control.

  Es la herramienta de venta central del demo: la ÚNICA forma de cambiar el
  plan activo. Lee el plan del store (vía useEntitlements para reactividad) y
  lo cambia con la acción setPlan. El cambio se refleja al instante en todo
  lo que consume useEntitlements (el sidebar, etc.).

  La pieza visual es deliberada: es un interruptor, no una pestaña. El riel
  se viste con la franja de una barrera de acceso cuando Control está
  activo, porque Control es, literalmente, el plan que prende la barrera.
-->
<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import type { PlanId } from '~/domain/types'
import { PLANS } from '~/domain/plans'

const store = usePlanStore()
const { plan } = useEntitlements()

const options = (Object.keys(PLANS) as PlanId[]).map((id) => ({
  id,
  name: PLANS[id].name,
}))

const esControl = computed(() => plan.value.id === 'control')

// El flip es el clímax de venta del demo: un destello marca el cambio. El
// color distingue la dirección, para que el ámbar quede asociado solo a
// "ahora estás en Control".
const recienCambiado = ref(false)
let ocultarTimeout: ReturnType<typeof setTimeout> | null = null

watch(
  () => plan.value.id,
  () => {
    recienCambiado.value = true
    if (ocultarTimeout) clearTimeout(ocultarTimeout)
    ocultarTimeout = setTimeout(() => {
      recienCambiado.value = false
    }, 700)
  },
)

onUnmounted(() => {
  if (ocultarTimeout) clearTimeout(ocultarTimeout)
})

function claseEtiqueta(id: PlanId): string {
  const activo = plan.value.id === id
  if (id === 'control') {
    return activo
      ? 'text-white [text-shadow:0_1px_2px_rgb(0_0_0_/_70%)]'
      : 'text-asphalt-400 hover:text-hazard-400'
  }
  return activo ? 'text-asphalt-900' : 'text-asphalt-400 hover:text-white'
}

const franjaStyle = {
  backgroundImage:
    'repeating-linear-gradient(135deg, #EFB91E 0px, #EFB91E 8px, #2E2922 8px, #2E2922 16px)',
}
</script>

<template>
  <div
    role="tablist"
    aria-label="Plan activo"
    class="relative inline-flex items-center rounded-full bg-asphalt-800 p-1 shadow-[inset_0_1px_3px_rgb(0_0_0_/_40%)] ring-offset-2 ring-offset-asphalt-900 transition-shadow duration-300"
    :class="recienCambiado ? (esControl ? 'ring-2 ring-hazard-400' : 'ring-2 ring-asphalt-400') : ''"
  >
    <!-- Riel deslizante: blanco en Gestión, franja de barrera en Control -->
    <span
      class="absolute inset-y-1 w-24 rounded-full transition-all duration-300 ease-[cubic-bezier(.34,1.56,.64,1)]"
      :class="esControl ? 'left-1/2 shadow-[0_0_14px_rgb(214_154_0_/_55%)]' : 'left-1 bg-white'"
      :style="esControl ? franjaStyle : undefined"
    />

    <button
      v-for="opt in options"
      :key="opt.id"
      type="button"
      role="tab"
      :aria-selected="plan.id === opt.id"
      class="relative z-10 w-24 rounded-full py-1.5 font-display text-sm font-medium uppercase tracking-wide transition-colors duration-150"
      :class="claseEtiqueta(opt.id)"
      @click="store.setPlan(opt.id)"
    >
      {{ opt.name }}
    </button>
  </div>
</template>
