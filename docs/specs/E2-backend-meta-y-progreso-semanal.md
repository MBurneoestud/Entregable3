# Spec backend — E2: Meta y progreso semanal

Fecha: 2026-11-07 · Estado: lista para implementar
Documentos relacionados: [PRD](../prd/PRD-diario-progreso-gamer.md) · [historias y tickets](../backlog/E2-metas-y-rachas.md) · [spec frontend](E2-frontend-meta-semanal.md) · [diagnóstico](../diagnostico.md)
Tickets: E2-T01, E2-T03, E2-T04, E2-T05, E2-T06, E2-T07, E2-T08 (y la parte backend de E2-T14)

## 0. Resumen

Cada videojuego puede tener una meta semanal activa (horas y días por semana) con hasta 5 hitos de avance. Las metas anteriores se guardan archivadas. El backend calcula el progreso de la semana actual, la racha actual y la mejor racha, el estado de los hitos y el de las últimas 4 semanas completas, y lo expone en `GET /api/videojuegos/:id/progreso-semanal`.

## 1. Reglas DEBE / NO DEBE

| ID | Regla | Origen |
|---|---|---|
| B-01 | Un videojuego **DEBE** tener como máximo una meta con `activa = true`, garantizado por un índice único parcial. | RN-06 |
| B-02 | La meta **DEBE** exigir `horasSemanales` (número > 0 y ≤ 100) y `diasPorSemana` (entero 1–7). **NO DEBE** guardarse una meta fuera de esos rangos. | RN-06, S-3 |
| B-03 | Al cambiar `horasSemanales` o `diasPorSemana`, el sistema **DEBE** archivar la meta activa (`activa = false`, `vigenteHasta = ahora`) y crear una nueva (`activa = true`, `vigenteDesde = ahora`) con copia de los hitos y su `alcanzadoEn`. **NO DEBE** sobrescribir la meta activa. | RN-07, RN-12 |
| B-04 | Si se envían los mismos valores que la meta activa, **NO DEBE** crear una meta nueva (responde 200). | RN-07 |
| B-05 | La semana **DEBE** ir de lunes a domingo, con «hoy» en hora de Ecuador (`America/Guayaquil`, UTC-5 fijo, sin horario de verano). | RN-05 |
| B-06 | El día de una partida **DEBE** ser su fecha calendario `AAAA-MM-DD`, es decir, la parte UTC del `Date` guardado (el formulario envía medianoche UTC). **NO DEBE** convertirse de zona horaria. La partida **DEBE** contar entera (todos sus minutos) en ese día. | RN-03, H-3 |
| B-07 | Las partidas con día posterior a hoy **NO DEBEN** contar en ningún cálculo. | S-2 |
| B-08 | Una semana **DEBE** marcarse como cumplida solo si `horas ≥ horasSemanales` **y** `dias ≥ diasPorSemana`. `dias` **DEBE** ser el número de días distintos con al menos una partida (de cualquier duración, incluso 0 min); varias partidas el mismo día **NO DEBEN** contar como varios días. | RN-08, H-2, S-1 |
| B-09 | `porcentajeHoras` y `porcentajeDias` **DEBEN** redondearse a entero y **NO DEBEN** limitarse a 100 (7 h con una meta de 5 h → 140). | H-5 |
| B-10 | La racha **DEBE** contar los días consecutivos con partida hacia atrás desde hoy, si hoy hay partida, o desde ayer, si no. Si no hay partida ni hoy ni ayer, **DEBE** ser 0. | H-1 |
| B-11 | Cada semana **DEBE** evaluarse con la meta vigente al cierre (domingo). Para la semana en curso esa es la meta activa, aunque se haya creado a mitad de semana. | H-4 |
| B-12 | `ultimas4` **DEBE** contener las 4 semanas completas anteriores a la actual, de la más antigua a la más reciente. Una semana sin meta vigente al cierre **DEBE** tener `estado: "sin_meta"` y **NO DEBE** contar en `semanasConMeta`. | RN-09 |
| B-13 | Una meta **NO DEBE** tener más de 5 hitos. Cada hito **DEBE** tener `descripcion` (obligatoria, con `trim`) y `porcentajeObjetivo` (entero 1–100). **NO DEBE** haber dos hitos con el mismo `porcentajeObjetivo` en una meta. | RN-10, S-4 |
| B-14 | **NO DEBE** crearse un hito con `porcentajeObjetivo ≤ porcentajeAvanceActual`. Un juego sin avance cuenta como 0. | RN-11 |
| B-15 | Un hito **DEBE** estar alcanzado (`alcanzado = true`) si y solo si `porcentajeAvanceActual ≥ porcentajeObjetivo`; sin partidas o sin avance, ningún hito está alcanzado. La primera vez que se cumple, el hito **DEBE** recibir `alcanzadoEn = ahora` (al crear, editar o eliminar una partida); esa fecha **NO DEBE** borrarse ni sobrescribirse después, aunque baje el avance (es historial, no estado). | Enunciado, H-6 |
| B-16 | `porcentajeAvanceActual` **DEBE** ser el de la partida más reciente, ordenando por `fecha` desc. y luego `createdAt` desc. | RN-04, diag. #4 |
| B-17 | Eliminar un videojuego **DEBE** eliminar todas sus metas (activa y archivadas) y, con ellas, sus hitos. | H-8 |
| B-18 | Al pasar un videojuego a `completado` o `abandonado`, el sistema **DEBE** archivar su meta activa. Mientras siga en ese estado, fijar una meta **DEBE** devolver 400. Al volver a `jugando` o `pausado`, la meta archivada **NO DEBE** restaurarse. Pasar a `pausado` **NO DEBE** archivar la meta. | H-7 |
| B-19 | Los controladores **NO DEBEN** pasar `req.body` crudo a Mongoose; **DEBEN** copiar solo los campos permitidos. | diag. #10 |
| B-20 | Los errores **DEBEN** lanzarse con `ApiError` y mensajes en español (§5). Un `:id` o `:hitoId` con formato inválido **DEBE** devolver 400, y un videojuego inexistente, 404. | AGENTS.md |
| B-21 | El backend **NO DEBE** leer variables de entorno fuera de `config/env.ts`. E2 **NO DEBE** necesitar variables nuevas. | AGENTS.md |
| B-22 | `mejorRacha` **DEBE** ser la serie más larga de días consecutivos con al menos una partida en todo el historial del juego (sin contar partidas futuras, B-07). Siempre **DEBE** cumplirse `mejorRacha ≥ rachaActual`; sin partidas vale 0. | H-1 |
| B-23 | `GET /api/videojuegos/:id/progreso-semanal` **DEBE** devolver el objeto de §5 sin envoltorio. `semana`, `horasSemana`, `diasJugadosSemana`, `rachaActual`, `mejorRacha` y `ultimas4` **DEBEN** calcularse aunque no haya meta activa; sin meta, `meta`, `porcentajeHoras`, `porcentajeDias` y `cumplida` **DEBEN** ser `null` y `hitos` **DEBE** ser `[]`. `alcanzado` **DEBE** calcularse con el avance actual (B-15) y `alcanzadoEn` devolverse tal cual (o `null`). `horasSemana` **DEBE** redondearse a 1 decimal. | H-2, H-6 |
| B-24 | Un conflicto con el estado actual de la meta **DEBE** devolver 409: (a) añadir un hito con un `porcentajeObjetivo` que ya tiene otro hito de la meta activa («Ya existe un hito con porcentaje objetivo X %»); (b) una violación de un índice único (error E11000 de MongoDB, p. ej. dos `PUT /meta` simultáneos que intentan crear dos metas activas, B-01) → «Ya existe un recurso con esos datos; vuelve a intentarlo». El resto de errores de validación de un hito siguen siendo 400. | RN-10, B-01 |

