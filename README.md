# Diario de Progreso Gamer

Aplicación web para registrar videojuegos, sus logros y las partidas jugadas. El detalle de cada videojuego presenta un resumen calculado por el backend con las horas acumuladas, el número de partidas, la fecha de la última sesión y el avance más reciente.

## Aplicación desplegada

- **Frontend:** [https://diario-gamer-burneo.onrender.com/](https://diario-gamer-burneo.onrender.com/)
- **API backend:** [https://diario-gamer-api-burneo.onrender.com/](https://diario-gamer-api-burneo.onrender.com/)
- **Estado de la API:** [https://diario-gamer-api-burneo.onrender.com/api/salud](https://diario-gamer-api-burneo.onrender.com/api/salud)

## Diseño del dominio

### Videojuego

Cada videojuego almacena su nombre, plataforma, género, estado y una lista de logros. Los logros son subdocumentos con nombre y estado de obtención:

```text
Videojuego
├── nombre: string (obligatorio)
├── plataforma: PC | PlayStation | Xbox | Switch | Movil
├── genero: accion | rol | estrategia | puzzle | deportes | otro
├── estado: jugando | pausado | completado | abandonado
├── logros: [{ nombre: string, obtenido: boolean }]
└── createdAt, updatedAt
```

`logros` se embebe porque es una lista corta y propia del videojuego: normalmente se consulta y actualiza junto con su ficha, no como una entidad independiente.

### Partida

Cada partida guarda una sesión y referencia al videojuego correspondiente:

```text
Partida
├── videojuego: ObjectId (ref: "Videojuego", obligatorio)
├── fecha: Date (obligatoria)
├── duracionMinutos: number (obligatorio, >= 0)
├── porcentajeAvance: number (0 a 100)
├── notas: string (opcional)
└── createdAt, updatedAt
```

`Partida` se referencia en vez de embeberse porque las sesiones pueden crecer indefinidamente y también se consultan por separado, por ejemplo, para listar el historial completo. El listado de partidas usa `populate("videojuego")` para incluir la ficha del juego relacionado.

### Meta

Cada meta semanal referencia a su videojuego y embebe sus hitos de avance:

```text
Meta
├── videojuego: ObjectId (ref: "Videojuego", obligatorio)
├── horasSemanales: number (obligatorio, > 0 y <= 100)
├── diasPorSemana: number (obligatorio, entero de 1 a 7)
├── activa: boolean (por defecto true; como máximo una activa por videojuego)
├── vigenteDesde: Date (obligatoria) · vigenteHasta: Date (solo en metas archivadas)
├── hitos: [{ descripcion: string, porcentajeObjetivo: number (entero 1–100), alcanzadoEn?: Date }] (máx. 5)
└── createdAt, updatedAt
```

`Meta` se referencia porque tiene su propio ciclo de vida: se crea, se reemplaza y se desactiva sin tocar la ficha del juego, y las metas anteriores se conservan como historial. Los hitos se embeben porque son una lista corta y acotada que solo tiene sentido dentro de su meta. El estado «alcanzado» no se guarda: se calcula con el avance actual del juego (decisión H-6 del PRD), para no duplicar un dato que ya está en las partidas. Lo único que se guarda es `alcanzadoEn`, la fecha de la primera vez que se alcanzó, como historial (ver [spec §3.1](docs/specs/E2-backend-meta-y-progreso-semanal.md)).

### Resumen de progreso

`GET /api/videojuegos/:id/resumen` calcula el resumen en la capa de servicio, usando las partidas de ese videojuego:

- **Cantidad de partidas:** número de sesiones asociadas al juego.
- **Horas totales:** suma de `duracionMinutos` dividida entre 60. El resultado se devuelve sin redondear.
- **Última partida:** fecha de la sesión más reciente según `fecha`.
- **Avance actual:** `porcentajeAvance` de la sesión más reciente.
- **Sin partidas:** cero partidas, cero horas y `null` para la última fecha y el avance actual.

La respuesta tiene esta forma:

```json
{
  "totalPartidas": 8,
  "horasTotales": 14.5,
  "ultimaPartida": "2026-10-02T00:00:00.000Z",
  "porcentajeAvanceActual": 67
}
```

## Tecnologías y estructura

- **Backend:** Node.js, Express, TypeScript y Mongoose.
- **Base de datos:** MongoDB Atlas; la URI se proporciona mediante `MONGODB_URI`.
- **Frontend:** React, TypeScript, Vite y React Router.
- **Configuración backend:** `backend/src/config/env.ts` lee y valida las variables de entorno; `backend/src/DBconnection.ts` se ocupa de conectar con MongoDB.
- **Backend organizado en:** `models`, `routes`, `controllers`, `services` y `middlewares`.
- **Servicios frontend:** `frontend/src/api/videojuegoApi.ts`, `frontend/src/api/partidaApi.ts` y `frontend/src/api/metasApi.ts`; las páginas consumen estos módulos en lugar de llamar a `fetch` directamente.

## Funcionalidades

- Listar videojuegos y filtrarlos por plataforma, género y estado.
- Consultar el detalle de un videojuego, sus logros, partidas y resumen calculado.
- Crear, editar y eliminar videojuegos.
- Marcar logros como obtenidos o pendientes.
- Listar y filtrar partidas, ver su videojuego relacionado, editarlas y eliminarlas (también desde el historial del detalle).
- Registrar una partida con fecha, duración, avance y notas.
- Fijar, cambiar y quitar una meta semanal por videojuego, con progreso de la semana, racha, hitos y últimas 4 semanas (ver [Meta semanal](#meta-semanal)).
- Mostrar estados de carga, error y contenido vacío en las vistas que dependen de la API.
- Incluir un identificador de petición, registrar solicitudes y centralizar el manejo de errores HTTP.

### Meta semanal

El detalle de cada videojuego incluye la sección «Meta semanal», entre «Resumen de actividad» e «Información» (componente `frontend/src/components/MetaSemanal.tsx`). Todos sus datos salen de `GET /api/videojuegos/:id/progreso-semanal`; la interfaz no recalcula nada.

- **Sin meta:** se muestra el formulario de horas (más de 0 y hasta 100) y días por semana (1–7) con el botón «Fijar meta».
- **Con meta:** «Meta: 5 h y 4 días por semana», dos barras de progreso («3,5 de 5 h · 70 %»; la barra nunca pasa del 100 %, el texto sí muestra el porcentaje real) y la insignia «Meta cumplida» o «En curso».
- **Cambiar meta:** abre el formulario con los valores actuales y avisa que la meta actual quedará archivada. **Quitar meta** pide confirmación.
- **Racha y últimas 4 semanas:** siempre visibles, también sin meta o en juegos completados o abandonados.
- **Hitos:** hasta 5 por meta, con descripción y porcentaje objetivo; se ven como «Pendiente», «Alcanzado» o «Alcanzado el 30 oct 2026». Eliminar un hito pide confirmación.
- En juegos **completados o abandonados** el formulario de meta aparece deshabilitado.
- Al eliminar un videojuego también se borran su meta semanal y sus hitos; la confirmación lo avisa.
- **Refresco del progreso:** al registrar o editar una partida desde el detalle se vuelve a él y la sección se recarga; al eliminar una partida desde el historial del detalle, el resumen y la meta semanal se actualizan sin recargar la página.

**Fechas:** las fechas de partida (`AAAA-MM-DD` guardadas a medianoche UTC) se formatean en UTC con `formatearFecha` (`frontend/src/utils/formato.ts`), para que no se vean un día antes en zonas horarias negativas como Ecuador. Las fechas en que se alcanza un hito son instantes reales y se muestran en hora de Ecuador (`America/Guayaquil`).

## API REST

Las rutas usan el prefijo `/api`.

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/salud` | Comprueba el estado de la API. |
| `GET` | `/api/videojuegos` | Lista videojuegos; acepta filtros opcionales `plataforma`, `genero` y `estado`. |
| `GET` | `/api/videojuegos/:id` | Obtiene un videojuego por ID. |
| `POST` | `/api/videojuegos` | Crea un videojuego. |
| `PUT` | `/api/videojuegos/:id` | Actualiza un videojuego. |
| `PATCH` | `/api/videojuegos/:id/logros/:indiceLogro` | Actualiza si un logro fue obtenido, mediante `{ "obtenido": true }`. |
| `DELETE` | `/api/videojuegos/:id` | Elimina un videojuego. |
| `GET` | `/api/videojuegos/:id/partidas` | Lista las partidas de un videojuego. |
| `GET` | `/api/videojuegos/:id/resumen` | Calcula el resumen de progreso del videojuego. |
| `GET` | `/api/partidas` | Lista todas las partidas con el videojuego poblado; acepta `videojuegoId` opcional. |
| `GET` | `/api/partidas/:id` | Obtiene una partida por ID con el videojuego poblado. |
| `POST` | `/api/partidas` | Registra una partida; valida que el videojuego exista. |
| `PUT` | `/api/partidas/:id` | Actualiza una partida. |
| `DELETE` | `/api/partidas/:id` | Elimina una partida. |
| `GET` | `/api/videojuegos/:id/meta` | Obtiene la meta semanal activa (`{ meta }`); 404 si no hay. |
| `PUT` | `/api/videojuegos/:id/meta` | Fija la meta con `{ "horasSemanales": 5, "diasPorSemana": 3 }`. 201 si crea una meta (la anterior queda archivada con sus hitos copiados), 200 si los valores no cambian. 400 en juegos completados o abandonados. |
| `DELETE` | `/api/videojuegos/:id/meta` | Quita (archiva) la meta activa; 204. |
| `POST` | `/api/videojuegos/:id/meta/hitos` | Añade un hito con `{ "descripcion": "Llegar al 50 %", "porcentajeObjetivo": 50 }` (máx. 5, porcentaje objetivo entero 1–100, mayor que el avance actual); 201 · 409 si el porcentaje objetivo ya existe. |
| `DELETE` | `/api/videojuegos/:id/meta/hitos/:hitoId` | Elimina un hito de la meta activa; 200 con la meta. |
| `GET` | `/api/videojuegos/:id/progreso-semanal` | Progreso de la semana actual (lunes a domingo, hora de Ecuador): horas y días jugados frente a la meta, racha actual y mejor racha, hitos con su estado `alcanzado`, avance actual y estado de las últimas 4 semanas completas. Estructura completa en la [spec §5](docs/specs/E2-backend-meta-y-progreso-semanal.md). |
| `POST` | `/api/videojuegos/:id/metas` | Crea la meta activa con `{ "horasSemanales": 5, "diasPorSemana": 3 }`; 201 · 409 si el juego ya tiene una meta activa (no la modifica). |
| `GET` | `/api/videojuegos/:id/metas` | Historial de metas del juego (`{ metas }`), activa y archivadas, la más reciente primero. |
| `GET` | `/api/metas/:metaId` | Una meta por id, activa o archivada; 400 si el id no es válido, 404 si no existe. |
| `PATCH` | `/api/metas/:metaId` | Actualiza parcialmente la meta activa (`horasSemanales` y/o `diasPorSemana`); 201 si crea una nueva y archiva la anterior, 200 si no cambia · 409 si la meta está desactivada. |
| `PATCH` | `/api/metas/:metaId/desactivar` | Desactiva la meta sin borrarla; 200 con la meta · 409 si ya estaba desactivada. |

Las rutas `/meta` son las que usa la interfaz (la meta activa del juego); las rutas `/metas` y `/api/metas/:metaId` son el CRUD del recurso Meta. Ver «Por qué conviven» en la [spec §5](docs/specs/E2-backend-meta-y-progreso-semanal.md).

### Códigos de error

- **400:** errores de validación de esquema o identificadores con formato inválido.
- **404:** recurso inexistente o videojuego referenciado que no existe.
- **409:** conflicto con el estado actual: segunda meta activa para el mismo juego, modificar o desactivar una meta ya desactivada, hito con un porcentaje objetivo que ya existe en la meta, o violación de un índice único (p. ej. dos `PUT /meta` simultáneos).
- **500:** error inesperado del servidor.

Los errores incluyen el `requestId` de la solicitud. El middleware centralizado está en `backend/src/middlewares/errorHandler.ts`.

## Ejecución local

Se requiere Node.js y una base de datos MongoDB Atlas accesible desde el entorno local.

### Backend

En PowerShell, desde la raíz del repositorio:

```powershell
Copy-Item backend/.env.example backend/.env
```

Completa `backend/.env` con la URI real de Atlas y el nombre de la base de datos. No publiques ese archivo ni incluyas credenciales en el código:

```dotenv
MONGODB_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/
MONGODB_DB=progreso_juegos
PORT=3000
```

Instala las dependencias e inicia el servidor:

```powershell
cd backend
npm install
npm run dev
```

La API queda disponible en `http://localhost:3000`; su comprobación de salud está en `http://localhost:3000/api/salud`.

### Tests

Los tests viven en `test/` (raíz del repositorio), usan `node:test` y se lanzan desde `backend/`. Incluyen las utilidades de formato del frontend (`test/frontend/formato.test.js`). No necesitan conexión a MongoDB:

```powershell
cd backend
npm test
```

### Frontend

En otra terminal:

```powershell
Copy-Item frontend/.env.example frontend/.env
cd frontend
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`. El ejemplo de Vite configura un proxy local para `/api` hacia `http://localhost:3000`.

Para compilar cada servicio:

```powershell
cd backend
npm run build

cd ../frontend
npm run build
```

## Despliegue en Render

El frontend y el backend se despliegan como servicios separados. Configura las variables y comandos en Render; no guardes credenciales de Atlas en el repositorio.

- **Backend (Web Service):** raíz `backend`; instala con `npm install`, compila con `npm run build` e inicia con `npm start`. Configura `MONGODB_URI`, `MONGODB_DB` y la variable `PORT` proporcionada por Render.
- **Frontend (Static Site):** raíz `frontend`; compila con `npm install && npm run build` y publica el directorio `dist`. Define `VITE_API_URL` con la URL HTTPS pública del servicio backend, sin añadir `/api`.
- **CORS:** el backend habilita CORS para las solicitudes del frontend.

Las URLs públicas actuales están al inicio de este documento. Los valores privados del panel de Render no se almacenan en Git.

## Cómo trabajamos con el agente

La épica E2 se construyó con un agente de IA (Claude Code) dentro de un *harness* preparado para este repositorio, siguiendo Spec-Driven Development: ninguna funcionalidad se implementa sin una spec en `docs/specs/`.

### Harness

| Pieza | Archivo | Para qué sirve |
|---|---|---|
| Memoria del proyecto | [`AGENTS.md`](AGENTS.md) | Proyecto, stack, estructura, comandos, convenciones y reglas: nunca leer ni modificar `.env`, nada sin spec, `npm test` antes de terminar. |
| Punto de entrada | [`CLAUDE.md`](CLAUDE.md) | Una sola línea, `@AGENTS.md`. |
| Skill | [`.claude/skills/commit/SKILL.md`](.claude/skills/commit/SKILL.md) | `/commit`: commit en Conventional Commits y en español a partir de lo que está en staging. Lleva `disable-model-invocation: true`: el agente no puede hacer commits por su cuenta. |
| Hook `PostToolUse` | [`.claude/hooks/formatear.js`](.claude/hooks/formatear.js) | Formatea con Prettier cada archivo `.ts`, `.tsx`, `.js`, `.json` o `.css` que el agente crea o edita. |
| Hook `PreToolUse` | [`.claude/hooks/proteger-env.js`](.claude/hooks/proteger-env.js) | Bloquea con código 2 cualquier lectura o edición de `.env` o `.env.*` (salvo `.env.example`). |
| Sistema de diseño | [`DESIGN.md`](DESIGN.md) | Colores, tipografía, espaciado, componentes, tono, accesibilidad y «No hacemos». Los estilos salen de `tailwind.config.js` y `styles.css`. |

Los hooks están registrados en [`.claude/settings.json`](.claude/settings.json); la captura [`Evidencia_Hooks.png`](Evidencia_Hooks.png) y [AUDITORIA §5](docs/AUDITORIA.md#5-los-hooks-de-claude-code-funcionan) muestran que funcionan.

### Flujo seguido

```
diagnóstico → harness → PRD → épicas → historias → criterios → tickets → specs → código con tests → auditoría
```

1. **Diagnóstico** (plan mode): el agente leyó el código, el README, los tests y el video del Proyecto 3. La persona decidió qué bloqueaba E2 y qué se difería.
2. **Harness:** `AGENTS.md`, `CLAUDE.md`, la skill, los hooks y `DESIGN.md`.
3. **PRD y épicas** (plan mode): la ficha de hechos se pegó tal cual. El agente buscó los huecos y la persona tomó cada decisión de producto.
4. **Backlog:** historias «Como / quiero / para», criterios DADO / CUANDO / ENTONCES y tickets con tipo, Definition of Done y dependencias.
5. **Specs** de backend y frontend, con reglas DEBE / NO DEBE, criterio → verificación y ticket → archivos, commiteadas antes del código.
6. **Backend por tickets** (plan mode): funciones puras de dominio con tests y pruebas con curl (sin partidas, racha rota, 400, 404 y 409).
7. **Frontend** según la spec y `DESIGN.md`, con revisión de diseño.
8. **Deuda técnica** pagada con el ciclo criterio → test → código → verificación.
9. **Auditoría**, despliegue en Render y pull request.

Cada commit lo confirma la persona (skill `/commit` o confirmación expresa); el agente no hace commits por su cuenta.

### Dónde está cada documento

| Documento | Ruta |
|---|---|
| Diagnóstico del Proyecto 3 | [`docs/diagnostico.md`](docs/diagnostico.md) |
| PRD (con los 8 huecos resueltos) | [`docs/prd/PRD-diario-progreso-gamer.md`](docs/prd/PRD-diario-progreso-gamer.md) |
| Épicas E1 y E2 | [`docs/backlog/epicas.md`](docs/backlog/epicas.md) |
| Historias, criterios, tickets y deuda técnica de E2 | [`docs/backlog/E2-metas-y-rachas.md`](docs/backlog/E2-metas-y-rachas.md) |
| Spec del backend (Meta y progreso semanal) | [`docs/specs/E2-backend-meta-y-progreso-semanal.md`](docs/specs/E2-backend-meta-y-progreso-semanal.md) |
| Spec del frontend (sección «Meta semanal») | [`docs/specs/E2-frontend-meta-semanal.md`](docs/specs/E2-frontend-meta-semanal.md) |
| Auditoría por criterio, pruebas con curl, despliegue y trazabilidad | [`docs/AUDITORIA.md`](docs/AUDITORIA.md) |
| Revisión de diseño contra `DESIGN.md` | [`docs/revision-diseno.md`](docs/revision-diseno.md) |
| Bitácora del trabajo con el agente | [`docs/bitacora-agente.md`](docs/bitacora-agente.md) |
| Guion de la demo | [`docs/guion-demo.md`](docs/guion-demo.md) |

### Ejemplo de trazabilidad de punta a punta

La decisión «una meta superada muestra el porcentaje real» recorre toda la cadena:

| Paso | Dónde |
|---|---|
| PRD | Hueco **H-5**: 7 h con una meta de 5 h → 140 %, sin límite ([PRD §7.2](docs/prd/PRD-diario-progreso-gamer.md)) |
| Historia y criterio | **E2-H5**, criterio **H5-C2**: «7 de 5 h · 140 %», la barra llena sin salirse y «Meta cumplida» ([backlog](docs/backlog/E2-metas-y-rachas.md)) |
| Ticket | **E2-T05** (cálculo puro) y **E2-T10** (barra en la interfaz) |
| Spec | **B-09** (backend) y **F-05** (frontend) |
| Test | `test/dominio/progreso.test.js`, «caso 6: 7 h con una meta de 5 h → 140 % y cumplida»; `test/frontend/formato.test.js` (`anchoBarra(140)` → 100) |
| Código | `backend/src/dominio/progreso.ts` (`porcentajeHoras` sin límite, B-09) y `frontend/src/utils/formato.ts` (`anchoBarra`) |
| Auditoría | Filas «H5-C2, B-09» y «H5-C2, F-05» de [AUDITORIA §0](docs/AUDITORIA.md#0-auditoría-por-criterio) |

### Demo

El guion está en [`docs/guion-demo.md`](docs/guion-demo.md). El video de la demo de E2 (`Demo-E2-metas-rachas.mp4`) se entrega como archivo .mp4 en la tarea del curso; no se versiona en el repositorio (diagnóstico #5).
