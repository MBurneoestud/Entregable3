# Guion de la demo — E2 · Metas y rachas (máximo 6 minutos)

Sigue la fase 10 del enunciado sobre la app desplegada:

- **Frontend:** https://diario-gamer-burneo.onrender.com/
- **API:** https://diario-gamer-api-burneo.onrender.com/

**Antes de grabar:**

- Abre la API (`/api/salud`) para que Render despierte el servicio; el primer arranque tarda.
- Ten preparado un juego **«Demo E2»** en estado «Jugando», sin meta, y con una partida de un día de la semana pasada (para que la racha y las 4 semanas tengan algo que mostrar).
- Ten abiertas dos pestañas: la app y una terminal con `curl`. Y en el editor: el PRD, el backlog, la spec del backend, `progreso.test.js`, `dominio/progreso.ts` y `AUDITORIA.md`.

| Tiempo | Bloque | Qué hacer y qué decir |
|---|---|---|
| 0:00–0:30 | Presentación | «El Diario ya respondía qué juego, cuánto tiempo y qué tan avanzado. E2 responde: ¿estoy cumpliendo lo que me propuse esta semana y cuántos días seguidos llevo?» Mostrar el detalle de «Demo E2» con la sección «Meta semanal» vacía, que invita a crear una meta. |
| 0:30–1:15 | **Crear una meta con hitos** | Fijar 5 h y 3 días por semana. Añadir los hitos «Llegar al 25 %» (25) y «Llegar al 50 %» (50). Señalar que aparecen como «Pendiente». |
| 1:15–2:30 | **Registrar partidas y ver el progreso y la racha** | Registrar una partida de hoy (120 min, 20 %): al volver al detalle, la barra de horas sube («2 de 5 h · 40 %»), los días pasan a «1 de 3» y la racha a «1 día seguido». Editar la partida, subirla a 180 min y ver que la barra se actualiza. Explicar la regla H-1: si mañana todavía no juego, la racha sigue viva hasta que pase un día entero sin partidas. |
| 2:30–3:15 | **Alcanzar un hito** | Registrar otra partida de hoy con avance 30 %: el hito de 25 % pasa a «Alcanzado el <hoy>». Mencionar H-6: si el avance baja, vuelve a «Pendiente», pero se conserva la fecha en que se alcanzó. |
| 3:15–4:00 | **Error 409 de meta duplicada** | En la terminal: `curl -s -X POST https://diario-gamer-api-burneo.onrender.com/api/videojuegos/<id de Demo E2>/metas -H 'Content-Type: application/json' -d '{"horasSemanales":6,"diasPorSemana":3}'` → `409 {"error":"El videojuego ya tiene una meta activa; cámbiala o desactívala antes de crear otra"}`. Recargar el detalle: la meta sigue siendo de 5 h. (Opcional: `…/videojuegos/abc/progreso-semanal` → 400.) |
| 4:00–5:30 | **Trazabilidad de punta a punta** (H-5 → 140 %) | **PRD §7.2, H-5** (140 %, sin límite) → **backlog, H5-C2** → **ticket E2-T05** en la tabla de tickets (estado y commit) → **spec backend, B-09** y su fila en «criterio → verificación» → **`test/dominio/progreso.test.js`, caso 6** → **`backend/src/dominio/progreso.ts`**, línea de `porcentajeHoras` con el comentario `// B-09` → **AUDITORIA §0.1**, fila «H5-C2, B-09» ✅. Si da tiempo, mostrar en `git log` que la spec (`6cb3b0a`) es anterior al código (`265813f`). |
| 5:30–6:00 | Cierre | Mostrar «Quitar meta» (pide confirmación y vuelve el estado vacío). Mencionar la auditoría y la bitácora del agente. |

**Después de grabar:**

- Eliminar «Demo E2» y sus partidas desde «Partidas», porque al borrar un juego sus partidas no se borran (diagnóstico #2).
- Entregar el video como archivo .mp4 en la tarea del curso. No se sube al repositorio (diagnóstico #5).
