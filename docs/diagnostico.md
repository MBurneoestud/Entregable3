# Diagnóstico — Diario de Progreso Gamer (Proyecto 3 → E2)

Fecha del diagnóstico: 2026-11-07 · Commit revisado: `91da107` (rama `feature/e2-metas-rachas`). Primera versión sobre `ace480a`.
Documentos relacionados: [PRD](prd/PRD-diario-progreso-gamer.md) · [épicas](backlog/epicas.md) · [E2: historias y tickets](backlog/E2-metas-y-rachas.md) · [spec backend](specs/E2-backend-meta-y-progreso-semanal.md) · [spec frontend](specs/E2-frontend-meta-semanal.md)

Alcance de la revisión:

- lectura completa del código (backend y frontend), del `README.md`, de `AGENTS.md` y de la configuración de Claude (`.claude/`);
- ejecución de `npm test` en backend y frontend;
- verificación de tipos con `tsc --noEmit`;
- análisis del video `Demo-Diario-Gamer.mp4` como evidencia de pruebas.

## Cambios desde la primera versión (`ace480a` → `91da107` + documentación SDD)

- `73c70e9` añadió este documento.
- `91da107` añadió `AGENTS.md`, `CLAUDE.md`, `DESIGN.md`, `.claude/` (hook de Prettier y skill `commit`), `Evidencia_Hooks.png`, scripts `test` y la carpeta `test/` con pruebas base.
- Después se escribió la documentación SDD de E2: PRD, épicas, historias con tickets y las specs de backend y frontend. Con ella se resuelve el #14 (pendiente de commit).
- **No se tocó `backend/src` ni `frontend/src`:** los problemas #1–#13 siguen vigentes (comprobado en el código; ver la tabla).

## Estado del Proyecto 3

- **Stack:** backend Express + TypeScript + Mongoose (models/routes/controllers/services/middlewares) y frontend React + Vite + React Router + Tailwind. Desplegado en Render (2 servicios).
- **Compilación:** `tsc --noEmit` pasa sin errores en backend y frontend.
- **Funcionalidad:** coincide en general con el README:
  - CRUD de videojuegos y PATCH de logro embebido;
  - CRUD de partidas (API);
  - resumen calculado en el servicio;
  - filtros;
  - middlewares requestId/logger/errorHandler;
  - estados de carga/error/vacío.

  Corresponde a la épica E1 del [backlog](backlog/epicas.md).
- **Pruebas automatizadas:** `node:test` + `tsx`, en `test/` (raíz), lanzadas con `cd backend && npm test`.
  - **Backend:** 45 tests pasan y 0 fallan (`test/model/partida.test.js`: 16; `test/model/videojuego.test.js`: 29). Solo validan esquemas de Mongoose con `validateSync()`, sin base de datos.
  - **Omitidas (en el momento del diagnóstico):** las 3 suites de `test/dominio/fechas.test.js`, porque `backend/src/dominio/fechas.ts` aún no existía. Se resolvió en E2-T01.
  - **Tras implementar el backend de E2 (2026-11-08):** 159 tests pasan y 0 fallan; se añaden `test/dominio/{fechas,progreso,orden-partidas}.test.js`, `test/model/meta.test.js` y `test/middlewares/errorHandler.test.js`.
  - **Frontend:** `npm test` (`node --test`) ejecuta 0 tests.
- **Video (2:06, 1920×1020, app en producción):** muestra lista, detalle con resumen, registrar partida, eliminar partida, crear juego, editar juego, eliminar juego (sin partidas) y filtros por plataforma y estado. **Revela un bug visible:** se registra una partida con fecha `10/21/2026` y la lista la muestra como **«20 oct 2026»**.
- **Rama:** `feature/e2-metas-rachas` va 2 commits por delante de `main` (`ace480a`), los dos de documentación, configuración y tests.
  - En el momento del diagnóstico, las specs de E2 no estaban versionadas y la implementación no había empezado.
  - **Actualización 2026-11-08:** `docs/` ya está versionado y el backend de E2 está implementado según la [spec backend](specs/E2-backend-meta-y-progreso-semanal.md) (tickets E2-T01, T03–T08).
