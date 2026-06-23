<!--
  AccesoAutomaticoPanel — acceso automático (solo Control).

  Simula cámara LPR + barrera. El resultado es exactamente la misma acción
  que el ingreso manual (useParkingData.registrarIngreso), solo que con
  origen 'lpr' y disparada por "hardware" en vez de tecleo. Por eso la
  sesión resultante cae en la misma SesionesTable: la equivalencia es el
  punto central de esta pantalla.

  Quien decide si este panel se monta es la página (gated por
  has('access.barrier')); este componente no pregunta por el plan.
-->
<script setup lang="ts">
import { onUnmounted, ref } from 'vue'

const { registrarIngreso } = useParkingData()

type Estado = 'idle' | 'escaneando' | 'barrera' | 'ingresado'

const estado = ref<Estado>('idle')
const patenteLeida = ref<string | null>(null)

const PATENTES_MOCK = ['FGRT45', 'BPLW82', 'KDXS19', 'HTNV63', 'CWQZ27', 'RMJB50']

function patenteAleatoria(): string {
  return PATENTES_MOCK[Math.floor(Math.random() * PATENTES_MOCK.length)]!
}

let timeoutId: ReturnType<typeof setTimeout> | null = null

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => {
    timeoutId = setTimeout(() => {
      timeoutId = null
      resolve()
    }, ms)
  })
}

function limpiarTimeout() {
  if (timeoutId !== null) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

onUnmounted(limpiarTimeout)

async function simularIngreso() {
  if (estado.value !== 'idle') return

  estado.value = 'escaneando'
  patenteLeida.value = null
  await esperar(900)

  patenteLeida.value = patenteAleatoria()
  estado.value = 'barrera'
  await esperar(900)

  registrarIngreso(patenteLeida.value, 'lpr')
  estado.value = 'ingresado'
  await esperar(1100)

  estado.value = 'idle'
  patenteLeida.value = null
}
</script>

<template>
  <section class="rounded-xl border border-slate-200 bg-white p-5">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-sm font-semibold text-slate-800">Acceso automático</h2>
        <p class="text-xs text-slate-500">Cámara LPR + barrera. Simula la llegada de un vehículo.</p>
      </div>
      <button
        type="button"
        class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="estado !== 'idle'"
        @click="simularIngreso"
      >
        Simular ingreso
      </button>
    </div>

    <div class="mt-5 flex items-center gap-6">
      <!-- Cámara -->
      <div class="flex flex-col items-center gap-1.5">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors duration-300"
          :class="
            estado === 'escaneando'
              ? 'animate-pulse border-emerald-500 bg-emerald-50'
              : 'border-slate-200 bg-slate-50'
          "
        >
          <svg
            class="h-6 w-6 transition-colors duration-300"
            :class="estado === 'escaneando' ? 'text-emerald-600' : 'text-slate-400'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </div>
        <span class="text-xs text-slate-500">Cámara LPR</span>
      </div>

      <!-- Lectura de patente -->
      <div class="flex min-w-28 flex-col items-center gap-1.5">
        <div
          class="flex h-8 items-center justify-center rounded-md border border-slate-300 bg-slate-50 px-3 font-mono text-sm font-semibold tracking-wider text-slate-700 transition-opacity duration-300"
          :class="patenteLeida ? 'opacity-100' : 'opacity-30'"
        >
          {{ patenteLeida ?? '------' }}
        </div>
        <span class="text-xs text-slate-500">Patente leída</span>
      </div>

      <!-- Barrera -->
      <div class="flex flex-col items-center gap-1.5">
        <div class="relative h-12 w-16 overflow-hidden rounded-md bg-slate-100">
          <div
            class="absolute left-1/2 top-1/2 h-1.5 w-14 -translate-x-1/2 origin-left rounded-full bg-amber-500 transition-transform duration-700"
            :class="estado === 'barrera' || estado === 'ingresado' ? 'rotate-[-75deg]' : 'rotate-0'"
          />
        </div>
        <span class="text-xs text-slate-500">Barrera</span>
      </div>

      <!-- Estado textual -->
      <p v-if="estado === 'ingresado'" class="text-sm font-medium text-emerald-700">
        Ingreso registrado ✓
      </p>
    </div>
  </section>
</template>
