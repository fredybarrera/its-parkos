<!--
  TopBar — barra superior permanente del shell.

  Es la cubierta de control: asfalto oscuro, no el blanco genérico de
  cualquier panel admin. Logo a la izquierda, PlanToggle al centro
  (herramienta de venta), y un usuario decorativo a la derecha (sin auth
  real, solo apariencia).
-->
<template>
  <header
    class="flex h-16 shrink-0 items-center justify-between bg-asphalt-900 px-6 text-white"
  >
    <!-- Logo / marca -->
    <div class="flex items-center gap-2.5">
      <div
        class="flex h-8 w-8 items-center justify-center rounded-md bg-signal-500 font-display text-lg font-bold text-asphalt-900"
      >
        P
      </div>
      <span class="font-display text-lg font-semibold uppercase tracking-wide text-white">
        ParkOS
      </span>
    </div>

    <!-- Toggle de plan (centro) -->
    <ShellPlanToggle />

    <!-- Usuario decorativo (sin auth real) -->
    <div class="flex items-center gap-3">
      <ShellDemoControls />
      <div class="h-6 w-px bg-asphalt-700" />
      <div class="hidden text-right sm:block">
        <p class="text-sm font-medium leading-tight text-asphalt-100">Carla Méndez</p>
        <p class="text-xs leading-tight text-asphalt-400">Operadora</p>
      </div>
      <div
        class="flex h-9 w-9 items-center justify-center rounded-full bg-asphalt-700 text-sm font-semibold text-white"
      >
        CM
      </div>
    </div>
  </header>
</template>
