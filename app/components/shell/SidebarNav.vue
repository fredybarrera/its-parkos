<!--
  SidebarNav — navegación lateral del shell.

  Cada ítem es data y declara, si aplica, qué funcionalidad requiere. El
  gating se decide SIEMPRE con useEntitlements().has(code): nunca con un
  `if (plan === 'control')` ni con listas por plan. Los ítems sin requisito
  son núcleo y siempre se ven. Los ítems con requisito no contratado NO se
  ocultan: se muestran atenuados con candado (FeatureLock) porque el candado
  vende.
-->
<script setup lang="ts">
import type { ToggleCode } from '~/domain/types'

interface NavItem {
  label: string
  to: string
  /** Funcionalidad necesaria. Sin requisito = núcleo, siempre visible. */
  requires?: ToggleCode
}

// Núcleo: visible y navegable en ambos planes.
const coreItems: NavItem[] = [
  { label: 'Operación en vivo', to: '/operacion' },
  { label: 'Mapa de estacionamientos', to: '/plazas' },
  { label: 'Tarifas', to: '/tarifas' },
  { label: 'Abonados', to: '/abonados' },
  { label: 'Reportes', to: '/reportes' },
]

// Funcionalidades que el plan puede o no incluir.
const gatedItems: NavItem[] = [
  { label: 'Lectura de patente', to: '/lpr', requires: 'lpr.camera' },
  { label: 'Sensores', to: '/sensores', requires: 'occupancy.sensors' },
  { label: 'Barreras', to: '/barreras', requires: 'access.barrier' },
]

const emit = defineEmits<{ navigate: [] }>()

const { has } = useEntitlements()
const route = useRoute()
const { candadosResaltados } = useDemoSpotlight()

/** Un ítem está desbloqueado si es núcleo o si el plan tiene su funcionalidad. */
function isUnlocked(item: NavItem): boolean {
  return !item.requires || has(item.requires)
}

function isActive(item: NavItem): boolean {
  return route.path === item.to
}
</script>

<template>
  <nav class="flex flex-col gap-1 p-3">
    <!-- Núcleo -->
    <NuxtLink
      v-for="item in coreItems"
      :key="item.to"
      :to="item.to"
      class="rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-colors"
      :class="
        isActive(item)
          ? 'border-signal-600 bg-signal-50 text-signal-700'
          : 'border-transparent text-asphalt-600 hover:bg-asphalt-100 hover:text-asphalt-900'
      "
      @click="emit('navigate')"
    >
      {{ item.label }}
    </NuxtLink>

    <div class="my-2 flex items-center gap-2">
      <hr class="flex-1 border-asphalt-200" />
      <span class="text-[10px] font-semibold uppercase tracking-widest text-asphalt-400">Funcionalidades</span>
      <hr class="flex-1 border-asphalt-200" />
    </div>

    <!-- Gated: navegable si está desbloqueado, con candado si no -->
    <template v-for="item in gatedItems" :key="item.to">
      <NuxtLink
        v-if="isUnlocked(item)"
        :to="item.to"
        class="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        :class="
          isActive(item)
            ? 'border-l-2 border-signal-600 bg-signal-50 text-signal-700'
            : 'border-l-2 border-transparent text-asphalt-600 hover:bg-asphalt-100 hover:text-asphalt-900'
        "
        @click="emit('navigate')"
      >
        {{ item.label }}
      </NuxtLink>

      <CommonFeatureLock
        v-else
        class="rounded-lg px-3 py-2 transition-shadow duration-500"
        :class="candadosResaltados ? 'ring-2 ring-hazard-400 ring-offset-2 ring-offset-white' : ''"
      >
        {{ item.label }}
      </CommonFeatureLock>
    </template>
  </nav>
</template>
