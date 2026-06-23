<!--
  Login — decorativo. Sin auth real: "Ingresar" solo abre el demo en
  Operación. Existe para que la primera pantalla que ve un prospecto sea
  creíble, no para validar credenciales.
-->
<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ layout: 'login' })

const email = ref('operador@parkos.cl')
const password = ref('')

function ingresar() {
  navigateTo('/operacion')
}
</script>

<template>
  <div class="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
    <div class="mb-6 flex flex-col items-center gap-2 text-center">
      <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-signal-600 font-display text-xl font-bold text-white">
        P
      </div>
      <h1 class="font-display text-xl font-semibold uppercase tracking-wide text-asphalt-900">ParkOS</h1>
      <p class="text-sm text-asphalt-500">Control de acceso, plazas y cobro en un mismo lugar</p>
    </div>

    <form class="space-y-4" @submit.prevent="ingresar">
      <label class="block">
        <span class="text-sm font-medium text-asphalt-700">Correo</span>
        <input
          v-model="email"
          type="email"
          class="mt-1 w-full rounded-md border border-asphalt-300 px-3 py-2 text-sm text-asphalt-800 focus:border-signal-500 focus:outline-none"
        />
      </label>
      <label class="block">
        <span class="text-sm font-medium text-asphalt-700">Contraseña</span>
        <input
          v-model="password"
          type="password"
          placeholder="••••••••"
          class="mt-1 w-full rounded-md border border-asphalt-300 px-3 py-2 text-sm text-asphalt-800 focus:border-signal-500 focus:outline-none"
        />
      </label>

      <button
        type="submit"
        class="w-full rounded-lg bg-signal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-signal-700"
      >
        Ingresar
      </button>
    </form>

    <p class="mt-6 text-center text-xs text-asphalt-400">Demo comercial · ParkOS</p>
  </div>
</template>