- **Veredicto:**
  - Entregable funcional y bien estructurado, con 2 bugs de datos reales (fechas y partidas huérfanas).
  - Tiene una base de pruebas, pero solo cubre los modelos, así que no detecta ninguno de los bugs conocidos.
  - Cuatro problemas bloquean E2 (#1, #4, #14 y #17) y se resuelven dentro de la épica. El resto se difiere.

## Tabla de problemas

**Para E2:**

- **Bloquea:** E2 no puede implementarse o daría resultados incorrectos si no se corrige antes; se corrige dentro de E2, en el ticket indicado.
- **Se difiere:** no afecta a E2 y queda para después.

| # | Sev. | Área | Problema | Evidencia / ubicación | Corrección sugerida | Para E2 |
|---|---|---|---|---|---|---|
| 1 | Alta | Front/Back | La fecha de la partida se muestra un día antes. `<input type=date>` envía `YYYY-MM-DD` → Mongo guarda medianoche UTC → `Intl.DateTimeFormat` lo formatea en hora local (UTC-5). | **Visible en el video** (10/21 → «20 oct»). `FormularioPartida.tsx`, `formatearFecha` en `ListaPartidas.tsx:7` y `DetalleVideojuego.tsx:35` | Formatear con `timeZone: "UTC"`. Ver #17 | **Bloquea**: días, semanas y rachas se asignarían mal → E2-T01, E2-T02 |
| 2 | Alta | Backend | Eliminar un videojuego no elimina sus partidas: quedan huérfanas, siguen en `/api/partidas` y suman en «Tiempo de juego». El commit `0752461` («página negra en /partidas») solo parchó la UI (`videojuego: null`), no la causa. | `videojuego.service.ts:75` → `eliminarVideojuego` | `Partida.deleteMany({ videojuego: id })` al eliminar (y avisar en el `confirm`) | **Se difiere**: el progreso de E2 se calcula por juego existente. E2 sí borra metas e hitos (H-8). Punto abierto P-2 del PRD |
| 3 | Alta | Calidad | Las pruebas solo cubren los esquemas de Mongoose. No hay tests de servicios, controladores ni rutas: ni el resumen, ni los 400/404, ni el PATCH de logro, ni el borrado en cascada. Ninguna detecta #1, #2 o #4. | `test/model/*.test.js` | Tests de servicio/API | **Se difiere** para E1. E2 trae sus propios tests de dominio (specs §6/§5) |
| 4 | Media | Backend | «Avance actual» del resumen es ambiguo si hay 2 partidas el mismo día: solo se ordena por `fecha` (precisión de día). | `partida.service.ts:14,22` (`sort({ fecha: -1 })`) | `sort({ fecha: -1, createdAt: -1 })` | **Resuelto** en E2-T03: `ORDEN_RECIENTES` y `avanceActual` en `backend/src/dominio/partidas.ts`, usados por listados, resumen y progreso |
| 5 | Media | Repo | Video de 68 MB versionado en git (GitHub advierte a partir de 50 MB; infla cada clon). | `Demo-Diario-Gamer.mp4` | Enlace externo (Drive/YouTube) o Git LFS | Se difiere |
| 6 | Media | Repo | `.gitignore` contiene literalmente las líneas del heredoc (`cat > .gitignore << 'EOF'`, `EOF`, `cat .gitignore`). Funciona por casualidad. | `.gitignore` | Dejar solo los patrones | Se difiere |
| 7 | Media | Evidencia | El video no cubre: estados de error (400/404), recarga directa de rutas profundas (rewrite SPA en Render), filtro por género aplicado, eliminar un juego **con** partidas, ni el cambio de estado de logros de forma clara. Los tests actuales tampoco. | Video, `test/` | Ampliar la demo o cubrir con tests | Se difiere |
| 8 | Media | Docs | El README dice «Listar y filtrar partidas», pero solo hay filtro por `videojuegoId` vía URL, sin UI. El rewrite `/* → /index.html` de Render no está documentado. `vite.config.ts` dice que se evita `cors()`, pero el backend sí lo usa. | `README.md`, `vite.config.ts` | Ajustar textos y comentarios | Se difiere (el README se actualiza en E2-T14) |
| 9 | Baja | Backend | Los logros no tienen `_id` y se actualizan por índice: si la lista cambia entre cargarla y marcar un logro, se marca el equivocado. Un test lo fija como comportamiento esperado. | `videojuego.model.ts` (`_id: false`), ruta PATCH `:indiceLogro`, `videojuego.test.js` | Aceptable para el alcance; o usar el `_id` del subdocumento | Se difiere (los hitos de E2 sí llevan `_id`) |
| 10 | Baja | Backend | `PUT` pasa `req.body` crudo a `findByIdAndUpdate`: acepta operadores como `$unset` o `$set`. | `actualizarVideojuego`, `actualizarPartida` | Seleccionar solo los campos permitidos | Se difiere para E1; la regla B-19 lo evita en los endpoints nuevos |
| 11 | Baja | Front | Código duplicado: `manejarRespuesta` (2 archivos), `etiquetasEstado/Genero` (3), `formatearFecha` (2). Facilita bugs como el #1. | `src/api/*`, `src/pages/*` | Extraer a `src/utils` | Se difiere, salvo `formatearFecha`, que se unifica en E2-T02 |
| 12 | Baja | Backend | `PORT` no se valida (puede ser NaN); `backend/.env.example` no incluye `PORT`; `cerrarConexionDB` no se usa; la cabecera de `DBconnection.ts` dice `conexionDB.ts`. | `config/env.ts`, `DBconnection.ts` | Limpieza menor | Se difiere |
| 13 | Baja | Front | Texto de error «No se pudieron **completar** las partidas» (debería decir «cargar»). | `ListaPartidas.tsx:124` | Corregir el texto | Se difiere |
| 14 | Alta | Proceso | `AGENTS.md` exige una spec en `docs/specs/` antes de implementar, pero no había PRD, backlog ni specs, y `fechas.test.js` ya dependía de una spec inexistente. **Resuelto:** ya existen el PRD, las épicas, las historias con tickets y las specs de backend y frontend. **Falta hacer commit de `docs/`.** | `docs/` | Versionar `docs/` | **Bloquea** (resuelto en documentación; pendiente de commit) |
| 15 | Media | Calidad | El `npm test` del frontend no ejecuta nada (0 tests), así que la regla «ejecutar `npm test` antes de terminar» se cumple en falso. | `frontend/package.json` | Añadir tests o documentar que no hay | Se difiere. E2 prueba las utilidades de formato desde `test/frontend/` |
| 16 | Media | Herramientas | El hook de Prettier no hace nada: `prettier` no está instalado en ningún `package.json` ni es resoluble desde `.claude/hooks/`, y el `catch` silencia el error. Además solo procesa `.js/.jsx/.json/.css`, y el código es `.ts/.tsx`. | `.claude/hooks/formatear.js`, `.claude/settings.json` | Instalar Prettier y añadir `.ts/.tsx` | Se difiere |
| 17 | Media | Diseño | `fechas.test.js` espera que `interpretarFecha("2026-10-21")` devuelva la medianoche **local del servidor**. Render corre en UTC, así que el #1 persistiría en navegadores en UTC-5. | `test/dominio/fechas.test.js` | Alinear el test con la decisión D-1 | **Resuelto** en E2-T01: `backend/src/dominio/fechas.ts` existe y el test usa fechas UTC, sin suites omitidas |
| 18 | Baja | Calidad | Los tests viven en `/test` (raíz), pero solo se lanzan desde `backend/` con la ruta `../test/**`. El README no explica cómo ejecutarlos. | `backend/package.json`, `README.md` | Documentar `cd backend && npm test` | **Resuelto** en E2-T14: sección «Tests» del README |
| 19 | Baja | Calidad | Los tests están en JS con `require`, mientras el proyecto es TS con `import`. Funciona gracias a `tsx`, pero es inconsistente con `AGENTS.md`. | `test/` | Migrar a `.test.ts` cuando se amplíen | Se difiere (los tests nuevos de E2 siguen el formato actual, para no mezclar) |

## Decisiones tomadas

| # | Decisión | Problemas | Dónde se aplica |
|---|---|---|---|
| D-1 | El día de una partida es su fecha calendario (la parte UTC de la medianoche guardada), sin convertir zona horaria. En el frontend se formatea con `timeZone: "UTC"`. No se migran datos. | #1, #17 | Spec backend B-06 y §2; spec frontend F-02 |
| D-2 | «Hoy» y la semana (lunes a domingo) se calculan en hora de Ecuador con un desfase fijo de −5 h, sin librería de zonas horarias. | #1 | Spec backend B-05, ST-1 |
| D-3 | El avance actual se desempata por `createdAt` descendente, tanto en el resumen como en E2. | #4 | Spec backend B-16, E2-T03 |
| D-4 | Las correcciones que bloquean E2 (#1, #4 y #17) se hacen dentro de la épica, como historia habilitadora E2-H0 y tickets T01–T03, no como una épica aparte. | #1, #4, #17 | Backlog E2 |
| D-5 | El borrado en cascada de E2 se limita a metas e hitos. Las partidas huérfanas (#2) se difieren y quedan como punto abierto del PRD. | #2 | PRD H-8 y P-2; spec backend B-17 |
| D-6 | Los endpoints nuevos copian solo los campos permitidos del cuerpo; los de E1 no se tocan en esta épica. | #10 | Spec backend B-19 |
| D-7 | Los tests de E2 se escriben en `test/` (JS + `tsx`) y se lanzan con `cd backend && npm test`. Las utilidades del frontend se prueban desde `test/frontend/`. | #3, #15, #19 | Specs §6 (backend) y §5 (frontend) |
| D-8 | Los hitos llevan `_id` propio, a diferencia de los logros. | #9 | Spec backend §3 |
| D-9 | El video (#5) no se toca en E2. Sacarlo del repositorio requiere reescribir el historial y es una decisión del responsable del repo. | #5 | — |

## Correcciones propuestas (por prioridad)

1. **#14:** versionar `docs/` (commit de la documentación SDD).
2. **#17, #1:** E2-T01 (módulo de fechas y test alineado) y E2-T02 (`formatearFecha` única con `timeZone: "UTC"`).
3. **#4:** E2-T03 (desempate por `createdAt`).
4. Resto de E2 según el [backlog](backlog/E2-metas-y-rachas.md).
5. **Después de E2:** #2, #3 y #15 (pruebas de servicio/API para E1), y la limpieza #6, #8, #12, #13, #16 y #18.
6. **#5:** requiere decisión (D-9).

## Verificación de las correcciones

- `cd backend && npm test`: los 45 tests actuales siguen pasando y las suites de `fechas` dejan de omitirse.
- `npx tsc --noEmit` en `backend` y `frontend`.
- En local (`npm run dev` en ambos): registrar una partida con fecha X → la lista y el detalle muestran X.
- Dos partidas el mismo día → el resumen toma la creada más recientemente.
- Las tablas «criterio → verificación» de las dos specs, completas.
