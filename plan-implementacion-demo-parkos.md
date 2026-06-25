# Plan de implementación — Demo ParkOS

Demo SPA funcional para vender la solución de gestión de estacionamientos por niveles, **antes** del desarrollo formal. Pensado para construirse con Claude Code, etapa por etapa.

---

## Principios que mandan todo el plan

1. **Desechable por fuera, reutilizable por dentro.** El demo no tiene backend, auth ni pagos reales. Pero el modelo de dominio, los componentes y el modelo de entitlements se diseñan limpios para sobrevivir al producto real.
2. **Un solo núcleo, la variación entra por los bordes.** No hay "dos apps". Hay una, donde el plan activo (Gestión / Control) prende o apaga funcionalidades. El código nunca pregunta por el plan; pregunta por la funcionalidad.
3. **El backend será la fuente de verdad algún día; hoy lo es un mock detrás de una interfaz.** Toda lectura de datos pasa por `useParkingData`, para poder cambiar mock → API real sin tocar componentes.
4. **El toggle de plan es la herramienta de venta.** Construirlo bien y temprano es prioridad, porque obliga a tener la arquitectura de entitlements correcta desde el día uno.

---

## Stack recomendado

- **Nuxt 4** (Vue 3 + Composition API + `<script setup>`)
- **TypeScript** (el modelo de dominio tipado es lo que se reutiliza después)
- **Pinia** para estado
- **Tailwind CSS** para estilos (rápido para un demo; alternativa: UnoCSS)
- **VueUse** para utilidades (`useIntervalFn` para simular sensores, etc.)
- Sin librería de hardware, sin API, sin auth real

> Para Claude Code: arrancá el proyecto con `npx nuxi@latest init parkos-demo` y agregá los módulos. Pedile que configure Pinia y Tailwind como módulos de Nuxt.

---

## Estructura de carpetas objetivo

```
parkos-demo/
├── nuxt.config.ts
├── package.json
├── tsconfig.json
├── public/
└── app/                       # srcDir de Nuxt 4 (los alias ~ y @ apuntan aquí)
    ├── app.vue
    ├── layouts/
    │   └── default.vue            # El shell: topbar + sidebar
    ├── pages/
    │   ├── index.vue              # redirige a /operacion
    │   ├── operacion.vue
    │   ├── plazas.vue
    │   ├── tarifas.vue
    │   ├── abonados.vue
    │   └── reportes.vue
    ├── components/
    │   ├── shell/
    │   │   ├── PlanToggle.vue
    │   │   ├── SidebarNav.vue
    │   │   └── TopBar.vue
    │   ├── operacion/
    │   │   ├── SesionesTable.vue
    │   │   ├── IngresoManualForm.vue
    │   │   ├── AccesoAutomaticoPanel.vue   # cámara + barrera (Control)
    │   │   └── ComprobanteModal.vue
    │   ├── plazas/
    │   │   └── PlazasGrid.vue
    │   └── common/
    │       └── FeatureLock.vue    # candado "Disponible en plan Control"
    ├── composables/
    │   ├── useEntitlements.ts     # has() / getLimit() / plan activo
    │   └── useParkingData.ts      # interfaz de datos (mock hoy, API mañana)
    ├── stores/
    │   ├── plan.ts                # plan activo + catálogo de planes
    │   └── parking.ts             # sesiones, plazas, abonados, tarifas
    ├── domain/
    │   ├── features.ts            # catálogo de funcionalidades (códigos)
    │   ├── plans.ts               # mapeo plan → funcionalidades
    │   └── types.ts               # Sesion, Plaza, Abonado, Tarifa...
    └── mocks/
        └── seed.ts                # datos semilla creíbles
```

---

# Etapas

Cada etapa es un bloque cerrado: se construye, se prueba a ojo, se commitea, se pasa a la siguiente. **No avances a la siguiente sin que la anterior funcione.**

---

## Etapa 0 — Andamiaje (scaffold)

**Objetivo:** proyecto Nuxt corriendo, en blanco pero navegable.

