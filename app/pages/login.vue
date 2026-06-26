<!--
  Login — decorativo. Sin auth real: "Ingresar" solo abre el demo en
  Operación. Existe para que la primera pantalla que ve un prospecto sea
  creíble, no para validar credenciales.
-->
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

definePageMeta({ layout: 'login' })

const email = ref('operador@parkos.cl')
const password = ref('')

function ingresar() {
  navigateTo('/operacion')
}

// Reloj en vivo para el panel de producto
const horaActual = ref('')
function actualizarHora() {
  horaActual.value = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
let intervalo: ReturnType<typeof setInterval>
onMounted(() => {
  actualizarHora()
  intervalo = setInterval(actualizarHora, 1000)
})
onUnmounted(() => clearInterval(intervalo))

// Plazas estáticas decorativas: 24 plazas, 18 ocupadas, 6 libres
const plazas = [
  { id: 'A1', ocupada: true }, { id: 'A2', ocupada: true }, { id: 'A3', ocupada: false },
  { id: 'A4', ocupada: true }, { id: 'A5', ocupada: true }, { id: 'A6', ocupada: true },
  { id: 'B1', ocupada: true }, { id: 'B2', ocupada: false }, { id: 'B3', ocupada: true },
  { id: 'B4', ocupada: true }, { id: 'B5', ocupada: true }, { id: 'B6', ocupada: false },
  { id: 'C1', ocupada: true }, { id: 'C2', ocupada: true }, { id: 'C3', ocupada: true },
  { id: 'C4', ocupada: false }, { id: 'C5', ocupada: true }, { id: 'C6', ocupada: true },
  { id: 'D1', ocupada: true }, { id: 'D2', ocupada: true }, { id: 'D3', ocupada: false },
  { id: 'D4', ocupada: true }, { id: 'D5', ocupada: false }, { id: 'D6', ocupada: true },
]

const sesiones = [
  { patente: 'BCDF45', hora: '08:12', duracion: '3h 41m' },
  { patente: 'GHJK91', hora: '10:27', duracion: '1h 26m' },
  { patente: 'LLMN32', hora: '11:03', duracion: '0h 50m' },
]
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Panel de producto (solo desktop lg+) -->
    <div class="hidden lg:flex lg:w-[58%] flex-col justify-between p-12 xl:p-16">
      <!-- Logo -->
      <div class="flex items-center gap-2.5">
        <div class="flex h-8 w-8 items-center justify-center rounded-md bg-signal-500 font-display text-lg font-bold text-asphalt-900">
          P
        </div>
        <span class="font-display text-lg font-semibold uppercase tracking-wide text-white">ParkOS</span>
      </div>

      <!-- Contenido central -->
      <div class="space-y-8">
        <!-- Contador LED de libres -->
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-asphalt-500">Espacios libres ahora</p>
          <p class="mt-1 font-mono text-7xl font-semibold tabular-nums text-signal-400 [text-shadow:0_0_24px_rgb(31_164_86_/_50%)]">
            6
          </p>
        </div>

        <!-- Grid de plazas decorativo -->
        <div class="grid grid-cols-6 gap-1.5">
          <div
            v-for="plaza in plazas"
            :key="plaza.id"
            class="h-9 rounded-md border text-[10px] font-mono font-semibold flex items-center justify-center"
            :class="plaza.ocupada
              ? 'border-brake-700/40 bg-brake-600/20 text-brake-400'
              : 'border-signal-600/40 bg-signal-500/15 text-signal-400'"
          >
            {{ plaza.id }}
          </div>
        </div>

        <!-- Strip de stats -->
        <div class="flex items-center gap-6 border-t border-asphalt-700/60 pt-6">
          <div>
            <p class="font-mono text-2xl font-bold text-asphalt-100">18</p>
            <p class="text-xs text-asphalt-500">ocupadas</p>
          </div>
          <div class="h-8 w-px bg-asphalt-700" />
          <div>
            <p class="font-mono text-2xl font-bold text-signal-400">6</p>
            <p class="text-xs text-asphalt-500">libres</p>
          </div>
          <div class="h-8 w-px bg-asphalt-700" />
          <div>
            <p class="font-mono text-2xl font-bold text-asphalt-100">75%</p>
            <p class="text-xs text-asphalt-500">ocupación hoy</p>
          </div>
          <div class="ml-auto flex items-center gap-1.5 text-xs text-asphalt-500">
            <span class="h-1.5 w-1.5 rounded-full bg-signal-500 animate-pulse" />
            <span class="font-mono">{{ horaActual }}</span>
          </div>
        </div>

        <!-- Sesiones recientes -->
        <div class="space-y-1">
          <p class="mb-3 text-xs uppercase tracking-[0.15em] text-asphalt-600">Sesiones activas</p>
          <div
            v-for="sesion in sesiones"
            :key="sesion.patente"
            class="flex items-center justify-between rounded-lg border border-asphalt-700/50 bg-asphalt-800/40 px-3 py-2"
          >
            <span class="font-mono text-sm font-semibold tracking-wide text-asphalt-100">{{ sesion.patente }}</span>
            <span class="text-xs text-asphalt-500">desde {{ sesion.hora }}</span>
            <span class="font-mono text-sm text-signal-400">{{ sesion.duracion }}</span>
          </div>
        </div>
      </div>

      <!-- Tagline inferior -->
      <p class="text-sm text-asphalt-600">
        Control de acceso, plazas y cobro en un mismo lugar.
      </p>
    </div>

    <!-- Panel de login -->
    <div class="flex flex-1 items-center justify-center p-8">
      <div class="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div class="mb-6 flex flex-col items-center gap-2 text-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-signal-600 font-display text-xl font-bold text-white">
            P
          </div>
          <h1 class="font-display text-xl font-semibold uppercase tracking-wide text-asphalt-900">ParkOS</h1>
          <p class="text-sm text-asphalt-500">Accede a tu panel de operaciones</p>
        </div>

        <form class="space-y-4" @submit.prevent="ingresar">
          <label class="block">
            <span class="text-sm font-medium text-asphalt-700">Correo</span>
            <input
              v-model="email"
              type="email"
              class="mt-1 w-full rounded-md border border-asphalt-300 px-3 py-2 text-sm text-asphalt-800 focus:border-signal-500 focus:outline-none focus:ring-2 focus:ring-signal-500/20"
            />
          </label>
          <label class="block">
            <span class="text-sm font-medium text-asphalt-700">Contraseña</span>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              class="mt-1 w-full rounded-md border border-asphalt-300 px-3 py-2 text-sm text-asphalt-800 focus:border-signal-500 focus:outline-none focus:ring-2 focus:ring-signal-500/20"
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
    </div>
  </div>
</template>