## 2. Fechas — `backend/src/dominio/fechas.ts` (E2-T01)

Representación interna de un día: string `"AAAA-MM-DD"`, ordenable lexicográficamente.

| Función | Contrato |
|---|---|
| `diaCalendario(fecha: Date): string` | `fecha.toISOString().slice(0, 10)` (B-06). |
| `interpretarFecha(texto: string): Date` | `"AAAA-MM-DD"` → `Date` a las 00:00 UTC de ese día. Lanza `ApiError(400)` si el formato o la fecha no son válidos (p. ej. `2026-02-30`). |
| `hoyEcuador(ahora = new Date()): string` | `diaCalendario(new Date(ahora.getTime() - 5 * 3600 * 1000))`. También convierte instantes reales (`vigenteDesde`, `vigenteHasta`) a día de Ecuador. |
| `esFechaFutura(dia: string, hoy = hoyEcuador()): boolean` | `dia > hoy`. |
| `sumarDias(dia: string, n: number): string` | Aritmética de días en UTC. |
| `inicioSemana(dia: string): string` | Lunes de la semana de `dia`. |

**Alinear `test/dominio/fechas.test.js` (diagnóstico #17).** Hoy construye fechas en hora local del proceso y espera medianoche local. Debe pasar a:

- usar `Date.UTC(...)` o strings `AAAA-MM-DD`;
- esperar las 00:00 UTC en `interpretarFecha`;
- añadir casos de `hoyEcuador`: `2026-11-09T04:59Z` → `"2026-11-08"` y `2026-11-09T05:00Z` → `"2026-11-09"`.

## 3. Modelo — `backend/src/models/meta.model.ts` (E2-T04)

```ts
export interface IHito {
  _id: Types.ObjectId;
  descripcion: string;         // required, trim
  porcentajeObjetivo: number;  // entero 1–100
  alcanzadoEn?: Date;
}

export interface IMeta extends Document {
  videojuego: Types.ObjectId;   // ref "Videojuego", required
  horasSemanales: number;       // > 0, ≤ 100
  diasPorSemana: number;        // entero 1–7
  activa: boolean;              // default true
  vigenteDesde: Date;           // required
  vigenteHasta?: Date;          // solo en metas archivadas
  hitos: IHito[];               // máx. 5 (validador del array)
  createdAt: Date;
  updatedAt: Date;
}
```

- Los hitos **sí** tienen `_id` (a diferencia de los logros, diagnóstico #9).
- Índice único parcial `{ videojuego: 1 }` con `partialFilterExpression: { activa: true }` (B-01).
- Índice `{ videojuego: 1, vigenteDesde: 1 }` para el historial.
- Mensajes de validación en español, como en `partida.model.ts`.

### 3.1 Decisiones de modelado

- **Videojuego y Partida no cambian.** E2 solo añade la colección `metas`.
- **Meta se referencia, no se embebe en Videojuego.** La meta tiene su propio ciclo de vida: se crea, se reemplaza al cambiar sus cifras (B-03) y se desactiva al completar o abandonar el juego (B-18), todo sin tocar la ficha del juego. Además, cada cambio deja la meta anterior archivada (`activa: false`, `vigenteHasta`), y ese historial hace falta para evaluar las semanas pasadas con la meta que estaba vigente (H-4). Si la meta estuviera embebida, cada cambio reescribiría el documento del videojuego y el historial crecería dentro de él sin límite. El índice único parcial garantiza que solo haya una meta activa por juego (B-01).
- **Los hitos se embeben en la meta.** Son una lista corta y acotada (máx. 5) que solo tiene sentido dentro de su meta: no se consultan solos, se leen siempre junto con la meta y se copian con ella cuando se reemplaza (B-03). Tienen `_id` para poder eliminar uno concreto (`DELETE …/hitos/:hitoId`).
- **El estado «alcanzado» de un hito se calcula; solo se guarda la fecha de la primera vez (`alcanzadoEn`).** El enunciado fija que un hito está alcanzado cuando `porcentajeAvanceActual ≥ porcentajeObjetivo` y que, sin partidas, ninguno lo está; por eso `alcanzado` se deriva siempre del avance actual (B-16) y no se duplica en la base de datos. `alcanzadoEn` es historial (H-6): registra cuándo se alcanzó por primera vez para que la interfaz muestre «Alcanzado el 30 oct 2026», y no se borra aunque el avance baje (en ese caso el hito vuelve a «Pendiente» y, si se alcanza de nuevo, conserva la fecha original).
- **Nombres de campos:** `horasSemanales`, `diasPorSemana`, `hitos[].descripcion` y `hitos[].porcentajeObjetivo`, como en el enunciado. Se añaden `vigenteDesde` y `vigenteHasta` para el historial.

## 4. Lógica y servicio

### 4.1 Funciones puras — `backend/src/dominio/progreso.ts` (E2-T05)

| Función | Contrato |
|---|---|
| `calcularProgresoDesde(partidas, metas, ahora): Progreso` | El algoritmo de §4.3, sin acceso a la base de datos. |
| `aProgresoSemanal(progreso): ProgresoSemanal` | Convierte el `Progreso` interno en la respuesta de §5 (B-23): `horasSemana` redondeada a 1 decimal y hitos ordenados por `porcentajeObjetivo` asc. con `_id`, `alcanzado = porcentajeAvanceActual !== null && porcentajeAvanceActual ≥ porcentajeObjetivo` y `alcanzadoEn` (o `null`). |
| `hitosPorAlcanzar(hitos, avance): IHito[]` | Hitos sin `alcanzadoEn` con `porcentajeObjetivo ≤ avance` (B-15). |
| `validarNuevoHito(meta, { descripcion, porcentajeObjetivo }, avance): string \| null` | El mensaje de error de B-13/B-14, o `null` si el hito es válido. |
| `debeArchivarMeta(estado): boolean` | `true` para `completado` y `abandonado` (B-18). |

### 4.2 Servicio — `backend/src/services/meta.service.ts` (E2-T06)

Todas las funciones lanzan `ApiError(404)` si el videojuego no existe; para ello reutilizan `buscarVideojuegoPorId` de `videojuego.service.ts`.

| Función | Comportamiento |
|---|---|
| `obtenerMetaActiva(videojuegoId)` | Devuelve la meta activa o `ApiError(404, "El videojuego no tiene una meta activa")`. |
| `fijarMeta(videojuegoId, { horasSemanales, diasPorSemana })` | Juego `completado` o `abandonado` → `ApiError(400)` (B-18). Sin meta activa → la crea (`creada: true`). Mismos valores → la devuelve sin cambios (`creada: false`, B-04). Valores distintos → B-03 (`creada: true`). Devuelve `{ meta, creada }`. |
| `archivarMeta(videojuegoId, { siExiste = false } = {})` | Pone `activa = false` y `vigenteHasta = ahora`. Si no hay meta activa: 404, o no hace nada si `siExiste` es `true`. |
| `agregarHito(videojuegoId, { descripcion, porcentajeObjetivo })` | Valida con `validarNuevoHito` → `ApiError(400)`. Devuelve la meta. |
| `eliminarHito(videojuegoId, hitoId)` | 404 si no hay meta activa o si no existe el hito. Devuelve la meta. |
| `actualizarHitosAlcanzados(videojuegoId)` | Calcula `porcentajeAvanceActual` (B-16) y pone `alcanzadoEn = ahora` en `hitosPorAlcanzar`. Sin meta activa o sin avance, no hace nada. |
| `calcularProgreso(videojuegoId, ahora = new Date())` | Carga las partidas y las metas, llama a `calcularProgresoDesde` y devuelve `aProgresoSemanal(...)`. |

**Integración con partidas** (`partida.service.ts`, E2-T03 y E2-T07):

- `crearPartida`, `actualizarPartida` y `eliminarPartida` llaman a `actualizarHitosAlcanzados(videojuegoId)` después de guardar o borrar (al borrar la partida más reciente el avance puede subir). En `actualizarPartida`, si cambió `videojuego`, la llamada se hace para el nuevo. En `eliminarPartida`, si el videojuego ya no existe, no se hace nada.
- `listarPartidas`, `listarPartidasDeVideojuego` y el resumen ordenan con `{ fecha: -1, createdAt: -1 }` (B-16).

**Integración con videojuegos** (`videojuego.service.ts`, E2-T07):

- `eliminarVideojuego` ejecuta `Meta.deleteMany({ videojuego: id })` (B-17).
- `actualizarVideojuego`, si `debeArchivarMeta(cambios.estado)`, llama a `archivarMeta(id, { siExiste: true })` después de guardar (B-18).

### 4.3 Algoritmo de `calcularProgresoDesde`

```
hoy        = hoyEcuador(ahora)
ayer       = sumarDias(hoy, -1)
partidas   = partidas filtradas a diaCalendario(fecha) ≤ hoy          // B-07
porDia     = Map<dia, minutos>  agregadas por diaCalendario            // B-06, B-08
metas      = ordenadas por vigenteDesde asc.
metaActiva = la meta con activa = true (o null)
lunes      = inicioSemana(hoy)

evaluar(inicio, fin, meta):
  dias  = días de porDia en [inicio, fin]
  horas = suma de minutos en [inicio, fin] / 60
  return { inicio, fin, horas, dias: dias.length,
           porcentajeHoras: round(horas / meta.horasSemanales * 100),        // B-09
           porcentajeDias:  round(dias.length / meta.diasPorSemana * 100),   // B-09
           cumplida: horas ≥ meta.horasSemanales && dias.length ≥ meta.diasPorSemana }  // B-08

semana       = { inicio: lunes, fin: sumarDias(lunes, 6),             // B-23: siempre
                 horas: minutos de porDia en la semana / 60, dias: días de porDia en la semana }
semanaActual = metaActiva ? evaluar(lunes, sumarDias(lunes, 6), metaActiva) : null   // B-11

racha:                                                                 // B-10
  d = porDia.has(hoy) ? hoy : porDia.has(ayer) ? ayer : null
  n = 0; mientras d && porDia.has(d): n++, d = sumarDias(d, -1)

mejorRacha:                                                            // B-22
  recorrer los días de porDia en orden asc.; si un día es sumarDias(anterior, 1)
  la serie crece, si no vuelve a 1; mejorRacha = la serie más larga (0 sin partidas)

ultimas4, k = 4..1:                                                    // B-11, B-12
  inicio = sumarDias(lunes, -7k); fin = sumarDias(inicio, 6)
  meta   = la meta con hoyEcuador(vigenteDesde) ≤ fin
           y (sin vigenteHasta o hoyEcuador(vigenteHasta) > fin);
           si hay varias, la de vigenteDesde más reciente
  estado = meta ? (evaluar(...).cumplida ? "cumplida" : "no_cumplida") : "sin_meta"

semanasConMeta   = semanas de ultimas4 con estado ≠ "sin_meta"
semanasCumplidas = semanas de ultimas4 con estado = "cumplida"
```

`vigenteDesde` y `vigenteHasta` son instantes reales, así que se convierten a día con `hoyEcuador(instante)`, no con `diaCalendario`.

## 5. API (E2-T08)

Nuevo router `backend/src/routes/meta.routes.ts` con `Router({ mergeParams: true })`, montado en `app.ts` como `app.use("/api/videojuegos/:id", metaRouter)` antes de `videojuegoRouter`. El controlador `backend/src/controllers/meta.controller.ts` sigue el mismo patrón `try/catch → next(error)` que `videojuego.controller.ts`.

| Método y ruta | Cuerpo | Respuesta |
|---|---|---|
| `GET /api/videojuegos/:id/meta` | — | 200 `{ meta }` · 404 |
| `PUT /api/videojuegos/:id/meta` | `{ horasSemanales, diasPorSemana }` | 201 `{ meta }` si se creó una meta · 200 `{ meta }` si no cambió · 400 · 404 · 409 (índice único, B-24) |
| `DELETE /api/videojuegos/:id/meta` | — | 204 · 404 |
| `POST /api/videojuegos/:id/meta/hitos` | `{ descripcion, porcentajeObjetivo }` | 201 `{ meta }` · 400 · 404 · 409 (porcentaje objetivo repetido, B-24) |
| `DELETE /api/videojuegos/:id/meta/hitos/:hitoId` | — | 200 `{ meta }` · 400 · 404 |
| `GET /api/videojuegos/:id/progreso-semanal` | — | 200 con el objeto de abajo, sin envoltorio (B-23) · 400 · 404 (solo si no existe el videojuego) |

Mensajes 400, en español y exactos:

- «Las horas por semana deben ser un número mayor que 0 y como máximo 100»
- «Los días por semana deben ser un entero entre 1 y 7»
- «La descripción del hito es obligatoria»
- «El porcentaje objetivo del hito debe ser un entero entre 1 y 100»
- «Una meta admite como máximo 5 hitos»
- «El porcentaje objetivo del hito debe ser mayor que el avance actual (Y %)»
- «No se puede fijar una meta en un videojuego completado o abandonado»

Mensajes 409 (B-24):

- «Ya existe un hito con porcentaje objetivo X %»
- «Ya existe un recurso con esos datos; vuelve a intentarlo» (E11000, lo resuelve `errorHandler`)

Ejemplo de `GET /api/videojuegos/:id/progreso-semanal` (sábado 7 de noviembre de 2026):

```json
{
  "semana": { "inicio": "2026-11-02", "fin": "2026-11-08" },
  "meta": { "horasSemanales": 5, "diasPorSemana": 4 },
  "horasSemana": 3.5,
  "porcentajeHoras": 70,
  "diasJugadosSemana": 3,
  "porcentajeDias": 75,
  "cumplida": false,
  "rachaActual": 4,
  "mejorRacha": 9,
  "porcentajeAvanceActual": 62,
  "hitos": [
    { "_id": "…", "descripcion": "Llegar al 25 %", "porcentajeObjetivo": 25, "alcanzado": true, "alcanzadoEn": "2026-10-20T22:10:00.000Z" },
    { "_id": "…", "descripcion": "Llegar al 50 %", "porcentajeObjetivo": 50, "alcanzado": true, "alcanzadoEn": "2026-10-30T22:10:00.000Z" },
    { "_id": "…", "descripcion": "Terminar el juego", "porcentajeObjetivo": 100, "alcanzado": false, "alcanzadoEn": null }
  ],
  "ultimas4": [
    { "inicio": "2026-10-05", "fin": "2026-10-11", "estado": "sin_meta" },
    { "inicio": "2026-10-12", "fin": "2026-10-18", "estado": "cumplida", "horas": 7, "dias": 4, "porcentajeHoras": 140, "porcentajeDias": 100 },
    { "inicio": "2026-10-19", "fin": "2026-10-25", "estado": "no_cumplida", "horas": 2, "dias": 1, "porcentajeHoras": 40, "porcentajeDias": 25 },
    { "inicio": "2026-10-26", "fin": "2026-11-01", "estado": "cumplida", "horas": 5.5, "dias": 5, "porcentajeHoras": 110, "porcentajeDias": 125 }
  ],
  "semanasCumplidas": 2,
  "semanasConMeta": 3
}
```

| Campo | Significado |
|---|---|
| `semana` | Lunes y domingo de la semana actual, en hora de Ecuador (B-05). |
| `meta` | Cifras de la meta activa, o `null` si no hay. |
| `horasSemana`, `diasJugadosSemana` | Horas (1 decimal) y días distintos jugados esta semana; se calculan aunque no haya meta (B-08, B-23). |
| `porcentajeHoras`, `porcentajeDias` | Redondeados y sin límite de 100 (B-09); `null` sin meta. |
| `cumplida` | La semana actual ya cumple horas y días (B-08); `null` sin meta. |
| `rachaActual`, `mejorRacha` | Días seguidos actuales (B-10) y mejor serie histórica (B-22). |
| `porcentajeAvanceActual` | Avance de la partida más reciente (B-16), o `null`. |
| `hitos` | Hitos de la meta activa, por `porcentajeObjetivo` asc., con `alcanzado` (calculado: avance actual ≥ objetivo, B-15), la fecha `alcanzadoEn` de la primera vez (o `null`) que muestra la interfaz (H-6) y el `_id` para eliminarlo. |
| `ultimas4`, `semanasCumplidas`, `semanasConMeta` | Las 4 semanas completas anteriores y sus totales (B-11, B-12), para el indicador «X de N semanas». |

Los campos del ejemplo del enunciado (`semana`, `meta`, `horasSemana`, `porcentajeHoras`, `diasJugadosSemana`, `rachaActual`, `mejorRacha`, `hitos`) van con los mismos nombres. Los demás se añaden porque la interfaz los necesita (barra de días, fecha de alcance y `_id` de los hitos, e indicador de las últimas 4 semanas) y así no tiene que recalcular nada (F-03).

Sin meta activa: `meta`, `porcentajeHoras`, `porcentajeDias` y `cumplida` son `null` y `hitos` es `[]`; el resto se calcula igual.

## 6. Pruebas

Se escriben con `node:test` en `test/` y se lanzan con `cd backend && npm test`.

- `test/dominio/fechas.test.js`: alineado según §2, más `hoyEcuador`, `inicioSemana` (lunes, domingo, cruce de mes y de año) y `sumarDias`.
- `test/model/meta.test.js`: B-02 y B-13 con `validateSync()` (rangos, entero, 6 hitos, nombre vacío).
- `test/dominio/progreso.test.js`, con los casos:
  1. partida en domingo → cuenta en esa semana; partida en lunes → en la siguiente;
  2. `ahora = 2026-11-09T04:30Z` (domingo 23:30 en Ecuador) → sigue en la semana del 2 al 8 de nov.;
  3. cumple horas pero no días → no cumplida; cumple días pero no horas → no cumplida; ambas → cumplida;
  4. dos partidas el mismo día (60 + 30 min) → 1 día y 1,5 h;
  5. una partida de 120 min el día D → 2 h en D;
  6. 7 h con una meta de 5 h → `porcentajeHoras = 140` y cumplida;
  7. meta cambiada el miércoles de la semana actual → `semanaActual` usa la nueva;
  8. meta cambiada a mitad de una semana pasada → se usa la vigente al domingo;
  9. semanas anteriores a la primera meta → `sin_meta` y fuera de `semanasConMeta`;
  10. meta quitada → las semanas completas en que estuvo vigente conservan su estado;
  11. racha: partida hoy, ayer y anteayer (3); solo ayer y anteayer (2); ni hoy ni ayer (0); hueco de un día; cruce de mes (31 oct → 1 nov);
  12. partida con fecha futura → ignorada en semana y racha;
  13. `hitosPorAlcanzar`: alcanza con avance ≥ porcentaje objetivo y no sobrescribe un `alcanzadoEn` ya guardado;
  14. `validarNuevoHito` devuelve `{ status, mensaje }` o `null`: porcentaje objetivo < avance → 400; porcentaje objetivo = avance → 400; porcentaje objetivo repetido → 409 (B-24); sexto hito → 400;
  15. `debeArchivarMeta`: `completado` y `abandonado` → `true`; `jugando` y `pausado` → `false`.
  16. `mejorRacha` (B-22): sin partidas → 0; una serie pasada de 5 días y la actual de 2 → 5 y `rachaActual = 2`; la serie actual es la mejor → igual a `rachaActual`; partidas futuras no cuentan;
  17. `aProgresoSemanal` (B-23): con meta → campos del ejemplo de §5, `horasSemana` con 1 decimal (20 min → 0,3) y hitos ordenados con `alcanzado`; hito con `alcanzadoEn` pero avance actual menor → `alcanzado: false` y fecha conservada; avance = objetivo → `alcanzado: true`; sin partidas → ningún hito alcanzado; sin meta → `meta`, `porcentajeHoras`, `porcentajeDias` y `cumplida` en `null`, `hitos: []` y horas, días y rachas calculados.
- `test/middlewares/errorHandler.test.js`: `ApiError(409)` → 409; error E11000 de MongoDB → 409 con el mensaje de §5 (B-24); `CastError` → 400.
- `test/dominio/orden-partidas.test.js`: la función de orden / avance actual con dos partidas del mismo día devuelve la creada más tarde (B-16).

## 7. Criterio → verificación

**Auto** = test automatizado en `cd backend && npm test`. **Manual** = petición contra la API en local (`cd backend && npm run dev`), con `curl` o similar.

| Criterio / regla | Verificación | Tipo |
|---|---|---|
| H0-C2, B-05 | `fechas.test.js`: `hoyEcuador(2026-11-09T04:59Z) = "2026-11-08"`; `progreso.test.js` caso 2 | Auto |
| H0-C3 | `progreso.test.js` caso 1 | Auto |
| H0-C4 | `fechas.test.js`: `inicioSemana("2026-01-01") = "2025-12-29"` | Auto |
| B-06 | `fechas.test.js`: `diaCalendario` e `interpretarFecha` a 00:00 UTC; inválida → 400 | Auto |
| H1-C1 | `PUT /meta {5,3}` en un juego sin meta → 201 y `meta.activa = true` | Manual |
| H1-C2, B-03 | `PUT /meta {8,3}` → 201; `GET /progreso-semanal` muestra `meta.horasSemanales = 8`; en MongoDB la meta anterior tiene `activa: false` y `vigenteHasta` | Manual |
| H1-C3 | Con hitos, cambiar la meta → la nueva meta tiene los mismos hitos con su `alcanzadoEn` | Manual |
| H1-C4, B-04 | `PUT /meta {5,3}` repetido → 200, sin documento nuevo | Manual |
| H1-C5, B-02 | `meta.test.js` (rangos y enteros); `PUT` con 0 / 101 / 0 / 8 / 2.5 → 400 con el mensaje de §5 | Auto + Manual |
| H2-C1 | `DELETE /meta` → 204; `GET /meta` → 404; `GET /progreso-semanal` → `meta: null` | Manual |
| H2-C2 | `progreso.test.js` caso 10 | Auto |
| H2-C3 | Sin meta: `GET /progreso-semanal` → `meta`, `porcentajeHoras` y `cumplida` en `null`, `hitos: []`, y `horasSemana`, `rachaActual` y `mejorRacha` calculadas (B-23) | Manual |
| H3-C1, B-18 | `PUT /api/videojuegos/:id {estado:"completado"}` → `GET /meta` 404; `debeArchivarMeta` en `progreso.test.js` caso 15 | Auto + Manual |
| H3-C3 | En un juego abandonado, `PUT /meta` → 400 «No se puede fijar una meta en un videojuego completado o abandonado» | Manual |
| H3-C4 | Volver a `jugando` → `GET /meta` 404; `PUT /meta` → 201 | Manual |
| H3-C6 | Pasar a `pausado` → `GET /meta` sigue devolviendo 200 | Manual |
| H4-C1, B-17 | `DELETE /api/videojuegos/:id` → `Meta.countDocuments({ videojuego: id }) = 0` | Manual |
| H5-C1 | `progreso.test.js`: 2 h el lunes + 1,5 h el miércoles con meta {5,3} → 3,5 h, 70 %, 2 días, 67 %, no cumplida | Auto |
| H5-C2, B-09 | `progreso.test.js` caso 6 | Auto |
| H5-C3, B-08 | `progreso.test.js` caso 3 | Auto |
| H5-C4 | `progreso.test.js` caso 4 | Auto |
| H5-C5 | `progreso.test.js` caso 5 | Auto |
| H5-C6, B-11 | `progreso.test.js` caso 7 | Auto |
| H5-C7 | `progreso.test.js` caso 1 (domingo anterior fuera de la semana actual) | Auto |
| H6-C1 … H6-C5, B-10 | `progreso.test.js` caso 11 | Auto |
| H6-C6, B-07 | `progreso.test.js` caso 12 | Auto |
| H7-C1 | `POST /meta/hitos {"Llegar al 50 %", 50}` con avance 40 → 201, hito sin `alcanzadoEn` | Manual |
| H7-C2, H7-C3, H7-C4, B-13, B-14 | `progreso.test.js` caso 14; `meta.test.js` (6 hitos, nombre vacío); `POST` → 400 con el mensaje exacto (repetido → 409, B-24) | Auto + Manual |
| H7-C5 | `DELETE /meta/hitos/:hitoId` → 200 y el hito ya no está | Manual |
| H7-C6 | Sin meta: `POST /meta/hitos` → 404 | Manual |
| H8-C1, B-15 | `progreso.test.js` caso 13; registrar una partida con 55 % → `GET /meta` muestra `alcanzadoEn` | Auto + Manual |
| H8-C2, H8-C3 | `progreso.test.js` casos 13 y 17; registrar 45 % o borrar la partida → `alcanzado: false` y `alcanzadoEn` igual | Auto + Manual |
| H8-C4, B-16 | `orden-partidas.test.js`; `GET /resumen` y `GET /progreso-semanal` devuelven el avance de la creada más tarde | Auto + Manual |
| H9-C1, B-12 | `progreso.test.js`: 3 de 4 semanas cumplidas → `semanasCumplidas = 3`, `semanasConMeta = 4` | Auto |
| H9-C2 | `progreso.test.js` caso 9 | Auto |
| H9-C3 | `progreso.test.js` caso 8 | Auto |
| H9-C4 | `progreso.test.js`: ninguna semana de `ultimas4` tiene `inicio = lunes` actual | Auto |
| B-19 | Revisión de código: `meta.controller.ts` construye el objeto con campos explícitos; `PUT /meta` con `{"$set": …}` no altera nada | Manual |
| B-20 | `GET /api/videojuegos/abc/progreso-semanal` → 400; id válido inexistente → 404 | Manual |
| B-21 | `grep process.env backend/src` solo encuentra `config/env.ts` | Manual |
| B-22 | `progreso.test.js` caso 16 | Auto |
| B-23 | `progreso.test.js` caso 17; `GET /api/videojuegos/:id/progreso-semanal` → 200 con el objeto de §5; `GET …/progreso` → 404 | Auto + Manual |
| B-24 | `progreso.test.js` caso 14 (repetido → 409); `errorHandler.test.js` (E11000 → 409); `POST /meta/hitos` con un porcentaje objetivo repetido → 409 | Auto + Manual |

## 8. Ticket → archivos

| Ticket | Archivos (N = nuevo, M = modificado) |
|---|---|
| E2-T01 | N `backend/src/dominio/fechas.ts` · M `test/dominio/fechas.test.js` |
| E2-T03 | M `backend/src/services/partida.service.ts` · N `test/dominio/orden-partidas.test.js` |
| E2-T04 | N `backend/src/models/meta.model.ts` · N `test/model/meta.test.js` |
| E2-T05 | N `backend/src/dominio/progreso.ts` · N `test/dominio/progreso.test.js` |
| E2-T06 | N `backend/src/services/meta.service.ts` |
| E2-T07 | M `backend/src/services/videojuego.service.ts` · M `backend/src/services/partida.service.ts` |
| E2-T08 | N `backend/src/routes/meta.routes.ts` · N `backend/src/controllers/meta.controller.ts` · M `backend/src/app.ts` |
| E2-T14 (backend) | M `README.md` · M `docs/diagnostico.md` |

## 9. Fuera de alcance

- Notificaciones, recordatorios, metas compartidas, rankings y gráficos históricos.
- Endpoints para listar o editar metas archivadas.
- Rechazar partidas con fecha futura al crearlas (PRD P-1).
- Borrar las partidas de un videojuego eliminado (PRD P-2, diagnóstico #2).

## 10. Supuestos técnicos

- ST-1: Ecuador no tiene horario de verano, así que basta con un desfase fijo de −5 h, sin librería de zonas horarias.
- ST-2: el volumen de partidas por juego es pequeño (cientos), así que el progreso se calcula en memoria en cada petición, sin agregaciones ni caché.
- ST-3: las partidas existentes guardadas a medianoche UTC no necesitan migración.
