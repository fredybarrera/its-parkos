// Estado del drawer del sidebar en móvil (<lg). En desktop el aside es
// estático y este estado no se usa. useState (no createGlobalState) porque
// necesita ser SSR-safe: cada request del servidor debe arrancar en false.
export function useSidebar() {
  const abierto = useState('sidebar-abierto', () => false)

  function abrir() {
    abierto.value = true
  }

  function cerrar() {
    abierto.value = false
  }

  function toggle() {
    abierto.value = !abierto.value
  }

  return { abierto, abrir, cerrar, toggle }
}
