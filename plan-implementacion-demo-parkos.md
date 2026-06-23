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
