<!--
  IngresoManualForm — registro de ingreso a mano.

  Es el modo primario cuando no hay acceso automático (Gestión). En Control
  sigue disponible (el operador siempre puede registrar a mano un caso que
  la cámara no captó), pero pasa a acción secundaria: la prop `primary` solo
  cambia el énfasis visual, nunca la disponibilidad.
-->
<script setup lang="ts">
import { ref } from 'vue'

withDefaults(defineProps<{ primary?: boolean }>(), { primary: true })

const { registrarIngreso } = useParkingData()

const abierto = ref(false)
const patente = ref('')

function abrir() {
  abierto.value = true
  patente.value = ''
}

function cancelar() {
  abierto.value = false
  patente.value = ''
}

function confirmar() {
  const valor = patente.value.trim().toUpperCase()
  if (!valor) return
  registrarIngreso(valor, 'manual')
  abierto.value = false
  patente.value = ''
}
</script>

<template>
  <div>
    <button
      v-if="!abierto"
      type="button"
      class="rounded-lg text-sm font-medium transition-colors"
      :class="
        primary
          ? 'bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700'
          : 'border border-slate-300 px-3 py-1.5 text-slate-600 hover:bg-slate-100'
      "
      @click="abrir"
    >
      Registrar ingreso
    </button>

    <div v-else class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
      <input
        v-model="patente"
        type="text"
        placeholder="Patente"
        autofocus
        class="w-32 rounded-md border border-slate-300 px-2 py-1.5 text-sm uppercase tracking-wide text-slate-700 focus:border-emerald-500 focus:outline-none"
        @keyup.enter="confirmar"
        @keyup.esc="cancelar"
      />
      <button
        type="button"
        class="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
        @click="confirmar"
      >
        Confirmar
      </button>
      <button
        type="button"
        class="rounded-md px-2 py-1.5 text-sm text-slate-500 hover:text-slate-700"
        @click="cancelar"
      >
        Cancelar
      </button>
    </div>
  </div>
</template>
