<!--
  login — layout standalone para la pantalla de acceso. Sin topbar ni
  sidebar: es la puerta de entrada antes del shell del producto.
-->
<template>
  <div
    class="flex min-h-screen items-center justify-center px-4"
    style="background: radial-gradient(circle at 50% 35%, #2E2922 0%, #1C1812 70%);"
  >
    <slot />
  </div>
</template>
