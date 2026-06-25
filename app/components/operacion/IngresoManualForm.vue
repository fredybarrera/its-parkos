<!--
  IngresoManualForm — registro de ingreso a mano.

  Es el modo primario cuando no hay acceso automático (Gestión). En Control
  sigue disponible (el operador siempre puede registrar a mano un caso que
  la cámara no captó), pero pasa a acción secundaria: la prop `primary` solo
  cambia el énfasis visual, nunca la disponibilidad.

  Cuando has('ticket.barcode') está activo, el ingreso crea una sesión con
  origen 'ticket' y muestra el TicketBarcode modal al confirmar.
-->
<script setup lang="ts">
import { ref } from 'vue'
import type { Sesion } from '~/domain/types'

withDefaults(defineProps<{ primary?: boolean }>(), { primary: true })

const { has } = useEntitlements()
const { registrarIngreso } = useParkingData()

const abierto = ref(false)
const patente = ref('')
const sesionConTicket = ref<Sesion | null>(null)

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

  const origen = has('ticket.barcode') ? 'ticket' : 'manual'
  const sesion = registrarIngreso(valor, origen)

  if (has('ticket.barcode')) {
    sesionConTicket.value = sesion
  }

  abierto.value = false
  patente.value = ''
}

function cerrarTicket() {
  sesionConTicket.value = null
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
          ? 'bg-signal-600 px-4 py-2 text-white hover:bg-signal-700'
          : 'border border-asphalt-300 px-3 py-1.5 text-asphalt-600 hover:bg-asphalt-100'
      "
      @click="abrir"
    >
      Registrar ingreso
    </button>

    <div v-else class="flex flex-wrap items-center gap-2 rounded-lg border border-asphalt-200 bg-white p-2 shadow-sm">
      <input
        v-model="patente"
        type="text"
        placeholder="Patente"
        autofocus
        class="w-32 rounded-md border border-asphalt-300 px-2 py-1.5 text-sm uppercase tracking-wide text-asphalt-700 focus:border-signal-500 focus:outline-none"
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

    <!-- Modal del ticket (solo cuando ticket.barcode está activo) -->
    <Teleport to="body">
      <OperacionTicketBarcode
        v-if="sesionConTicket"
        :sesion="sesionConTicket"
        @cerrar="cerrarTicket"
      />
    </Teleport>
  </div>
</template>
