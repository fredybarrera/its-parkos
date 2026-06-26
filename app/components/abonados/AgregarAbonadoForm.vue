<!--
  AgregarAbonadoForm — alta rápida de un abonado (nombre + patente).
  No conoce límites de plan ni entitlements: solo emite el dato. La página
  decide si renderiza este form o el aviso de límite alcanzado.
-->
<script setup lang="ts">
import { ref, watch } from 'vue'

const emit = defineEmits<{ agregar: [data: { nombre: string; patente: string }] }>()

const abierto = ref(false)
const nombre = ref('')
const patente = ref('')
const errorNombre = ref(false)
const errorPatente = ref(false)

watch(nombre, () => { errorNombre.value = false })
watch(patente, () => { errorPatente.value = false })

function abrir() {
  abierto.value = true
  nombre.value = ''
  patente.value = ''
  errorNombre.value = false
  errorPatente.value = false
}

function cancelar() {
  abierto.value = false
  nombre.value = ''
  patente.value = ''
  errorNombre.value = false
  errorPatente.value = false
}

function confirmar() {
  const nombreValor = nombre.value.trim()
  const patenteValor = patente.value.trim().toUpperCase()
  errorNombre.value = !nombreValor
  errorPatente.value = !patenteValor
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
      class="rounded-lg bg-signal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-signal-700"
      @click="abrir"
    >
      Agregar abonado
    </button>

    <div v-else class="flex flex-wrap items-center gap-2 rounded-lg border border-asphalt-200 bg-white p-2 shadow-sm">
      <input
        v-model="nombre"
        type="text"
        placeholder="Nombre"
        autofocus
        class="w-40 rounded-md border px-2 py-1.5 text-sm text-asphalt-700 focus:outline-none focus:ring-2 transition-colors"
        :class="errorNombre
          ? 'border-2 border-brake-600 focus:border-brake-600 focus:ring-brake-600/20'
          : 'border border-asphalt-300 focus:border-signal-500 focus:ring-signal-500/20'"
        @keyup.enter="confirmar"
        @keyup.esc="cancelar"
      />
      <input
        v-model="patente"
        type="text"
        placeholder="Patente"
        class="w-28 rounded-md border px-2 py-1.5 text-sm uppercase tracking-wide text-asphalt-700 focus:outline-none focus:ring-2 transition-colors"
        :class="errorPatente
          ? 'border-2 border-brake-600 focus:border-brake-600 focus:ring-brake-600/20'
          : 'border border-asphalt-300 focus:border-signal-500 focus:ring-signal-500/20'"
        @keyup.enter="confirmar"
        @keyup.esc="cancelar"
      />
      <button
        type="button"
        class="rounded-md bg-signal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-signal-700"
        @click="confirmar"
      >
        Confirmar
      </button>
      <button
        type="button"
        class="rounded-md px-2 py-1.5 text-sm text-asphalt-500 hover:text-asphalt-700"
        @click="cancelar"
      >
        Cancelar
      </button>
    </div>
  </div>
</template>
