# Auditoría — evidencia que no se ve en el historial de git

Proyecto: Diario de Progreso Gamer · Rama: `feature/e2-metas-rachas` · Fecha de corte: 2026-11-08

El historial de git solo muestra **qué** cambió y **cuándo** se hizo el commit. No muestra los planes hechos en plan mode, las ejecuciones de tests, las pruebas manuales contra la API, si los hooks funcionan, las decisiones tomadas en la conversación con el agente ni el trabajo que aún no está en un commit. Este documento reúne esa evidencia. El contenido íntegro de cada archivo de evidencia está en los [apéndices](#apendices).

## 0. Auditoría por criterio

Una fila por cada fila de la tabla «criterio → verificación» de cada spec: [backend §7](specs/E2-backend-meta-y-progreso-semanal.md#7-criterio--verificación) y [frontend §6](specs/E2-frontend-meta-semanal.md#6-criterio--verificación). Fecha de corte: 2026-11-08.

**Cómo leer las tablas**

- **Auto:** test de `cd backend && npm test`. En la última ejecución (2026-11-08, tras E2-T15) pasan **203 de 203**, con 0 fallos y 0 omitidos.
- **Curl #N:** caso N de la [tabla de pruebas manuales §4.1](#41-tabla-de-pruebas), con el log en el [Apéndice C](#apendice-c).
- **Revisión:** comprobación del código o `grep` hecha el 2026-11-08; el comando está en la columna de evidencia.
- **Resultado:**
  - ✅ verificado;
  - ✅ auto · ⏳ manual: el test pasa, pero la comprobación manual que pide la spec aún no está registrada;
  - ⏳ pendiente: no hay evidencia registrada todavía;
  - ❌ falla.

Ninguna fila se marca ✅ sin evidencia registrada.

### 0.1 Spec backend — Meta y progreso semanal

| Criterio / regla | Cómo se verificó | Resultado | Evidencia |
|---|---|---|---|
| H0-C2, B-05 | Auto | ✅ | `fechas.test.js` (`hoyEcuador(2026-11-09T04:59Z) = "2026-11-08"`); `progreso.test.js` caso 2 |
| H0-C3 | Auto | ✅ | `progreso.test.js` caso 1 |
| H0-C4 | Auto | ✅ | `fechas.test.js` (`inicioSemana("2026-01-01") = "2025-12-29"`) |
| B-06 | Auto | ✅ | `fechas.test.js` (`diaCalendario`, `interpretarFecha`) |
| H1-C1 | Curl | ✅ | Curl #3: `PUT /meta {5,3}` → 201, meta activa |
| H1-C2, B-03 | Manual (pendiente): `PUT /meta {8,3}` sobre una meta existente | ⏳ pendiente | Ningún caso de §4.1 cambia las cifras de una meta existente |
| H1-C3 | Manual (pendiente) | ⏳ pendiente | Ningún caso cambia una meta con hitos |
| H1-C4, B-04 | Curl | ✅ | Curl #14: mismos valores → 200, sin meta nueva |
| H1-C5, B-02 | Auto + Curl | ✅ | `meta.test.js` y `metas.test.js` caso 1; Curl #18, #19 y #20 → 400 con el mensaje exacto |
| H2-C1 | Curl | ✅ | Curl #27 (`DELETE /meta` → 204) y #28 (`GET /meta` → 404) |
| H2-C2 | Auto | ✅ | `progreso.test.js` caso 10 |
| H2-C3 | Curl | ✅ | Curl #2: sin meta → `meta: null`, `hitos: []`, horas y rachas calculadas |
| H3-C1, B-18 | Auto + Manual | ✅ auto · ⏳ manual | `progreso.test.js` caso 15 y `metas.test.js` caso 1; falta el `PUT` de estado a `completado` contra la API |
| H3-C3 | Auto + Manual | ✅ auto · ⏳ manual | `metas.test.js` caso 1 (juego `abandonado` → 400); falta la comprobación contra la API |
| H3-C4 | Manual (pendiente) | ⏳ pendiente | — |
| H3-C6 | Manual (pendiente) | ⏳ pendiente | — |
| H4-C1, B-17 | Curl | ✅ | Curl #33–34: al borrar A y B se borraron sus metas |
| H5-C1 | Auto | ✅ | `progreso.test.js` (3,5 h, 70 %, 2 días, 67 %) |
| H5-C2, B-09 | Auto | ✅ | `progreso.test.js` caso 6 (140 %) |
| H5-C3, B-08 | Auto | ✅ | `progreso.test.js` caso 3 |
| H5-C4 | Auto | ✅ | `progreso.test.js` caso 4 |
| H5-C5 | Auto | ✅ | `progreso.test.js` caso 5 |
| H5-C6, B-11 | Auto | ✅ | `progreso.test.js` caso 7 |
| H5-C7 | Auto | ✅ | `progreso.test.js` caso 1 |
| H6-C1 … H6-C5, B-10 | Auto + Curl | ✅ | `progreso.test.js` caso 11; Curl #16 (`rachaActual: 3`, racha rota) |
| H6-C6, B-07 | Auto | ✅ | `progreso.test.js` caso 12; `orden-partidas.test.js` (`avanceActualHastaHoy`) |
| H7-C1 | Curl | ✅ | Curl #15: hito 50 % con avance 35 % → 201 |
| H7-C2, H7-C3, H7-C4, B-13, B-14 | Auto + Curl | ✅ | `progreso.test.js` caso 14 y `meta.test.js`; Curl #21 (≤ avance → 400), #22 (sin descripción → 400) y #31 (repetido → 409) |
| H7-C5 | Manual (pendiente): `DELETE /meta/hitos/:hitoId` → 200 | ⏳ pendiente | Curl #23 y #26 solo prueban los errores (400 y 404) |
| H7-C6 | Curl | ✅ | Curl #29: sin meta → 404 |
| H8-C1, B-15 | Auto + Manual | ✅ auto · ⏳ manual | `progreso.test.js` caso 13 |
| H8-C2, H8-C3 | Auto + Manual | ✅ auto · ⏳ manual | `progreso.test.js` casos 13 y 17 |
| H8-C4, B-16 | Auto + Manual | ✅ auto · ⏳ manual | `orden-partidas.test.js` |
| H9-C1, B-12 | Auto | ✅ | `progreso.test.js` (3 de 4 semanas) |
| H9-C2 | Auto + Curl | ✅ | `progreso.test.js` caso 9; Curl #2 (4 semanas `sin_meta`) |
| H9-C3 | Auto | ✅ | `progreso.test.js` caso 8 |
| H9-C4 | Auto | ✅ | `progreso.test.js` (la semana actual no está en `ultimas4`) |
| B-19 | Revisión | ✅ | `meta.controller.ts`: `cuerpo(req)` y desestructuración de los campos permitidos en cada handler, también en los de E2-T15 |
| B-20 | Curl | ✅ | Curl #17 (`abc` → 400) y #24 (id inexistente → 404) |
| B-21 | Revisión | ✅ | `grep -rn "process.env" backend/src` → solo `config/env.ts` |
| B-22 | Auto + Curl | ✅ | `progreso.test.js` caso 16; Curl #16 (`mejorRacha: 4`) |
| B-23 | Auto + Curl | ✅ | `progreso.test.js` caso 17; Curl #2 y #16 (objeto sin envoltorio) y #30 (`/progreso` → 404) |
| B-24 | Auto + Curl | ✅ | `progreso.test.js` caso 14 y `errorHandler.test.js`; Curl #31 (hito repetido → 409) y #32 (8 `PUT` simultáneos → 201 ×2, 409 ×6) |
| H1-C6, B-25 | Auto + Manual | ✅ auto · ⏳ manual | `metas.test.js` casos 1 y 2; falta `POST /metas` dos veces → 201 y 409 (comandos en §0.3) |
| H1-C7, B-26 | Manual (pendiente) | ⏳ pendiente | Comandos en §0.3 |
| B-27 | Auto + Manual | ✅ auto · ⏳ manual | `metas.test.js` caso 3 |
| B-28 | Auto + Manual | ✅ auto · ⏳ manual | `metas.test.js` casos 4 y 5 |
| H2-C4, B-29 | Auto + Manual | ✅ auto · ⏳ manual | `metas.test.js` caso 6 |

### 0.2 Spec frontend — Sección «Meta semanal»

| Criterio / regla | Cómo se verificó | Resultado | Evidencia |
|---|---|---|---|
| H0-C1, F-02 | Auto + Manual | ✅ auto · ⏳ manual | `test/frontend/formato.test.js` (`formatearFecha` → «21 oct 2026») |
| H1-C1 | Manual (navegador) | ⏳ pendiente | — |
| H1-C2, F-08 | Manual (navegador) | ⏳ pendiente | — |
| H1-C3 | Manual (navegador) | ⏳ pendiente | — |
| H1-C5, F-15 | Manual (navegador) | ⏳ pendiente | Los mensajes del backend están verificados en Curl #18–#20 |
| H2-C1, F-08 | Manual (navegador) | ⏳ pendiente | — |
| H2-C3 | Manual (navegador) | ⏳ pendiente | — |
| H3-C2, H3-C5, F-06 | Manual (navegador) | ⏳ pendiente | — |
| H3-C3 | Manual (navegador) | ⏳ pendiente | — |
| H4-C2, F-09 | Manual (navegador) | ⏳ pendiente | — |
| H5-C1 | Manual (navegador) | ⏳ pendiente | — |
| H5-C2, F-05 | Auto + Manual | ✅ auto · ⏳ manual | `formato.test.js` (`anchoBarra` limita a 100) |
| H5-C3 | Manual (navegador) | ⏳ pendiente | — |
| H5-C8, F-11 | Manual (navegador) | ⏳ pendiente | — |
| H6-C1 … H6-C3, H6-C5, F-14 | Auto + Manual | ✅ auto · ⏳ manual | `formato.test.js` (`textoRacha`) |
| H7-C1 | Manual (navegador) | ⏳ pendiente | — |
| H7-C2, H7-C4 | Manual (navegador) | ⏳ pendiente | — |
| H7-C3, F-07 | Manual (navegador) | ⏳ pendiente | — |
| H7-C5 | Manual (navegador) | ⏳ pendiente | — |
| H7-C6, F-07 | Manual (navegador) | ⏳ pendiente | — |
| H8-C1, F-10 | Manual (navegador) | ⏳ pendiente | — |
| H9-C1, H9-C5, F-13 | Manual (navegador) | ⏳ pendiente | — |
| H9-C2 | Manual (navegador) | ⏳ pendiente | — |
| F-01 | Revisión | ✅ | `grep -rn "fetch(" frontend/src/pages frontend/src/components` → sin resultados |
| F-03 | Revisión | ✅ | `MetaSemanal.tsx` no usa `Math.`, `/ 60` ni `* 100`: solo formatea los datos de `/progreso-semanal` |
| F-04, F-12 | Revisión | ✅ (código) · ⏳ visual | `grep -E "#[0-9a-fA-F]{3,8}"` en `MetaSemanal.tsx` y `DetalleVideojuego.tsx` → sin colores hexadecimales |
| Tipos y build | Build | ✅ | `cd frontend && npm run build` → «built» sin errores; `cd backend && npm run build` sin errores (2026-11-08) |

### 0.3 Cómo cerrar los pendientes

**Backend.** Con la API en local (`cd backend && npm run dev`), sobre un videojuego de prueba `$V` en estado `jugando`:

```bash
API=http://localhost:3000/api
curl -s -X POST $API/videojuegos/$V/metas -H 'Content-Type: application/json' -d '{"horasSemanales":5,"diasPorSemana":3}'   # 201 (B-25)
curl -s -X POST $API/videojuegos/$V/metas -H 'Content-Type: application/json' -d '{"horasSemanales":6,"diasPorSemana":3}'   # 409 (B-25)
curl -s $API/videojuegos/$V/metas                                                                                         # 1 meta (B-26)
curl -s -X PATCH $API/metas/$M -H 'Content-Type: application/json' -d '{"horasSemanales":8}'                              # 201, diasPorSemana 3 (B-28, H1-C2)
curl -s $API/videojuegos/$V/metas                                                                                         # 2 metas, activa primero (H1-C7)
curl -s -X PATCH $API/metas/$M -H 'Content-Type: application/json' -d '{"horasSemanales":9}'                              # 409: $M ya está archivada (B-28)
curl -s $API/metas/abc                                                                                                    # 400 (B-27)
curl -s -X PATCH $API/metas/$M_NUEVA/desactivar                                                                           # 200 (B-29)
curl -s -X PATCH $API/metas/$M_NUEVA/desactivar                                                                           # 409 (B-29, H2-C4)
```

**Frontend.** Recorrer en `http://localhost:5173` las filas ⏳ de §0.2 y anotar en la columna de evidencia la fecha y lo observado (o una captura).

---

## Índice

| § | Evidencia | Por qué git no la muestra | Contenido |
|---|---|---|---|
| 0 | **Auditoría por criterio** (una fila por criterio de cada spec) | — | [§0](#0-auditoría-por-criterio) |
| — | **⚠️ Deuda técnica** (pagada y diferida) | Vive en el backlog, no en esta auditoría | [Backlog § Deuda técnica](backlog/E2-metas-y-rachas.md#deuda-tecnica) |
| 1 | Planes hechos en plan mode | Se guardan fuera del repo (`~/.claude/plans/`) | [Apéndice A](#apendice-a) |
| 2 | Orden «tests primero, después código» | Los commits de E2-T01…T14 se hicieron todos en dos minutos (22:58–22:59), y cada uno lleva el test y el código juntos | [Apéndice B.1](#b-1), [Apéndice B.2](#b-2) |
| 3 | Ejecuciones de `npm test` a lo largo del trabajo | git no guarda resultados de ejecución | §3 |
| 4 | Pruebas manuales del endpoint con curl (paso 6) | Son peticiones HTTP contra la API en local, y los datos se borraron después | [Apéndice C](#apendice-c), [Apéndice D](#apendice-d) |
| 5 | Los hooks de Claude Code funcionan | git versiona el código de los hooks, pero no que se ejecuten | [Apéndice E](#apendice-e), [Evidencia_Hooks.png](../Evidencia_Hooks.png) |
| 6 | Decisiones del usuario en la conversación | Solo existen en la conversación con el agente | §6 |
| 7 | Trabajo sin commit a la fecha de corte | No forma parte del historial | §7 |
| 8 | Contenido del video de demostración | git guarda el binario, no lo que muestra | §8 |
| 9 | Limitaciones conocidas de esta evidencia | — | §9 |

---

## 1. Planes hechos en plan mode

Claude Code guarda cada plan aprobado en `~/.claude/plans/`, fuera del repositorio. Los cinco planes de este proyecto están copiados sin cambios en el [Apéndice A](#apendice-a). En esa carpeta había otros dos planes que son de otro proyecto (el «invernadero» de `Taller_Agents`) y no se incluyen.

| # | Plan | Guardado | Resultado en git |
|---|---|---|---|
| 1 | [Diagnóstico inicial](#a-1): estado del proyecto, análisis del video y una tabla de 13 problemas | 2026-11-07 14:11 | `73c70e9` (`docs/diagnostico.md`) |
| 2 | [Diagnóstico actualizado](#a-2) tras los tests base: 45 tests en verde, 3 suites omitidas, hallazgos N1–N7 | 2026-11-07 21:16 | `6cb3b0a` (actualiza `docs/diagnostico.md`) |
| 3 | [Huecos de la ficha E2](#a-3): cubre 8 casos límite en PRD, backlog y spec | 2026-11-07 22:01 | `6cb3b0a`, `959e4c6` |
| 4 | [Plan del backend E2](#a-4): tickets E2-T01 → T08 y T14 en orden de dependencias, con los tests primero en cada ticket | 2026-11-07 22:46 | `07249f0` … `c611adc` |
| 5 | [Alinear el backend con el enunciado](#a-5): `horasSemana` con 1 decimal, `alcanzado` calculado y `alcanzadoEn` como historial | 2026-11-08 13:42 | sin commit (§7) |

El plan 4 es el que pide el paso 6. Su línea de convenciones dice que los tests se escriben con `node:test` en `test/`, que se hace un commit por ticket y que en cada ticket van primero los tests y después el código.

## 2. Orden «tests primero, después código»

**Qué muestra git y qué no.** Los commits de E2-T01 a E2-T14 se hicieron entre las 22:58 y las 22:59 del 2026-11-07, y en T01, T03, T04 y T05 el test y el código van en el mismo commit. Por eso git **no puede demostrar** que el test se escribió antes.

**Evidencia registrada: la regla B-24 (respuesta 409).** Para el último cambio del backend se registró el ciclo completo:

1. **Spec.** Se añadió la regla B-24 a [la spec del backend](specs/E2-backend-meta-y-progreso-semanal.md) (§1, §5, §6 y §7) y se ajustó F-15 en [la spec del frontend](specs/E2-frontend-meta-semanal.md).
2. **Tests, con el código sin tocar.** Se cambió el caso 14 de `test/dominio/progreso.test.js` (`validarNuevoHito` devuelve `{ status, mensaje }`, y un hito repetido da 409) y se creó `test/middlewares/errorHandler.test.js` (E11000 → 409).
   Resultado: **155 tests · 145 pasan · 10 fallan** → [Apéndice B.1](#b-1)
3. **Código.** Se cambiaron `dominio/progreso.ts`, `services/meta.service.ts` y `middlewares/errorHandler.ts`.
   Resultado: **155 tests · 155 pasan · 0 fallan · 0 omitidos** → [Apéndice B.2](#b-2)

## 3. Ejecuciones de `npm test`

| Momento | Resultado | Fuente |
|---|---|---|
| Commit `91da107` (tests base) | 45 pasan, 0 fallan; 3 suites de `fechas.test.js` omitidas porque aún no existía `fechas.ts`; el frontend tiene 0 tests | [plan 2](#a-2) |
| Antes de alinear con el enunciado | 149 / 149 | [plan 5](#a-5) |
| Después de alinear (inicio de la sesión del paso 6) | 152 / 152, 0 omitidos | ejecución del 2026-11-08 |
| Tests de B-24 escritos, sin código | 145 / 155 (10 fallan) | [Apéndice B.1](#b-1) |
| B-24 implementada | **155 / 155**, 0 omitidos; `npm run build` sin errores | [Apéndice B.2](#b-2) |
| E2-T15 implementado (CRUD de Meta) | **203 / 203**, 0 omitidos; `npm run build` sin errores en backend y frontend; `tsc --noEmit --noUnusedLocals` limpio | ejecución del 2026-11-08 |

## 4. Pruebas manuales del endpoint con curl (paso 6)

La API se levantó en local (`cd backend && npm run dev`, conectada a MongoDB Atlas) el 2026-11-08 y se lanzaron las peticiones con [Apéndice D](#apendice-d). El [log completo](#apendice-c) contiene cada comando `curl` y su respuesta JSON.

«Hoy» es el domingo 8 de noviembre de 2026 en hora de Ecuador, así que la semana actual va del lunes 2 al domingo 8 de noviembre.

**Datos de prueba:**
- **Videojuego A** (`[PRUEBA] A sin partidas`): no tiene partidas.
- **Videojuego B** (`[PRUEBA] B racha rota`): 7 partidas de 60 min en 7 días distintos. Hay una serie de 4 días (27–30 oct), un hueco del 31 oct al 5 nov (**racha rota**) y una serie actual de 3 días (6–8 nov). El avance va de 5 % a 35 %.

### 4.1 Tabla de pruebas

| # | Caso | Petición | Esperado | Obtenido | Resultado clave |
|---|---|---|---|---|---|
| 1 | Crear videojuego A | `POST /api/videojuegos` | 201 | 201 ✅ | — |
| 2 | **A sin partidas**, sin meta | `GET /api/videojuegos/A/progreso-semanal` | 200 | 200 ✅ | `horasSemana: 0`, `diasJugadosSemana: 0`, `rachaActual: 0`, `mejorRacha: 0`, `porcentajeAvanceActual: null`, `meta: null`, `hitos: []`, 4 semanas `sin_meta` |
| 3 | A: fijar meta | `PUT /api/videojuegos/A/meta` `{5, 3}` | 201 | 201 ✅ | meta activa creada |
| 4 | **A sin partidas**, con meta | `GET /api/videojuegos/A/progreso-semanal` | 200 | 200 ✅ | `porcentajeHoras: 0`, `porcentajeDias: 0`, `cumplida: false`, rachas 0 |
| 5 | Crear videojuego B | `POST /api/videojuegos` | 201 | 201 ✅ | — |
| 6–12 | B: 7 partidas (27, 28, 29, 30 oct; 6, 7, 8 nov) | `POST /api/partidas` ×7 | 201 | 201 ✅ ×7 | — |
| 13 | B: fijar meta | `PUT /api/videojuegos/B/meta` `{5, 4}` | 201 | 201 ✅ | — |
| 14 | B: mismos valores (B-04) | `PUT /api/videojuegos/B/meta` `{5, 4}` | 200 | 200 ✅ | no crea meta nueva |
| 15 | B: hito 50 % (avance 35 %) | `POST /api/videojuegos/B/meta/hitos` | 201 | 201 ✅ | — |
| 16 | **B: ≥5 partidas, racha rota** | `GET /api/videojuegos/B/progreso-semanal` | 200 | 200 ✅ | `horasSemana: 3` (60 %), `diasJugadosSemana: 3` (75 %), `cumplida: false`, **`rachaActual: 3`, `mejorRacha: 4`**, `porcentajeAvanceActual: 35`, hito 50 % `alcanzado: false` |
| 17 | 400: id con formato inválido | `GET /api/videojuegos/abc/progreso-semanal` | 400 | 400 ✅ | `"abc" no es un id válido para el campo "_id"` |
| 18 | 400: horas = 0 | `PUT /api/videojuegos/B/meta` `{0, 3}` | 400 | 400 ✅ | «Las horas por semana deben ser un número mayor que 0 y como máximo 100» |
| 19 | 400: días = 8 | `PUT /api/videojuegos/B/meta` `{5, 8}` | 400 | 400 ✅ | «Los días por semana deben ser un entero entre 1 y 7» |
| 20 | 400: días = 2.5 | `PUT /api/videojuegos/B/meta` `{5, 2.5}` | 400 | 400 ✅ | ídem |
| 21 | 400: hito ≤ avance | `POST /api/videojuegos/B/meta/hitos` `{…, 30}` | 400 | 400 ✅ | «El porcentaje objetivo del hito debe ser mayor que el avance actual (35 %)» |
| 22 | 400: hito sin descripción | `POST /api/videojuegos/B/meta/hitos` `{"  ", 60}` | 400 | 400 ✅ | «La descripción del hito es obligatoria» |
| 23 | 400: hitoId inválido | `DELETE /api/videojuegos/B/meta/hitos/abc` | 400 | 400 ✅ | `"abc" no es un id válido para el campo "hitoId"` |
| 24 | 404: videojuego inexistente | `GET /api/videojuegos/507f…011/progreso-semanal` | 404 | 404 ✅ | «No existe un videojuego con id 507f…011» |
| 25 | 404: videojuego inexistente | `PUT /api/videojuegos/507f…011/meta` | 404 | 404 ✅ | ídem |
| 26 | 404: hito inexistente | `DELETE /api/videojuegos/B/meta/hitos/507f…011` | 404 | 404 ✅ | «No existe un hito con id 507f…011» |
| 27 | A: quitar meta | `DELETE /api/videojuegos/A/meta` | 204 | 204 ✅ | — |
| 28 | 404: sin meta activa | `GET /api/videojuegos/A/meta` | 404 | 404 ✅ | «El videojuego no tiene una meta activa» |
| 29 | 404: hito sin meta | `POST /api/videojuegos/A/meta/hitos` | 404 | 404 ✅ | ídem |
| 30 | 404: ruta antigua | `GET /api/videojuegos/B/progreso` | 404 | 404 ✅ | «Ruta no encontrada» |
| 31 | **409: hito repetido** | `POST /api/videojuegos/B/meta/hitos` `{…, 50}` | 409 | 409 ✅ | «Ya existe un hito con porcentaje objetivo 50 %» |
| 32 | **409: índice único (E11000)** | 8 × `PUT /api/videojuegos/A/meta` simultáneos | 201 / 409 | 201 ×2, 409 ×6 ✅ | «Ya existe un recurso con esos datos; vuelve a intentarlo». Nunca hubo dos metas activas (B-01). |
| 33–34 | Limpieza | `DELETE /api/videojuegos/A` y `/B` | 204 | 204 ✅ | metas borradas (B-17) |

**Resultado: 34 de 34 casos con el código esperado.** Después de la tabla se borraron a mano las 7 partidas de B con `DELETE /api/partidas/:id` (7 × 204). La base de datos volvió a su estado anterior: 2 videojuegos y 2 partidas.

### 4.2 Comprobación del cálculo en el caso 16

- **Semana del 2 al 8 de noviembre:** hay partidas el 6, 7 y 8, es decir, 3 × 60 min = **3 h**. Eso da 3 / 5 = **60 %** en horas y **3 días** de 4 = **75 %** en días. La semana no está cumplida.
- **Racha actual:** hay partida hoy (8), el 7 y el 6; el 5 no hay. La racha es **3**.
- **Mejor racha:** del 27 al 30 de octubre seguidos, que da **4**, mayor o igual que la racha actual (B-22). Esa serie se rompe el 31 de octubre.
- **Avance actual:** el de la partida más reciente (8 nov), que es **35 %**. Por eso el hito del 50 % sigue pendiente.
- **`ultimas4`:** las 4 semanas salen `sin_meta` porque la meta se creó hoy, y ninguna semana pasada tenía una meta vigente al cierre (B-12).

### 4.3 Cómo repetirlo

```bash
cd backend && npm run dev          # en otra terminal
# guardar el script del Apéndice D como pruebas-curl-E2.sh y ejecutarlo:
bash pruebas-curl-E2.sh /tmp/pruebas.md
```

La versión del script del [Apéndice D](#apendice-d) ya borra también las partidas que crea. En la ejecución registrada esa limpieza se hizo a mano, después del script.

## 5. Los hooks de Claude Code funcionan

[`.claude/settings.json`](../.claude/settings.json) registra dos hooks:

| Hook | Evento | Qué hace | Evidencia de que funciona |
|---|---|---|---|
| [`proteger-env.js`](../.claude/hooks/proteger-env.js) | `PreToolUse` (`Read\|Edit\|Write`) | Bloquea leer o editar `.env` y `.env.*`, salvo `.env.example` | Se probó pasándole una llamada simulada por stdin, sin abrir ningún `.env`: con `.env` sale con **código 2** y el mensaje «Bloqueado: …»; con `.env.example` y `README.md` sale con **código 0** → [Apéndice E](#apendice-e) |
| [`formatear.js`](../.claude/hooks/formatear.js) | `PostToolUse` (`Edit\|Write`) | Formatea con Prettier los `.ts`, `.tsx`, `.js`, `.jsx`, `.json` y `.css` editados | En la sesión del paso 6, Claude Code avisó «PostToolUse hook modified … (likely a formatter)» al editar `progreso.ts`, `errorHandler.ts` y `errorHandler.test.js`. Prettier está instalado en la raíz (`node_modules/prettier`). Esto corrige el hallazgo N4 del [plan 2](#a-2), que indicaba que el hook no hacía nada. |

La captura [`Evidencia_Hooks.png`](../Evidencia_Hooks.png) muestra el hook `PostToolUse` con matcher `Edit|Write` y el comando `node "$CLAUDE_PROJECT_DIR/.claude/hooks/formatear.js"`, configurado en el panel de hooks de Claude Code.

La skill [`/commit`](../.claude/skills/commit/SKILL.md) está versionada. `.claude/settings.local.json` (permisos locales) queda fuera de git por el `.gitignore` global del usuario.

## 6. Decisiones del usuario en la conversación

| Cuándo | Decisión | Dónde quedó reflejada |
|---|---|---|
| Plan 3 (2026-11-07) | Una partida que cruza la medianoche cuenta entera en su día de inicio | spec B-06 |
| Plan 3 | La semana en curso se evalúa con la meta activa, aunque haya cambiado a mitad de semana | spec B-11 |
| Plan 3 | Una meta superada muestra el porcentaje real, sin límite (140 %); la barra se llena como máximo al 100 % | spec B-09, spec frontend F-05 |
| Plan 3 | Al pasar un juego a `completado` o `abandonado` se archiva su meta, y fijar una meta en ese estado da 400 | spec B-18 |
| Plan 5 (2026-11-08) | `alcanzado` se calcula con el avance actual; `alcanzadoEn` guarda la primera vez y no se borra | spec B-15, B-23 |
| Sesión del paso 6 (2026-11-08) | Implementar el 409 (hito repetido y E11000), primero en la spec, y documentar las pruebas manuales. El usuario aprobó la propuesta («begin») | spec B-24, §2 y §4 de este documento |

## 7. Trabajo sin commit a la fecha de corte

A 2026-11-08, todo lo siguiente está en el árbol de trabajo pero **no** en ningún commit:

- **Alineación con el enunciado** ([plan 5](#a-5) y cambios de nombres):
  - campos renombrados `horasPorSemana` → `horasSemanales`, `nombre` → `descripcion` y `objetivo` → `porcentajeObjetivo`;
  - máximo de 100 h por semana (antes 168);
  - ruta `/progreso` → `/progreso-semanal`, que devuelve el objeto sin envoltorio;
  - `horasSemana` con 1 decimal y `alcanzado` calculado;
  - `eliminarPartida` vuelve a calcular los hitos.

  Archivos: `meta.model.ts`, `meta.controller.ts`, `meta.routes.ts`, `meta.service.ts`, `partida.service.ts`, `dominio/progreso.ts`, `progreso.test.js`, `meta.test.js`, specs, backlog, PRD y README.
- **B-24 (409):** `dominio/progreso.ts`, `meta.service.ts`, `errorHandler.ts`, `test/middlewares/errorHandler.test.js`, specs y README.
- **Evidencia:** este documento.

## 8. Contenido del video de demostración

[`Demo-Diario-Gamer.mp4`](../Demo-Diario-Gamer.mp4) (commit `ace480a`, 2026-10-22) dura 2:06 y graba la aplicación desplegada en Render. Según el análisis del [plan 1](#a-1), muestra:

- las listas de videojuegos y partidas, y el detalle con su resumen;
- registrar y eliminar una partida;
- crear, editar y eliminar un juego sin partidas;
- los filtros por plataforma y estado.

También deja ver un bug: una partida registrada el 21/10/2026 aparece como «20 oct 2026» (problema #1 del diagnóstico). El video no cubre errores 400 o 404, ni eliminar un juego que tenga partidas. Es anterior a E2, así que no incluye metas ni rachas.

## 9. Limitaciones conocidas de esta evidencia

- **Orden de los tests en E2-T01…T05.** Solo el plan 4 indica que los tests iban primero; git no lo demuestra (§2). El ciclo rojo → verde quedó registrado únicamente para B-24.
- **Sin tests automatizados en T06–T08** (servicio, integración y endpoints). Esa parte se cubre con las pruebas manuales de §4, no con `npm test`.
- **Partidas huérfanas.** Eliminar un videojuego borra sus metas (B-17), pero no sus partidas (problema #2 del diagnóstico, todavía abierto; ver [Deuda técnica](backlog/E2-metas-y-rachas.md#deuda-tecnica)). Por eso la limpieza de §4 tuvo que borrarlas a mano.
- **Sin evidencia histórica de los hooks.** La prueba de los hooks (§5) es de 2026-11-08; no hay registro de que funcionaran en sesiones anteriores.

---

<a id="apendices"></a>

## Apéndices

<a id="apendice-a"></a>

### Apéndice A — Planes hechos en plan mode

Copia literal de cada plan. Solo se bajaron los niveles de los títulos para que queden dentro de este apéndice, y los enlaces relativos se ajustaron a la carpeta `docs/`.

<a id="a-1"></a>

#### A.1 · Diagnóstico — Diario de Progreso Gamer (Entregable 3)

> Archivo original: `~/.claude/plans/diagnostica-este-proyecto-lee-velvety-minsky.md`

##### Contexto
Se pidió diagnosticar el proyecto: leer código y README, analizar `Demo-Diario-Gamer.mp4` (evidencia de pruebas) y entregar estado + tabla de problemas. Este plan contiene el diagnóstico y, al final, una propuesta de correcciones priorizadas para ejecutar si se aprueba.

##### Estado del proyecto
- **Stack:** backend Express + TypeScript + Mongoose (models/routes/controllers/services/middlewares), frontend React + Vite + React Router + Tailwind. Desplegado en Render (2 servicios).
- **Compilación:** `tsc --noEmit` pasa sin errores en backend y frontend.
- **Funcionalidad:** CRUD de videojuegos, PATCH de logro embebido, CRUD de partidas (API), resumen calculado en servicio, filtros, middlewares requestId/logger/errorHandler, estados de carga/error/vacío. Coincide en general con el README.
- **Pruebas:** no hay tests automatizados; la única evidencia es el video.
- **Video (2:06, 1920×1020, app en producción):** muestra lista, detalle con resumen, registrar partida, eliminar partida, crear juego, editar juego, eliminar juego (sin partidas), filtros por plataforma y estado. **Revela un bug visible:** se registra una partida con fecha `10/21/2026` y la lista la muestra como **"20 oct 2026"**.
- **Rama:** `feature/e2-metas-rachas` apunta al mismo commit que `main` (ace480a); el trabajo de "metas/rachas" no ha empezado.
- **Veredicto:** entregable funcional y bien estructurado, con 2 bugs de datos reales (fechas y partidas huérfanas), sin pruebas automatizadas y con problemas menores de higiene del repo.

##### Tabla de problemas

| # | Sev. | Área | Problema | Evidencia / ubicación | Corrección sugerida |
|---|---|---|---|---|---|
| 1 | Alta | Front/Back | Fecha de partida se muestra un día antes. `<input type=date>` envía `YYYY-MM-DD` → Mongo guarda medianoche UTC → `Intl.DateTimeFormat` lo formatea en hora local (UTC-5). | **Visible en el video** (10/21 → "20 oct"). `FormularioPartida.tsx`, `formatearFecha` en `ListaPartidas.tsx` y `DetalleVideojuego.tsx` | Formatear con `timeZone: "UTC"` (o guardar a mediodía UTC) |
| 2 | Alta | Backend | Eliminar un videojuego no elimina sus partidas → quedan huérfanas, siguen en `/api/partidas` y suman en "Tiempo de juego". El commit 0752461 ("página negra en /partidas") solo parchó la UI (`videojuego: null`), no la causa. | `videojuego.service.ts` `eliminarVideojuego` | `Partida.deleteMany({ videojuego: id })` al eliminar (y avisar en el `confirm`) |
| 3 | Alta | Calidad | Sin pruebas automatizadas (ni script `test`). La evidencia depende del video. | `backend/package.json`, `frontend/package.json` | Tests de servicio/API (resumen, 400/404, PATCH logro) |
| 4 | Media | Backend | "Avance actual" del resumen es ambiguo si hay 2 partidas el mismo día: solo se ordena por `fecha` (precisión de día). | `partida.service.ts` `listarPartidasDeVideojuego` (`sort({ fecha: -1 })`) | `sort({ fecha: -1, createdAt: -1 })` |
| 5 | Media | Repo | Video de 70 MB versionado en git (GitHub advierte >50 MB; infla cada clon). | `Demo-Diario-Gamer.mp4` | Enlace externo (Drive/YouTube) o Git LFS |
| 6 | Media | Repo | `.gitignore` contiene literalmente las líneas del heredoc (`cat > .gitignore << 'EOF'`, `EOF`, `cat .gitignore`). Funciona por casualidad. | `.gitignore` | Dejar solo los patrones |
| 7 | Media | Evidencia | El video no cubre: estados de error (400/404), recarga directa de rutas profundas (rewrite SPA en Render), filtro por género aplicado, eliminar juego **con** partidas, toggle de logros de forma clara. | Video | Ampliar demo o cubrir con tests |
| 8 | Media | Docs | README dice "Listar y filtrar partidas", pero solo hay filtro por `videojuegoId` vía URL, sin UI. El rewrite `/* → /index.html` de Render no está documentado. `vite.config.ts` dice que se evita `cors()`, pero el backend sí lo usa. | `README.md`, `vite.config.ts` | Ajustar textos/comentarios |
| 9 | Baja | Backend | Logros sin `_id`, se actualizan por índice: si la lista cambia entre cargar y marcar, se marca el logro equivocado. | `videojuego.model.ts` (`_id: false`), ruta PATCH `:indiceLogro` | Aceptable para el alcance; o usar `_id` de subdocumento |
| 10 | Baja | Backend | `PUT` pasa `req.body` crudo a `findByIdAndUpdate`: acepta operadores `$unset`, `$set`, etc. | `actualizarVideojuego`, `actualizarPartida` | Seleccionar campos permitidos |
| 11 | Baja | Front | Código duplicado: `manejarRespuesta` (2 archivos), `etiquetasEstado/Genero` (3), `formatearFecha` (2). Facilita bugs como #1. | `src/api/*`, `src/pages/*` | Extraer a `src/utils` |
| 12 | Baja | Backend | `PORT` no se valida (NaN); `backend/.env.example` no incluye `PORT`; `cerrarConexionDB` sin uso; cabecera de `DBconnection.ts` dice `conexionDB.ts`. | `config/env.ts`, `DBconnection.ts` | Limpieza menor |
| 13 | Baja | Front | Texto de error "No se pudieron **completar** las partidas" (debería ser "cargar"). | `ListaPartidas.tsx` | Corregir texto |

##### Propuesta de corrección (si se aprueba)
1. **#1** — en `ListaPartidas.tsx` y `DetalleVideojuego.tsx`, `formatearFecha` con `{ dateStyle: "medium", timeZone: "UTC" }` (idealmente una sola función en `src/utils/formato.ts`, que resuelve también parte de #11).
2. **#2** — `eliminarVideojuego` borra las partidas asociadas; mensaje de `confirm` en `DetalleVideojuego.tsx` avisa que se borran sus partidas.
3. **#4** — desempate por `createdAt` en `partida.service.ts`.
4. **#6, #8, #12, #13** — limpieza de `.gitignore`, README, comentario de Vite, `.env.example`, texto de error.
5. **#5** — decisión del usuario (sacar el video del repo implica reescribir historial o solo dejar de versionarlo).
6. **#3** — opcional: añadir pruebas (p. ej. Vitest + supertest con mongodb-memory-server) para resumen, 404 y PATCH de logro.

##### Verificación
- `npx tsc --noEmit` en `backend` y `frontend`.
- Local: `npm run dev` en ambos; registrar partida con fecha X → la lista y el detalle muestran X.
- Crear juego con partidas, eliminarlo → `/api/partidas` ya no lo devuelve.
- Dos partidas el mismo día → el resumen toma la creada más recientemente.

<a id="a-2"></a>

#### A.2 · Diagnóstico actualizado — Diario de Progreso Gamer (commit `91da107`)

> Archivo original: `~/.claude/plans/diagnostica-este-proyecto-lee-lazy-moore.md`

##### Context
Ya existe `docs/diagnostico.md`, pero se escribió sobre `ace480a`. Después llegó `91da107` (config de Claude, AGENTS.md, DESIGN.md y **tests base**), así que el apartado de pruebas del diagnóstico está desactualizado: dice "no hay tests automatizados", y eso ya no es cierto. El código de `backend/src` y `frontend/src` **no cambió**: comprobé que los 13 problemas del diagnóstico anterior siguen ahí.

##### Lo que verifiqué (solo lectura)
- `cd backend && npm test`: **45 pasan, 0 fallan**. Las 3 suites de `fechas.test.js` (`diaCalendario`, `interpretarFecha`, `esFechaFutura`) se **omiten** porque `backend/src/dominio/fechas.ts` no existe.
- `cd frontend && npm test` (`node --test`): **0 tests**. Pasa sin probar nada.
- `tsc --noEmit` en backend y frontend: sin errores.
- Bugs anteriores confirmados en el código: fechas sin `timeZone` (`ListaPartidas.tsx:7`, `DetalleVideojuego.tsx:35`), `eliminarVideojuego` no borra partidas (`videojuego.service.ts:75`), `sort({ fecha: -1 })` sin desempate (`partida.service.ts:14,22`), texto "completar" (`ListaPartidas.tsx:124`), `.gitignore` con las líneas del heredoc, video de 68 MB todavía versionado.

##### Hallazgos nuevos (desde `91da107`)
| # | Sev. | Problema | Evidencia |
|---|---|---|---|
| N1 | Alta | Las pruebas solo validan los esquemas de Mongoose (`validateSync`). No cubren servicios, rutas ni controladores: ni el resumen, ni los 400/404, ni el PATCH de logro, ni el borrado en cascada. Ninguna detecta los bugs #1, #2 o #4. | `test/model/*.test.js` |
| N2 | Alta | Regla de AGENTS.md "Ninguna funcionalidad sin spec en `docs/specs/`": `docs/specs/`, `docs/prd/` y `docs/backlog/` existen pero están **vacías** (git no las versiona). `fechas.test.js` ya depende de una spec que no existe. | `docs/` |
| N3 | Media | El `npm test` del frontend no ejecuta nada, así que la regla "ejecutar `npm test`" se cumple en falso. | `frontend/package.json` |
| N4 | Media | El hook de Prettier no hace nada: `prettier` no está instalado en ninguna parte (`require` falla y el error se ignora). Además solo procesa `.js/.jsx/.json/.css`, pero el código fuente es `.ts/.tsx`. | `.claude/hooks/formatear.js` |
| N5 | Media | `fechas.test.js` espera que `interpretarFecha("2026-10-21")` devuelva la **medianoche local del servidor**. Render corre en UTC, así que eso sigue guardando medianoche UTC y el bug #1 (un día menos en UTC-5) persistiría en el navegador. Hay que decidir en la spec si la corrección va en el frontend (`timeZone: "UTC"`) o se guarda a mediodía. | `test/dominio/fechas.test.js` |
| N6 | Baja | Los tests viven en `/test`, en la raíz, pero solo se lanzan desde `backend/` con la ruta `../test/**`. El README no documenta cómo ejecutarlos. | `backend/package.json`, `README.md` |
| N7 | Baja | Los tests están en JS con `require`, mientras el proyecto es TS con `import`. Funciona gracias a `tsx`, pero es inconsistente con AGENTS.md. | `test/` |

##### Acción propuesta
Actualizar `docs/diagnostico.md` (el único archivo que se tocaría):
1. Cabecera: commit revisado `91da107`.
2. "Estado del proyecto → Pruebas": 45 pasan, 3 suites omitidas y 0 tests en el frontend.
3. Problema #3 (antes "sin pruebas"): reescribirlo como N1 (cobertura solo de modelos).
4. Añadir N2–N7 a la tabla y marcar que #1–#13 siguen vigentes.
5. Prioridades: primero escribir las specs en `docs/specs/` (desbloquea #1/N5 y metas/rachas), luego #1, #2, #4 con tests de servicio que los cubran (p. ej. `mongodb-memory-server`), después la limpieza (#6, #8, #12, #13, N4, N6).

No se corrige ningún bug en este paso: la regla de AGENTS.md exige una spec antes de implementar.

##### Verificación
- `cd backend && npm test`: siguen 45 pasando (no se toca código).
- Revisar que `docs/diagnostico.md` renderice bien la tabla en Markdown.

<a id="a-3"></a>

#### A.3 · Plan: cubrir los huecos de la ficha E2 en los documentos

> Archivo original: `~/.claude/plans/pasted-content-id-a7da-ficha-de-zany-crown.md`

##### Contexto
El usuario listó 8 huecos de la ficha de hechos de E2. Revisé si los documentos de `docs/` (PRD, backlog y spec que se escribieron en la sesión anterior) ya los resuelven. 4 ya están documentados. Los otros 4 faltaban o estaban solo implícitos, y el usuario los decidió en esta sesión. Este cambio toca solo documentación; no se modifica código.

##### Qué cubren los documentos hoy

| # | Hueco | Estado | Dónde |
|---|---|---|---|
| 1 | Racha si hoy no hay partida pero ayer sí | ✅ Documentado: sigue viva hasta ayer | spec R8; PRD §5 «Racha»; backlog E2-H3 |
| 2 | Varias partidas el mismo día | ✅ Documentado: cuentan como 1 día | spec R7 («días distintos»); backlog E2-H2 |
| 3 | Partida que cruza la medianoche | ⚠️ Solo implícito (R5 asigna la partida al día elegido, pero no habla de medianoche) | spec R5 |
| 4 | Cambio de meta a mitad de semana | ⚠️ Parcial: las semanas pasadas usan la meta vigente el domingo (R9, S1). Para la semana actual solo está implícito en el pseudocódigo (`semanaActual` usa `metaActiva`). La spec no define ningún «porcentaje de la semana». | spec R9, §4.1 |
| 5 | Meta superada (140 % o 100 %) | ❌ No documentado | — |
| 6 | Hito que deja de estar alcanzado | ✅ Documentado: nunca se revierte | spec R12; PRD §5; backlog E2-H4 |
| 7 | Juego completado o abandonado con meta activa | ❌ No documentado | — |
| 8 | Eliminar un videojuego con meta | ✅ Documentado: se borran todas sus metas, y con ellas sus hitos, porque van dentro de la meta | spec R14, §4; PRD §8; backlog E2-H1 |

##### Decisiones del usuario para los huecos 3, 4, 5 y 7
- **3:** la partida cuenta completa (todos sus minutos) en el día de inicio elegido. El modelo no cambia.
- **4:** la semana en curso se evalúa con la meta nueva (la activa), igual que en R9.
- **5:** la API devuelve el porcentaje real, sin límite (140 %). La barra se llena como máximo al 100 % y el texto muestra el valor real («7 de 5 h · 140 %»).
- **7:** al pasar el juego a `completado` o `abandonado`, su meta activa se archiva automáticamente. Mientras siga en ese estado, fijar una meta devuelve 400.

##### Cambios en los documentos

###### `docs/specs/e2-metas-rachas.md`
- **R5:** añadir que la partida pertenece entera a su día de inicio, aunque cruce la medianoche, porque no hay hora de inicio ni de fin.
- **R7:** añadir `porcentajeHoras = horas / horasPorSemana × 100` y `porcentajeDias = dias / diasPorSemana × 100`, redondeados a entero y **sin límite** (pueden pasar de 100).
- **Nueva R15:** la semana en curso se evalúa con la meta activa. Si la meta cambió a mitad de semana, se usa la nueva, de forma coherente con R9.
- **Nueva R16:** si un videojuego cambia a `completado` o `abandonado`, su meta activa se archiva (`vigenteHasta = ahora`). `fijarMeta` sobre un juego en esos estados devuelve `ApiError(400, "No se puede fijar una meta en un videojuego completado o abandonado")`. Si el juego vuelve a `jugando` o `pausado`, la meta no se restaura; se puede fijar una nueva.
- **§4 Integración con videojuegos:** `actualizarVideojuego` (`backend/src/services/videojuego.service.ts`) llama a `archivarMeta`, sin fallar si no hay meta activa, cuando `cambios.estado` es `completado` o `abandonado`.
- **§4.1 / §5:** añadir `porcentajeHoras` y `porcentajeDias` a `semanaActual` y a cada semana de `ultimas4`, y actualizar el ejemplo JSON. Añadir la línea de error 400 de R16.
- **§6 UI:** las barras usan `aria-valuenow = min(porcentaje, 100)` y el texto muestra el valor real («7 de 5 h · 140 %»). En un juego completado o abandonado, el formulario de meta aparece deshabilitado y explica el motivo.
- **§7 Pruebas:** añadir estos casos:
  - una partida registrada el día D cuenta entera en D;
  - 7 h con meta de 5 h → `porcentajeHoras = 140`;
  - meta cambiada el miércoles → la semana actual usa la nueva;
  - cambiar el estado a `completado` archiva la meta;
  - `PUT /meta` sobre un juego abandonado → 400.

###### `docs/prd/e2-metas-rachas.md`
- En la tabla de §5, añadir filas para «Partida que cruza la medianoche», «Cambio de meta a mitad de semana», «Meta superada» y «Juego completado o abandonado».
- En §7, mencionar el porcentaje real con la barra limitada al 100 %.

###### `docs/backlog/epicas.md`
- **E2-H1:** criterios para el cambio a completado o abandonado (la meta se archiva) y para el 400 al fijar una meta en ese estado.
- **E2-H2:** criterios «7 de 5 h · 140 %» con la barra llena; meta cambiada a mitad de semana → se usa la nueva; partida que cruza la medianoche → cuenta en el día de inicio.

##### Verificación
- Releer la tabla de cobertura: los 8 huecos deben quedar con una regla explícita en la spec y una referencia en el PRD o el backlog.
- `cd backend && npm test` sigue con 45 pasados y 0 fallidos, porque no se toca código.
- `git status` solo muestra cambios en `docs/`. No se hace commit.

<a id="a-4"></a>

#### A.4 · Plan — E2 backend: meta y progreso semanal

> Archivo original: `~/.claude/plans/prepara-un-plan-basado-snuggly-moler.md`

##### Contexto
La spec [docs/specs/E2-backend-meta-y-progreso-semanal.md](specs/E2-backend-meta-y-progreso-semanal.md) (estado: lista para implementar) añade a cada videojuego una meta semanal activa (horas + días, hasta 5 hitos), con historial de metas archivadas, y un endpoint `GET /api/videojuegos/:id/progreso` que calcula la semana actual, la racha y las últimas 4 semanas. Este plan la divide en los tickets backend del backlog ([docs/backlog/E2-metas-y-rachas.md](backlog/E2-metas-y-rachas.md)), en orden de dependencias. Rama: `feature/e2-metas-rachas`.

**Orden:** T01 → T03 → T04 → T05 → T06 → T07 → T08 → T14 (backend). T01, T03 y T04 son independientes entre sí; T05 depende de T01; T06 depende de T03, T04 y T05; T07 y T08 dependen de T06.

**Convenciones que aplican a todo:** tests con `node:test` en `test/` (raíz del repo, CommonJS con `require("../../backend/src/...")`), lanzados con `cd backend && npm test`; errores con `ApiError` y mensajes exactos de §5; nada de `process.env` fuera de `config/env.ts`; un commit por ticket.

---

##### E2-T01 · Módulo de fechas
**Archivos:** N `backend/src/dominio/fechas.ts` · M `test/dominio/fechas.test.js`

- Implementar con días como string `"AAAA-MM-DD"`:
  - `diaCalendario(fecha)` → `fecha.toISOString().slice(0, 10)`.
  - `interpretarFecha(texto)` → regex `^\d{4}-\d{2}-\d{2}$` + `new Date(Date.UTC(a, m-1, d))`; comprobar con `diaCalendario(resultado) === texto` para rechazar `2026-02-30` → `ApiError(400)`.
  - `hoyEcuador(ahora = new Date())` → `diaCalendario(new Date(ahora.getTime() - 5*3600*1000))`.
  - `esFechaFutura(dia, hoy = hoyEcuador())` → `dia > hoy`.
  - `sumarDias(dia, n)` → parsear a UTC, `setUTCDate(+n)`, `diaCalendario`.
  - `inicioSemana(dia)` → `getUTCDay()` (dom=0) → retroceder `(dow + 6) % 7` días.
- Reescribir `fechas.test.js` (diagnóstico #17): quitar el `try/catch` + `skip`, usar `Date.UTC`/strings, `interpretarFecha` a 00:00 UTC e inválida → lanza `ApiError` con status 400 (eliminar el caso «deja igual cualquier otro valor», que contradice la spec), `esFechaFutura` con strings, y añadir:
  - `hoyEcuador(2026-11-09T04:59Z) = "2026-11-08"`, `hoyEcuador(2026-11-09T05:00Z) = "2026-11-09"` (H0-C2).
  - `inicioSemana` en lunes, domingo, cruce de mes, y `inicioSemana("2026-01-01") = "2025-12-29"` (H0-C4).
  - `sumarDias` con cruce de mes/año y negativos.

##### E2-T03 · Desempate del avance actual (B-16)
**Archivos:** M `backend/src/services/partida.service.ts` · M `backend/src/services/videojuego.service.ts` (resumen) · N `test/dominio/orden-partidas.test.js`

- Funciones puras en un archivo pequeño N `backend/src/dominio/partidas.ts` (fuera de la lista de §8, pero evita que `dominio/progreso.ts` dependa de un servicio con Mongoose): `ordenarPartidasRecientes(partidas)` (copia ordenada por `fecha` desc., luego `createdAt` desc.) y `avanceActual(partidas): number | null` (el `porcentajeAvance` de la primera tras ordenar).
- En `partida.service.ts`: `ORDEN_RECIENTES = { fecha: -1, createdAt: -1 } as const`, usado en `listarPartidas` y `listarPartidasDeVideojuego` (hoy solo `{ fecha: -1 }`).
- `obtenerResumenVideojuego` usa `avanceActual(partidas)` (ya recibe la lista ordenada, pero así resumen y progreso comparten criterio).
- `orden-partidas.test.js`: dos partidas el mismo día con distinto `createdAt` → gana la creada más tarde; fechas distintas → gana la fecha mayor; lista vacía → `null`. Usar objetos planos (no hace falta Mongo).

##### E2-T04 · Modelo `Meta`
**Archivos:** N `backend/src/models/meta.model.ts` · N `test/model/meta.test.js`

- Interfaces `IHito` / `IMeta` tal cual §3; patrón de [partida.model.ts](../backend/src/models/partida.model.ts) (`timestamps: true`, mensajes en español).
- `HitoSchema` (subdocumento con `_id`): `nombre` required + trim («El nombre del hito es obligatorio»); `objetivo` required, min 1, max 100, validador `Number.isInteger` («El objetivo del hito debe ser un entero entre 1 y 100»); `alcanzadoEn?: Date`.
- `MetaSchema`: `videojuego` ref required; `horasPorSemana` con validador `v > 0 && v <= 168` (mensaje §5); `diasPorSemana` validador entero 1–7 (mensaje §5); `activa` default true; `vigenteDesde` required; `vigenteHasta` opcional; `hitos` con validador de array `length <= 5` («Una meta admite como máximo 5 hitos») y otro de `objetivo` sin duplicados.
- Índices: `{ videojuego: 1 }` único parcial `{ activa: true }` (B-01) y `{ videojuego: 1, vigenteDesde: 1 }`.
- `meta.test.js` con `validateSync()` (como `partida.test.js`): meta válida; horas 0 / 169 / ausente; días 0 / 8 / 2.5; 6 hitos; nombre vacío y solo espacios; objetivo 0 / 101 / 2.5; objetivos duplicados.

##### E2-T05 · Cálculo puro de progreso
**Archivos:** N `backend/src/dominio/progreso.ts` · N `test/dominio/progreso.test.js`

- Tipos de entrada mínimos (no documentos Mongoose): `PartidaCalculo { fecha: Date; duracionMinutos: number; porcentajeAvance?: number; createdAt: Date }`, `MetaCalculo { horasPorSemana, diasPorSemana, activa, vigenteDesde, vigenteHasta?, hitos }`. Tipos de salida `Progreso`, `SemanaActual`, `SemanaHistorial` con la forma del ejemplo de §5.
- `calcularProgresoDesde(partidas, metas, ahora)`: algoritmo de §4.3 literal, usando `fechas.ts`; `porcentajeAvanceActual` vía `avanceActual` de `dominio/partidas.ts` (T03). `vigenteDesde`/`vigenteHasta` → día con `hoyEcuador()`. Semanas `sin_meta` solo llevan `inicio`, `fin`, `estado`.
- `hitosPorAlcanzar(hitos, avance)`, `validarNuevoHito(meta, {nombre, objetivo}, avance)` (orden de chequeos: nombre → objetivo entero 1–100 → máx. 5 → duplicado → `objetivo ≤ avance`; `avance ?? 0`), `debeArchivarMeta(estado)`.
- `progreso.test.js`: los 15 casos de §6 + H5-C1 (2 h lunes + 1,5 h miércoles, meta {5,3} → 3,5 h / 70 % / 2 días / 67 % / no cumplida), H9-C1 (3 de 4 cumplidas, `semanasConMeta = 4`) y H9-C4 (ningún `inicio` de `ultimas4` = lunes actual). Construir `ahora` con `Date.UTC` y partidas a medianoche UTC.

##### E2-T06 · Servicio de metas
**Archivos:** N `backend/src/services/meta.service.ts`

- Todas empiezan con `await buscarVideojuegoPorId(id)` de [videojuego.service.ts](../backend/src/services/videojuego.service.ts) (404; un id mal formado produce `CastError` → 400 por [errorHandler.ts](../backend/src/middlewares/errorHandler.ts)).
- `obtenerMetaActiva`, `fijarMeta` (B-18 → 400; sin activa → crear; mismos valores → `{creada:false}`; distintos → archivar la activa **antes** de crear la nueva para no violar el índice único, copiando `hitos` con `nombre`, `objetivo`, `alcanzadoEn`), `archivarMeta(id, { siExiste })`, `agregarHito` (`validarNuevoHito` con `avanceActual` de las partidas → 400; push + save), `eliminarHito` (validar `hitoId` con `Types.ObjectId.isValid` → 400; 404 si no hay meta o hito; `meta.hitos.pull`), `actualizarHitosAlcanzados` (sin meta o avance `null` → no hace nada; `hitosPorAlcanzar` → `alcanzadoEn = new Date()`; save solo si cambió algo), `calcularProgreso(id, ahora)` (`Partida.find({videojuego})` + `Meta.find({videojuego})` → `calcularProgresoDesde`).
- Validar en el servicio (además del modelo) los rangos de horas/días para devolver el mensaje exacto de §5 vía `ApiError(400)` y no el mensaje compuesto de `ValidationError`.
- **Imports circulares:** `videojuego.service → partida.service → meta.service → videojuego.service`. Funciona en CommonJS porque las funciones solo se usan en tiempo de llamada, pero ningún módulo debe usar lo importado a nivel superior. Verificar con `npm run build` + arranque.

##### E2-T07 · Integración con videojuegos y partidas
**Archivos:** M `backend/src/services/videojuego.service.ts` · M `backend/src/services/partida.service.ts`

- `eliminarVideojuego`: tras borrar, `Meta.deleteMany({ videojuego: id })` (B-17).
- `actualizarVideojuego`: tras guardar, si `debeArchivarMeta(cambios.estado)` → `archivarMeta(id, { siExiste: true })` (B-18; `pausado` no archiva).
- `crearPartida` / `actualizarPartida`: tras guardar, `actualizarHitosAlcanzados(videojuegoId)`; en actualizar, usar `cambios.videojuego ?? actualizada.videojuego` (ojo: está populado → tomar `._id`).
- `eliminarPartida` no toca hitos (B-15: `alcanzadoEn` nunca se revierte).

##### E2-T08 · Endpoints
**Archivos:** N `backend/src/routes/meta.routes.ts` · N `backend/src/controllers/meta.controller.ts` · M `backend/src/app.ts`

- Router `Router({ mergeParams: true })` con las 6 rutas de §5; montado en [app.ts](../backend/src/app.ts) con `app.use("/api/videojuegos/:id", metaRouter)` **antes** de `videojuegoRouter`.
- Controlador con el patrón `try/catch → next(error)` de [videojuego.controller.ts](../backend/src/controllers/videojuego.controller.ts). B-19: construir `{ horasPorSemana, diasPorSemana }` y `{ nombre, objetivo }` explícitamente desde `req.body ?? {}`, con chequeo de tipo (`typeof === "number"`, `typeof === "string"`) → `ApiError(400)` con los mensajes de §5.
- Códigos: `PUT /meta` 201 si `creada`, 200 si no; `DELETE /meta` 204; `POST /meta/hitos` 201; `DELETE /meta/hitos/:hitoId` 200; `GET /progreso` 200 `{ progreso }`.
- B-20: `GET /api/videojuegos/abc/progreso` → 400 (CastError desde `buscarVideojuegoPorId`).

##### E2-T14 (parte backend) · Documentación
**Archivos:** M `README.md` · M `docs/diagnostico.md`

- README: los 6 endpoints nuevos con cuerpos/códigos y cómo correr `cd backend && npm test`.
- `diagnostico.md`: marcar como resueltos #4 y #17 (los de backend; #1 y #14 se cierran con los tickets de frontend).

---

##### Verificación
1. Por ticket: `cd backend && npm test` en verde (sin suites omitidas) y `cd backend && npm run build` sin errores.
2. Manual al terminar T07/T08 (`cd backend && npm run dev`, `curl` contra `http://localhost:3000`), recorriendo las filas «Manual» de §7: H1-C1…C5 (PUT 201/200/400 con 0, 169, 0, 8, 2.5), H2-C1/C3, H3-C1/C3/C4/C6, H4-C1, H7-C1/C5/C6, H8-C1…C4, B-19 (`{"$set": …}` no altera nada), B-20 (`abc` → 400, id inexistente → 404).
3. B-21: buscar `process.env` en `backend/src` → solo `config/env.ts`.

<a id="a-5"></a>

#### A.5 · Alinear el backend de E2 con las reglas fijas del enunciado

> Archivo original: `~/.claude/plans/verifica-que-el-backend-polymorphic-boot.md`

##### Contexto

Revisé `backend/src/dominio/progreso.ts`, `fechas.ts`, `partidas.ts`, `meta.service.ts`, `meta.controller.ts`, `meta.routes.ts`, `errorHandler.ts` y la spec `docs/specs/E2-backend-meta-y-progreso-semanal.md` contra el enunciado. `npm test`: 149/149 en verde.

###### Lo que ya cumple
| Regla del enunciado | Dónde |
|---|---|
| Semana de lunes a domingo, America/Guayaquil | `hoyEcuador` (UTC-5 fijo) + `inicioSemana` en `fechas.ts` |
| porcentajeHoras redondeado a entero; límite (hueco 5) = sin tope | `evaluar()` en `progreso.ts`, B-09 |
| diasJugadosSemana = días distintos | `jugadoEntre()` cuenta claves de `porDia` |
| rachaActual / mejorRacha sobre todo el historial | `calcularProgresoDesde` recorre todo `porDia`, B-10 / B-22 |
| Sin meta → `meta: null`, `porcentajeHoras: null`, pero horas, días y rachas calculados | `aProgresoSemanal` + `semana` siempre calculada |
| Sin partidas → horas, días y rachas en 0 | Map vacío → 0 |
| 404 si no existe / 400 si el id es inválido | `buscarVideojuegoPorId` → `ApiError(404)`; CastError → 400 en `errorHandler.ts` |
| Decisiones: racha viva desde ayer (B-10), partida que cruza la medianoche cuenta entera en su día (B-06), semana evaluada con la meta vigente al domingo (B-11) | `progreso.ts` |
| Cálculo puro en `src/dominio/progreso.ts`; el servicio solo consulta y llama a esas funciones | `meta.service.ts::calcularProgreso` |

###### Incumplimientos
1. **horasSemana con 2 decimales**: el enunciado pide **1 decimal**. `aProgresoSemanal` hace `Math.round(h*100)/100`, y la spec y el test lo siguen.
2. **Hito alcanzado**: el enunciado dice que se alcanza cuando `porcentajeAvanceActual ≥ porcentajeObjetivo`, y que sin partidas no hay ninguno alcanzado. Hoy `alcanzado = Boolean(alcanzadoEn)` y la fecha nunca se revierte (H-6), así que un hito sigue alcanzado después de borrar las partidas o de que baje el avance.
   - Además, `eliminarPartida` no llama a `actualizarHitosAlcanzados`. Si se borra la partida más reciente y la anterior tenía más avance, el avance sube sin que se registre la fecha.

Decisión del usuario: **calcular `alcanzado` + conservar `alcanzadoEn` como fecha de la primera vez que se alcanzó.**

##### Cambios

###### Specs (primero; regla del repo: nada sin spec)
- `docs/specs/E2-backend-meta-y-progreso-semanal.md`:
  - §4.1, tabla §5 («Horas (1 decimal)»), caso 17 de §6: `horasSemana` con **1 decimal**.
  - B-15: `alcanzadoEn` registra la **primera** vez que `avance ≥ objetivo` y no se borra. Se actualiza también al eliminar una partida.
  - B-23 y §4.1 `aProgresoSemanal`: `alcanzado = porcentajeAvanceActual !== null && porcentajeAvanceActual ≥ porcentajeObjetivo` (sin partidas → todos `false`). `alcanzadoEn` se devuelve tal cual (o `null`).
  - §3.1 «Decisiones de modelado»: reescribir el punto de H-6. El estado se **calcula** y solo la fecha se guarda, como historial.
  - §4.2 integración: `eliminarPartida` llama a `actualizarHitosAlcanzados(videojuegoId)`.
  - §6: añadir casos (ver Tests).
- `docs/specs/E2-frontend-meta-semanal.md` (T12): «Alcanzado el …» solo si `alcanzado && alcanzadoEn`. Si `alcanzado` es true y no hay fecha → «Alcanzado». Si no → «Pendiente». Revisar también `docs/backlog/E2-metas-y-rachas.md` y el PRD si citan H-6 / 2 decimales.

###### Código
- `backend/src/dominio/progreso.ts` → `aProgresoSemanal`:
  - `horasSemana: Math.round(semana.horas * 10) / 10`.
  - En el `map` de hitos: `alcanzado: avance !== null && avance >= hito.porcentajeObjetivo`, con `avance = progreso.porcentajeAvanceActual`.
  - Actualizar los comentarios (B-15/B-23).
- `backend/src/services/partida.service.ts` → `eliminarPartida`: guardar `resultado.videojuego` y, después del borrado, `await actualizarHitosAlcanzados(String(resultado.videojuego))`. Reutiliza la función que ya existe en `meta.service.ts`. Si el videojuego ya no existe, la función lanza 404; envolver esa llamada para que no rompa el DELETE, o comprobar antes con `Videojuego.exists`.
- Frontend (componente de hitos de T12 en `frontend/src/pages/`): ajustar el texto según la spec nueva, si hoy depende solo de `alcanzadoEn`.

###### Tests (`test/dominio/progreso.test.js`)
- Cambiar «redondea horasSemana a 2 decimales» a 1 decimal (20 min → `0.3`) y ajustar el título del test de estructura.
- Nuevos casos en `aProgresoSemanal`:
  - hito con `alcanzadoEn` guardado pero avance actual menor → `alcanzado: false`, `alcanzadoEn` conservado;
  - sin partidas (avance `null`) → todos los hitos `alcanzado: false`;
  - avance = objetivo → `alcanzado: true`.
- El test «no toca los ya alcanzados aunque el avance baje» (`hitosPorAlcanzar`) se mantiene: la fecha no se reescribe.

##### Verificación
1. `cd backend && npm test`: todo en verde, incluidos los casos nuevos.
2. `cd backend && npm run build` y `cd frontend && npm run build` sin errores de tipos.
3. Manual con `npm run dev`:
   - `GET /api/videojuegos/abc/progreso-semanal` → 400; un ObjectId válido que no existe → 404.
   - Partidas de 20 min → `horasSemana: 0.3`.
   - Hito al 50 %, partida con 55 % → `alcanzado: true` con fecha. Borrar la partida → `alcanzado: false`, `alcanzadoEn` igual. Sin partidas → ningún hito alcanzado.
   - Sin meta → `meta: null`, `porcentajeHoras: null`, horas, días y rachas calculados.

<a id="apendice-b"></a>

### Apéndice B — Salidas de `cd backend && npm test`

<a id="b-1"></a>

#### B.1 · Tests de B-24 escritos, sin código: 155 tests · 145 pasan · 10 fallan

<details>
<summary>Ver la salida completa</summary>

```text

> api-diario-gamer@1.0.0 test
> node --import tsx --test "../test/**/*.test.js"

▶ diaCalendario
  ✔ devuelve la parte UTC de la fecha en formato AAAA-MM-DD (2.627ms)
  ✔ las 00:01 y las 23:59 UTC caen el mismo día (0.3075ms)
  ✔ las 23:59 y las 00:00 siguientes son días distintos (0.3238ms)
  ✔ ordena los días a través de un cambio de mes y de año (0.1746ms)
✔ diaCalendario (5.0751ms)
▶ interpretarFecha
  ✔ interpreta AAAA-MM-DD como las 00:00 UTC de ese día (0.3953ms)
  ✔ es la inversa de diaCalendario (0.1749ms)
  ✔ rechaza "2026-02-30" con un error 400 (0.7634ms)
  ✔ rechaza "2026-13-01" con un error 400 (0.287ms)
  ✔ rechaza "21/10/2026" con un error 400 (0.2498ms)
  ✔ rechaza "2026-10-21T10:00:00Z" con un error 400 (0.2719ms)
  ✔ rechaza "" con un error 400 (0.1421ms)
✔ interpretarFecha (3.2286ms)
▶ hoyEcuador
  ✔ a las 04:59 UTC todavía es el día anterior en Ecuador (0.2281ms)
  ✔ a las 05:00 UTC ya es el día siguiente en Ecuador (0.1082ms)
✔ hoyEcuador (0.5109ms)
▶ esFechaFutura
  ✔ mañana es futuro (1.652ms)
  ✔ hoy no es futuro (0.1614ms)
  ✔ ayer no es futuro (0.2671ms)
✔ esFechaFutura (2.3973ms)
▶ sumarDias
  ✔ suma y resta días dentro del mes (0.4967ms)
  ✔ cruza el cambio de mes (0.1697ms)
  ✔ cruza el cambio de año (0.1419ms)
  ✔ n = 0 devuelve el mismo día (0.1631ms)
✔ sumarDias (1.3891ms)
▶ inicioSemana
  ✔ un lunes es su propio inicio de semana (0.251ms)
  ✔ un domingo pertenece a la semana que empezó el lunes anterior (0.1325ms)
  ✔ un sábado a mitad de semana (0.1409ms)
  ✔ cruza el cambio de mes (0.1578ms)
  ✔ cruza el cambio de año (0.1286ms)
✔ inicioSemana (1.1271ms)
▶ ordenarPartidasRecientes
  ✔ ordena por fecha descendente (2.1443ms)
  ✔ a igual fecha, la creada más tarde va primero (0.3665ms)
  ✔ no modifica la lista original (0.5105ms)
✔ ordenarPartidasRecientes (4.8457ms)
▶ avanceActual
  ✔ con dos partidas el mismo día devuelve el avance de la creada más tarde (0.401ms)
  ✔ una fecha posterior gana aunque se haya creado antes (0.2155ms)
  ✔ sin partidas devuelve null (0.157ms)
  ✔ si la partida más reciente no indica avance devuelve null (0.1779ms)
✔ avanceActual (1.4105ms)
▶ calcularProgresoDesde — semana
  ✔ caso 1: partida en domingo cuenta en esa semana; en lunes, en la siguiente (3.0495ms)
  ✔ caso 2: domingo 23:30 en Ecuador sigue en la semana del 2 al 8 de noviembre (0.3699ms)
  ✔ caso 3: cumplir solo horas o solo días no basta; ambas sí (0.6325ms)
  ✔ caso 4: dos partidas el mismo día (60 + 30 min) → 1 día y 1,5 h (0.3564ms)
  ✔ caso 5: una partida de 120 min cuenta entera en su día (0.3012ms)
  ✔ caso 6: 7 h con una meta de 5 h → 140 % y cumplida (0.3941ms)
  ✔ H5-C1: 2 h el lunes + 1,5 h el miércoles con meta {5,3} (1.194ms)
  ✔ caso 7: meta cambiada el miércoles de la semana actual → se usa la nueva (0.3238ms)
  ✔ caso 12: una partida con fecha futura se ignora en semana, racha y avance (0.2781ms)
  ✔ sin meta activa, meta y semanaActual son null y el resto se calcula (0.2965ms)
✔ calcularProgresoDesde — semana (8.8164ms)
▶ calcularProgresoDesde — últimas 4 semanas
  ✔ H9-C4: son las 4 semanas completas anteriores, de la más antigua a la más reciente (0.5249ms)
  ✔ H9-C1: 3 de 4 semanas cumplidas (0.2329ms)
  ✔ caso 8: meta cambiada a mitad de una semana pasada → se usa la vigente al domingo (0.1784ms)
  ✔ caso 9: semanas anteriores a la primera meta → sin_meta y fuera de semanasConMeta (0.2403ms)
  ✔ caso 10: meta quitada → las semanas en que estuvo vigente conservan su estado (0.3003ms)
  ✔ las semanas sin_meta solo llevan inicio, fin y estado (0.1689ms)
✔ calcularProgresoDesde — últimas 4 semanas (1.9647ms)
▶ calcularProgresoDesde — racha (caso 11)
  ✔ partida hoy, ayer y anteayer → 3 (0.2826ms)
  ✔ solo ayer y anteayer → 2 (0.1405ms)
  ✔ ni hoy ni ayer → 0 (0.1265ms)
  ✔ un hueco de un día corta la racha (0.146ms)
  ✔ cruza el cambio de mes (31 oct → 1 nov) (0.1572ms)
  ✔ una partida de 0 minutos cuenta como día jugado (0.1397ms)
✔ calcularProgresoDesde — racha (caso 11) (1.1968ms)
▶ hitosPorAlcanzar (caso 13)
  ✔ devuelve los hitos pendientes con porcentaje objetivo ≤ avance (0.2496ms)
  ✔ no toca los ya alcanzados aunque el avance baje (0.1084ms)
  ✔ sin avance no alcanza nada (0.1105ms)
✔ hitosPorAlcanzar (caso 13) (0.6548ms)
▶ validarNuevoHito (caso 14)
  ✔ un hito válido devuelve null (0.4784ms)
  ✖ porcentajeObjetivo menor que el avance → error (2.0876ms)
  ✖ porcentajeObjetivo igual al avance → error (0.5777ms)
  ✔ sin avance cuenta como 0 (0.1732ms)
  ✖ porcentajeObjetivo repetido → 409 (B-24) (0.644ms)
  ✖ sexto hito → error (0.313ms)
  ✖ descripción vacía → error (0.4165ms)
  ✖ porcentajeObjetivo 0 → error (0.2887ms)
  ✖ porcentajeObjetivo 101 → error (0.2114ms)
  ✖ porcentajeObjetivo 2.5 → error (0.2034ms)
  ✖ porcentajeObjetivo "50" → error (0.3309ms)
✖ validarNuevoHito (caso 14) (6.5312ms)
▶ debeArchivarMeta (caso 15)
  ✔ completado → true (0.1906ms)
  ✔ abandonado → true (0.0822ms)
  ✔ jugando → false (0.1158ms)
  ✔ pausado → false (0.0762ms)
  ✔ undefined → false (0.0597ms)
✔ debeArchivarMeta (caso 15) (0.7501ms)
▶ calcularProgresoDesde — mejor racha (caso 16)
  ✔ sin partidas → 0 (0.272ms)
  ✔ una serie pasada de 5 días y la actual de 2 → mejor 5, actual 2 (0.2335ms)
  ✔ la mejor puede ser una serie pasada (cruce de mes); si es la actual, coincide con rachaActual (0.4133ms)
  ✔ varias partidas el mismo día cuentan como un día (0.476ms)
  ✔ las partidas futuras no cuentan (0.4101ms)
✔ calcularProgresoDesde — mejor racha (caso 16) (2.1963ms)
▶ aProgresoSemanal (caso 17)
  ✔ con meta: estructura de la spec §5, horas con 1 decimal e hitos ordenados (0.9804ms)
  ✔ redondea horasSemana a 1 decimal (0.2478ms)
  ✔ hito con alcanzadoEn pero avance actual menor → no alcanzado, fecha conservada (0.3877ms)
  ✔ avance igual al objetivo → alcanzado (0.3699ms)
  ✔ sin partidas → horas, días y rachas en 0 y ningún hito alcanzado (0.3481ms)
  ✔ sin meta: campos de meta en null, sin hitos y el resto calculado (0.3101ms)
✔ aProgresoSemanal (caso 17) (3.0529ms)
[2026-11-08T18:49:48.938Z] id=req-1 ERROR: Error [MongoServerError]: E11000 duplicate key error collection: metas
    at TestContext.<anonymous> (D:\MBURNEO\Web3\Entregable3\test\middlewares\errorHandler.test.js:43:7)
    at Test.runInAsyncScope (node:async_hooks:227:14)
    at Test.run (node:internal/test_runner/test:1382:25)
    at Suite.processPendingSubtests (node:internal/test_runner/test:960:18)
    at Test.postRun (node:internal/test_runner/test:1522:19)
    at Test.run (node:internal/test_runner/test:1447:12)
    at async Promise.all (index 0)
    at async Suite.run (node:internal/test_runner/test:1869:7)
    at async startSubtestAfterBootstrap (node:internal/test_runner/harness:387:3) {
  code: 11000
}
▶ errorHandler (B-20, B-24)
  ✔ ApiError(409) → 409 con su mensaje (2.2563ms)
  ✖ error E11000 de MongoDB (índice único) → 409 (2.8337ms)
  ✔ CastError (id con formato inválido) → 400 (0.5697ms)
✖ errorHandler (B-20, B-24) (7.1488ms)
▶ Modelo Meta
  ✔ una meta con horas, días y vigencia es válida y activa por defecto (11.0307ms)
  ✔ acepta 0.5 horas por semana (1.3997ms)
  ✔ acepta 100 horas por semana (0.9357ms)
  ✔ rechaza 0 horas por semana (1.2804ms)
  ✔ rechaza -1 horas por semana (0.6803ms)
  ✔ rechaza 100.5 horas por semana (0.6444ms)
  ✔ rechaza 101 horas por semana (0.5668ms)
  ✔ exige horasSemanales (0.8722ms)
  ✔ acepta 1 días por semana (0.636ms)
  ✔ acepta 7 días por semana (0.7205ms)
  ✔ rechaza 0 días por semana (0.5767ms)
  ✔ rechaza 8 días por semana (0.4683ms)
  ✔ rechaza 2.5 días por semana (0.4165ms)
  ✔ exige diasPorSemana (0.5785ms)
  ✔ acepta 5 hitos, cada uno con su propio _id (5.3047ms)
  ✔ rechaza un sexto hito (4.1834ms)
  ✔ rechaza un hito con descripción "" (1.1361ms)
  ✔ rechaza un hito con descripción "   " (0.6285ms)
  ✔ recorta los espacios de la descripción del hito (0.4081ms)
  ✔ rechaza un hito con porcentaje objetivo 0 (0.4271ms)
  ✔ rechaza un hito con porcentaje objetivo 101 (0.3688ms)
  ✔ rechaza un hito con porcentaje objetivo 2.5 (0.3658ms)
  ✔ rechaza dos hitos con el mismo porcentaje objetivo (0.5911ms)
✔ Modelo Meta (37.3584ms)
▶ Modelo Partida
  ✔ una partida con videojuego, fecha y duración es válida (7.8173ms)
  ✔ porcentajeAvance y notas son opcionales y se guardan si se indican (1.1549ms)
  ✔ rechaza una partida sin videojuego (2.0274ms)
  ✔ rechaza una partida sin fecha (0.5692ms)
  ✔ rechaza una partida sin duracionMinutos (0.4032ms)
  ✔ informa de todos los datos que faltan (0.3999ms)
  ✔ rechaza un videojuego con un identificador que no es válido (0.8324ms)
  ✔ acepta una fecha en formato YYYY-MM-DD (0.364ms)
  ✔ rechaza una fecha que no es válida (2.3952ms)
  ✔ acepta una duración de 0 minutos (0.7805ms)
  ✔ rechaza una duración negativa (0.6229ms)
  ✔ rechaza una duración que no es un número (1.1817ms)
  ✔ acepta un avance del 0 % (0.4677ms)
  ✔ acepta un avance del 100 % (0.3562ms)
  ✔ rechaza un avance menor que 0 (0.4447ms)
  ✔ rechaza un avance mayor que 100 (0.4711ms)
✔ Modelo Partida (22.9586ms)
▶ Modelo Videojuego
  ✔ un videojuego con todos sus datos es válido (7.5977ms)
  ✔ solo el nombre es obligatorio (1.3351ms)
  ✔ logros está vacío por defecto (0.5091ms)
  ✔ rechaza un videojuego sin nombre (1.1957ms)
  ✔ rechaza un nombre con solo espacios (0.4765ms)
  ✔ recorta los espacios del nombre (0.2525ms)
  ✔ acepta la plataforma PC (0.3334ms)
  ✔ acepta la plataforma PlayStation (0.2566ms)
  ✔ acepta la plataforma Xbox (0.2848ms)
  ✔ acepta la plataforma Switch (0.3645ms)
  ✔ acepta la plataforma Movil (0.236ms)
  ✔ acepta el género accion (0.2377ms)
  ✔ acepta el género rol (0.2172ms)
  ✔ acepta el género estrategia (0.154ms)
  ✔ acepta el género puzzle (0.1741ms)
  ✔ acepta el género deportes (0.1926ms)
  ✔ acepta el género otro (0.1685ms)
  ✔ acepta el estado jugando (0.2151ms)
  ✔ acepta el estado pausado (0.1433ms)
  ✔ acepta el estado completado (0.2214ms)
  ✔ acepta el estado abandonado (0.2064ms)
  ✔ rechaza plataforma con un valor fuera de la lista (GameBoy) (0.3828ms)
  ✔ rechaza genero con un valor fuera de la lista (terror) (0.2685ms)
  ✔ rechaza estado con un valor fuera de la lista (pendiente) (0.4151ms)
  ✔ informa de todos los campos no válidos a la vez (0.4772ms)
  ✔ acepta logros con nombre y estado de obtención (2.3323ms)
  ✔ rechaza un logro sin nombre (0.712ms)
  ✔ rechaza un logro sin estado de obtención (0.4481ms)
  ✔ los logros no tienen _id propio (se identifican por índice) (0.344ms)
✔ Modelo Videojuego (22.506ms)
ℹ tests 155
ℹ suites 20
ℹ pass 145
ℹ fail 10
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1078.9656

✖ failing tests:

test at ..\test\dominio\progreso.test.js:380:3
✖ porcentajeObjetivo menor que el avance → error (2.0876ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  + actual - expected
  
  + 'El porcentaje objetivo del hito debe ser mayor que el avance actual (40 %)'
  - {
  -   mensaje: 'El porcentaje objetivo del hito debe ser mayor que el avance actual (40 %)',
  -   status: 400
  - }
  
      at TestContext.<anonymous> (D:\MBURNEO\Web3\Entregable3\test\dominio\progreso.test.js:381:12)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1382:25)
      at Suite.processPendingSubtests (node:internal/test_runner/test:960:18)
      at Test.postRun (node:internal/test_runner/test:1522:19)
      at Test.run (node:internal/test_runner/test:1447:12)
      at async Promise.all (index 0)
      at async Suite.run (node:internal/test_runner/test:1869:7)
      at async Test.processPendingSubtests (node:internal/test_runner/test:960:7) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: 'El porcentaje objetivo del hito debe ser mayor que el avance actual (40 %)',
    expected: { status: 400, mensaje: 'El porcentaje objetivo del hito debe ser mayor que el avance actual (40 %)' },
    operator: 'strictEqual',
    diff: 'simple'
  }

test at ..\test\dominio\progreso.test.js:391:3
✖ porcentajeObjetivo igual al avance → error (0.5777ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
  + actual - expected
  
  + 'El porcentaje objetivo del hito debe ser mayor que el avance actual (40 %)'
  - {
  -   mensaje: 'El porcentaje objetivo del hito debe ser mayor que el avance actual (40 %)',
  -   status: 400
  - }
  
      at TestContext.<anonymous> (D:\MBURNEO\Web3\Entregable3\test\dominio\progreso.test.js:392:12)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1382:25)
      at Suite.processPendingSubtests (node:internal/test_runner/test:960:18)
      at Test.postRun (node:internal/test_runner/test:1522:19)
      at Test.run (node:internal/test_runner/test:1447:12)
      at async Suite.processPendingSubtests (node:internal/test_runner/test:960:7) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: 'El porcentaje objetivo del hito debe ser mayor que el avance actual (40 %)',
    expected: { status: 400, mensaje: 'El porcentaje objetivo del hito debe ser mayor que el avance actual (40 %)' },
    operator: 'deepStrictEqual',
    diff: 'simple'
  }

test at ..\test\dominio\progreso.test.js:413:3
✖ porcentajeObjetivo repetido → 409 (B-24) (0.644ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  + actual - expected
  
  + 'Ya existe un hito con porcentaje objetivo 50 %'
  - {
  -   mensaje: 'Ya existe un hito con porcentaje objetivo 50 %',
  -   status: 409
  - }
  
      at TestContext.<anonymous> (D:\MBURNEO\Web3\Entregable3\test\dominio\progreso.test.js:414:12)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1382:25)
      at Suite.processPendingSubtests (node:internal/test_runner/test:960:18)
      at Test.postRun (node:internal/test_runner/test:1522:19)
      at Test.run (node:internal/test_runner/test:1447:12)
      at async Suite.processPendingSubtests (node:internal/test_runner/test:960:7) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: 'Ya existe un hito con porcentaje objetivo 50 %',
    expected: { status: 409, mensaje: 'Ya existe un hito con porcentaje objetivo 50 %' },
    operator: 'strictEqual',
    diff: 'simple'
  }

test at ..\test\dominio\progreso.test.js:424:3
✖ sexto hito → error (0.313ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
  + actual - expected
  
  + 'Una meta admite como máximo 5 hitos'
  - {
  -   mensaje: 'Una meta admite como máximo 5 hitos',
  -   status: 400
  - }
  
      at TestContext.<anonymous> (D:\MBURNEO\Web3\Entregable3\test\dominio\progreso.test.js:425:12)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1382:25)
      at Suite.processPendingSubtests (node:internal/test_runner/test:960:18)
      at Test.postRun (node:internal/test_runner/test:1522:19)
      at Test.run (node:internal/test_runner/test:1447:12)
      at async Suite.processPendingSubtests (node:internal/test_runner/test:960:7) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: 'Una meta admite como máximo 5 hitos',
    expected: { status: 400, mensaje: 'Una meta admite como máximo 5 hitos' },
    operator: 'deepStrictEqual',
    diff: 'simple'
  }

test at ..\test\dominio\progreso.test.js:435:3
✖ descripción vacía → error (0.4165ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
  + actual - expected
  
  + 'La descripción del hito es obligatoria'
  - {
  -   mensaje: 'La descripción del hito es obligatoria',
  -   status: 400
  - }
  
      at TestContext.<anonymous> (D:\MBURNEO\Web3\Entregable3\test\dominio\progreso.test.js:436:12)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1382:25)
      at Suite.processPendingSubtests (node:internal/test_runner/test:960:18)
      at Test.postRun (node:internal/test_runner/test:1522:19)
      at Test.run (node:internal/test_runner/test:1447:12)
      at async Suite.processPendingSubtests (node:internal/test_runner/test:960:7) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: 'La descripción del hito es obligatoria',
    expected: { status: 400, mensaje: 'La descripción del hito es obligatoria' },
    operator: 'deepStrictEqual',
    diff: 'simple'
  }

test at ..\test\dominio\progreso.test.js:447:5
✖ porcentajeObjetivo 0 → error (0.2887ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
  + actual - expected
  
  + 'El porcentaje objetivo del hito debe ser un entero entre 1 y 100'
  - {
  -   mensaje: 'El porcentaje objetivo del hito debe ser un entero entre 1 y 100',
  -   status: 400
  - }
  
      at TestContext.<anonymous> (D:\MBURNEO\Web3\Entregable3\test\dominio\progreso.test.js:448:14)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1382:25)
      at Suite.processPendingSubtests (node:internal/test_runner/test:960:18)
      at Test.postRun (node:internal/test_runner/test:1522:19)
      at Test.run (node:internal/test_runner/test:1447:12)
      at async Suite.processPendingSubtests (node:internal/test_runner/test:960:7) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: 'El porcentaje objetivo del hito debe ser un entero entre 1 y 100',
    expected: { status: 400, mensaje: 'El porcentaje objetivo del hito debe ser un entero entre 1 y 100' },
    operator: 'deepStrictEqual',
    diff: 'simple'
  }

test at ..\test\dominio\progreso.test.js:447:5
✖ porcentajeObjetivo 101 → error (0.2114ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
  + actual - expected
  
  + 'El porcentaje objetivo del hito debe ser un entero entre 1 y 100'
  - {
  -   mensaje: 'El porcentaje objetivo del hito debe ser un entero entre 1 y 100',
  -   status: 400
  - }
  
      at TestContext.<anonymous> (D:\MBURNEO\Web3\Entregable3\test\dominio\progreso.test.js:448:14)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1382:25)
      at Suite.processPendingSubtests (node:internal/test_runner/test:960:18)
      at Test.postRun (node:internal/test_runner/test:1522:19)
      at Test.run (node:internal/test_runner/test:1447:12)
      at async Suite.processPendingSubtests (node:internal/test_runner/test:960:7) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: 'El porcentaje objetivo del hito debe ser un entero entre 1 y 100',
    expected: { status: 400, mensaje: 'El porcentaje objetivo del hito debe ser un entero entre 1 y 100' },
    operator: 'deepStrictEqual',
    diff: 'simple'
  }

test at ..\test\dominio\progreso.test.js:447:5
✖ porcentajeObjetivo 2.5 → error (0.2034ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
  + actual - expected
  
  + 'El porcentaje objetivo del hito debe ser un entero entre 1 y 100'
  - {
  -   mensaje: 'El porcentaje objetivo del hito debe ser un entero entre 1 y 100',
  -   status: 400
  - }
  
      at TestContext.<anonymous> (D:\MBURNEO\Web3\Entregable3\test\dominio\progreso.test.js:448:14)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1382:25)
      at Suite.processPendingSubtests (node:internal/test_runner/test:960:18)
      at Test.postRun (node:internal/test_runner/test:1522:19)
      at Test.run (node:internal/test_runner/test:1447:12)
      at async Suite.processPendingSubtests (node:internal/test_runner/test:960:7) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: 'El porcentaje objetivo del hito debe ser un entero entre 1 y 100',
    expected: { status: 400, mensaje: 'El porcentaje objetivo del hito debe ser un entero entre 1 y 100' },
    operator: 'deepStrictEqual',
    diff: 'simple'
  }

test at ..\test\dominio\progreso.test.js:447:5
✖ porcentajeObjetivo "50" → error (0.3309ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
  + actual - expected
  
  + 'El porcentaje objetivo del hito debe ser un entero entre 1 y 100'
  - {
  -   mensaje: 'El porcentaje objetivo del hito debe ser un entero entre 1 y 100',
  -   status: 400
  - }
  
      at TestContext.<anonymous> (D:\MBURNEO\Web3\Entregable3\test\dominio\progreso.test.js:448:14)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1382:25)
      at Suite.processPendingSubtests (node:internal/test_runner/test:960:18)
      at Test.postRun (node:internal/test_runner/test:1522:19)
      at Test.run (node:internal/test_runner/test:1447:12)
      at async Suite.processPendingSubtests (node:internal/test_runner/test:960:7) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: 'El porcentaje objetivo del hito debe ser un entero entre 1 y 100',
    expected: { status: 400, mensaje: 'El porcentaje objetivo del hito debe ser un entero entre 1 y 100' },
    operator: 'deepStrictEqual',
    diff: 'simple'
  }

test at ..\test\middlewares\errorHandler.test.js:41:3
✖ error E11000 de MongoDB (índice único) → 409 (2.8337ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  
  500 !== 409
  
      at TestContext.<anonymous> (D:\MBURNEO\Web3\Entregable3\test\middlewares\errorHandler.test.js:47:12)
      at Test.runInAsyncScope (node:async_hooks:227:14)
      at Test.run (node:internal/test_runner/test:1382:25)
      at Suite.processPendingSubtests (node:internal/test_runner/test:960:18)
      at Test.postRun (node:internal/test_runner/test:1522:19)
      at Test.run (node:internal/test_runner/test:1447:12)
      at async Promise.all (index 0)
      at async Suite.run (node:internal/test_runner/test:1869:7)
      at async startSubtestAfterBootstrap (node:internal/test_runner/harness:387:3) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: 500,
    expected: 409,
    operator: 'strictEqual',
    diff: 'simple'
  }
```

</details>

<a id="b-2"></a>

#### B.2 · B-24 implementada: 155 tests · 155 pasan · 0 fallan

<details>
<summary>Ver la salida completa</summary>

```text

> api-diario-gamer@1.0.0 test
> node --import tsx --test "../test/**/*.test.js"

▶ diaCalendario
  ✔ devuelve la parte UTC de la fecha en formato AAAA-MM-DD (2.3008ms)
  ✔ las 00:01 y las 23:59 UTC caen el mismo día (0.306ms)
  ✔ las 23:59 y las 00:00 siguientes son días distintos (0.3277ms)
  ✔ ordena los días a través de un cambio de mes y de año (0.2505ms)
✔ diaCalendario (5.0317ms)
▶ interpretarFecha
  ✔ interpreta AAAA-MM-DD como las 00:00 UTC de ese día (0.4599ms)
  ✔ es la inversa de diaCalendario (0.2781ms)
  ✔ rechaza "2026-02-30" con un error 400 (0.7963ms)
  ✔ rechaza "2026-13-01" con un error 400 (0.2531ms)
  ✔ rechaza "21/10/2026" con un error 400 (0.2763ms)
  ✔ rechaza "2026-10-21T10:00:00Z" con un error 400 (0.344ms)
  ✔ rechaza "" con un error 400 (0.1396ms)
✔ interpretarFecha (3.4599ms)
▶ hoyEcuador
  ✔ a las 04:59 UTC todavía es el día anterior en Ecuador (0.6967ms)
  ✔ a las 05:00 UTC ya es el día siguiente en Ecuador (0.3122ms)
✔ hoyEcuador (2.9899ms)
▶ esFechaFutura
  ✔ mañana es futuro (0.3068ms)
  ✔ hoy no es futuro (0.1364ms)
  ✔ ayer no es futuro (0.1238ms)
✔ esFechaFutura (0.8792ms)
▶ sumarDias
  ✔ suma y resta días dentro del mes (0.3324ms)
  ✔ cruza el cambio de mes (0.1646ms)
  ✔ cruza el cambio de año (0.1574ms)
  ✔ n = 0 devuelve el mismo día (0.1225ms)
✔ sumarDias (1.0602ms)
▶ inicioSemana
  ✔ un lunes es su propio inicio de semana (0.2602ms)
  ✔ un domingo pertenece a la semana que empezó el lunes anterior (0.1661ms)
  ✔ un sábado a mitad de semana (0.1348ms)
  ✔ cruza el cambio de mes (0.1361ms)
  ✔ cruza el cambio de año (0.132ms)
✔ inicioSemana (1.0955ms)
▶ ordenarPartidasRecientes
  ✔ ordena por fecha descendente (1.7717ms)
  ✔ a igual fecha, la creada más tarde va primero (0.2995ms)
  ✔ no modifica la lista original (0.2672ms)
✔ ordenarPartidasRecientes (4.1483ms)
▶ avanceActual
  ✔ con dos partidas el mismo día devuelve el avance de la creada más tarde (0.4352ms)
  ✔ una fecha posterior gana aunque se haya creado antes (0.2512ms)
  ✔ sin partidas devuelve null (0.2022ms)
  ✔ si la partida más reciente no indica avance devuelve null (0.2398ms)
✔ avanceActual (1.7027ms)
▶ calcularProgresoDesde — semana
  ✔ caso 1: partida en domingo cuenta en esa semana; en lunes, en la siguiente (3.0482ms)
  ✔ caso 2: domingo 23:30 en Ecuador sigue en la semana del 2 al 8 de noviembre (0.6274ms)
  ✔ caso 3: cumplir solo horas o solo días no basta; ambas sí (1.087ms)
  ✔ caso 4: dos partidas el mismo día (60 + 30 min) → 1 día y 1,5 h (0.4721ms)
  ✔ caso 5: una partida de 120 min cuenta entera en su día (0.3789ms)
  ✔ caso 6: 7 h con una meta de 5 h → 140 % y cumplida (0.4162ms)
  ✔ H5-C1: 2 h el lunes + 1,5 h el miércoles con meta {5,3} (1.5034ms)
  ✔ caso 7: meta cambiada el miércoles de la semana actual → se usa la nueva (0.5513ms)
  ✔ caso 12: una partida con fecha futura se ignora en semana, racha y avance (0.4147ms)
  ✔ sin meta activa, meta y semanaActual son null y el resto se calcula (0.5465ms)
✔ calcularProgresoDesde — semana (11.099ms)
▶ calcularProgresoDesde — últimas 4 semanas
  ✔ H9-C4: son las 4 semanas completas anteriores, de la más antigua a la más reciente (0.7516ms)
  ✔ H9-C1: 3 de 4 semanas cumplidas (0.3685ms)
  ✔ caso 8: meta cambiada a mitad de una semana pasada → se usa la vigente al domingo (0.324ms)
  ✔ caso 9: semanas anteriores a la primera meta → sin_meta y fuera de semanasConMeta (0.4032ms)
  ✔ caso 10: meta quitada → las semanas en que estuvo vigente conservan su estado (0.3627ms)
  ✔ las semanas sin_meta solo llevan inicio, fin y estado (0.2454ms)
✔ calcularProgresoDesde — últimas 4 semanas (2.9184ms)
▶ calcularProgresoDesde — racha (caso 11)
  ✔ partida hoy, ayer y anteayer → 3 (0.4464ms)
  ✔ solo ayer y anteayer → 2 (0.2206ms)
  ✔ ni hoy ni ayer → 0 (0.2264ms)
  ✔ un hueco de un día corta la racha (0.288ms)
  ✔ cruza el cambio de mes (31 oct → 1 nov) (0.2852ms)
  ✔ una partida de 0 minutos cuenta como día jugado (0.2556ms)
✔ calcularProgresoDesde — racha (caso 11) (2.097ms)
▶ hitosPorAlcanzar (caso 13)
  ✔ devuelve los hitos pendientes con porcentaje objetivo ≤ avance (0.2592ms)
  ✔ no toca los ya alcanzados aunque el avance baje (0.1374ms)
  ✔ sin avance no alcanza nada (0.1346ms)
✔ hitosPorAlcanzar (caso 13) (0.7611ms)
▶ validarNuevoHito (caso 14)
  ✔ un hito válido devuelve null (0.5053ms)
  ✔ porcentajeObjetivo menor que el avance → error (0.2339ms)
  ✔ porcentajeObjetivo igual al avance → error (0.1655ms)
  ✔ sin avance cuenta como 0 (0.1402ms)
  ✔ porcentajeObjetivo repetido → 409 (B-24) (0.1912ms)
  ✔ sexto hito → error (0.1619ms)
  ✔ descripción vacía → error (0.1633ms)
  ✔ porcentajeObjetivo 0 → error (0.1932ms)
  ✔ porcentajeObjetivo 101 → error (0.1445ms)
  ✔ porcentajeObjetivo 2.5 → error (0.1494ms)
  ✔ porcentajeObjetivo "50" → error (0.1335ms)
✔ validarNuevoHito (caso 14) (2.8632ms)
▶ debeArchivarMeta (caso 15)
  ✔ completado → true (0.2722ms)
  ✔ abandonado → true (0.0981ms)
  ✔ jugando → false (0.1305ms)
  ✔ pausado → false (0.0953ms)
  ✔ undefined → false (0.124ms)
✔ debeArchivarMeta (caso 15) (1.2354ms)
▶ calcularProgresoDesde — mejor racha (caso 16)
  ✔ sin partidas → 0 (0.8643ms)
  ✔ una serie pasada de 5 días y la actual de 2 → mejor 5, actual 2 (0.472ms)
  ✔ la mejor puede ser una serie pasada (cruce de mes); si es la actual, coincide con rachaActual (0.5408ms)
  ✔ varias partidas el mismo día cuentan como un día (0.3031ms)
  ✔ las partidas futuras no cuentan (0.2661ms)
✔ calcularProgresoDesde — mejor racha (caso 16) (2.7944ms)
▶ aProgresoSemanal (caso 17)
  ✔ con meta: estructura de la spec §5, horas con 1 decimal e hitos ordenados (0.8874ms)
  ✔ redondea horasSemana a 1 decimal (0.2651ms)
  ✔ hito con alcanzadoEn pero avance actual menor → no alcanzado, fecha conservada (0.4053ms)
  ✔ avance igual al objetivo → alcanzado (0.3536ms)
  ✔ sin partidas → horas, días y rachas en 0 y ningún hito alcanzado (0.4606ms)
  ✔ sin meta: campos de meta en null, sin hitos y el resto calculado (0.3499ms)
✔ aProgresoSemanal (caso 17) (3.0838ms)
▶ errorHandler (B-20, B-24)
  ✔ ApiError(409) → 409 con su mensaje (1.7478ms)
  ✔ error E11000 de MongoDB (índice único) → 409 (0.2731ms)
  ✔ CastError (id con formato inválido) → 400 (0.5996ms)
✔ errorHandler (B-20, B-24) (3.8775ms)
▶ Modelo Meta
  ✔ una meta con horas, días y vigencia es válida y activa por defecto (9.225ms)
  ✔ acepta 0.5 horas por semana (0.9422ms)
  ✔ acepta 100 horas por semana (0.6434ms)
  ✔ rechaza 0 horas por semana (0.8314ms)
  ✔ rechaza -1 horas por semana (0.4446ms)
  ✔ rechaza 100.5 horas por semana (0.6955ms)
  ✔ rechaza 101 horas por semana (0.5626ms)
  ✔ exige horasSemanales (0.9538ms)
  ✔ acepta 1 días por semana (0.8206ms)
  ✔ acepta 7 días por semana (0.7035ms)
  ✔ rechaza 0 días por semana (0.5391ms)
  ✔ rechaza 8 días por semana (0.4205ms)
  ✔ rechaza 2.5 días por semana (0.4013ms)
  ✔ exige diasPorSemana (0.505ms)
  ✔ acepta 5 hitos, cada uno con su propio _id (4.665ms)
  ✔ rechaza un sexto hito (3.4479ms)
  ✔ rechaza un hito con descripción "" (1.1177ms)
  ✔ rechaza un hito con descripción "   " (0.5664ms)
  ✔ recorta los espacios de la descripción del hito (0.3232ms)
  ✔ rechaza un hito con porcentaje objetivo 0 (0.4407ms)
  ✔ rechaza un hito con porcentaje objetivo 101 (0.5245ms)
  ✔ rechaza un hito con porcentaje objetivo 2.5 (0.682ms)
  ✔ rechaza dos hitos con el mismo porcentaje objetivo (0.7776ms)
✔ Modelo Meta (32.9577ms)
▶ Modelo Partida
  ✔ una partida con videojuego, fecha y duración es válida (9.3896ms)
  ✔ porcentajeAvance y notas son opcionales y se guardan si se indican (1.2705ms)
  ✔ rechaza una partida sin videojuego (2.1457ms)
  ✔ rechaza una partida sin fecha (0.5351ms)
  ✔ rechaza una partida sin duracionMinutos (0.3928ms)
  ✔ informa de todos los datos que faltan (0.381ms)
  ✔ rechaza un videojuego con un identificador que no es válido (1.0332ms)
  ✔ acepta una fecha en formato YYYY-MM-DD (0.6895ms)
  ✔ rechaza una fecha que no es válida (3.041ms)
  ✔ acepta una duración de 0 minutos (0.8041ms)
  ✔ rechaza una duración negativa (0.6211ms)
  ✔ rechaza una duración que no es un número (1.084ms)
  ✔ acepta un avance del 0 % (0.5304ms)
  ✔ acepta un avance del 100 % (0.3554ms)
  ✔ rechaza un avance menor que 0 (0.4266ms)
  ✔ rechaza un avance mayor que 100 (0.4432ms)
✔ Modelo Partida (25.572ms)
▶ Modelo Videojuego
  ✔ un videojuego con todos sus datos es válido (8.3201ms)
  ✔ solo el nombre es obligatorio (1.2819ms)
  ✔ logros está vacío por defecto (0.4653ms)
  ✔ rechaza un videojuego sin nombre (1.2929ms)
  ✔ rechaza un nombre con solo espacios (0.6789ms)
  ✔ recorta los espacios del nombre (0.2853ms)
  ✔ acepta la plataforma PC (0.5483ms)
  ✔ acepta la plataforma PlayStation (0.7501ms)
  ✔ acepta la plataforma Xbox (0.4914ms)
  ✔ acepta la plataforma Switch (0.5763ms)
  ✔ acepta la plataforma Movil (0.4746ms)
  ✔ acepta el género accion (0.3955ms)
  ✔ acepta el género rol (0.2647ms)
  ✔ acepta el género estrategia (0.204ms)
  ✔ acepta el género puzzle (0.2181ms)
  ✔ acepta el género deportes (0.2407ms)
  ✔ acepta el género otro (0.1769ms)
  ✔ acepta el estado jugando (0.1915ms)
  ✔ acepta el estado pausado (0.1616ms)
  ✔ acepta el estado completado (0.1697ms)
  ✔ acepta el estado abandonado (0.1424ms)
  ✔ rechaza plataforma con un valor fuera de la lista (GameBoy) (0.3306ms)
  ✔ rechaza genero con un valor fuera de la lista (terror) (0.3166ms)
  ✔ rechaza estado con un valor fuera de la lista (pendiente) (0.3486ms)
  ✔ informa de todos los campos no válidos a la vez (0.5039ms)
  ✔ acepta logros con nombre y estado de obtención (2.6903ms)
  ✔ rechaza un logro sin nombre (0.918ms)
  ✔ rechaza un logro sin estado de obtención (0.4676ms)
  ✔ los logros no tienen _id propio (se identifican por índice) (0.2986ms)
✔ Modelo Videojuego (26.2618ms)
ℹ tests 155
ℹ suites 20
ℹ pass 155
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1103.2902
```

</details>

<a id="apendice-c"></a>

### Apéndice C — Log de las pruebas manuales con curl (2026-11-08)

Generado por el script del [Apéndice D](#apendice-d) contra `http://localhost:3000`. Cada entrada muestra el comando `curl` y la respuesta JSON recibida.

<details>
<summary>Ver las 34 peticiones y sus respuestas</summary>

#### 1. Crear videojuego A (sin partidas) — esperado 201, obtenido 201 ✅
```bash
curl -X POST http://localhost:3000/api/videojuegos -H 'Content-Type: application/json' -d '{"nombre":"[PRUEBA] A sin partidas","plataforma":"PC","genero":"rol","estado":"jugando"}'
```
```json
{"videojuego":{"nombre":"[PRUEBA] A sin partidas","plataforma":"PC","genero":"rol","estado":"jugando","_id":"6af0c4c89962f973626f5afd","logros":[],"createdAt":"2026-11-08T18:51:52.507Z","updatedAt":"2026-11-08T18:51:52.507Z","__v":0}}
```

#### 2. A: progreso sin partidas ni meta — esperado 200, obtenido 200 ✅
```bash
curl -X GET http://localhost:3000/api/videojuegos/6af0c4c89962f973626f5afd/progreso-semanal
```
```json
{"semana":{"inicio":"2026-11-02","fin":"2026-11-08"},"meta":null,"horasSemana":0,"porcentajeHoras":null,"diasJugadosSemana":0,"porcentajeDias":null,"cumplida":null,"rachaActual":0,"mejorRacha":0,"porcentajeAvanceActual":null,"hitos":[],"ultimas4":[{"inicio":"2026-10-05","fin":"2026-10-11","estado":"sin_meta"},{"inicio":"2026-10-12","fin":"2026-10-18","estado":"sin_meta"},{"inicio":"2026-10-19","fin":"2026-10-25","estado":"sin_meta"},{"inicio":"2026-10-26","fin":"2026-11-01","estado":"sin_meta"}],"semanasCumplidas":0,"semanasConMeta":0}
```

#### 3. A: fijar meta {5 h, 3 días} — esperado 201, obtenido 201 ✅
```bash
curl -X PUT http://localhost:3000/api/videojuegos/6af0c4c89962f973626f5afd/meta -H 'Content-Type: application/json' -d '{"horasSemanales":5,"diasPorSemana":3}'
```
```json
{"meta":{"videojuego":"6af0c4c89962f973626f5afd","horasSemanales":5,"diasPorSemana":3,"activa":true,"vigenteDesde":"2026-11-08T18:51:53.418Z","hitos":[],"_id":"6af0c4c99962f973626f5b04","createdAt":"2026-11-08T18:51:53.567Z","updatedAt":"2026-11-08T18:51:53.567Z","__v":0}}
```

#### 4. A: progreso sin partidas con meta (0 %, rachas 0) — esperado 200, obtenido 200 ✅
```bash
curl -X GET http://localhost:3000/api/videojuegos/6af0c4c89962f973626f5afd/progreso-semanal
```
```json
{"semana":{"inicio":"2026-11-02","fin":"2026-11-08"},"meta":{"horasSemanales":5,"diasPorSemana":3},"horasSemana":0,"porcentajeHoras":0,"diasJugadosSemana":0,"porcentajeDias":0,"cumplida":false,"rachaActual":0,"mejorRacha":0,"porcentajeAvanceActual":null,"hitos":[],"ultimas4":[{"inicio":"2026-10-05","fin":"2026-10-11","estado":"sin_meta"},{"inicio":"2026-10-12","fin":"2026-10-18","estado":"sin_meta"},{"inicio":"2026-10-19","fin":"2026-10-25","estado":"sin_meta"},{"inicio":"2026-10-26","fin":"2026-11-01","estado":"sin_meta"}],"semanasCumplidas":0,"semanasConMeta":0}
```

#### 5. Crear videojuego B (con partidas) — esperado 201, obtenido 201 ✅
```bash
curl -X POST http://localhost:3000/api/videojuegos -H 'Content-Type: application/json' -d '{"nombre":"[PRUEBA] B racha rota","plataforma":"PC","genero":"rol","estado":"jugando"}'
```
```json
{"videojuego":{"nombre":"[PRUEBA] B racha rota","plataforma":"PC","genero":"rol","estado":"jugando","_id":"6af0c4ca9962f973626f5b09","logros":[],"createdAt":"2026-11-08T18:51:54.286Z","updatedAt":"2026-11-08T18:51:54.286Z","__v":0}}
```

#### 6. B: partida 2026-10-27 (60 min, 5 %) — esperado 201, obtenido 201 ✅
```bash
curl -X POST http://localhost:3000/api/partidas -H 'Content-Type: application/json' -d '{"videojuego":"6af0c4ca9962f973626f5b09","fecha":"2026-10-27","duracionMinutos":60,"porcentajeAvance":5}'
```
```json
{"partida":{"videojuego":"6af0c4ca9962f973626f5b09","fecha":"2026-10-27T00:00:00.000Z","duracionMinutos":60,"porcentajeAvance":5,"_id":"6af0c4ca9962f973626f5b0c","createdAt":"2026-11-08T18:51:54.787Z","updatedAt":"2026-11-08T18:51:54.787Z","__v":0}}
```

#### 7. B: partida 2026-10-28 (60 min, 10 %) — esperado 201, obtenido 201 ✅
```bash
curl -X POST http://localhost:3000/api/partidas -H 'Content-Type: application/json' -d '{"videojuego":"6af0c4ca9962f973626f5b09","fecha":"2026-10-28","duracionMinutos":60,"porcentajeAvance":10}'
```
```json
{"partida":{"videojuego":"6af0c4ca9962f973626f5b09","fecha":"2026-10-28T00:00:00.000Z","duracionMinutos":60,"porcentajeAvance":10,"_id":"6af0c4cb9962f973626f5b11","createdAt":"2026-11-08T18:51:55.533Z","updatedAt":"2026-11-08T18:51:55.533Z","__v":0}}
```

#### 8. B: partida 2026-10-29 (60 min, 15 %) — esperado 201, obtenido 201 ✅
```bash
curl -X POST http://localhost:3000/api/partidas -H 'Content-Type: application/json' -d '{"videojuego":"6af0c4ca9962f973626f5b09","fecha":"2026-10-29","duracionMinutos":60,"porcentajeAvance":15}'
```
```json
{"partida":{"videojuego":"6af0c4ca9962f973626f5b09","fecha":"2026-10-29T00:00:00.000Z","duracionMinutos":60,"porcentajeAvance":15,"_id":"6af0c4cc9962f973626f5b16","createdAt":"2026-11-08T18:51:56.261Z","updatedAt":"2026-11-08T18:51:56.261Z","__v":0}}
```

#### 9. B: partida 2026-10-30 (60 min, 20 %) — esperado 201, obtenido 201 ✅
```bash
curl -X POST http://localhost:3000/api/partidas -H 'Content-Type: application/json' -d '{"videojuego":"6af0c4ca9962f973626f5b09","fecha":"2026-10-30","duracionMinutos":60,"porcentajeAvance":20}'
```
```json
{"partida":{"videojuego":"6af0c4ca9962f973626f5b09","fecha":"2026-10-30T00:00:00.000Z","duracionMinutos":60,"porcentajeAvance":20,"_id":"6af0c4cc9962f973626f5b1b","createdAt":"2026-11-08T18:51:56.991Z","updatedAt":"2026-11-08T18:51:56.991Z","__v":0}}
```

#### 10. B: partida 2026-11-06 (60 min, 25 %) — esperado 201, obtenido 201 ✅
```bash
curl -X POST http://localhost:3000/api/partidas -H 'Content-Type: application/json' -d '{"videojuego":"6af0c4ca9962f973626f5b09","fecha":"2026-11-06","duracionMinutos":60,"porcentajeAvance":25}'
```
```json
{"partida":{"videojuego":"6af0c4ca9962f973626f5b09","fecha":"2026-11-06T00:00:00.000Z","duracionMinutos":60,"porcentajeAvance":25,"_id":"6af0c4cd9962f973626f5b20","createdAt":"2026-11-08T18:51:57.721Z","updatedAt":"2026-11-08T18:51:57.721Z","__v":0}}
```

#### 11. B: partida 2026-11-07 (60 min, 30 %) — esperado 201, obtenido 201 ✅
```bash
curl -X POST http://localhost:3000/api/partidas -H 'Content-Type: application/json' -d '{"videojuego":"6af0c4ca9962f973626f5b09","fecha":"2026-11-07","duracionMinutos":60,"porcentajeAvance":30}'
```
```json
{"partida":{"videojuego":"6af0c4ca9962f973626f5b09","fecha":"2026-11-07T00:00:00.000Z","duracionMinutos":60,"porcentajeAvance":30,"_id":"6af0c4ce9962f973626f5b25","createdAt":"2026-11-08T18:51:58.448Z","updatedAt":"2026-11-08T18:51:58.448Z","__v":0}}
```

#### 12. B: partida 2026-11-08 (60 min, 35 %) — esperado 201, obtenido 201 ✅
```bash
curl -X POST http://localhost:3000/api/partidas -H 'Content-Type: application/json' -d '{"videojuego":"6af0c4ca9962f973626f5b09","fecha":"2026-11-08","duracionMinutos":60,"porcentajeAvance":35}'
```
```json
{"partida":{"videojuego":"6af0c4ca9962f973626f5b09","fecha":"2026-11-08T00:00:00.000Z","duracionMinutos":60,"porcentajeAvance":35,"_id":"6af0c4cf9962f973626f5b2a","createdAt":"2026-11-08T18:51:59.179Z","updatedAt":"2026-11-08T18:51:59.179Z","__v":0}}
```

#### 13. B: fijar meta {5 h, 4 días} — esperado 201, obtenido 201 ✅
```bash
curl -X PUT http://localhost:3000/api/videojuegos/6af0c4ca9962f973626f5b09/meta -H 'Content-Type: application/json' -d '{"horasSemanales":5,"diasPorSemana":4}'
```
```json
{"meta":{"videojuego":"6af0c4ca9962f973626f5b09","horasSemanales":5,"diasPorSemana":4,"activa":true,"vigenteDesde":"2026-11-08T18:51:59.915Z","hitos":[],"_id":"6af0c4d09962f973626f5b30","createdAt":"2026-11-08T18:52:00.063Z","updatedAt":"2026-11-08T18:52:00.063Z","__v":0}}
```

#### 14. B: mismos valores de meta → sin cambios — esperado 200, obtenido 200 ✅
```bash
curl -X PUT http://localhost:3000/api/videojuegos/6af0c4ca9962f973626f5b09/meta -H 'Content-Type: application/json' -d '{"horasSemanales":5,"diasPorSemana":4}'
```
```json
{"meta":{"_id":"6af0c4d09962f973626f5b30","videojuego":"6af0c4ca9962f973626f5b09","horasSemanales":5,"diasPorSemana":4,"activa":true,"vigenteDesde":"2026-11-08T18:51:59.915Z","hitos":[],"createdAt":"2026-11-08T18:52:00.063Z","updatedAt":"2026-11-08T18:52:00.063Z","__v":0}}
```

#### 15. B: añadir hito 50 % (avance 35 %) — esperado 201, obtenido 201 ✅
```bash
curl -X POST http://localhost:3000/api/videojuegos/6af0c4ca9962f973626f5b09/meta/hitos -H 'Content-Type: application/json' -d '{"descripcion":"Llegar al 50 %","porcentajeObjetivo":50}'
```
```json
{"meta":{"_id":"6af0c4d09962f973626f5b30","videojuego":"6af0c4ca9962f973626f5b09","horasSemanales":5,"diasPorSemana":4,"activa":true,"vigenteDesde":"2026-11-08T18:51:59.915Z","hitos":[{"descripcion":"Llegar al 50 %","porcentajeObjetivo":50,"_id":"6af0c4d19962f973626f5b37"}],"createdAt":"2026-11-08T18:52:00.063Z","updatedAt":"2026-11-08T18:52:01.228Z","__v":1}}
```

#### 16. B: progreso (racha actual 3, mejor racha 4) — esperado 200, obtenido 200 ✅
```bash
curl -X GET http://localhost:3000/api/videojuegos/6af0c4ca9962f973626f5b09/progreso-semanal
```
```json
{"semana":{"inicio":"2026-11-02","fin":"2026-11-08"},"meta":{"horasSemanales":5,"diasPorSemana":4},"horasSemana":3,"porcentajeHoras":60,"diasJugadosSemana":3,"porcentajeDias":75,"cumplida":false,"rachaActual":3,"mejorRacha":4,"porcentajeAvanceActual":35,"hitos":[{"_id":"6af0c4d19962f973626f5b37","descripcion":"Llegar al 50 %","porcentajeObjetivo":50,"alcanzado":false,"alcanzadoEn":null}],"ultimas4":[{"inicio":"2026-10-05","fin":"2026-10-11","estado":"sin_meta"},{"inicio":"2026-10-12","fin":"2026-10-18","estado":"sin_meta"},{"inicio":"2026-10-19","fin":"2026-10-25","estado":"sin_meta"},{"inicio":"2026-10-26","fin":"2026-11-01","estado":"sin_meta"}],"semanasCumplidas":0,"semanasConMeta":0}
```

#### 17. 400: id con formato inválido — esperado 400, obtenido 400 ✅
```bash
curl -X GET http://localhost:3000/api/videojuegos/abc/progreso-semanal
```
```json
{"error":"\"abc\" no es un id válido para el campo \"_id\"","requestId":"64f98033-8cac-40e8-b6cf-67d07a4b8b02"}
```

#### 18. 400: horasSemanales = 0 — esperado 400, obtenido 400 ✅
```bash
curl -X PUT http://localhost:3000/api/videojuegos/6af0c4ca9962f973626f5b09/meta -H 'Content-Type: application/json' -d '{"horasSemanales":0,"diasPorSemana":3}'
```
```json
{"error":"Las horas por semana deben ser un número mayor que 0 y como máximo 100","requestId":"78e9728a-34a4-4891-8bcd-bd55b6a5a378"}
```

#### 19. 400: diasPorSemana = 8 — esperado 400, obtenido 400 ✅
```bash
curl -X PUT http://localhost:3000/api/videojuegos/6af0c4ca9962f973626f5b09/meta -H 'Content-Type: application/json' -d '{"horasSemanales":5,"diasPorSemana":8}'
```
```json
{"error":"Los días por semana deben ser un entero entre 1 y 7","requestId":"7378062e-588e-4a3e-9b6c-c30ff334bbb0"}
```

#### 20. 400: diasPorSemana = 2.5 — esperado 400, obtenido 400 ✅
```bash
curl -X PUT http://localhost:3000/api/videojuegos/6af0c4ca9962f973626f5b09/meta -H 'Content-Type: application/json' -d '{"horasSemanales":5,"diasPorSemana":2.5}'
```
```json
{"error":"Los días por semana deben ser un entero entre 1 y 7","requestId":"f26e04cd-7344-44dc-9db6-52892194fd9f"}
```

#### 21. 400: hito ≤ avance actual (30 ≤ 35) — esperado 400, obtenido 400 ✅
```bash
curl -X POST http://localhost:3000/api/videojuegos/6af0c4ca9962f973626f5b09/meta/hitos -H 'Content-Type: application/json' -d '{"descripcion":"Muy bajo","porcentajeObjetivo":30}'
```
```json
{"error":"El porcentaje objetivo del hito debe ser mayor que el avance actual (35 %)","requestId":"ad1d1ee6-7fac-4104-b319-acf082847185"}
```

#### 22. 400: hito sin descripción — esperado 400, obtenido 400 ✅
```bash
curl -X POST http://localhost:3000/api/videojuegos/6af0c4ca9962f973626f5b09/meta/hitos -H 'Content-Type: application/json' -d '{"descripcion":"  ","porcentajeObjetivo":60}'
```
```json
{"error":"La descripción del hito es obligatoria","requestId":"21c2400c-c082-4f77-b4e3-1b8d1f270976"}
```

#### 23. 400: hitoId con formato inválido — esperado 400, obtenido 400 ✅
```bash
curl -X DELETE http://localhost:3000/api/videojuegos/6af0c4ca9962f973626f5b09/meta/hitos/abc
```
```json
{"error":"\"abc\" no es un id válido para el campo \"hitoId\"","requestId":"04465fce-51bf-4710-984a-fe56e2a6100a"}
```

#### 24. 404: videojuego inexistente (progreso) — esperado 404, obtenido 404 ✅
```bash
curl -X GET http://localhost:3000/api/videojuegos/507f1f77bcf86cd799439011/progreso-semanal
```
```json
{"error":"No existe un videojuego con id 507f1f77bcf86cd799439011","requestId":"b7498674-2381-4731-8a0e-53db229987bc"}
```

#### 25. 404: videojuego inexistente (meta) — esperado 404, obtenido 404 ✅
```bash
curl -X PUT http://localhost:3000/api/videojuegos/507f1f77bcf86cd799439011/meta -H 'Content-Type: application/json' -d '{"horasSemanales":5,"diasPorSemana":3}'
```
```json
{"error":"No existe un videojuego con id 507f1f77bcf86cd799439011","requestId":"6792681c-0f3d-4f79-b9d6-d7c1f96eb043"}
```

#### 26. 404: hito inexistente — esperado 404, obtenido 404 ✅
```bash
curl -X DELETE http://localhost:3000/api/videojuegos/6af0c4ca9962f973626f5b09/meta/hitos/507f1f77bcf86cd799439011
```
```json
{"error":"No existe un hito con id 507f1f77bcf86cd799439011","requestId":"5677f3b9-c19e-4a02-a1a6-1ea44f87bafc"}
```

#### 27. A: quitar la meta — esperado 204, obtenido 204 ✅
```bash
curl -X DELETE http://localhost:3000/api/videojuegos/6af0c4c89962f973626f5afd/meta
```
```json
(sin cuerpo)
```

#### 28. 404: A sin meta activa (GET meta) — esperado 404, obtenido 404 ✅
```bash
curl -X GET http://localhost:3000/api/videojuegos/6af0c4c89962f973626f5afd/meta
```
```json
{"error":"El videojuego no tiene una meta activa","requestId":"330a617b-ccb7-4e0a-9d91-eabd0ebb77c3"}
```

#### 29. 404: A sin meta activa (añadir hito) — esperado 404, obtenido 404 ✅
```bash
curl -X POST http://localhost:3000/api/videojuegos/6af0c4c89962f973626f5afd/meta/hitos -H 'Content-Type: application/json' -d '{"descripcion":"X","porcentajeObjetivo":50}'
```
```json
{"error":"El videojuego no tiene una meta activa","requestId":"e47723d9-9637-49ae-9937-8a8cf7ce02a1"}
```

#### 30. 404: ruta inexistente /progreso — esperado 404, obtenido 404 ✅
```bash
curl -X GET http://localhost:3000/api/videojuegos/6af0c4ca9962f973626f5b09/progreso
```
```json
{"error":"Ruta no encontrada: GET /api/videojuegos/6af0c4ca9962f973626f5b09/progreso","requestId":"d659fca6-3eab-48b3-8ae1-f030b9d02670"}
```

#### 31. 409: hito con porcentaje objetivo repetido (50 %) — esperado 409, obtenido 409 ✅
```bash
curl -X POST http://localhost:3000/api/videojuegos/6af0c4ca9962f973626f5b09/meta/hitos -H 'Content-Type: application/json' -d '{"descripcion":"Otra vez 50","porcentajeObjetivo":50}'
```
```json
{"error":"Ya existe un hito con porcentaje objetivo 50 %","requestId":"14f11472-8945-47f6-8451-e1b20f5f788f"}
```

#### Carrera: 8 × PUT /videojuegos/A/meta simultáneos (E11000 → 409)
```bash
for h in 1 2 3 4 5 6 7 8; do curl -s -X PUT http://localhost:3000/api/videojuegos/<A>/meta -H 'Content-Type: application/json' -d "{\"horasSemanales\":$h,\"diasPorSemana\":3}" & done; wait
```
```
horas=1 → 201 {"meta":{"videojuego":"6af0c4c89962f973626f5afd","horasSemanales":1,"diasPorSemana":3,"activa":true,"vigenteDesde":"2026-11-08T18:52:07.924Z","hitos":[],"_id":"6af0c4d89962f973626f5b67","createdAt":"2026-11-08T18:52:08.209Z","updatedAt":"2026-11-08T18:52:08.209Z","__v":0}}
horas=2 → 409 {"error":"Ya existe un recurso con esos datos; vuelve a intentarlo","requestId":"0375d2d8-7978-4b09-b49c-544edd97d58b"}
horas=3 → 409 {"error":"Ya existe un recurso con esos datos; vuelve a intentarlo","requestId":"fb54f8ee-02fb-4c83-98e8-92568cef032c"}
horas=4 → 201 {"meta":{"videojuego":"6af0c4c89962f973626f5afd","horasSemanales":4,"diasPorSemana":3,"activa":true,"vigenteDesde":"2026-11-08T18:52:08.770Z","hitos":[],"_id":"6af0c4d99962f973626f5b77","createdAt":"2026-11-08T18:52:09.067Z","updatedAt":"2026-11-08T18:52:09.067Z","__v":0}}
horas=5 → 409 {"error":"Ya existe un recurso con esos datos; vuelve a intentarlo","requestId":"da7ee652-14ad-41c2-b4f6-b20a2f761b52"}
horas=6 → 409 {"error":"Ya existe un recurso con esos datos; vuelve a intentarlo","requestId":"f97b1136-773b-4281-ac91-940399008075"}
horas=7 → 409 {"error":"Ya existe un recurso con esos datos; vuelve a intentarlo","requestId":"5f4e9301-e024-49b3-a203-c7d003480c70"}
horas=8 → 409 {"error":"Ya existe un recurso con esos datos; vuelve a intentarlo","requestId":"969306da-a02a-4cea-bed8-507cd8588839"}
```

#### 32. Limpieza: eliminar A — esperado 204, obtenido 204 ✅
```bash
curl -X DELETE http://localhost:3000/api/videojuegos/6af0c4c89962f973626f5afd
```
```json
(sin cuerpo)
```

#### 33. Limpieza: eliminar B (borra sus metas) — esperado 204, obtenido 204 ✅
```bash
curl -X DELETE http://localhost:3000/api/videojuegos/6af0c4ca9962f973626f5b09
```
```json
(sin cuerpo)
```

</details>

<a id="apendice-d"></a>

### Apéndice D — Script de las pruebas (`pruebas-curl-E2.sh`)

<details>
<summary>Ver el script</summary>

````bash
#!/usr/bin/env bash
# Pruebas manuales E2 con curl contra http://localhost:3000.
# Registra cada petición en $LOG (Markdown) para la tabla de evidencia.
API=http://localhost:3000/api
LOG="${1:-pruebas.log.md}"
: > "$LOG"
N=0

# req "<descripción>" "<esperado>" METHOD PATH [BODY]
req() {
  local desc="$1" esperado="$2" metodo="$3" ruta="$4" cuerpo="$5"
  N=$((N + 1))
  local args=(-s -w '\n%{http_code}' -X "$metodo" "$API$ruta")
  [ -n "$cuerpo" ] && args+=(-H 'Content-Type: application/json' -d "$cuerpo")
  local salida status resp
  salida=$(curl "${args[@]}")
  status=$(printf '%s' "$salida" | tail -n1)
  resp=$(printf '%s' "$salida" | sed '$d')
  ULTIMA="$resp"
  local ok="✅"; [ "$status" != "$esperado" ] && ok="❌"
  {
    echo "### $N. $desc — esperado $esperado, obtenido $status $ok"
    echo '```bash'
    if [ -n "$cuerpo" ]; then
      echo "curl -X $metodo $API$ruta -H 'Content-Type: application/json' -d '$cuerpo'"
    else
      echo "curl -X $metodo $API$ruta"
    fi
    echo '```'
    echo '```json'
    printf '%s\n' "${resp:-(sin cuerpo)}"
    echo '```'
    echo
  } >> "$LOG"
  echo "$N|$desc|$metodo $ruta|$esperado|$status|$ok"
}

campo() { node -e "const o=JSON.parse(process.argv[1]);console.log(eval('o.'+process.argv[2]))" "$ULTIMA" "$1"; }

JUEGO='{"nombre":"%s","plataforma":"PC","genero":"rol","estado":"jugando"}'

# ---------- Videojuego A: sin partidas ----------
req "Crear videojuego A (sin partidas)" 201 POST /videojuegos "$(printf "$JUEGO" '[PRUEBA] A sin partidas')"
A=$(node -e "const o=JSON.parse(process.argv[1]);console.log((o.videojuego||o)._id)" "$ULTIMA")
req "A: progreso sin partidas ni meta" 200 GET "/videojuegos/$A/progreso-semanal"
req "A: fijar meta {5 h, 3 días}" 201 PUT "/videojuegos/$A/meta" '{"horasSemanales":5,"diasPorSemana":3}'
req "A: progreso sin partidas con meta (0 %, rachas 0)" 200 GET "/videojuegos/$A/progreso-semanal"

# ---------- Videojuego B: 7 partidas en 7 días distintos, racha rota ----------
req "Crear videojuego B (con partidas)" 201 POST /videojuegos "$(printf "$JUEGO" '[PRUEBA] B racha rota')"
B=$(node -e "const o=JSON.parse(process.argv[1]);console.log((o.videojuego||o)._id)" "$ULTIMA")
avance=5
# Serie pasada de 4 días (27–30 oct), hueco, serie actual de 3 días (6–8 nov).
for dia in 2026-10-27 2026-10-28 2026-10-29 2026-10-30 2026-11-06 2026-11-07 2026-11-08; do
  req "B: partida $dia (60 min, $avance %)" 201 POST /partidas \
    "{\"videojuego\":\"$B\",\"fecha\":\"$dia\",\"duracionMinutos\":60,\"porcentajeAvance\":$avance}"
  PARTIDAS="$PARTIDAS $(node -e "console.log(JSON.parse(process.argv[1]).partida._id)" "$ULTIMA")"
  avance=$((avance + 5))
done
req "B: fijar meta {5 h, 4 días}" 201 PUT "/videojuegos/$B/meta" '{"horasSemanales":5,"diasPorSemana":4}'
req "B: mismos valores de meta → sin cambios" 200 PUT "/videojuegos/$B/meta" '{"horasSemanales":5,"diasPorSemana":4}'
req "B: añadir hito 50 % (avance 35 %)" 201 POST "/videojuegos/$B/meta/hitos" '{"descripcion":"Llegar al 50 %","porcentajeObjetivo":50}'
req "B: progreso (racha actual 3, mejor racha 4)" 200 GET "/videojuegos/$B/progreso-semanal"

# ---------- 400 ----------
req "400: id con formato inválido" 400 GET /videojuegos/abc/progreso-semanal
req "400: horasSemanales = 0" 400 PUT "/videojuegos/$B/meta" '{"horasSemanales":0,"diasPorSemana":3}'
req "400: diasPorSemana = 8" 400 PUT "/videojuegos/$B/meta" '{"horasSemanales":5,"diasPorSemana":8}'
req "400: diasPorSemana = 2.5" 400 PUT "/videojuegos/$B/meta" '{"horasSemanales":5,"diasPorSemana":2.5}'
req "400: hito ≤ avance actual (30 ≤ 35)" 400 POST "/videojuegos/$B/meta/hitos" '{"descripcion":"Muy bajo","porcentajeObjetivo":30}'
req "400: hito sin descripción" 400 POST "/videojuegos/$B/meta/hitos" '{"descripcion":"  ","porcentajeObjetivo":60}'
req "400: hitoId con formato inválido" 400 DELETE "/videojuegos/$B/meta/hitos/abc"

# ---------- 404 ----------
INEXISTENTE=507f1f77bcf86cd799439011
req "404: videojuego inexistente (progreso)" 404 GET "/videojuegos/$INEXISTENTE/progreso-semanal"
req "404: videojuego inexistente (meta)" 404 PUT "/videojuegos/$INEXISTENTE/meta" '{"horasSemanales":5,"diasPorSemana":3}'
req "404: hito inexistente" 404 DELETE "/videojuegos/$B/meta/hitos/$INEXISTENTE"
req "A: quitar la meta" 204 DELETE "/videojuegos/$A/meta"
req "404: A sin meta activa (GET meta)" 404 GET "/videojuegos/$A/meta"
req "404: A sin meta activa (añadir hito)" 404 POST "/videojuegos/$A/meta/hitos" '{"descripcion":"X","porcentajeObjetivo":50}'
req "404: ruta inexistente /progreso" 404 GET "/videojuegos/$B/progreso"

# ---------- 409 ----------
req "409: hito con porcentaje objetivo repetido (50 %)" 409 POST "/videojuegos/$B/meta/hitos" '{"descripcion":"Otra vez 50","porcentajeObjetivo":50}'

# 409 por índice único (E11000): 8 PUT /meta simultáneos con valores distintos sobre A (sin meta).
echo "--- carrera PUT /meta (E11000) ---"
CARRERA=$(mktemp -d)
for h in 1 2 3 4 5 6 7 8; do
  curl -s -o "$CARRERA/$h.json" -w "%{http_code}\n" -X PUT "$API/videojuegos/$A/meta" \
    -H 'Content-Type: application/json' -d "{\"horasSemanales\":$h,\"diasPorSemana\":3}" > "$CARRERA/$h.status" &
done
wait
{
  echo "### Carrera: 8 × PUT /videojuegos/A/meta simultáneos (E11000 → 409)"
  echo '```bash'
  echo "for h in 1 2 3 4 5 6 7 8; do curl -s -X PUT $API/videojuegos/<A>/meta -H 'Content-Type: application/json' -d \"{\\\"horasSemanales\\\":\$h,\\\"diasPorSemana\\\":3}\" & done; wait"
  echo '```'
  echo '```'
  for h in 1 2 3 4 5 6 7 8; do echo "horas=$h → $(cat "$CARRERA/$h.status") $(cat "$CARRERA/$h.json")"; done
  echo '```'
  echo
} >> "$LOG"
for h in 1 2 3 4 5 6 7 8; do echo "carrera horas=$h → $(cat "$CARRERA/$h.status")"; done

# ---------- limpieza (B-17) ----------
for p in $PARTIDAS; do req "Limpieza: eliminar partida $p" 204 DELETE "/partidas/$p"; done
req "Limpieza: eliminar A" 204 DELETE "/videojuegos/$A"
req "Limpieza: eliminar B (borra sus metas)" 204 DELETE "/videojuegos/$B"
echo "A=$A B=$B"
````

</details>

<a id="apendice-e"></a>

### Apéndice E — Prueba del hook `proteger-env.js`

```text
$ echo '{"tool_name":"Read","tool_input":{"file_path":"D:/x/backend/.env"}}' | node .claude/hooks/proteger-env.js; echo "exit=$?"
Bloqueado: las reglas del proyecto prohíben leer o modificar .env. Usa variables de entorno vía config/env.ts.
exit=2

$ ... file_path=backend/.env.example
exit=0

$ ... file_path=README.md
exit=0
```