Pasos:
1. Inicializar proyecto Nuxt 4 con TypeScript.
2. Agregar y configurar Pinia, Tailwind y VueUse como módulos.
3. Crear las páginas vacías (las 5 + index que redirige a `/operacion`).
4. Verificar que `npm run dev` levanta y se puede navegar entre rutas con la URL.

Checklist:
- [ ] `npm run dev` levanta sin errores
- [ ] Las 5 rutas existen y cargan (aunque estén vacías)
- [ ] `/` redirige a `/operacion`
- [ ] Tailwind aplica (probar una clase de color)
- [ ] Commit: `chore: scaffold inicial`

---

## Etapa 1 — Núcleo de entitlements (el corazón)

**Objetivo:** un sistema que sepa qué funcionalidades tiene el plan activo, y un toggle que lo cambie en vivo. Se construye **antes que la UI** porque todo lo demás depende de esto.

Pasos:
1. En `domain/features.ts`, definir el catálogo de funcionalidades con sus códigos y tipo (toggle / límite):
   - `session.manual`, `billing.tariffs`, `billing.calculate`, `payment.register`, `occupancy.view`, `reports.basic` (núcleo, ambos planes)
   - `users.operators` (límite), `branches.max` (límite), `subscribers.manage` (límite o ilimitado)
   - `access.barrier`, `lpr.camera`, `occupancy.sensors`, `signage.dynamic`, `reports.advanced` (solo Control)
2. En `domain/plans.ts`, definir los dos planes como mapeo a funcionalidades + valores de límite:
   - **Gestión:** núcleo + operadores=3, sucursales=1, abonados=50
   - **Control:** todo + operadores=10, sucursales=5, abonados=ilimitado
3. En `stores/plan.ts`, guardar el plan activo (default: Gestión) y exponer una acción para cambiarlo.
4. En `composables/useEntitlements.ts`, exponer `has(code)` y `getLimit(code)` que leen del plan activo. **Reactivo**: si cambia el plan, todo recomputa.

Checklist:
- [ ] El catálogo de funcionalidades está en código, no en componentes
- [ ] Los planes son data (mapeos), no `if` regados
- [ ] `useEntitlements().has('lpr.camera')` devuelve `false` en Gestión, `true` en Control
- [ ] `getLimit('subscribers.manage')` devuelve 50 en Gestión
- [ ] Cambiar el plan en el store recomputa los entitlements reactivamente
- [ ] Commit: `feat: núcleo de entitlements y catálogo de planes`

---

## Etapa 2 — El shell (marco permanente)

**Objetivo:** topbar con el toggle de plan, sidebar que se filtra según el plan, navegación funcionando. Al mover el toggle, el menú reacciona en vivo.

Pasos:
1. `layouts/default.vue`: estructura topbar + sidebar + slot de contenido.
2. `TopBar.vue`: logo, `PlanToggle.vue` (segmentado Gestión ↔ Control), usuario decorativo.
3. `PlanToggle.vue`: lee y escribe el plan activo del store.
4. `SidebarNav.vue`: lista de ítems; cada ítem declara qué funcionalidad requiere. Si el plan activo NO la tiene, se muestra atenuado con candado (`FeatureLock.vue`) y texto "Disponible en plan Control"; no se oculta.
5. Conectar la navegación a las rutas reales.

Checklist:
- [ ] El toggle cambia el plan y se ve el cambio sin recargar
- [ ] En Gestión, "Lectura patente / Sensores / Barreras" aparecen con candado
- [ ] En Control, esos ítems se vuelven navegables
- [ ] El ítem activo se resalta correctamente
- [ ] El candado lee de `useEntitlements`, no de un `if` por ítem
- [ ] Commit: `feat: shell con toggle de plan y nav gated`

---

## Etapa 3 — Capa de datos (mock)

**Objetivo:** una fuente de datos intercambiable con semilla creíble. Es el puente al producto real.

