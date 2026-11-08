# DESIGN.md — Identidad visual de Diario Gamer

Guía de la identidad visual del frontend (`frontend/`). Describe lo que **ya existe** en
[`frontend/tailwind.config.js`](frontend/tailwind.config.js) y
[`frontend/src/styles.css`](frontend/src/styles.css); cualquier pantalla nueva debe
reutilizar estos tokens y clases en lugar de introducir valores sueltos.

---

## 1. Concepto

**"Diario de juego nocturno"**: una interfaz oscura, cálida y sobria, más cercana a un
cuaderno de bitácora que a un panel gamer estridente.

- **Oscuro por defecto** (`color-scheme: dark`). No hay modo claro.
- **Dos acentos con significado**: verde lima (*progreso*) y ámbar tierra (*sesión / partida*).
- **Contraste editorial**: titulares con serif clásica + texto de interfaz en sans humanista.
- **Brillos suaves** en lugar de neones: halos difusos, sombras amplias y bordes finos.
- **Tono**: tranquilo, ordenado, personal. Textos siempre en español.

---

## 2. Color

### 2.1 Paleta base

| Token Tailwind | Variable CSS             | Hex       | Uso                                              |
| -------------- | ------------------------ | --------- | ------------------------------------------------ |
| `night`        | `--color-canvas`         | `#111315` | Fondo de la página y cabecera                    |
| `surface`      | `--color-surface`        | `#191b1a` | Fondo de paneles (`.panel`)                      |
| —              | `--color-surface-raised` | `#20221f` | Superficies elevadas                             |
| `field`        | `--color-field`          | `#141615` | Fondo de campos de formulario (`.field`)         |
| `line`         | `--color-border`         | `#30322d` | Bordes, separadores, filas de tabla              |
| `copy`         | `--color-copy`           | `#f1eddf` | Texto principal y titulares (blanco hueso)       |
| `mist`         | `--color-muted`          | `#a5a59b` | Texto secundario, descripciones, etiquetas       |
| `signal`       | `--color-progress`       | `#c8d96a` | Acento primario: progreso, acciones, foco        |
| `earth`        | `--color-session`        | `#d99a5b` | Acento secundario: partidas, sesiones, género    |
| `earth-light`  | —                        | `#e8b77f` | Texto sobre fondos `earth` translúcidos          |
| `signal-light` | —                        | `#d5e783` | Estado *hover* del botón primario                |
| `signal-ink`   | —                        | `#202316` | Texto oscuro sobre el botón primario `signal`    |

Colores de apoyo de Tailwind usados de forma consistente:

- `stone-200 / 300 / 400 / 600` — textos de etiquetas, navegación y placeholders.
- `rose-200 / rose-400` — errores y acciones destructivas (siempre translúcido, nunca sólido).

### 2.2 Significado de los acentos

| Acento   | Representa                                    | Ejemplos                                                         |
| -------- | --------------------------------------------- | ---------------------------------------------------------------- |
| `signal` | Progreso, estado del juego, acción principal  | `.primary-button`, `.eyebrow`, `.status-badge-progress`, foco, selección, `.loading-dot` |
| `earth`  | Partidas / sesiones, género del videojuego    | `.icon-tile-session`, `.status-badge-session`                    |
| Neutro   | Datos descriptivos (plataforma)               | `.status-badge-neutral`                                          |
| `rose`   | Error o eliminación                           | `.form-error`, `.error-state`, `.danger-button`                  |

### 2.3 Reglas de uso

- Los acentos se aplican **translúcidos** sobre fondos oscuros: bordes al `20–40 %`,
  rellenos al `6–15 %` (p. ej. `border-signal/20 bg-signal/[0.08]`).
- `signal` sólido se reserva para el **botón primario** y los marcadores pequeños
  (`.activity-marker`, `.loading-dot`).
- No introducir nuevos tonos: si hace falta un color, derivarlo de los tokens con opacidad.

### 2.4 Fondo atmosférico

El `body` combina el lienzo `night` con dos degradados radiales muy tenues
(verde arriba a la izquierda, ámbar a la derecha). `MarcoPagina` añade dos halos
desenfocados (`blur-3xl`) con `signal/[0.045]` y `earth/[0.07]`. Los héroes de página
incluyen un círculo decorativo `from-signal/10 to-earth/10`. Todos llevan
`aria-hidden="true"` y `pointer-events-none`.

---

## 3. Tipografía

