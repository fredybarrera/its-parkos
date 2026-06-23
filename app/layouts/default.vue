<!--
  default — el shell permanente que envuelve todas las páginas.
  TopBar arriba, SidebarNav a la izquierda, contenido (slot) a la derecha.

  El sidebar es estático desde lg: y un drawer (overlay + backdrop) por
  debajo de lg:, controlado por useSidebar(). Se conecta con
  useDemoSpotlight() para que el recorrido guiado siga siendo visible en
  móvil: si resalta los candados del sidebar con el drawer cerrado, lo abre.

  También arranca useSensoresSimulados() acá (no en pages/plazas.vue): son
  "sensores que están prendidos" según el plan activo, no algo que dependa
  de qué pantalla esté mirando el operador.
-->
<script setup lang="ts">
import { watch } from 'vue'

const { abierto, cerrar } = useSidebar()
const { candadosResaltados } = useDemoSpotlight()
useSensoresSimulados()

watch(candadosResaltados, (activo) => {
  if (activo) abierto.value = true
})

watch(abierto, (valor) => {
  if (!valor) return
  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') cerrar()
  }
  window.addEventListener('keydown', onKeydown, { once: true })
})
</script>

<template>
  <div class="flex h-screen flex-col bg-asphalt-50 text-asphalt-900">
    <ShellTopBar />
    <ShellDemoBanner />
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar estático (desktop) -->
      <aside class="hidden w-64 shrink-0 overflow-y-auto border-r border-asphalt-200 bg-white lg:block">
        <ShellSidebarNav />
      </aside>

      <!-- Drawer móvil -->
      <Transition
        enter-active-class="transition-opacity duration-200 ease-out"
        leave-active-class="transition-opacity duration-150 ease-in"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div v-if="abierto" class="fixed inset-0 z-40 lg:hidden">
          <div class="absolute inset-0 bg-asphalt-900/40" @click="cerrar" />
          <Transition
            enter-active-class="transition-transform duration-200 ease-out"
            leave-active-class="transition-transform duration-150 ease-in"
            enter-from-class="-translate-x-full"
            leave-to-class="-translate-x-full"
            appear
          >
            <aside class="relative h-full w-64 max-w-[80vw] overflow-y-auto bg-white shadow-xl">
              <ShellSidebarNav @navigate="cerrar" />
            </aside>
          </Transition>
        </div>
      </Transition>

      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