Pasos:
1. `domain/types.ts`: tipar `Sesion`, `Plaza`, `Abonado`, `Tarifa`, `Comprobante`, etc.
2. `composables/useParkingData.ts`: definir la **interfaz** (métodos: `getSesiones`, `registrarIngreso`, `registrarSalida`, `getPlazas`, `getAbonados`, `getTarifas`, `getReporteDia`...).
3. `mocks/seed.ts`: datos semilla con movimiento — varias sesiones activas, plazas mezcladas ocupado/libre, ~49 abonados (para mostrar el límite), una tarifa configurada.
4. `stores/parking.ts`: estado en memoria inicializado desde el seed; las acciones mutan el estado (sin persistencia).

Checklist:
- [ ] Tipos del dominio definidos y exportados
- [ ] `useParkingData` es una interfaz clara; el mock es una implementación de ella
- [ ] Semilla con datos realistas (no "test1, test2")
- [ ] El store de parking arranca poblado desde el seed
- [ ] Ningún componente accede al seed directamente; todo pasa por `useParkingData`
- [ ] Commit: `feat: capa de datos mock e interfaz useParkingData`

---

## Etapa 4 — Pantalla Operación en vivo (la central)

**Objetivo:** la pantalla del 90% del recorrido. Ingreso/salida/cobro en Gestión; mismo flujo automatizado en Control.

Pasos:
1. `SesionesTable.vue`: lista de sesiones activas (patente, entrada, tiempo corriendo, acción salida). La columna "Origen" (Manual / LPR) solo se muestra si `has('lpr.camera')`.
2. `IngresoManualForm.vue`: botón "Registrar ingreso" → form para teclear patente. Visible/primario solo cuando NO hay acceso automático.
3. Flujo de salida: seleccionar sesión → calcular cobro (tiempo × tarifa de la pantalla Tarifas) → `ComprobanteModal.vue` con el monto → cerrar sesión.
4. `AccesoAutomaticoPanel.vue` (solo si `has('access.barrier')`): cámara que "lee" una patente de una lista mock + barrera animada que sube; al dispararse, crea la **misma** sesión que el form manual, con origen LPR.
5. El tiempo de cada sesión se actualiza en vivo (`useIntervalFn`).

Checklist:
- [ ] En Gestión: ingreso manual funciona, crea sesión
- [ ] Salida calcula cobro correcto (tiempo × tarifa) y muestra comprobante
- [ ] La sesión se cierra y desaparece de activas tras la salida
- [ ] En Control: aparece el panel de acceso automático; el form manual pasa a secundario
- [ ] El ingreso automático crea una sesión idéntica a la manual (solo cambia "Origen")
- [ ] La columna "Origen" solo aparece en Control
- [ ] El tiempo de las sesiones corre en vivo
- [ ] Commit: `feat: pantalla operación en vivo (manual + automático)`

---

## Etapa 5 — Pantalla Mapa de estacionamientos

**Objetivo:** la otra pantalla con coreografía. Grilla idéntica en ambos planes; cambia quién la actualiza.

Pasos:
1. `PlazasGrid.vue`: grilla que recibe una lista de plazas con estado; pinta libre/ocupada con color + leyenda.
2. En Gestión: el estado de las plazas refleja los ingresos/salidas registrados en Operación (conteo lógico). Mostrar el contador "X/Y ocupadas".
3. En Control (si `has('occupancy.sensors')`):
   - Timer (`useIntervalFn`) que cambia un par de plazas de estado solo, simulando sensores.
   - Indicador "sensores en vivo · última lectura hace Ns".
   - Señalización dinámica (si `has('signage.dynamic')`): contador grande de espacios libres.
   - Resaltar brevemente la plaza que acaba de cambiar.

Checklist:
- [ ] La grilla es un solo componente; cambia la fuente, no el componente
- [ ] En Gestión la grilla refleja lo registrado en Operación
- [ ] En Control los sensores mueven plazas solos (timer)
- [ ] Señalización dinámica visible solo en Control
- [ ] La plaza que cambia se resalta un instante
- [ ] El timer se limpia al desmontar / cambiar de plan (sin fugas)
- [ ] Commit: `feat: mapa de plazas con simulación de sensores`

---

## Etapa 6 — Pantallas Tarifas, Abonados, Reportes

**Objetivo:** completar las pantallas de soporte. Más convencionales, pero Abonados y Reportes muestran límites y gating.

