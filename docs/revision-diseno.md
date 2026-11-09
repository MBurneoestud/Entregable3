# Revisión de diseño — Sección «Meta semanal» contra DESIGN.md (E2-T19)

Fecha: 2026-11-09 · Rama: `feature/e2-metas-rachas` · Regla: [F-21 de la spec del frontend](specs/E2-frontend-meta-semanal.md#10-ampliación-2026-11-09-revisión-de-diseño-e2-t19) · Guía: [DESIGN.md](../DESIGN.md)

**Alcance.** Los archivos donde E2 cambia la interfaz:

- `frontend/src/components/MetaSemanal.tsx` (la sección completa);
- `frontend/src/pages/DetalleVideojuego.tsx` (la página que la aloja, con el aviso de borrado y la edición de partidas);
- `frontend/src/pages/FormularioPartida.tsx` (modo edición, F-18).

**Método.** El agente leyó el código y comparó cada clase y cada texto con el checklist §9 y la sección «No hacemos» §10 de `DESIGN.md`. Se apoyó en `grep` de `text-white`, `[#`, `primary-button`, `aria-hidden` y `htmlFor`.

**Resultado:** ✅ cumple · ⚠️ desviación (corregida en el commit indicado) · ℹ️ observación aceptada (se explica por qué no es una desviación).

| # | Regla de DESIGN.md | Dónde | Resultado | Corrección / comentario | Commit |
|---|---|---|---|---|---|
| 1 | §9 Envuelta en `<MarcoPagina>` | `DetalleVideojuego.tsx`, `FormularioPartida.tsx` | ✅ | — | — |
| 2 | §9 Superficies con `.panel`, sin fondos ni bordes hex nuevos | `MetaSemanal.tsx` (`section.panel`, tarjetas `border-line`) | ✅ | `grep -rn "\[#" frontend/src` → sin resultados | — |
| 3 | §9 / §10 Una sola `.primary-button` por vista | Detalle: ninguna en la sección; Formulario: dos ramas excluyentes («Añadir videojuego» solo sin juegos, «Guardar cambios» con formulario) | ✅ | Las acciones de la sección usan `.secondary-button` y `.danger-button` | — |
| 4 | §2.2 Verde = progreso | Barras `progress-track`/`progress-fill` (`signal`), insignia «Meta cumplida» (`status-badge-progress`), hito alcanzado (`text-signal`) | ✅ | — | — |
| 5 | §2.2 Neutro = datos descriptivos | Insignias «En curso», «No cumplida» y «Sin meta» con `status-badge-neutral` | ℹ️ | Se acepta: el neutro indica «aún sin progreso» sin usar el rosa, que DESIGN reserva para errores. Así no se mezclan significados de acento (§10). | — |
| 6 | §2.2 / §10 Rosa solo para errores y borrado | «Quitar meta» y «Eliminar» hito (`danger-button`), `form-error`, `error-state` | ✅ | — | — |
| 7 | §3 Tipografía: `.section-title`, `.stat-label`, `.stat-value` | Título «Meta semanal», subtítulo «Hitos» (`section-title !text-lg`), Racha, Horas y Días | ✅ | — | — |
| 8 | §2.1 Texto principal con el token `copy` (`#f1eddf`), no blanco puro | `DetalleVideojuego.tsx`: «Última partida», `dd` de «Información», logros y notas del historial usaban `text-white` | ⚠️ | `text-white` → `text-copy` (F-20 ya lo aplicó en `MetaSemanal.tsx`, pero no en la página que la aloja) | `67c3fea` |
| 9 | §2.4 Círculo decorativo del héroe `from-signal/10 to-earth/10` | `DetalleVideojuego.tsx`, héroe | ⚠️ | `to-earth/15` → `to-earth/10` | `67c3fea` |
| 10 | §7 / §10 Decoración con `aria-hidden="true"` | `.loading-dot` en `MetaSemanal.tsx`, `DetalleVideojuego.tsx` y `FormularioPartida.tsx` | ⚠️ | Se añade `aria-hidden="true"` al punto pulsante; el texto «Cargando…» sigue en `role="status"` | `67c3fea` |
| 11 | §7 / §10 Todos los campos con `<label htmlFor>` | Formulario de meta (`meta-horas`, `meta-dias`), de hitos (`hito-descripcion`, `hito-porcentaje`) y de partida | ✅ | — | — |
| 12 | §7 Objetivos táctiles ≥ 44 px | Botones de la sección (`secondary-button`/`danger-button` con `min-h-11`) | ℹ️ | «Cambiar meta», «Quitar meta» y «Eliminar» usan `!text-xs`: reduce la letra, no la altura (`min-h-11` se mantiene). Se acepta. | — |
| 13 | §9 Estados de carga, vacío y error con sus clases | `loading-state`, `empty-state` (sin meta y sin hitos), `error-state`, `form-error` | ✅ | — | — |
| 14 | Accesibilidad de las barras (F-05) | `BarraProgreso`: `role="progressbar"`, `aria-valuemin/max/now`, `aria-label` | ✅ | — | — |
| 15 | §6 Movimiento corto y `prefers-reduced-motion` | `progress-fill` con `transition-[width] duration-200`; `styles.css` desactiva animaciones con `prefers-reduced-motion` | ✅ | — | — |
| 16 | §8 Español, segunda persona, botones en infinitivo | «Elige cuántas horas…», «Aún no tienes una meta…», «Fijar meta», «Cambiar meta», «Quitar meta», «Añadir hito», «Guardar cambios» | ✅ | — | — |
| 17 | §8 / F-14 Formato coherente de porcentajes («70 %») | `DetalleVideojuego.tsx`, «Avance actual» mostraba «62%» junto a «70 %» de la sección | ⚠️ | `${n}%` → `${n} %`, como en la sección y en los hitos | `67c3fea` |
| 18 | §5 Iconografía como caracteres, sin librería | Sin iconos nuevos en la sección | ✅ | — | — |
| 19 | §9 / §10 Datos solo mediante `frontend/src/api/` | `MetaSemanal.tsx` → `metasApi.ts` | ✅ | `grep -rn "fetch(" frontend/src/pages frontend/src/components` → sin resultados | — |
| 20 | Sin librerías de UI no autorizadas | `frontend/package.json` | ✅ | Solo `react`, `react-dom` y `react-router-dom` | — |

**Resumen:** 20 reglas revisadas · 14 ✅ · 2 ℹ️ aceptadas · 4 ⚠️, corregidas en `67c3fea` (`fix(E2-T19): corregir desviaciones de DESIGN.md en Meta semanal`). Después se ejecuta `cd frontend && npm run build`.

**Fuera de alcance.** `.secondary-button` y `.site-nav-link` usan `hover:text-white` en `styles.css`. Es E1 y está documentado así en DESIGN §5 («→ blanco al hover»), así que no se toca.
