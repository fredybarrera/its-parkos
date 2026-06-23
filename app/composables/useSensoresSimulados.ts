// Sensores de ocupación simulados (occupancy.sensors, solo Control).
//
// Vive como estado global (no por página) porque representa hardware que
// "está prendido" independientemente de qué pantalla esté mirando el
// operador: antes esta lógica vivía adentro de pages/plazas.vue y se
// detenía si el operador navegaba a otra pantalla. Ahora /plazas (la
// grilla) y /sensores (la bitácora) leen del mismo origen real: cada
// lectura simulada toca una plaza de verdad vía setEstadoPlaza y queda
// anotada acá, no es un mock paralelo.
import { computed, ref, watch } from 'vue'
import { createGlobalState } from '@vueuse/core'

export interface LecturaSensor {
  id: string
  plazaId: string
  plazaCodigo: string
  estado: 'libre' | 'ocupada'
  timestamp: string
}

const MAX_BITACORA = 20

export const useSensoresSimulados = createGlobalState(() => {
  const { has } = useEntitlements()
  const { getPlazas, setEstadoPlaza } = useParkingData()

  const bitacora = ref<LecturaSensor[]>([])
  const ultimaLecturaHaceSegundos = ref(0)

  // Solo toca plazas sin sesión activa asociada (sesionId === null): si
  // tocara una con sesión real, desincronizaría el sensor del registro de
  // Operación (ver pages/plazas.vue, misma regla desde el origen).
  function leer() {
    const candidatas = getPlazas().filter((p) => p.sesionId === null)
    if (candidatas.length === 0) return

    const cantidad = Math.min(candidatas.length, Math.random() < 0.5 ? 1 : 2)
    const elegidas = [...candidatas].sort(() => Math.random() - 0.5).slice(0, cantidad)
    for (const plaza of elegidas) {
      const estado = plaza.estado === 'libre' ? 'ocupada' : 'libre'
      setEstadoPlaza(plaza.id, estado)
      bitacora.value.unshift({
        id: `lec-${crypto.randomUUID()}`,
        plazaId: plaza.id,
        plazaCodigo: plaza.codigo,
        estado,
        timestamp: new Date().toISOString(),
      })
    }
    if (bitacora.value.length > MAX_BITACORA) bitacora.value.length = MAX_BITACORA
    ultimaLecturaHaceSegundos.value = 0
  }

  const { pause: pausarLecturas, resume: reanudarLecturas } = useIntervalFn(leer, 5000, { immediate: false })
  const { pause: pausarReloj, resume: reanudarReloj } = useIntervalFn(
    () => {
      ultimaLecturaHaceSegundos.value += 1
    },
    1000,
    { immediate: false },
  )

  const activo = computed(() => has('occupancy.sensors'))

  watch(
    activo,
    (on) => {
      if (on) {
        ultimaLecturaHaceSegundos.value = 0
        reanudarLecturas()
        reanudarReloj()
      } else {
        pausarLecturas()
        pausarReloj()
      }
    },
    { immediate: true },
  )

  return { bitacora, ultimaLecturaHaceSegundos, activo }
})
