# Spec frontend — E2: Sección «Meta semanal»

Fecha: 2026-11-07 · Estado: implementada (2026-11-08) y desplegada en Render (2026-11-09)
Documentos relacionados: [PRD](../prd/PRD-diario-progreso-gamer.md) · [historias y tickets](../backlog/E2-metas-y-rachas.md) · [spec backend](E2-backend-meta-y-progreso-semanal.md) · [DESIGN.md](../../DESIGN.md)
Tickets: E2-T02, E2-T09, E2-T10, E2-T11, E2-T12, E2-T13, E2-T19 (y la parte frontend de E2-T14, E2-T18 y E2-T20)
Ampliaciones: §9 (2026-11-08, refresco del progreso, edición de partidas y tokens de color) y §10 (2026-11-09, revisión de diseño, E2-T19).

## 0. Resumen

El detalle del videojuego (`DetalleVideojuego.tsx`) incorpora una sección «Meta semanal» que muestra la meta, el progreso de la semana actual, la racha, los hitos y las últimas 4 semanas, con datos de `GET /api/videojuegos/:id/progreso-semanal`. La sección permite fijar, cambiar y quitar la meta, y añadir y eliminar hitos. También se corrige el bug #1: las fechas de las partidas se ven un día antes.

## 1. Reglas DEBE / NO DEBE

| ID | Regla | Origen |
|---|---|---|
| F-01 | Las páginas **NO DEBEN** usar `fetch` directamente; **DEBEN** llamar a `frontend/src/api/metasApi.ts`, que usa `VITE_API_URL` como base. | AGENTS.md |
| F-02 | Las fechas de partida (`AAAA-MM-DD` guardadas a medianoche UTC) **DEBEN** formatearse con `{ dateStyle: "medium", timeZone: "UTC" }` mediante una única `formatearFecha` en `frontend/src/utils/formato.ts`. **NO DEBEN** quedar copias locales de `formatearFecha`. | RN-03, diag. #1, #11 |
| F-03 | La interfaz **NO DEBE** recalcular el progreso, la racha, las semanas ni el estado de los hitos: **DEBE** mostrar lo que devuelve `/progreso-semanal`, que es la única fuente de verdad. | B-05…B-16 |
| F-04 | La sección **DEBE** ser `<section aria-label="Meta semanal">` y estar entre «Resumen de actividad» e «Información». | PRD §5.2 |
| F-05 | Cada barra de progreso **DEBE** tener `role="progressbar"`, `aria-valuemin=0`, `aria-valuemax=100` y `aria-valuenow = min(porcentaje, 100)`. Su ancho **NO DEBE** superar el 100 %, y el texto **DEBE** mostrar el porcentaje real («7 de 5 h · 140 %»). | H-5 |
| F-06 | Si el juego está `completado` o `abandonado`, el formulario de meta **DEBE** mostrarse deshabilitado con el texto «No se puede fijar una meta en un juego completado o abandonado», y la racha y las últimas 4 semanas **DEBEN** seguir visibles. | H-7 |
| F-07 | El formulario de hitos **DEBE** deshabilitarse cuando la meta tiene 5 hitos, y **NO DEBE** mostrarse si no hay meta activa. | RN-10 |
| F-08 | «Cambiar meta» **DEBE** avisar que la meta actual quedará archivada. «Quitar meta» y «Eliminar hito» **DEBEN** pedir confirmación con `window.confirm`. | RN-07 |
| F-09 | La confirmación de eliminar un videojuego **DEBE** avisar que también se borrarán su meta semanal y sus hitos. | H-8 |
| F-10 | Después de fijar, cambiar o quitar la meta, o de añadir o eliminar un hito, la sección **DEBE** volver a pedir el progreso. Al volver de registrar una partida, el detalle **DEBE** cargarlo de nuevo. | — |
| F-11 | La sección **DEBE** mostrar los estados de carga (`loading-state`), error (`error-state`) y vacío (`empty-state`). Los errores de formulario **DEBEN** mostrarse en `form-error` con el mensaje de la API tal cual. | AGENTS.md |
| F-12 | Los estilos **DEBEN** reutilizar las clases y los colores existentes (`panel`, `section-title`, `stat-label`, `stat-value`, `status-badge-*`, `field`, `form-error`, variables de `styles.css`, `tailwind.config.js`) y seguir `DESIGN.md`. **NO DEBEN** usarse colores ni fuentes sueltos. | AGENTS.md |
| F-13 | Las últimas 4 semanas **NO DEBEN** mostrarse como gráfico; **DEBEN** ser 4 indicadores simples. | PRD §6 |
| F-14 | Todos los textos **DEBEN** estar en español, con coma decimal («3,5 h») y el singular correcto («1 día seguido»). | AGENTS.md |
| F-15 | Los campos del formulario **DEBEN** llevar `min`, `max` y `step` acordes a los límites (horas > 0 y ≤ 100; días enteros 1–7; porcentaje objetivo entero 1–100) para dar aviso inmediato. Aun así, **NO DEBEN** sustituir la validación del backend: **DEBEN** mostrar su mensaje si responde 400 o 409 (B-24). | B-02, B-13 |

