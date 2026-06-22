// Composable de consulta de entitlements. Es la ÚNICA forma en que el resto
// del código pregunta qué puede hacer el plan activo. Lee del store del plan
// activo, así que es reactivo: si cambia el plan, todo computed/watcher que
// dependa de has()/getLimit() recomputa solo.

import { computed } from 'vue'
import { usePlanStore } from '~/stores/plan'
import { UNLIMITED } from '~/domain/types'
import type { LimitCode, ToggleCode } from '~/domain/types'

export function useEntitlements() {
  const store = usePlanStore()

  // Dependencia reactiva única: el plan resuelto del store.
  const plan = computed(() => store.plan)

  /** ¿El toggle está activo en el plan activo? */
  function has(code: ToggleCode): boolean {
    return plan.value.toggles[code] === true
  }

  /** Valor del límite en el plan activo (UNLIMITED = ilimitado). */
  function getLimit(code: LimitCode): number {
    return plan.value.limits[code]
  }

  /** ¿El límite es ilimitado? */
  function isUnlimited(code: LimitCode): boolean {
    return getLimit(code) === UNLIMITED
  }

  return { plan, has, getLimit, isUnlimited }
}
