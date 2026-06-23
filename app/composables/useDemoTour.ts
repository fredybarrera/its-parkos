// Modo demo: reproduce el guion de venta de punta a punta sin presentador.
// Cada paso llama a la MISMA acción real que dispararía un click —
// useParkingData(), usePlanStore().setPlan(), o una acción registrada por
// una pantalla en useDemoStage(). No hay una animación paralela: es el demo
// de verdad, reproduciéndose solo.

import { computed, ref } from 'vue'
import { createGlobalState } from '@vueuse/core'
import { usePlanStore } from '~/stores/plan'

export type DemoEstado = 'idle' | 'running' | 'paused'

interface DemoCtx {
  /** Espera `ms` (se pausa con el demo). Devuelve false si se detuvo mientras esperaba. */
  sleep(ms: number): Promise<boolean>
  abortado(): boolean
}

interface DemoPaso {
  label: string
  run: (ctx: DemoCtx) => Promise<void>
}

const PATENTES_INGRESO_MANUAL = ['JKLM02', 'BCPT77', 'VRSH41']

function patenteAleatoria(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)]!
}

export const useDemoTour = createGlobalState(() => {
  const estado = ref<DemoEstado>('idle')
  const pasoActual = ref(-1)
  const generacion = ref(0)

  const pasos = construirPasos()
  const totalPasos = pasos.length
  const labelActual = computed(() => (pasoActual.value >= 0 ? pasos[pasoActual.value]?.label ?? '' : ''))

  function vigente(gen: number): boolean {
    return gen === generacion.value
  }

  function sleep(ms: number, gen: number): Promise<boolean> {
    return new Promise((resolve) => {
      let restante = ms
      const tick = () => {
        if (!vigente(gen)) {
          resolve(false)
          return
        }
        if (estado.value === 'paused') {
          setTimeout(tick, 150)
          return
        }
        const paso = Math.min(150, restante)
        setTimeout(() => {
          if (!vigente(gen)) {
            resolve(false)
            return
          }
          restante -= paso
          if (restante <= 0) resolve(true)
          else tick()
        }, paso)
      }
      tick()
    })
  }

  async function iniciar() {
    if (estado.value === 'running') return
    const gen = ++generacion.value
    estado.value = 'running'
    pasoActual.value = -1

    const ctx: DemoCtx = {
      sleep: (ms) => sleep(ms, gen),
      abortado: () => !vigente(gen),
    }

    for (let i = 0; i < pasos.length; i++) {
      if (!vigente(gen)) return
      pasoActual.value = i
      try {
        await pasos[i]!.run(ctx)
      } catch {
        // Una acción de pantalla no llegó a registrarse a tiempo (navegación
        // lenta). No interrumpe el resto del recorrido.
      }
    }

    if (vigente(gen)) finalizar()
  }

  function pausar() {
    if (estado.value === 'running') estado.value = 'paused'
  }

  function reanudar() {
    if (estado.value === 'paused') estado.value = 'running'
  }

  function detener() {
    generacion.value += 1
    finalizar()
  }

  function finalizar() {
    estado.value = 'idle'
    pasoActual.value = -1
  }

  return { estado, pasoActual, labelActual, totalPasos, iniciar, pausar, reanudar, detener }
})

function construirPasos(): DemoPaso[] {
  return [
    {
      label: 'Acto 1 · Operación: registrando un ingreso manual',
      async run(ctx) {
        await navigateTo('/operacion')
        if (!(await ctx.sleep(900))) return
        useParkingData().registrarIngreso(patenteAleatoria(PATENTES_INGRESO_MANUAL), 'manual')
        if (!(await ctx.sleep(1800))) return
      },
    },
    {
      label: 'Acto 1 · Operación: cobrando una salida',
      async run(ctx) {
        await navigateTo('/operacion')
        if (!(await ctx.sleep(600))) return
        const activa = useParkingData().getSesiones().find((s) => s.estado === 'activa')
        if (activa) useOperacionFlujo().registrarSalida(activa.id)
        if (!(await ctx.sleep(2600))) return
        useOperacionFlujo().cerrarComprobante()
        if (!(await ctx.sleep(500))) return
      },
    },
    {
      label: 'Acto 2 · Abonados: llegando al límite del plan',
      async run(ctx) {
        await navigateTo('/abonados')
        if (!(await ctx.sleep(1800))) return
        useParkingData().agregarAbonado({
          nombre: 'Tomás Bravo',
          patente: 'NPXR88',
          vigenteHasta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        if (!(await ctx.sleep(2200))) return
      },
    },
    {
      label: 'Acto 2 · Lo que falta por desbloquear',
      async run(ctx) {
        const spotlight = useDemoSpotlight()
        spotlight.candadosResaltados.value = true
        const ok = await ctx.sleep(2200)
        spotlight.candadosResaltados.value = false
        if (!ok) return
      },
    },
    {
      label: 'Acto 3 · El flip: pasando a plan Control',
      async run(ctx) {
        if (!(await ctx.sleep(400))) return
        usePlanStore().setPlan('control')
        if (!(await ctx.sleep(1800))) return
      },
    },
    {
      label: 'Acto 3 · Operación: ingreso automático (cámara + barrera)',
      async run(ctx) {
        await navigateTo('/operacion')
        if (!(await ctx.sleep(700))) return
        await useDemoStage().runAction('operacion.ingresoAutomatico', { shouldAbort: ctx.abortado })
        if (!(await ctx.sleep(900))) return
      },
    },
    {
      label: 'Acto 3 · Mapa de estacionamientos: sensores en vivo',
      async run(ctx) {
        await navigateTo('/plazas')
        if (!(await ctx.sleep(7000))) return
      },
    },
    {
      label: 'Acto 4 · Abonados: ahora ilimitado',
      async run(ctx) {
        await navigateTo('/abonados')
        if (!(await ctx.sleep(2400))) return
      },
    },
    {
      label: 'Acto 4 · Reportes: sección avanzada desbloqueada',
      async run(ctx) {
        await navigateTo('/reportes')
        if (!(await ctx.sleep(2600))) return
      },
    },
  ]
}