Pasos:
1. **Tarifas:** configurar tarifa (por hora/fracción o plana). Idéntica en ambos planes. Alimenta el cálculo de Operación.
2. **Abonados:** lista de abonados. Aplicar el **límite** de `subscribers.manage`: en Gestión, al intentar pasar de 50, mostrar "Alcanzaste el límite de tu plan". En Control, ilimitado.
3. **Reportes:** ingresos del día, rotación, ocupación, horas punta (básicos, ambos planes). Si `has('reports.advanced')`, desbloquear sección extra (por sensor, comparativas).

Checklist:
- [x] Tarifas configurables; el cambio se refleja en el cálculo de cobro
- [x] Abonados respeta el límite en Gestión con mensaje claro
- [x] Abonados es ilimitado en Control
- [x] Reportes básicos visibles en ambos; avanzados solo en Control
- [x] Todo gating lee de `useEntitlements`
- [x] Commit: `feat: pantallas tarifas, abonados y reportes`

---

## Etapa 7 — Recorrido guiado y pulido

**Objetivo:** que el demo cuente la historia solo y se vea profesional.

Pasos:
1. (Opcional pero potente) **Modo demo:** un botón que auto-reproduce la secuencia del guion (ingreso → salida → flip a Control → ingreso automático → sensores → reporte) para cuando no estés presente.
2. Pulir animaciones: barrera que sube, cámara que "lee", plaza que se libera, transición del toggle.
3. Revisar el flip de plan: que TODO reaccione en vivo sin recargar ni glitches.
4. Datos semilla finales realistas. Logo y nombre comercial.
5. Revisar en pantalla de notebook (resolución típica de una reunión).

Checklist:
- [ ] El recorrido completo de las 10 escenas funciona de principio a fin
- [ ] El flip Gestión↔Control es instantáneo y sin parpadeos
- [ ] Animaciones suaves, nada brusco
- [ ] (Si se hizo) el modo demo auto-reproduce el guion
- [ ] Se ve bien en la resolución donde lo vas a mostrar
- [ ] Commit: `feat: recorrido guiado y pulido visual`

---

## Etapa 8 — Diseño responsivo (móvil)

**Objetivo:** que el shell y todas las pantallas se vean y se usen correctamente en dispositivos móviles (320–414px de ancho), sin perder usabilidad en desktop. El demo se muestra a veces desde un celular o tablet, no solo desde notebook.

Pasos:
1. `composables/useSidebar.ts` (nuevo): estado global (`abierto` / `abrir` / `cerrar` / `toggle`) para el drawer del sidebar en móvil.
2. `layouts/default.vue`: el `<aside>` pasa a ser estático solo desde `lg:`; por debajo de `lg:` se monta un drawer deslizante con backdrop oscuro (cierra con click afuera, tecla Escape, o al navegar). Se conecta con `useDemoSpotlight()` para que, si el recorrido guiado resalta los candados del sidebar, el drawer se abra solo y siga siendo visible en móvil. Padding del `<main>` responsivo (`p-4 sm:p-6 lg:p-8`).
3. `TopBar.vue`: botón hamburguesa nuevo (visible solo `<lg`), paddings/gaps comprimidos para que logo + `PlanToggle` + controles de demo + avatar entren sin desbordar incluso a 320px.
4. `PlanToggle.vue` / `DemoControls.vue`: tamaños reducidos en móvil — el toggle de plan (herramienta de venta) se mantiene siempre visible, pero más angosto; el botón "Iniciar recorrido" oculta su texto y deja solo el ícono en pantallas chicas.
5. `SidebarNav.vue`: emite `navigate` en cada link para que el layout cierre el drawer al elegir una sección.
6. `DemoBanner.vue`: `flex-wrap` + `min-w-0` en el label del paso actual para que no desborde ni se corte mal en pantallas angostas.
7. Encabezados de página (`operacion`, `plazas`, `abonados`), tablas (`SesionesTable`, `AbonadosTable`), formularios inline (`IngresoManualForm`, `AgregarAbonadoForm`), `AccesoAutomaticoPanel`, y grids de `reportes`/`tarifas`: `flex-wrap`, `overflow-x-auto` y columnas que pasan a una sola en móvil.

