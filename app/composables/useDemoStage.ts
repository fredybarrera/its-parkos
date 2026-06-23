// Registro de acciones "reales" que algunas pantallas exponen para que el
// modo demo (useDemoTour) las dispare exactamente como lo haría un click.
// No es una capa de datos: es pura orquestación de UI. Las pantallas
// registran su función al montarse y la retiran al desmontarse; el demo
// espera (con timeout) a que la acción exista antes de invocarla, porque la
// navegación entre rutas es asíncrona.

const acciones = new Map<string, (...args: never[]) => unknown>()

export function useDemoStage() {
  function registerAction(nombre: string, fn: (...args: never[]) => unknown) {
    acciones.set(nombre, fn)
  }

  function unregisterAction(nombre: string) {
    acciones.delete(nombre)
  }

  /** Espera hasta `timeoutMs` a que la acción esté registrada y la ejecuta.
   *  Si `shouldAbort()` se vuelve true mientras espera (demo detenido), corta
   *  sin ejecutar nada. */
  async function runAction(
    nombre: string,
    options: { timeoutMs?: number; shouldAbort?: () => boolean } = {},
  ): Promise<void> {
    const { timeoutMs = 3000, shouldAbort = () => false } = options
    const inicio = Date.now()
    while (!acciones.has(nombre)) {
      if (shouldAbort()) return
      if (Date.now() - inicio >= timeoutMs) {
        throw new Error(`useDemoStage: acción "${nombre}" no se registró a tiempo`)
      }
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
    if (shouldAbort()) return
    await acciones.get(nombre)?.()
  }

  return { registerAction, unregisterAction, runAction }
}
