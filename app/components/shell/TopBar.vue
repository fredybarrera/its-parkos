<!--
  TopBar — barra superior permanente del shell.

  Logo a la izquierda, PlanToggle al centro (herramienta de venta), y un
  usuario decorativo a la derecha (sin auth real, solo apariencia).
-->
<template>
  <header
    class="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6"
  >
    <!-- Logo / marca -->
    <div class="flex items-center gap-2">
      <div
        class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 font-bold text-white"
      >
        P
      </div>
      <span class="text-lg font-semibold tracking-tight text-slate-800">ParkOS</span>
    </div>

    <!-- Toggle de plan (centro) -->
    <ShellPlanToggle />

    <!-- Usuario decorativo (sin auth real) -->
    <div class="flex items-center gap-3">
      <div class="hidden text-right sm:block">
        <p class="text-sm font-medium leading-tight text-slate-700">Carla Méndez</p>
        <p class="text-xs leading-tight text-slate-400">Operadora</p>
      </div>
      <div
        class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600"
      >
        CM
      </div>
    </div>
  </header>
</template>
