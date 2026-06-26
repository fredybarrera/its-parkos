<!--
  FeatureLock — estado "incluido pero no contratado".

  Componente genérico y presentacional: atenúa el contenido que envuelve,
  muestra un candado y un texto que invita a subir de plan. NO sabe nada de
  entitlements; quien lo usa decide CUÁNDO mostrarlo. Así sirve tanto en el
  sidebar como en pantallas futuras (botones, secciones, etc.).
-->
<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Texto que explica cómo desbloquear la funcionalidad. */
    message?: string
  }>(),
  {
    message: 'Disponible en plan Control',
  },
)
</script>

<template>
  <div class="group cursor-pointer select-none opacity-60 transition-opacity duration-150 hover:opacity-90" :title="message">
    <div class="flex items-center justify-between gap-2">
      <span class="min-w-0 flex-1 truncate"><slot /></span>
      <svg
        class="h-4 w-4 shrink-0 text-asphalt-400 transition-colors duration-150 group-hover:text-hazard-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
    </div>
    <p class="mt-0.5 text-xs text-asphalt-400 transition-colors duration-150 group-hover:text-hazard-600">
      <span class="group-hover:hidden">{{ message }}</span>
      <span class="hidden group-hover:inline">Subir a plan Control →</span>
    </p>
  </div>
</template>
