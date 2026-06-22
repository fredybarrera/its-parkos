// Definición de los planes como pura data: funcionalidad -> habilitada / valor.
// Sin ifs. Agregar un plan nuevo = agregar otra entrada a este mapa, nada más.

import type { Plan, PlanId } from './types'
import { UNLIMITED } from './types'

export const PLANS = {
  gestion: {
    id: 'gestion',
    name: 'Gestión',
    toggles: {
      // Núcleo: encendido
      'session.manual': true,
      'billing.tariffs': true,
      'billing.calculate': true,
      'payment.register': true,
      'occupancy.view': true,
      'reports.basic': true,
      // Control: apagado
      'access.barrier': false,
      'lpr.camera': false,
      'occupancy.sensors': false,
      'signage.dynamic': false,
      'reports.advanced': false,
    },
    limits: {
      'users.operators': 3,
      'branches.max': 1,
      'subscribers.manage': 50,
    },
  },

  control: {
    id: 'control',
    name: 'Control',
    toggles: {
      // Núcleo: encendido
      'session.manual': true,
      'billing.tariffs': true,
      'billing.calculate': true,
      'payment.register': true,
      'occupancy.view': true,
      'reports.basic': true,
      // Control: encendido
      'access.barrier': true,
      'lpr.camera': true,
      'occupancy.sensors': true,
      'signage.dynamic': true,
      'reports.advanced': true,
    },
    limits: {
      'users.operators': 10,
      'branches.max': 5,
      'subscribers.manage': UNLIMITED,
    },
  },
} as const satisfies Record<PlanId, Plan>
