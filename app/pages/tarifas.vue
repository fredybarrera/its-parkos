<!--
  Tarifas — configuración del cobro vigente. Igual en ambos planes: el
  cobro es núcleo del negocio, no una funcionalidad gateada. Lo que se
  guarda aquí (setTarifa) es lo mismo que lee el store al cerrar una sesión
  en Operación (registrarSalida -> calcularMonto), así que el cambio se
  refleja de inmediato en el próximo cobro, sin tocar la Etapa 4.
-->
<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { Tarifa, TarifaTipo } from '~/domain/types'

const { getTarifa, setTarifa } = useParkingData()

const tarifaVigente = computed(() => getTarifa())

const form = reactive<Tarifa>({ ...tarifaVigente.value })

const guardadoVisible = ref(false)
let ocultarTimeout: ReturnType<typeof setTimeout> | null = null

function elegirTipo(tipo: TarifaTipo) {
  if (tipo === 'plana' && form.valorPlano === null) {
    form.valorPlano = 3000
  }
  form.tipo = tipo
}

function guardar() {
  setTarifa({ ...form })
  guardadoVisible.value = true
  if (ocultarTimeout) clearTimeout(ocultarTimeout)
  ocultarTimeout = setTimeout(() => {
    guardadoVisible.value = false
  }, 2500)
}

const resumenVigente = computed(() => {
  const t = tarifaVigente.value
  if (t.tipo === 'plana') {
    return `${formatCLP(t.valorPlano ?? 0)} fijo por estadía`
  }
  return `${formatCLP(t.valorHora)} por hora, fracción de ${t.fraccionMinutos} min`
})

watch(tarifaVigente, (actual) => {
  Object.assign(form, actual)
})
</script>

<template>
  <div class="max-w-2xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-800">Tarifas</h1>
      <p class="mt-1 text-sm text-slate-500">
        Configura el cobro vigente. Se aplica de inmediato a las salidas que se registren en Operación.
      </p>
    </div>

    <div class="rounded-xl border border-slate-200 bg-white p-6">
      <div role="tablist" aria-label="Tipo de tarifa" class="inline-flex items-center gap-1 rounded-full bg-slate-100 p-1">
        <button
          type="button"
          role="tab"
          :aria-selected="form.tipo === 'hora_fraccion'"
          class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150"
          :class="form.tipo === 'hora_fraccion' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          @click="elegirTipo('hora_fraccion')"
        >
          Por hora y fracción
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="form.tipo === 'plana'"
          class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150"
          :class="form.tipo === 'plana' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          @click="elegirTipo('plana')"
        >
          Tarifa plana
        </button>
      </div>

      <div v-if="form.tipo === 'hora_fraccion'" class="mt-6 grid grid-cols-2 gap-4">
        <label class="block">
          <span class="text-sm font-medium text-slate-700">Valor por hora (CLP)</span>
          <input
            v-model.number="form.valorHora"
            type="number"
            min="0"
            step="50"
            class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
          />
        </label>
        <label class="block">
          <span class="text-sm font-medium text-slate-700">Fracción de cobro (minutos)</span>
          <input
            v-model.number="form.fraccionMinutos"
            type="number"
            min="1"
            step="1"
            class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
          />
        </label>
      </div>

      <div v-else class="mt-6 max-w-xs">
        <label class="block">
          <span class="text-sm font-medium text-slate-700">Monto fijo por estadía (CLP)</span>
          <input
            v-model.number="form.valorPlano"
            type="number"
            min="0"
            step="50"
            class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
          />
        </label>
      </div>

      <div class="mt-6 flex items-center gap-3">
        <button
          type="button"
          class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          @click="guardar"
        >
          Guardar tarifa
        </button>
        <Transition
          enter-active-class="transition-opacity duration-150"
          leave-active-class="transition-opacity duration-300"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
          <span v-if="guardadoVisible" class="text-sm font-medium text-emerald-600">Tarifa actualizada ✓</span>
        </Transition>
      </div>
    </div>

    <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
      Tarifa vigente: <span class="font-semibold text-slate-800">{{ resumenVigente }}</span>
    </div>
  </div>
</template>
