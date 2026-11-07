# Diagnóstico — Diario de Progreso Gamer (Entregable 3)

Fecha del diagnóstico: 2026-11-07 · Commit revisado: `ace480a` (rama `feature/e2-metas-rachas`)

Alcance: lectura completa del código (backend y frontend) y del `README.md`, verificación de tipos con `tsc --noEmit` y análisis del video `Demo-Diario-Gamer.mp4` como evidencia de pruebas.

## Estado del proyecto

- **Stack:** backend Express + TypeScript + Mongoose (models/routes/controllers/services/middlewares), frontend React + Vite + React Router + Tailwind. Desplegado en Render (2 servicios).
- **Compilación:** `tsc --noEmit` pasa sin errores en backend y frontend.
- **Funcionalidad:** CRUD de videojuegos, PATCH de logro embebido, CRUD de partidas (API), resumen calculado en servicio, filtros, middlewares requestId/logger/errorHandler, estados de carga/error/vacío. Coincide en general con el README.
- **Pruebas:** no hay tests automatizados; la única evidencia es el video.
- **Video (2:06, 1920×1020, app en producción):** muestra lista, detalle con resumen, registrar partida, eliminar partida, crear juego, editar juego, eliminar juego (sin partidas), filtros por plataforma y estado. **Revela un bug visible:** se registra una partida con fecha `10/21/2026` y la lista la muestra como **"20 oct 2026"**.
- **Rama:** `feature/e2-metas-rachas` apunta al mismo commit que `main` (`ace480a`); el trabajo de "metas/rachas" no ha empezado.
- **Veredicto:** entregable funcional y bien estructurado, con 2 bugs de datos reales (fechas y partidas huérfanas), sin pruebas automatizadas y con problemas menores de higiene del repositorio.

## Tabla de problemas

| # | Sev. | Área | Problema | Evidencia / ubicación | Corrección sugerida |
|---|---|---|---|---|---|
| 1 | Alta | Front/Back | La fecha de la partida se muestra un día antes. `<input type=date>` envía `YYYY-MM-DD` → Mongo guarda medianoche UTC → `Intl.DateTimeFormat` lo formatea en hora local (UTC-5). | **Visible en el video** (10/21 → "20 oct"). `FormularioPartida.tsx`, `formatearFecha` en `ListaPartidas.tsx` y `DetalleVideojuego.tsx` | Formatear con `timeZone: "UTC"` (o guardar a mediodía UTC) |
| 2 | Alta | Backend | Eliminar un videojuego no elimina sus partidas → quedan huérfanas, siguen en `/api/partidas` y suman en "Tiempo de juego". El commit `0752461` ("página negra en /partidas") solo parchó la UI (`videojuego: null`), no la causa. | `videojuego.service.ts` → `eliminarVideojuego` | `Partida.deleteMany({ videojuego: id })` al eliminar (y avisar en el `confirm`) |
| 3 | Alta | Calidad | Sin pruebas automatizadas (ni script `test`). La evidencia depende del video. | `backend/package.json`, `frontend/package.json` | Tests de servicio/API (resumen, 400/404, PATCH de logro) |
| 4 | Media | Backend | "Avance actual" del resumen es ambiguo si hay 2 partidas el mismo día: solo se ordena por `fecha` (precisión de día). | `partida.service.ts` → `listarPartidasDeVideojuego` (`sort({ fecha: -1 })`) | `sort({ fecha: -1, createdAt: -1 })` |
| 5 | Media | Repo | Video de 70 MB versionado en git (GitHub advierte a partir de 50 MB; infla cada clon). | `Demo-Diario-Gamer.mp4` | Enlace externo (Drive/YouTube) o Git LFS |
| 6 | Media | Repo | `.gitignore` contiene literalmente las líneas del heredoc (`cat > .gitignore << 'EOF'`, `EOF`, `cat .gitignore`). Funciona por casualidad. | `.gitignore` | Dejar solo los patrones |
| 7 | Media | Evidencia | El video no cubre: estados de error (400/404), recarga directa de rutas profundas (rewrite SPA en Render), filtro por género aplicado, eliminar un juego **con** partidas, ni el cambio de estado de logros de forma clara. | Video | Ampliar la demo o cubrir con tests |
| 8 | Media | Docs | El README dice "Listar y filtrar partidas", pero solo hay filtro por `videojuegoId` vía URL, sin UI. El rewrite `/* → /index.html` de Render no está documentado. `vite.config.ts` dice que se evita `cors()`, pero el backend sí lo usa. | `README.md`, `vite.config.ts` | Ajustar textos y comentarios |
| 9 | Baja | Backend | Los logros no tienen `_id` y se actualizan por índice: si la lista cambia entre cargarla y marcar un logro, se marca el equivocado. | `videojuego.model.ts` (`_id: false`), ruta PATCH `:indiceLogro` | Aceptable para el alcance; o usar el `_id` del subdocumento |
| 10 | Baja | Backend | `PUT` pasa `req.body` crudo a `findByIdAndUpdate`: acepta operadores como `$unset` o `$set`. | `actualizarVideojuego`, `actualizarPartida` | Seleccionar solo los campos permitidos |
| 11 | Baja | Front | Código duplicado: `manejarRespuesta` (2 archivos), `etiquetasEstado/Genero` (3), `formatearFecha` (2). Facilita bugs como el #1. | `src/api/*`, `src/pages/*` | Extraer a `src/utils` |
| 12 | Baja | Backend | `PORT` no se valida (puede ser NaN); `backend/.env.example` no incluye `PORT`; `cerrarConexionDB` no se usa; la cabecera de `DBconnection.ts` dice `conexionDB.ts`. | `config/env.ts`, `DBconnection.ts` | Limpieza menor |
| 13 | Baja | Front | Texto de error "No se pudieron **completar** las partidas" (debería decir "cargar"). | `ListaPartidas.tsx` | Corregir el texto |

## Correcciones propuestas (por prioridad)

1. **#1** — En `ListaPartidas.tsx` y `DetalleVideojuego.tsx`, usar `formatearFecha` con `{ dateStyle: "medium", timeZone: "UTC" }`, idealmente como una sola función en `src/utils/formato.ts` (también resuelve parte del #11).
2. **#2** — `eliminarVideojuego` borra las partidas asociadas; el `confirm` de `DetalleVideojuego.tsx` avisa que también se borrarán sus partidas.
3. **#4** — Desempate por `createdAt` en `partida.service.ts`.
4. **#6, #8, #12, #13** — Limpieza de `.gitignore`, README, comentario de Vite, `.env.example` y texto de error.
5. **#5** — Requiere decisión: sacar el video del repo implica reescribir el historial o, como mínimo, dejar de versionarlo.
6. **#3** — Opcional: añadir pruebas (p. ej. Vitest + supertest con mongodb-memory-server) para el resumen, los 404 y el PATCH de logro.

## Verificación de las correcciones

- `npx tsc --noEmit` en `backend` y `frontend`.
- En local (`npm run dev` en ambos): registrar una partida con fecha X → la lista y el detalle muestran X.
- Crear un juego con partidas y eliminarlo → `/api/partidas` ya no las devuelve.
- Dos partidas el mismo día → el resumen toma la creada más recientemente.