Checklist:
- [x] Sin overflow horizontal en ninguna pantalla a 320px ni 375px de ancho
- [x] El sidebar se vuelve drawer en móvil, con backdrop, y cierra por click afuera / Escape / navegación
- [x] El TopBar no desborda en pantallas angostas (hamburguesa, logo, PlanToggle, controles, avatar)
- [x] Las tablas con muchas columnas permiten scroll horizontal interno sin romper el layout de la página
- [x] Los formularios inline (Registrar ingreso, Agregar abonado) no cortan botones en móvil
- [x] Desktop (`≥lg`) sin regresiones: sidebar estático, sin hamburguesa, TopBar igual que antes
- [x] Verificado con Playwright en 320×568, 375×812 y 1440×900 (capturas + chequeo de `scrollWidth`)
- [x] Commit: `feat: diseño responsivo del shell y pantallas para móvil` (PR #1, mergeado a `main`)

---

## Etapa 9 — Bitácoras reales: Lectura de patente, Sensores, Barreras

**Objetivo:** los tres ítems gated del sidebar (`lpr.camera`, `occupancy.sensors`, `access.barrier`) llevaban a pantallas en blanco. En vez de inventar mini-features nuevas y desconectadas, cada pantalla pasa a ser una bitácora de **datos reales** que ya genera el resto de la app — sin estado paralelo falso.

Pasos:
1. `composables/useSensoresSimulados.ts` (nuevo): se extrae la simulación de sensores —antes vivía solo dentro de `pages/plazas.vue` y se detenía si el operador cambiaba de pantalla— a un composable global (`createGlobalState`), instanciado desde `layouts/default.vue`. Mantiene una bitácora de las últimas 20 lecturas (plaza, nuevo estado, hora).
2. `pages/plazas.vue`: se simplifica para consumir `useSensoresSimulados()` en vez de tener su propio `useIntervalFn` local; mismo comportamiento visual, lógica centralizada.
3. `pages/sensores.vue`: estado "en vivo · última lectura hace Ns" + métricas (`ReportesMetricCard`) + tabla de bitácora de lecturas, reutilizando `getPlazas()` y la bitácora del composable.
4. `pages/lpr.vue`: bitácora de lecturas de cámara, filtrando `getSesiones()` por `origen === 'lpr'` (no reinventa la simulación de cámara, que ya vive en `AccesoAutomaticoPanel`).
5. `pages/barreras.vue`: la misma data de sesiones con `origen === 'lpr'`, presentada como bitácora de aperturas automáticas (cada lectura válida implica que la barrera se levantó).
6. En las tres, si el plan activo no incluye la funcionalidad, se muestra el mismo bloque de `CommonFeatureLock` que ya usa Reportes avanzados (vende el candado) en vez de una pantalla vacía.

Checklist:
- [x] `/sensores`, `/lpr` y `/barreras` muestran candados en plan Gestión, no contenido vacío
- [x] En plan Control, las tres muestran datos reales (seed + cambios en vivo), no mocks paralelos
- [x] La bitácora de sensores crece con lecturas reales cada ~5s mientras el plan activo es Control
- [x] `/plazas` sigue funcionando igual que antes tras mover la simulación a `useSensoresSimulados`
- [x] Las tablas nuevas respetan el mismo patrón responsivo de la Etapa 8 (`overflow-x-auto`, `flex-wrap`)
- [x] Verificado con Playwright: estado bloqueado/desbloqueado por plan y crecimiento de la bitácora en el tiempo
- [x] Commit: `feat: bitácoras reales en lectura de patente, sensores y barreras` (PR #2, mergeado a `main`)

---

## Etapa 10 — Ticket con código de barras (entrada y salida)

**Objetivo:** tercer origen de sesión (`ticket`). El ingreso genera un ticket térmico con barcode CODE128; la salida acepta el código escaneado (o tipeado con Enter, compatible con pistola HID real). Funcionalidad `ticket.barcode` activa en Gestión **y** Control.

Archivos nuevos/modificados:
- `app/domain/types.ts` — `SesionOrigen` agrega `'ticket'`; `Sesion` agrega `ticketCode?`; `ToggleCode` agrega `'ticket.barcode'`
- `app/domain/features.ts` — `'ticket.barcode'` en el catálogo (sección Núcleo)
- `app/domain/plans.ts` — `'ticket.barcode': true` en **ambos** planes
- `app/domain/ticket.ts` *(nuevo)* — `generarTicketCode(sesionId)` puro y testeable
- `app/stores/parking.ts` — `registrarIngreso` asigna `ticketCode` cuando origen es `'ticket'`; nueva acción `buscarSesionPorTicket(code)`
- `app/composables/useParkingData.ts` — contrato extendido con `buscarSesionPorTicket`
- `app/components/operacion/TicketBarcode.vue` *(nuevo)* — modal de ticket térmico 58 mm con JsBarcode (client-only via `onMounted`)
- `app/components/operacion/EscanearTicketSalida.vue` *(nuevo)* — input HID-compatible, Enter confirma, busca sesión y dispara flujo de salida existente
- `app/components/operacion/IngresoManualForm.vue` — usa origen `'ticket'` cuando `has('ticket.barcode')`, muestra `TicketBarcode` tras confirmar
- `app/components/operacion/SesionesTable.vue` — `mostrarOrigen` incluye `ticket.barcode`; badge ámbar para origen Ticket
- `app/pages/operacion.vue` — monta `EscanearTicketSalida` cuando `has('ticket.barcode')`

Checklist:
- [x] `has('ticket.barcode') === true` en Gestión y en Control
- [x] En el flujo de ingreso se genera un ticket con código de barras (CODE128) y se muestra imprimible (vista tipo recibo 58 mm)
- [x] El barcode renderiza solo en cliente (no rompe el SSR)
- [x] El `ticketCode` es un id único (NO la patente); la patente aparece como texto legible en el ticket
- [x] El campo "Escanear ticket" confirma con Enter (compatible con pistola HID real)
- [x] Escanear un código válido encuentra la sesión y dispara cobro + comprobante + salida, liberando la plaza
- [x] Un código inválido muestra mensaje claro
- [x] La sesión con ticket aparece en la misma tabla; Origen = 'Ticket' (badge ámbar)
- [x] La acción "Salida" por fila sigue funcionando como alternativa
- [x] Gating con `has('ticket.barcode')`; sin ifs por id de plan; datos vía `useParkingData`
- [x] Commit: `feat: tickets con código de barras (origen ticket) en plan Gestión`

---

# Cómo trabajar esto con Claude Code

- **Una etapa por sesión/prompt.** Pedí a Claude Code que implemente una etapa completa, no el proyecto entero de una vez. Da contexto de la etapa y su checklist.
- **Empezá cada sesión apuntando a este documento** y a la etapa actual. Ej: "Estamos en la Etapa 4. Acá está el plan. Implementá la pantalla Operación en vivo respetando la interfaz `useParkingData` y `useEntitlements` ya creadas."
- **Commiteá al cerrar cada etapa.** Los mensajes de commit ya están sugeridos arriba.
- **No dejes que adelante etapas.** Si en la Etapa 2 empieza a meter lógica de sensores, frenalo: eso es Etapa 5.
- **Revisá el checklist a ojo en el navegador** antes de avanzar. El checklist es el "definition of done" de cada etapa.
- **Cuidá el principio reutilizable:** si ves un `if (plan === 'control')` suelto, pedí que lo reemplace por `has('...')`. Si ves un componente leyendo el seed directo, pedí que pase por `useParkingData`.

---

# Lo que NO se construye en el demo (a propósito)

- Back-office (tu lado de administración: alta de clientes, facturación)
- Autenticación / multi-tenancy reales
- Pagos reales
- Integración real con hardware (protocolos, gateway)
- Persistencia (base de datos)

Todo eso es producto real, no venta. El día que un dueño de plaza diga "lo quiero", recién ahí arranca el desarrollo formal — y gracias a la interfaz `useParkingData` y al modelo de dominio tipado, buena parte del frontend se reutiliza.