## 2. Utilidades de formato — `frontend/src/utils/formato.ts` (E2-T02, E2-T10)

Son funciones puras, sin React, y se pueden probar con `node:test`.

| Función | Contrato |
|---|---|
| `formatearFecha(fecha: string): string` | `Intl.DateTimeFormat("es", { dateStyle: "medium", timeZone: "UTC" })` → «21 oct 2026» (F-02). |
| `formatearDia(dia: string): string` | `"2026-10-12"` → «12 oct», para los rangos de semanas. |
| `formatearHoras(horas: number): string` | Hasta 1 decimal y coma decimal: `3.5` → «3,5», `7` → «7». |
| `anchoBarra(porcentaje: number): number` | `Math.min(Math.max(porcentaje, 0), 100)` (F-05). |
| `textoRacha(racha: number): string` | `0` → «Sin racha», `1` → «1 día seguido», `n` → «n días seguidos». |

## 3. Tipos y API (E2-T09)

**Tipos** en `frontend/src/types.ts`, alineados con la spec backend §5:

```ts
export interface Hito { _id: string; descripcion: string; porcentajeObjetivo: number; alcanzadoEn?: string }
export interface Meta { _id: string; horasSemanales: number; diasPorSemana: number; activa: boolean; vigenteDesde: string; hitos: Hito[] }
export type EstadoSemana = "cumplida" | "no_cumplida" | "sin_meta";
export interface SemanaHistorial { inicio: string; fin: string; estado: EstadoSemana; horas?: number; dias?: number; porcentajeHoras?: number; porcentajeDias?: number }
export interface HitoProgreso { _id: string; descripcion: string; porcentajeObjetivo: number; alcanzado: boolean; alcanzadoEn: string | null }
export interface ProgresoSemanal {
  semana: { inicio: string; fin: string };
  meta: { horasSemanales: number; diasPorSemana: number } | null;
  horasSemana: number; porcentajeHoras: number | null;
  diasJugadosSemana: number; porcentajeDias: number | null; cumplida: boolean | null;
  rachaActual: number; mejorRacha: number; porcentajeAvanceActual: number | null;
  hitos: HitoProgreso[]; ultimas4: SemanaHistorial[]; semanasCumplidas: number; semanasConMeta: number;
}
export interface MetaFormulario { horasSemanales: number; diasPorSemana: number }
export interface HitoFormulario { descripcion: string; porcentajeObjetivo: number }
export interface MetaRespuesta { meta: Meta }
```

**Cliente** en `frontend/src/api/metasApi.ts`. Sigue el mismo patrón que `videojuegoApi.ts`: base `VITE_API_URL` y lanza `Error` con el `mensaje` de la API.

