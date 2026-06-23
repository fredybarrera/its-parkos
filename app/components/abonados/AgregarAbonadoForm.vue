<!--
  AgregarAbonadoForm — alta rápida de un abonado (nombre + patente).
  No conoce límites de plan ni entitlements: solo emite el dato. La página
  decide si renderiza este form o el aviso de límite alcanzado.
-->
<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ agregar: [data: { nombre: string; patente: string }] }>()

const abierto = ref(false)
const nombre = ref('')
const patente = ref('')

function abrir() {
  abierto.value = true
  nombre.value = ''
  patente.value = ''
}

function cancelar() {
  abierto.value = false
  nombre.value = ''
  patente.value = ''
}

function confirmar() {
  const nombreValor = nombre.value.trim()
  const patenteValor = patente.value.trim().toUpperCase()
  if (!nombreValor || !patenteValor) return
  emit('agregar', { nombre: nombreValor, patente: patenteValor })
  abierto.value = false
}
</script>

<template>
  <div>
    <button
      v-if="!abierto"
      type="button"
      class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
      @click="abrir"
    >
      Agregar abonado
    </button>

    <div v-else class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
      <input
        v-model="nombre"
        type="text"
        placeholder="Nombre"
        autofocus
        class="w-40 rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none"
        @keyup.enter="confirmar"
        @keyup.esc="cancelar"
      />
      <input
        v-model="patente"
        type="text"
        placeholder="Patente"
        class="w-28 rounded-md border border-slate-300 px-2 py-1.5 text-sm uppercase tracking-wide text-slate-700 focus:border-emerald-500 focus:outline-none"
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
