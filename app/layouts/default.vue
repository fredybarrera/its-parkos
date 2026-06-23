<!--
  default — el shell permanente que envuelve todas las páginas.
  TopBar arriba, SidebarNav a la izquierda, contenido (slot) a la derecha.
-->
<template>
  <div class="flex h-screen flex-col bg-asphalt-50 text-asphalt-900">
    <ShellTopBar />
    <ShellDemoBanner />
    <div class="flex flex-1 overflow-hidden">
      <aside class="w-64 shrink-0 overflow-y-auto border-r border-asphalt-200 bg-white">
        <ShellSidebarNav />
      </aside>
      <main class="flex-1 overflow-y-auto p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