| Familia   | Clase          | Pila                                          | Uso                               |
| --------- | -------------- | --------------------------------------------- | --------------------------------- |
| Sans      | `font-sans`    | `"Avenir Next", "Segoe UI", sans-serif`       | Interfaz, cuerpo, botones, tablas |
| Display   | `font-display` | `"Iowan Old Style", Georgia, serif`           | `h1`–`h3`, valores de estadísticas |
| Mono      | `font-mono`    | `"SFMono-Regular", Consolas, monospace`       | Datos técnicos (IDs, códigos)     |

Se usan fuentes del sistema (sin web fonts). `h1`, `h2` y `h3` usan `font-display` y
`text-wrap: balance` automáticamente.

### Escala tipográfica

| Clase               | Estilo                                                                 |
| ------------------- | ---------------------------------------------------------------------- |
| `.page-title`       | Display, `text-3xl` → `sm:text-5xl`, bold, tracking `-0.04em`, `#f1eddf` |
| `.form-title`       | Display, `text-3xl`, bold, tracking `-0.04em`                          |
| `.section-title`    | Display, `text-xl`, bold, tracking ajustado                            |
| `.stat-value`       | Display, `text-3xl`, bold                                              |
| `.page-description` | `text-sm` → `sm:text-base`, `leading-6`, `mist`, máx. `max-w-2xl`      |
| `.form-description` | `text-sm`, `leading-6`, `mist`                                         |
| `.eyebrow`          | `text-xs`, bold, MAYÚSCULAS, tracking `0.18em`, `signal`               |
| `.stat-label`       | `text-xs`, semibold, MAYÚSCULAS, tracking `0.12em`, `mist`             |
| `.table-heading`    | `0.68rem`, bold, MAYÚSCULAS, tracking `0.14em`, `mist`                 |
| `.field-label`      | `text-sm`, semibold, `stone-200`                                       |

Patrón de cabecera de página: **icon-tile → eyebrow (opcional) → title → description**.

---

## 4. Forma, espacio y profundidad

### Radios

| Elemento                                | Radio          |
| --------------------------------------- | -------------- |
| Paneles, héroes, logotipo               | `rounded-2xl`  |
| Botones, campos, icon-tiles, avisos     | `rounded-xl`   |
| Badges, links de navegación, CTA de cabecera | `rounded-full` |

### Sombras

- `.panel`: `0 18px 60px rgba(0,0,0,0.14)` — profundidad amplia y suave.
- `shadow-glow`: `0 0 28px rgba(200,217,106,0.12)` — halo verde para hover del botón
  primario y el logotipo.
- Marcadores (`.activity-marker`, `.loading-dot`): brillo `rgba(200,217,106,0.55)`.

### Layout

- Contenedor principal: `max-w-7xl`, `px-5 sm:px-8`, `py-10 sm:py-14`.
- Separación vertical entre secciones: `space-y-8`.
- Héroes: `p-7 sm:p-10`; contenido de texto limitado a `max-w-3xl`.
- Rejillas: filtros en `sm:grid-cols-3`; estadísticas en `grid-cols-2 lg:grid-cols-4`.
- Ancho mínimo soportado: `320px`. Las tablas usan `min-w-[760px]` dentro de un
  contenedor con scroll horizontal.

---

## 5. Componentes

Todas las clases viven en `@layer components` de `styles.css`.

### Estructura
- **`.app-header`** — cabecera fija visualmente: `bg-night/75`, `backdrop-blur-xl`, borde
  inferior `white/[0.07]`.
- **`.brand-mark`** — logotipo: cuadro `11×11` con degradado `signal → earth`, emoji 🎮,
  borde que se intensifica al hover.
- **`.site-nav-link`** — enlace de navegación tipo píldora, `stone-300` → blanco al hover.
- **`.panel`** — contenedor base de toda superficie.
- **`.page-hero`** — `.panel` con `overflow-hidden` para alojar decoración.
- **`.form-header`** — cabecera de formulario con degradado horizontal `signal → earth`.

### Iconografía
- **`.icon-tile`** (verde) / **`.icon-tile-session`** (ámbar) / **`.form-icon-tile`** (pequeño).
- Iconos como caracteres, siempre con `aria-hidden="true"`:
  - 🎮 videojuegos / marca · ◷ partidas · ＋ añadir · ← volver.
- No se usa librería de iconos; mantener este enfoque minimalista.

