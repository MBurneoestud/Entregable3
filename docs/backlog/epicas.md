# Backlog — Épicas

Producto: Diario de Progreso Gamer · [PRD](../prd/PRD-diario-progreso-gamer.md) · [diagnóstico](../diagnostico.md)

| Épica | Nombre | Estado | Detalle |
|---|---|---|---|
| E1 | Registro de videojuegos, partidas y logros | Terminada (Proyecto 3), en producción | Esta página y el [README](../../README.md) |
| E2 | Metas y rachas | Terminada (2026-11-08), en producción desde el 2026-11-09 (PR #3) | [E2-metas-y-rachas.md](E2-metas-y-rachas.md) |

---

## E1 — Registro de videojuegos, partidas y logros

**Objetivo.** Que la persona tenga en un solo lugar los videojuegos que juega, sus logros y cada partida, y vea en el detalle de cada juego un resumen de su progreso sin hacer cálculos a mano.

**Alcance que cubre:**

- **Videojuegos:** crear, editar y eliminar con nombre, plataforma, género y estado (jugando, pausado, completado o abandonado).
- **Catálogo:** listar los videojuegos y filtrarlos por plataforma, género y estado.
- **Detalle del videojuego:** datos, logros, historial de partidas y resumen de progreso (número de partidas, horas totales, última partida y avance actual).
- **Logros:** marcarlos como obtenidos o pendientes.
- **Partidas:** registrar una partida con fecha, duración, avance (%) y notas; listar todas las partidas con su juego; eliminarlas.
- **Experiencia:** estados de carga, error y vacío en las vistas que dependen de la API; textos en español.
- **Operación:** identificador de petición, registro de solicitudes y manejo centralizado de errores; despliegue en Render.

**Fuera de alcance:** cuentas de usuario, metas, rachas, notificaciones.

**Pendientes conocidos** (ver [diagnóstico](../diagnostico.md)):

- Las fechas se muestran un día antes (#1) y el avance actual es ambiguo con dos partidas el mismo día (#4). Se corrigen dentro de E2 porque la bloquean.
- Las partidas quedan huérfanas al borrar un juego (#2). Se difiere.

---

## E2 — Metas y rachas

**Objetivo.** Que la persona pueda fijarse una meta semanal por videojuego (horas y días por semana) y vea en el detalle del juego si la está cumpliendo y si es constante.

**Métrica de éxito.** En un mes, la persona cumple su meta semanal al menos 3 de cada 4 semanas.

**Alcance que cubre:**

- **Fechas fiables (habilitadora):** cada partida se cuenta y se muestra en el día que la persona eligió; la semana va de lunes a domingo en hora de Ecuador.
- **Meta semanal:** fijarla, cambiarla (la anterior se guarda en el historial) y quitarla; una meta activa por juego.
- **Ciclo de vida del juego:** un juego completado o abandonado no tiene meta activa; eliminar un juego elimina sus metas e hitos.
- **Progreso de la semana actual:** horas y días frente a la meta, con porcentaje real (puede superar el 100 %) y el estado «En curso» o «Meta cumplida».
- **Racha:** días seguidos jugando; sigue viva si hoy aún no se ha jugado pero ayer sí.
- **Hitos:** hasta 5 por meta; se alcanzan solos al llegar al avance objetivo y no se pierden.
- **Últimas 4 semanas:** el estado de cada semana completa anterior y el total «X de N semanas con meta cumplidas».

**Fuera de alcance:** notificaciones, recordatorios, metas compartidas, rankings, gráficos históricos y consultar o editar el historial de metas.

**Documentos:**

- Historias y tickets: [E2-metas-y-rachas.md](E2-metas-y-rachas.md)
- Spec del backend: [E2-backend-meta-y-progreso-semanal.md](../specs/E2-backend-meta-y-progreso-semanal.md)
- Spec del frontend: [E2-frontend-meta-semanal.md](../specs/E2-frontend-meta-semanal.md)
