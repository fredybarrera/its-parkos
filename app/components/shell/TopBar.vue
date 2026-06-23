<!--
  TopBar — barra superior permanente del shell.

  Es la cubierta de control: asfalto oscuro, no el blanco genérico de
  cualquier panel admin. Hamburguesa (solo <lg, abre el drawer del sidebar) +
  logo a la izquierda, PlanToggle al centro (herramienta de venta), y un
  usuario decorativo a la derecha (sin auth real, solo apariencia).
-->
<script setup lang="ts">
const { toggle } = useSidebar()
</script>

<template>
  <header
    class="flex h-16 shrink-0 items-center justify-between gap-1 bg-asphalt-900 px-2 text-white sm:gap-3 sm:px-4 lg:px-6"
  >
    <!-- Hamburguesa (drawer del sidebar, solo móvil/tablet) -->
    <button
      type="button"
      class="-ml-1 rounded-md p-1.5 text-asphalt-300 transition-colors hover:bg-asphalt-800 hover:text-white lg:hidden"
      title="Abrir menú"
      @click="toggle"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>

    <!-- Logo / marca -->
    <div class="flex items-center gap-2.5">
      <div
        class="flex h-8 w-8 items-center justify-center rounded-md bg-signal-500 font-display text-lg font-bold text-asphalt-900"
      >
        P
      </div>
      <span class="hidden font-display text-lg font-semibold uppercase tracking-wide text-white sm:inline">
        ParkOS
      </span>
    </div>

    <!-- Toggle de plan (centro) -->
    <ShellPlanToggle />

    <!-- Usuario decorativo (sin auth real) -->
    <div class="flex items-center gap-1 sm:gap-3">
      <ShellDemoControls />
      <div class="hidden h-6 w-px bg-asphalt-700 sm:block" />
      <div class="hidden text-right sm:block">
        <p class="text-sm font-medium leading-tight text-asphalt-100">Carla Méndez</p>
        <p class="text-xs leading-tight text-asphalt-400">Operadora</p>
      </div>
      <div
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-asphalt-700 text-sm font-semibold text-white sm:h-9 sm:w-9"
      >
        CM
      </div>
    </div>
  </header>
</template>