| Función | Llamada |
|---|---|
| `obtenerProgreso(id)` | `GET /api/videojuegos/:id/progreso-semanal` → `ProgresoSemanal` (la respuesta no lleva envoltorio) |
| `fijarMeta(id, datos)` | `PUT /api/videojuegos/:id/meta` → `Meta` |
| `quitarMeta(id)` | `DELETE /api/videojuegos/:id/meta` |
| `agregarHito(id, datos)` | `POST /api/videojuegos/:id/meta/hitos` → `Meta` |
| `eliminarHito(id, hitoId)` | `DELETE /api/videojuegos/:id/meta/hitos/:hitoId` → `Meta` |

## 4. Interfaz — `DetalleVideojuego.tsx` (E2-T10 a E2-T13)

Dentro de `<section aria-label="Meta semanal" className="panel …">`, con el título `section-title` «Meta semanal»:

| Bloque | Ticket | Contenido |
|---|---|---|
| Carga y error | T10 | `loading-state` mientras se pide el progreso; `error-state` con el mensaje si falla. |
| Sin meta | T10 | `empty-state` «Aún no tienes una meta para este juego» con el formulario de horas y días por semana y el botón «Fijar meta». |
| Juego completado o abandonado | T10 | El formulario deshabilitado (`disabled`) con el texto de F-06. |
| Meta y semana actual | T10 | «Meta: 5 h y 4 días por semana» (`meta`); dos barras con «3,5 de 5 h · 70 %» (`horasSemana`, `porcentajeHoras`) y «3 de 4 días · 75 %» (`diasJugadosSemana`, `porcentajeDias`); insignia `status-badge-*` «Meta cumplida» o «En curso» según `cumplida`. |
| Acciones de meta | T10 | «Cambiar meta» (formulario con valores precargados y el aviso «La meta actual quedará archivada y la nueva se aplicará a toda esta semana») y «Quitar meta» (con `confirm`). |
| Racha | T11 | `stat-label` «Racha» y `stat-value` con `textoRacha(rachaActual)`, y debajo «Mejor racha: {textoRacha(mejorRacha)}». |
| Últimas 4 semanas | T11 | 4 indicadores con «12 oct – 18 oct» y el estado (Cumplida / No cumplida / Sin meta, con `status-badge-*`) más «X de N semanas con meta cumplidas». Si `semanasConMeta = 0`: «Todavía no hay semanas completas con meta». |
| Hitos | T12 | Lista de `hitos` con descripción, «Objetivo: 50 %» y «Alcanzado el 30 oct 2026» (si `alcanzado` y hay `alcanzadoEn`), «Alcanzado» (si `alcanzado` sin fecha) o «Pendiente» (si no `alcanzado`, aunque tenga `alcanzadoEn` de una vez anterior); formulario de descripción y porcentaje objetivo con el botón «Añadir hito» (deshabilitado con 5 hitos, oculto sin meta); botón «Eliminar» con `confirm`. |
| Eliminar videojuego | T13 | El `confirm` de la línea 92 pasa a: «¿Seguro que quieres eliminar "{nombre}"? También se borrarán su meta semanal y sus hitos.» |

Las fechas de alcance de los hitos (`alcanzadoEn`, un instante real) se formatean con `timeZone: "America/Guayaquil"`, no con UTC, para mostrar el día de Ecuador en que ocurrió.

## 5. Pruebas

- `test/frontend/formato.test.js`: lo lanza `cd backend && npm test`, que ejecuta `../test/**/*.test.js` con `tsx` y puede importar `frontend/src/utils/formato.ts`. Cubre:
  - `formatearFecha("2026-10-21T00:00:00.000Z")` → «21 oct 2026», con cualquier zona horaria del proceso;
  - `formatearHoras(3.5)` → «3,5»;
  - `anchoBarra(140)` → 100 y `anchoBarra(70)` → 70;
  - `textoRacha` con 0, 1 y 3.
