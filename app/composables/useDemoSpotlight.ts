// Resaltado temporal de los ítems con candado del sidebar, usado por el
// modo demo para "señalar" la fricción de plan Gestión antes del flip a
// Control. Es puro estado de presentación: no decide qué está bloqueado
// (eso sigue siendo useEntitlements().has()), solo si se le pone un anillo
// visual encima mientras el demo lo pide.

import { ref } from 'vue'
import { createGlobalState } from '@vueuse/core'

export const useDemoSpotlight = createGlobalState(() => {
  const candadosResaltados = ref(false)

  return { candadosResaltados }
})