### Botones
| Clase               | Aspecto                                                       | Uso                        |
| ------------------- | ------------------------------------------------------------- | -------------------------- |
| `.primary-button`   | Relleno `signal`, texto `#202316`, se eleva `-0.5` y brilla al hover | Acción principal (1 por vista) |
| `.secondary-button` | Fondo `white/[0.025]`, borde `line`, texto `stone-200`        | Acciones alternativas, editar |
| `.danger-button`    | Rosa translúcido                                              | Eliminar                   |
| `.back-link`        | Texto `stone-400` → `signal` al hover, con ←                  | Volver                     |

Altura mínima `min-h-11` (44 px) para objetivos táctiles; estados `disabled` con
`opacity-60` y `cursor-not-allowed` (o `cursor-wait` mientras se procesa).

### Formularios
- **`.field`** — inputs, selects y textareas: fondo `#141615`, borde `line`,
  hover `stone-600`, foco `signal/70` + `ring-signal/10`.
- **`.checkbox-control`** — `accent-signal` (marcar logros).
- **`.form-error`** — aviso rosa translúcido dentro del formulario.

### Datos y estados
- **`.status-badge`** + variante:
  - `-progress` (verde) → estado del videojuego (Jugando, En pausa, Completado, Abandonado).
  - `-session` (ámbar) → género.
  - `-neutral` (gris) → plataforma.
- **`.stat-label` / `.stat-value`** — tarjetas de resumen.
- **`.activity-marker`** — punto verde brillante para listas de actividad.
- **`.table-heading`** — cabeceras de tabla.
- **`.empty-state`** — borde discontinuo, texto centrado `mist`.
- **`.loading-state` + `.loading-dot`** — panel con punto verde pulsante.
- **`.error-state`** — panel con borde y texto rosa.

---

## 6. Interacción y movimiento

- Transiciones cortas (`duration-200`) en color, borde y posición.
- Botones: elevación sutil `hover:-translate-y-0.5`.
- Foco visible global: `outline 2px signal` con `offset 3px`.
- Selección de texto: fondo `signal` al 28 %.
- Animación de carga: `animate-pulse` en `.loading-dot`.
- `scroll-behavior: smooth`.
- **`prefers-reduced-motion: reduce`** desactiva animaciones, transiciones y scroll suave.

---

## 7. Accesibilidad

- `lang="es"` en el documento.
- Elementos decorativos (halos, emojis, flechas) con `aria-hidden="true"`.
- Navegación con `aria-label="Navegación principal"`; secciones de filtros con `aria-label`.
- Todos los campos tienen `<label htmlFor>` asociado (`.field-label`).
- Tablas con `<th scope="col">`.
- Contraste: texto principal `#f1eddf` y secundario `#a5a59b` sobre `#111315`/`#191b1a`.
- Objetivos táctiles de al menos 44 px en botones.

---

## 8. Voz y contenido

- Español, tono cercano y en segunda persona ("Organiza tu biblioteca…").
- Títulos posesivos y personales: "Mi colección de videojuegos".
- Botones con verbo en infinitivo: "Añadir videojuego", "Ver todas las partidas", "Editar".
- Etiquetas de dominio legibles: `Movil` → "Móvil", `accion` → "Acción", `pausado` → "En pausa".

---

## 9. Checklist para nuevas pantallas

- [ ] Envuelta en `<MarcoPagina>`.
- [ ] Cabecera con `.page-hero` (o `.form-header` en formularios) + `.icon-tile` + `.page-title`.
- [ ] Superficies con `.panel`; sin fondos ni bordes hex nuevos.
- [ ] Una sola `.primary-button` por vista; resto `.secondary-button`.
- [ ] Verde para progreso, ámbar para partidas/sesiones, rosa solo para errores/borrado.
- [ ] Estados de carga, vacío y error con `.loading-state`, `.empty-state`, `.error-state`.
- [ ] Decoración con `aria-hidden="true"`; campos con `<label>`.
- [ ] Textos en español.
- [ ] Datos obtenidos mediante `frontend/src/api/`, nunca con `fetch` en la página.

---

## 10. No hacemos

- No añadimos colores hex sueltos: solo los tokens de `tailwind.config.js` y `styles.css`.
- No ponemos más de una `.primary-button` por vista.
- No usamos el rosa en sólido ni fuera de errores y acciones destructivas.
- No mezclamos significados de acento: verde = progreso, ámbar = partidas/sesiones.
- No instalamos librerías de iconos ni usamos imágenes decorativas pesadas.
- No dejamos decoración sin `aria-hidden="true"` ni campos sin `<label>`.
- No usamos animaciones largas ni ignoramos `prefers-reduced-motion`.
- No llamamos a `fetch` desde las páginas: siempre a través de `frontend/src/api/`.
- No escribimos textos de interfaz en inglés ni en tono impersonal.