- `cd frontend && npm run build` (incluye `tsc`) y `npx tsc --noEmit`.
- `cd frontend && npm test` sigue sin tests propios (diagnóstico #15, diferido).
- Verificación manual con `cd backend && npm run dev` y `cd frontend && npm run dev`, siguiendo la tabla de §6.

## 6. Criterio → verificación

**Auto** = `test/frontend/formato.test.js`. **Manual** = comprobación en el navegador en local (`http://localhost:5173`). **Build** = `npm run build`.

| Criterio / regla | Verificación | Tipo |
|---|---|---|
| H0-C1, F-02 | Test de `formatearFecha`; en la app, una partida del 21/10/2026 se ve «21 oct 2026» en la lista y en el detalle | Auto + Manual |
| H1-C1 | Juego sin meta → fijar 5 h y 3 días → la sección muestra «Meta: 5 h y 3 días por semana» | Manual |
| H1-C2, F-08 | «Cambiar meta» muestra el aviso de archivado; tras guardar 8 h, la barra de horas usa «de 8 h» | Manual |
| H1-C3 | Con hitos, cambiar la meta → la lista de hitos queda igual | Manual |
| H1-C5, F-15 | Introducir 0 h, 101 h, 0 días, 8 días o 2,5 días → el navegador lo impide o aparece en `form-error` el mensaje en español del backend | Manual |
| H2-C1, F-08 | «Quitar meta» pide confirmación → aparece el estado vacío con «Fijar meta» | Manual |
| H2-C3 | Sin meta → se ve la racha y no hay barras | Manual |
| H3-C2, H3-C5, F-06 | Juego en «Completado» → formulario deshabilitado con el texto; racha y 4 semanas visibles | Manual |
| H3-C3 | Forzar el envío en un juego abandonado → `form-error` con «No se puede fijar una meta en un videojuego completado o abandonado» | Manual |
| H4-C2, F-09 | Pulsar «Eliminar» en el detalle → el `confirm` menciona la meta semanal y los hitos | Manual |
| H5-C1 | Con los datos del criterio → «3,5 de 5 h · 70 %», «2 de 3 días · 67 %», «En curso» | Manual |
| H5-C2, F-05 | 7 h con meta de 5 h → «7 de 5 h · 140 %», barra al 100 % sin desbordar (`aria-valuenow="100"`), «Meta cumplida»; test de `anchoBarra` | Auto + Manual |
| H5-C3 | 6 h en 2 días con meta {5,3} → «En curso» | Manual |
| H5-C8, F-11 | Juego sin meta → `empty-state` con formulario; con la API parada → `error-state` | Manual |
| H6-C1 … H6-C3, H6-C5, F-14 | Test de `textoRacha` («Sin racha», «1 día seguido», «3 días seguidos»); en la app se muestran `rachaActual` y `mejorRacha` | Auto + Manual |
| H7-C1 | Añadir «Llegar al 50 %» con 50 → aparece «Pendiente» | Manual |
| H7-C2, H7-C4 | Porcentaje objetivo ≤ avance o repetido → `form-error` con el mensaje del backend | Manual |
| H7-C3, F-07 | Con 5 hitos → «Añadir hito» deshabilitado | Manual |
| H7-C5 | «Eliminar» en un hito → `confirm` → desaparece | Manual |
| H7-C6, F-07 | Juego sin meta → no hay formulario de hitos | Manual |
| H8-C1, F-10 | Registrar una partida con 55 % y volver al detalle → el hito de 50 % aparece «Alcanzado el <hoy>» | Manual |
| H9-C1, H9-C5, F-13 | 4 indicadores con rango y estado, «3 de 4 semanas con meta cumplidas», sin gráfico | Manual |
| H9-C2 | Meta de hace 2 semanas → 2 «Sin meta» y «X de 2» | Manual |
| F-01 | `grep -n "fetch(" frontend/src/pages` no devuelve resultados | Manual |
| F-03 | Revisión de código: la sección no calcula porcentajes, semanas ni racha; solo formatea los datos de `/progreso-semanal` | Manual |
| F-04, F-12 | Revisión visual y de código: la sección está entre «Resumen de actividad» e «Información», con clases existentes y sin colores hexadecimales nuevos | Manual |
| Tipos y build | `npm run build` y `npx tsc --noEmit` sin errores | Build |

## 7. Ticket → archivos

| Ticket | Archivos (N = nuevo, M = modificado) |
|---|---|
| E2-T02 | N `frontend/src/utils/formato.ts` (`formatearFecha`) · M `frontend/src/pages/ListaPartidas.tsx` · M `frontend/src/pages/DetalleVideojuego.tsx` · N `test/frontend/formato.test.js` |
| E2-T09 | M `frontend/src/types.ts` · N `frontend/src/api/metasApi.ts` |
| E2-T10 | M `frontend/src/pages/DetalleVideojuego.tsx` · M `frontend/src/utils/formato.ts` (`formatearHoras`, `anchoBarra`) · M `test/frontend/formato.test.js` · M `frontend/src/styles.css` (solo si hace falta la clase de la barra, con variables existentes) |
| E2-T11 | M `frontend/src/pages/DetalleVideojuego.tsx` · M `frontend/src/utils/formato.ts` (`textoRacha`, `formatearDia`) · M `test/frontend/formato.test.js` |
| E2-T12 | M `frontend/src/pages/DetalleVideojuego.tsx` |
| E2-T13 | M `frontend/src/pages/DetalleVideojuego.tsx` (texto del `confirm`) |
| E2-T14 (frontend) | M `README.md` (sección «Meta semanal» y la nota de las fechas) |

Si `DetalleVideojuego.tsx` crece demasiado, la sección puede extraerse a `frontend/src/components/MetaSemanal.tsx`, con las mismas reglas.

## 8. Fuera de alcance

- Gráficos, notificaciones y recordatorios.
- Consultar o editar el historial de metas.
- Editar un hito existente (el backend no tiene endpoint; se elimina y se vuelve a crear).
- Tests de componentes React (diagnóstico #15, diferido).

## 9. Ampliación (2026-11-08): refresco del progreso, edición de partidas y tokens de color

Añadida tras verificar el frontend contra el enunciado de E2 («el progreso se vuelve a consultar al registrar, editar o eliminar una partida», «un servicio `metasApi.ts`», «estilos solo desde las variables definidas a partir de DESIGN.md»).

Tickets: F-16 → E2-T09; F-17, F-18 y F-19 → E2-T10 (refresco del progreso y edición de partidas); F-20 → E2-T10 y E2-T12 (tokens de la sección). Esta ampliación se commiteó junto con su código en `ae7c06d` ([AUDITORIA §9](../AUDITORIA.md#9-limitaciones-conocidas-de-esta-evidencia)).

| ID | Regla |
|---|---|
| F-16 | El cliente de metas **DEBE** llamarse `frontend/src/api/metasApi.ts`. |
| F-17 | Registrar una partida desde el detalle (`/partidas/nueva?videojuegoId=…`) **DEBE** volver a `/videojuegos/:id` al guardar, para que el detalle y la sección «Meta semanal» se vuelvan a cargar. Sin `videojuegoId`, se vuelve a `/partidas`. |
| F-18 | **DEBE** existir la ruta `/partidas/:id/editar`, que reutiliza `FormularioPartida.tsx` con los datos precargados (`obtenerPartidaPorId`) y guarda con `actualizarPartida` (`PUT /api/partidas/:id`). El título y el botón **DEBEN** decir «Editar partida» y «Guardar cambios». Al guardar se aplica la misma regla de vuelta que en F-17. Las notas vacías se envían como `""` para poder borrarlas; dejar vacío el avance mantiene el valor anterior. |
| F-19 | El historial de partidas del detalle **DEBE** ofrecer «Editar» (enlace a `/partidas/:id/editar?videojuegoId=…`) y «Eliminar» (con `window.confirm`) en cada partida. Al eliminar, el detalle **DEBE** volver a pedir las partidas, el resumen y el progreso semanal: `MetaSemanal` recibe una prop `recarga` (número) que, al cambiar, vuelve a llamar a `obtenerProgreso`. La lista `/partidas` **DEBE** ofrecer también «Editar». |
| F-20 | Los colores **DEBEN** venir de tokens definidos en `tailwind.config.js` y documentados en `DESIGN.md`. `styles.css` y los componentes **NO DEBEN** contener valores hex sueltos en clases (`[#…]`). Tokens añadidos: `copy` (#f1eddf), `surface` (#191b1a), `field` (#141615), `signal-light` (#d5e783) y `signal-ink` (#202316). En la sección «Meta semanal», el texto principal usa `text-copy` en lugar de `text-white`. |

| Criterio | Verificación | Tipo |
|---|---|---|
| F-16 | `grep -rn "metaApi" frontend/src` no devuelve resultados | Manual |
| F-17 | Desde el detalle, «Registrar partida» → guardar → se vuelve al detalle con las horas de la semana actualizadas | Manual |
| F-18 | «Editar» una partida → el formulario aparece precargado → cambiar la duración → al volver al detalle, la barra de horas refleja el cambio | Manual |
| F-19 | «Eliminar» una partida en el detalle → `confirm` → desaparece del historial y se actualizan el resumen y la meta semanal sin recargar la página | Manual |
| F-20 | `grep -n "\[#" frontend/src/styles.css frontend/src -r` no devuelve resultados | Manual |

| Archivos (N = nuevo, M = modificado) |
|---|
| M `frontend/src/api/metaApi.ts` → `metasApi.ts` · M `frontend/src/App.tsx` · M `frontend/src/pages/FormularioPartida.tsx` · M `frontend/src/pages/ListaPartidas.tsx` · M `frontend/src/pages/DetalleVideojuego.tsx` · M `frontend/src/components/MetaSemanal.tsx` · M `frontend/tailwind.config.js` · M `frontend/src/styles.css` · M `DESIGN.md` · M `README.md` |

## 10. Ampliación (2026-11-09): revisión de diseño (E2-T19)

Se escribe y se commitea antes de cualquier corrección de código, para cumplir el paso 7 del enunciado («revisión de diseño con el agente contra DESIGN.md y corrección de las desviaciones»).

| ID | Regla |
|---|---|
| F-21 | La sección «Meta semanal» (`MetaSemanal.tsx`), su integración en `DetalleVideojuego.tsx` y la edición de partidas (`FormularioPartida.tsx`) **DEBEN** cumplir el checklist §9 y la sección «No hacemos» §10 de `DESIGN.md`. La revisión **DEBE** quedar en `docs/revision-diseno.md`, con una fila por regla: dónde se revisó, el resultado y la corrección. Cada desviación **DEBE** corregirse solo con los tokens y clases que ya existen y en un commit que cite E2-T19. **NO DEBEN** añadirse colores, fuentes ni librerías nuevas. |

| Criterio | Verificación | Tipo |
|---|---|---|
| F-21 | `docs/revision-diseno.md` sin desviaciones abiertas; `cd frontend && npm run build` pasa; `grep -rn "\[#" frontend/src` sin resultados; recorrido visual de la sección | Revisión + Build + Manual |

| Ticket | Archivos (N = nuevo, M = modificado) |
|---|---|
| E2-T19 | N `docs/revision-diseno.md` · M `frontend/src/components/MetaSemanal.tsx`, `frontend/src/pages/DetalleVideojuego.tsx` y `frontend/src/pages/FormularioPartida.tsx`, solo si la revisión encuentra desviaciones |
| E2-T18 (frontend) | M `README.md` · M `AGENTS.md` · M esta spec (estado) |
| E2-T20 (frontend) | M `docs/AUDITORIA.md` (§0.2) |
