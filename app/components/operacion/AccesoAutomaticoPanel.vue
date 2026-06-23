<!--
  AccesoAutomaticoPanel — acceso automático (solo Control).

  Simula cámara LPR + barrera. El resultado es exactamente la misma acción
  que el ingreso manual (useParkingData.registrarIngreso), solo que con
  origen 'lpr' y disparada por "hardware" en vez de tecleo. Por eso la
  sesión resultante cae en la misma SesionesTable: la equivalencia es el
  punto central de esta pantalla.

  Quien decide si este panel se monta es la página (gated por
  has('access.barrier')); este componente no pregunta por el plan.

  Se registra en useDemoStage como 'operacion.ingresoAutomatico' para que el
  modo demo pueda disparar esta misma animación (no una paralela) en su
  escena de Control.
-->
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const { registrarIngreso } = useParkingData()
const { registerAction, unregisterAction } = useDemoStage()

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

onMounted(() => registerAction('operacion.ingresoAutomatico', simularIngreso))
onUnmounted(() => unregisterAction('operacion.ingresoAutomatico'))

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
  <section class="rounded-xl border border-asphalt-200 bg-white p-5">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-sm font-semibold text-asphalt-800">Acceso automático</h2>
        <p class="text-xs text-asphalt-500">Cámara LPR + barrera. Simula la llegada de un vehículo.</p>
      </div>
      <button
        type="button"
        class="rounded-lg bg-signal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-signal-700 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="estado !== 'idle'"
        @click="simularIngreso"
      >
        Simular ingreso
      </button>
    </div>

    <div class="mt-5 flex flex-wrap items-center gap-4 sm:gap-6">
      <!-- Cámara -->
      <div class="flex flex-col items-center gap-1.5">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors duration-300"
          :class="
            estado === 'escaneando'
              ? 'animate-pulse border-hazard-400 bg-hazard-50'
              : 'border-asphalt-200 bg-asphalt-50'
          "
        >
          <svg
            class="h-6 w-6 transition-colors duration-300"
            :class="estado === 'escaneando' ? 'text-hazard-600' : 'text-asphalt-400'"
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
        <span class="text-xs text-asphalt-500">Cámara LPR</span>
      </div>

      <!-- Lectura de patente -->
      <div class="flex min-w-28 flex-col items-center gap-1.5">
        <div
          class="flex h-8 items-center justify-center rounded-md border border-asphalt-300 bg-asphalt-50 px-3 font-mono text-sm font-semibold tracking-wider text-asphalt-700 transition-opacity duration-300"
          :class="patenteLeida ? 'opacity-100' : 'opacity-30'"
        >
          {{ patenteLeida ?? '------' }}
        </div>
        <span class="text-xs text-asphalt-500">Patente leída</span>
      </div>

      <!-- Barrera -->
      <div class="flex flex-col items-center gap-1.5">
        <div class="relative h-12 w-16 overflow-hidden rounded-md bg-asphalt-100">
          <div
            class="absolute left-1/2 top-1/2 h-1.5 w-14 -translate-x-1/2 origin-left rounded-full transition-transform duration-700"
            :class="estado === 'barrera' || estado === 'ingresado' ? 'rotate-[-75deg]' : 'rotate-0'"
            :style="{
              backgroundImage:
                'repeating-linear-gradient(135deg, #EFB91E 0px, #EFB91E 4px, #2E2922 4px, #2E2922 8px)',
            }"
          />
        </div>
        <span class="text-xs text-asphalt-500">Barrera</span>
      </div>

      <!-- Estado textual -->
      <p v-if="estado === 'ingresado'" class="text-sm font-medium text-signal-700">
        Ingreso registrado ✓
      </p>
    </div>
  </section>
</template>
