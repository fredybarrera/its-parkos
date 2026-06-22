// Store del plan activo. Única fuente de verdad de "qué plan está puesto".
// Nadie debe leer PLANS salteándose este store.

import { defineStore } from 'pinia'
import { PLANS } from '~/domain/plans'
import type { Plan, PlanId } from '~/domain/types'

export const usePlanStore = defineStore('plan', {
  state: () => ({
    planId: 'gestion' as PlanId,
  }),

  getters: {
    /** El objeto Plan resuelto del plan activo. */
    plan: (state): Plan => PLANS[state.planId],
  },

  actions: {
    /** Cambia el plan activo. */
    setPlan(id: PlanId) {
      this.planId = id
    },

    /** Alterna entre gestion y control (útil para el toggle de venta, Etapa 2). */
    cyclePlan() {
      this.planId = this.planId === 'gestion' ? 'control' : 'gestion'
    },
  },
})
