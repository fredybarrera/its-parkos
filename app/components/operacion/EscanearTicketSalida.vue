<!--
  EscanearTicketSalida — campo de escaneo de ticket de salida.

  Un input enfocado que acepta el ticketCode y confirma con Enter. Esta
  interfaz funciona igual con una pistola lectora HID real (dispositivo que
  "teclea" el código + Enter) que con el operador tipeando a mano en el demo.
  Al confirmar, busca la sesión activa y dispara el flujo de salida existente.
-->
<script setup lang="ts">
import { ref } from 'vue'

const { buscarSesionPorTicket } = useParkingData()
const { registrarSalida } = useOperacionFlujo()

const codigo = ref('')
const error = ref<string | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

function confirmar() {
  const code = codigo.value.trim().toUpperCase()
  if (!code) return

  error.value = null
  const sesion = buscarSesionPorTicket(code)

  if (!sesion) {
    error.value = 'Ticket no encontrado o sesión ya cerrada.'
    return
  }

  registrarSalida(sesion.id)
  codigo.value = ''
}

function limpiarError() {
  if (error.value) error.value = null
}
</script>

<template>
  <section class="rounded-xl border border-asphalt-200 bg-white p-4">
    <div class="flex flex-wrap items-center gap-4">
      <!-- Ícono de escaneo -->
      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-asphalt-100">
        <svg
          class="h-5 w-5 text-asphalt-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M3 5v4M3 5h4M21 5v4M21 5h-4M3 19v-4M3 19h4M21 19v-4M21 19h-4" />
          <line x1="7" y1="12" x2="17" y2="12" />
          <line x1="12" y1="9" x2="12" y2="9.01" />
          <line x1="12" y1="15" x2="12" y2="15.01" />
        </svg>
      </div>

      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium text-asphalt-800">Salida por escaneo de ticket</p>
        <p class="text-xs text-asphalt-400">Escanea o ingresa el código y presiona Enter</p>
      </div>

      <!-- Campo de escaneo -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="relative">
          <input
            ref="inputRef"
            v-model="codigo"
            type="text"
            placeholder="TK········"
            autofocus
            class="w-36 rounded-lg border px-3 py-1.5 font-mono text-sm uppercase tracking-widest transition-colors focus:outline-none"
            :class="
              error
                ? 'border-red-400 bg-red-50 text-red-700 focus:border-red-500'
                : 'border-asphalt-300 bg-white text-asphalt-800 focus:border-signal-500'
            "
            @keyup.enter="confirmar"
            @input="limpiarError"
          />
        </div>
        <button
          type="button"
          class="rounded-lg bg-asphalt-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-asphalt-800"
          @click="confirmar"
        >
          Registrar salida
        </button>
      </div>
    </div>

    <!-- Mensaje de error -->
    <Transition
      enter-active-class="transition-all duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      leave-active-class="transition-all duration-100 ease-in"
      leave-to-class="opacity-0"
    >
      <p
        v-if="error"
        class="mt-3 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
      >
        <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {{ error }}
      </p>
    </Transition>
  </section>
</template>
