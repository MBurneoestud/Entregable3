# E2 · Metas y rachas — Historias y tickets

Épica: [E2](epicas.md#e2--metas-y-rachas) · [PRD](../prd/PRD-diario-progreso-gamer.md) · Specs: [backend](../specs/E2-backend-meta-y-progreso-semanal.md) · [frontend](../specs/E2-frontend-meta-semanal.md)

Los criterios están numerados (`H5-C2` = historia H5, criterio 2). Las specs los usan en su tabla «criterio → verificación».

## Resumen de historias

| Historia | Título | Huecos del PRD | Tickets |
|---|---|---|---|
| E2-H0 | Ver cada partida en el día que elegí (habilitadora) | H-3 | T01, T02 |
| E2-H1 | Fijar o cambiar la meta semanal | H-4 | T04, T06, T08, T09, T10 |
| E2-H2 | Quitar la meta semanal | — | T06, T08, T10 |
| E2-H3 | Meta según el estado del juego | H-7 | T06, T07, T10 |
| E2-H4 | Eliminar un videojuego con meta | H-8 | T07, T13 |
| E2-H5 | Ver el progreso de la semana actual | H-2, H-3, H-4, H-5 | T05, T08, T10 |
| E2-H6 | Ver la racha | H-1 | T05, T08, T11 |
| E2-H7 | Gestionar los hitos | — | T04, T05, T06, T08, T12 |
| E2-H8 | Alcanzar hitos automáticamente | H-6 | T03, T05, T06, T07, T12 |
| E2-H9 | Ver las últimas 4 semanas | H-4 | T05, T08, T11 |

**Revisión INVEST:**

- **Independiente:** todas dependen solo de E2-H0 y, para tener datos, de E2-H1. Por lo demás pueden entregarse en cualquier orden; las dependencias técnicas están en los tickets.
- **Negociable:** describen el resultado, no la implementación.
- **Valiosa:** cada historia aporta algo visible a la persona usuaria.
- **Estimable:** cada historia se descompone en tickets concretos.
- **Pequeña:** cada historia cabe en uno a tres días de trabajo. Fijar y quitar la meta, el estado del juego y el borrado están separados por ese motivo.
- **Testeable:** los criterios son ejemplos concretos y comprobables.

---

## Historias

### E2-H0 (habilitadora) — Ver cada partida en el día que elegí

**Como** persona usuaria **quiero** que cada partida se muestre y se cuente en el día que elegí al registrarla **para** que mi semana y mi racha sean correctas.

- **H0-C1** · **DADO** que registro una partida con fecha 21/10/2026 **CUANDO** veo la lista de partidas o el detalle del juego **ENTONCES** la partida aparece con fecha «21 oct 2026».
- **H0-C2** · **DADO** que son las 23:30 del domingo en Ecuador **CUANDO** miro el progreso de la semana **ENTONCES** todavía cuenta como domingo de la semana actual.
- **H0-C3** · **DADO** una partida registrada un domingo **CUANDO** miro a qué semana pertenece **ENTONCES** pertenece a la semana que termina ese domingo, no a la siguiente.
- **H0-C4** · **DADO** una partida del jueves 1 de enero de 2026 **CUANDO** miro a qué semana pertenece **ENTONCES** pertenece a la semana del lunes 29 de diciembre de 2025 al domingo 4 de enero de 2026.

### E2-H1 — Fijar o cambiar la meta semanal

**Como** persona usuaria **quiero** fijar cuántas horas y cuántos días por semana quiero jugar a un videojuego **para** tener un objetivo claro.

- **H1-C1** · **DADO** un juego sin meta **CUANDO** fijo 5 horas y 3 días por semana **ENTONCES** el detalle del juego muestra esa meta.
- **H1-C2** · **DADO** un juego con meta de 5 h y 3 días **CUANDO** la cambio a 8 h y 3 días **ENTONCES** se muestra la nueva meta, y las semanas pasadas se siguen evaluando con la meta de 5 h.
- **H1-C3** · **DADO** una meta con hitos **CUANDO** cambio la meta **ENTONCES** la nueva meta conserva los mismos hitos, con su estado y su fecha de alcance.
- **H1-C4** · **DADO** un juego con meta de 5 h y 3 días **CUANDO** guardo otra vez 5 h y 3 días **ENTONCES** no cambia nada y no se crea una meta nueva en el historial.
- **H1-C5** · **DADO** el formulario de meta **CUANDO** intento guardar 0 horas, más de 100 horas, 0 días, 8 días o días con decimales **ENTONCES** veo un mensaje en español que explica el límite y la meta no se guarda.

### E2-H2 — Quitar la meta semanal

**Como** persona usuaria **quiero** quitar la meta de un juego **para** dejar de seguir mi ritmo cuando ya no me interese.

- **H2-C1** · **DADO** un juego con meta **CUANDO** la quito y confirmo **ENTONCES** la sección vuelve al estado «sin meta», con la invitación a fijar una.
- **H2-C2** · **DADO** que quité la meta de un juego **CUANDO** miro sus últimas 4 semanas **ENTONCES** las semanas completas en que la meta estuvo vigente conservan su estado (cumplida o no cumplida).
- **H2-C3** · **DADO** un juego sin meta **CUANDO** abro su detalle **ENTONCES** no veo progreso semanal, pero sí la racha.

### E2-H3 — Meta según el estado del juego

**Como** persona usuaria **quiero** que un juego completado o abandonado no tenga meta activa **para** que mis metas reflejen solo lo que sigo jugando.

- **H3-C1** · **DADO** un juego con meta **CUANDO** cambio su estado a «Completado» o «Abandonado» **ENTONCES** el juego deja de tener meta activa.
- **H3-C2** · **DADO** un juego completado o abandonado **CUANDO** abro su detalle **ENTONCES** el formulario de meta aparece deshabilitado con el texto «No se puede fijar una meta en un juego completado o abandonado».
- **H3-C3** · **DADO** un juego completado o abandonado **CUANDO** intento fijar una meta de todos modos **ENTONCES** veo el mensaje «No se puede fijar una meta en un videojuego completado o abandonado» y no se guarda.
- **H3-C4** · **DADO** un juego abandonado que tenía meta **CUANDO** lo vuelvo a poner en «Jugando» **ENTONCES** no recupera la meta anterior, pero puedo fijar una nueva.
- **H3-C5** · **DADO** un juego completado **CUANDO** abro su detalle **ENTONCES** sigo viendo la racha y las últimas 4 semanas.
- **H3-C6** · **DADO** un juego con meta **CUANDO** cambio su estado a «Pausado» **ENTONCES** la meta sigue activa.

### E2-H4 — Eliminar un videojuego con meta

**Como** persona usuaria **quiero** que al eliminar un juego se eliminen su meta y sus hitos **para** no dejar datos sueltos de un juego que ya no existe.

- **H4-C1** · **DADO** un juego con meta actual, metas anteriores e hitos **CUANDO** lo elimino **ENTONCES** también desaparecen todas sus metas y sus hitos.
- **H4-C2** · **DADO** un juego **CUANDO** pulso «Eliminar» **ENTONCES** la confirmación avisa que también se borrarán su meta semanal y sus hitos.

### E2-H5 — Ver el progreso de la semana actual

**Como** persona usuaria **quiero** ver en el detalle del juego cuántas horas y días llevo esta semana frente a mi meta **para** saber si voy bien.

- **H5-C1** · **DADO** una meta de 5 h y 3 días, y partidas esta semana de 2 h el lunes y 1,5 h el miércoles **CUANDO** abro el detalle del juego **ENTONCES** veo «3,5 de 5 h · 70 %», «2 de 3 días · 67 %» y «En curso».
- **H5-C2** · **DADO** una meta de 5 h y 3 días **CUANDO** juego 7 h repartidas en 3 días de la semana **ENTONCES** veo «7 de 5 h · 140 %», la barra llena sin salirse y «Meta cumplida».
- **H5-C3** · **DADO** una meta de 5 h y 3 días **CUANDO** juego 6 h en solo 2 días **ENTONCES** la semana sigue «En curso», no cumplida.
- **H5-C4** · **DADO** dos partidas el mismo día, de 1 h y de 30 min **CUANDO** veo el progreso **ENTONCES** cuentan como 1 día jugado y 1,5 h.
- **H5-C5** · **DADO** una partida registrada el martes que duró de 23:00 a 01:00 **CUANDO** veo el progreso **ENTONCES** sus 2 h cuentan enteras el martes.
- **H5-C6** · **DADO** que el miércoles cambio la meta de 5 h a 8 h **CUANDO** veo la semana actual **ENTONCES** el porcentaje de horas se calcula sobre 8 h.
- **H5-C7** · **DADO** una partida del domingo pasado **CUANDO** veo la semana actual **ENTONCES** esa partida no cuenta.
- **H5-C8** · **DADO** un juego sin meta **CUANDO** abro su detalle **ENTONCES** veo un estado vacío que invita a fijar una meta.

### E2-H6 — Ver la racha

**Como** persona usuaria **quiero** ver cuántos días seguidos llevo jugando a un juego **para** motivarme a ser constante.

- **H6-C1** · **DADO** partidas hoy, ayer y anteayer **CUANDO** abro el detalle **ENTONCES** veo «3 días seguidos».
- **H6-C2** · **DADO** partidas ayer y anteayer, y ninguna hoy **CUANDO** abro el detalle **ENTONCES** veo «2 días seguidos» (la racha sigue viva).
- **H6-C3** · **DADO** que mi última partida fue hace 2 días o más **CUANDO** abro el detalle **ENTONCES** veo «Sin racha».
- **H6-C4** · **DADO** partidas el 31 de octubre y el 1 de noviembre, y hoy es 1 de noviembre **CUANDO** abro el detalle **ENTONCES** veo «2 días seguidos».
- **H6-C5** · **DADO** partidas hoy y anteayer, pero no ayer **CUANDO** abro el detalle **ENTONCES** veo «1 día seguido».
- **H6-C6** · **DADO** una partida con fecha de mañana **CUANDO** abro el detalle **ENTONCES** esa partida no suma a la racha.

### E2-H7 — Gestionar los hitos

**Como** persona usuaria **quiero** añadir a mi meta hitos de avance (p. ej. «Llegar al 50 %») y eliminarlos **para** marcarme etapas dentro del juego.

- **H7-C1** · **DADO** una meta y un avance actual del 40 % **CUANDO** añado el hito «Llegar al 50 %» con porcentaje objetivo 50 **ENTONCES** aparece en la lista como «Pendiente».
- **H7-C2** · **DADO** un avance actual del 40 % **CUANDO** intento añadir un hito con porcentaje objetivo 30 o 40 **ENTONCES** veo «El porcentaje objetivo del hito debe ser mayor que el avance actual (40 %)» y no se crea.
- **H7-C3** · **DADO** una meta con 5 hitos **CUANDO** miro el formulario de hitos **ENTONCES** aparece deshabilitado; y si aun así intento añadir otro, veo «Una meta admite como máximo 5 hitos».
- **H7-C4** · **DADO** un hito con porcentaje objetivo 50 **CUANDO** intento añadir otro con porcentaje objetivo 50 **ENTONCES** veo «Ya existe un hito con porcentaje objetivo 50 %» y no se crea.
- **H7-C5** · **DADO** un hito **CUANDO** lo elimino y confirmo **ENTONCES** desaparece de la lista.
- **H7-C6** · **DADO** un juego sin meta **CUANDO** abro su detalle **ENTONCES** no puedo añadir hitos.

### E2-H8 — Alcanzar hitos automáticamente

**Como** persona usuaria **quiero** que mis hitos se marquen solos como alcanzados cuando llego a su avance **para** ver mis logros sin tener que marcarlos.

- **H8-C1** · **DADO** un hito pendiente con porcentaje objetivo 50 **CUANDO** registro una partida con avance del 55 % **ENTONCES** el hito aparece «Alcanzado el» con la fecha de hoy.
- **H8-C2** · **DADO** un hito alcanzado el 30 oct 2026 **CUANDO** registro una partida con un avance menor **ENTONCES** pasa a «Pendiente» y su `alcanzadoEn` (30 oct 2026) se conserva.
- **H8-C3** · **DADO** un hito alcanzado **CUANDO** borro la partida con la que se alcanzó **ENTONCES** el estado se recalcula con el nuevo avance actual (sin partidas, ningún hito alcanzado) y `alcanzadoEn` se conserva.
- **H8-C4** · **DADO** dos partidas el mismo día, la primera con 55 % y la segunda, registrada después, con 45 % **CUANDO** se calcula el avance actual **ENTONCES** el avance actual es 45 %.

### E2-H9 — Ver las últimas 4 semanas

**Como** persona usuaria **quiero** ver cuántas de las últimas 4 semanas cumplí mi meta **para** saber si estoy siendo constante en el mes.

- **H9-C1** · **DADO** que cumplí 3 de las 4 semanas completas anteriores **CUANDO** abro el detalle **ENTONCES** veo cada semana con su rango de fechas y estado, y «3 de 4 semanas con meta cumplidas».
- **H9-C2** · **DADO** que fijé la meta hace 2 semanas **CUANDO** abro el detalle **ENTONCES** las 2 semanas más antiguas aparecen «Sin meta» y el total es «X de 2».
- **H9-C3** · **DADO** que en una semana pasada cambié la meta el miércoles **CUANDO** veo esa semana **ENTONCES** se evalúa con la meta que estaba vigente el domingo.
- **H9-C4** · **DADO** la semana en curso **CUANDO** miro las últimas 4 semanas **ENTONCES** no aparece entre ellas (se muestra aparte, en E2-H5).
- **H9-C5** · **DADO** las últimas 4 semanas **CUANDO** las veo **ENTONCES** se muestran como indicadores simples, sin ningún gráfico.

---

## Tickets

### Definition of Done común (aplica a todos los tickets)

1. Existe una spec en `docs/specs/` que cubre el ticket, y el código la cumple.
2. El código es TypeScript con `import`/`export` y respeta las capas y los sufijos de `AGENTS.md`.
3. Los errores HTTP se lanzan con `ApiError` y los mensajes y textos de la interfaz están en español.
4. No se escriben credenciales ni se lee `.env`; las variables de entorno solo se leen en `config/env.ts`.
5. `cd backend && npm test` pasa (0 fallos) y `cd frontend && npm test` no falla.
6. `npm run build` pasa en cada paquete modificado.
7. Los criterios de las historias vinculadas están verificados como indica la tabla «criterio → verificación» de la spec.
8. Commit en `feature/e2-metas-rachas` con un mensaje que cita el id del ticket.

### Tabla de tickets

| Id | Tipo | Título | Historias | Spec | Depende de |
|---|---|---|---|---|---|
| E2-T01 | Habilitador | Módulo de fechas por día calendario y semana en hora de Ecuador | H0 | Backend | — |
| E2-T02 | Bug | Mostrar las fechas de partidas en el día elegido (diagnóstico #1) | H0 | Frontend | — |
| E2-T03 | Bug | Desempatar el avance actual por fecha de creación (diagnóstico #4) | H8 | Backend | — |
| E2-T04 | Funcionalidad | Modelo `Meta` con hitos | H1, H7 | Backend | — |
| E2-T05 | Funcionalidad | Cálculo puro de progreso, racha, últimas 4 semanas y reglas de hitos | H5, H6, H7, H8, H9 | Backend | T01 |
| E2-T06 | Funcionalidad | Servicio de metas e hitos | H1, H2, H3, H7, H8 | Backend | T03, T04, T05 |
| E2-T07 | Funcionalidad | Integrar metas con videojuegos y partidas | H3, H4, H8 | Backend | T06 |
| E2-T08 | Funcionalidad | Endpoints de meta, hitos y progreso | H1, H2, H5, H6, H7, H9 | Backend | T06 |
| E2-T09 | Funcionalidad | Tipos y cliente `metaApi` del frontend | H1, H2, H5–H9 | Frontend | T08 |
| E2-T10 | Funcionalidad | Sección «Meta semanal»: fijar, cambiar y quitar la meta y ver el progreso semanal | H1, H2, H3, H5 | Frontend | T02, T09 |
| E2-T11 | Funcionalidad | Racha y últimas 4 semanas en la interfaz | H6, H9 | Frontend | T10 |
| E2-T12 | Funcionalidad | Hitos en la interfaz | H7, H8 | Frontend | T10 |
| E2-T13 | Funcionalidad | Aviso de borrado de meta e hitos al eliminar un videojuego | H4 | Frontend | T07 |
| E2-T14 | Documentación | Cierre de E2: README, diagnóstico y verificación manual completa | Todas | Ambas | T01–T13 |

Orden de trabajo: `T01, T02, T03, T04` (en paralelo) → `T05` → `T06` → `T07, T08` → `T09` → `T10, T13` → `T11, T12` → `T14`.

### Detalle de los tickets

Además de la Definition of Done común, cada ticket tiene su DoD específica.

#### E2-T01 · Habilitador · Módulo de fechas
- **Historias:** H0 · **Depende de:** —
- **DoD:**
  - `backend/src/dominio/fechas.ts` implementa las funciones de la spec del backend (§2).
  - `test/dominio/fechas.test.js` está alineado con la spec (diagnóstico #17): ninguna suite se omite y todas pasan, incluidos los casos de `hoyEcuador` y `inicioSemana` con cruce de mes y de año.
  - H0-C2, H0-C3 y H0-C4 verificados por los tests.

#### E2-T02 · Bug · Fechas de partidas en el día elegido
- **Historias:** H0 · **Depende de:** —
- **DoD:**
  - Hay una sola función `formatearFecha` en `frontend/src/utils/formato.ts`, que formatea en UTC y se usa en `ListaPartidas.tsx` y `DetalleVideojuego.tsx`; las copias locales se eliminan.
  - Un test de `formatearFecha` está en verde.
  - Comprobación manual de H0-C1: una partida del 21/10/2026 se ve como «21 oct 2026».

#### E2-T03 · Bug · Desempate del avance actual
- **Historias:** H8 · **Depende de:** —
- **DoD:**
  - Los listados de partidas y el resumen ordenan por fecha y, a igual fecha, por fecha de creación descendente.
  - El resumen y el progreso usan el mismo criterio.
  - H8-C4 verificado.

#### E2-T04 · Funcionalidad · Modelo `Meta`
- **Historias:** H1, H7 · **Depende de:** —
- **DoD:**
  - `meta.model.ts` sigue la spec del backend (§3), con validaciones en español e índices (incluido el único parcial de meta activa).
  - `test/model/meta.test.js` cubre los rangos, los enteros, el sexto hito y el nombre vacío.

#### E2-T05 · Funcionalidad · Cálculo puro de progreso
- **Historias:** H5, H6, H7, H8, H9 · **Depende de:** T01
- **DoD:**
  - `backend/src/dominio/progreso.ts` exporta `calcularProgresoDesde`, `aProgresoSemanal`, `hitosPorAlcanzar`, `validarNuevoHito` y `debeArchivarMeta`, sin acceso a la base de datos.
  - `test/dominio/progreso.test.js` cubre todos los casos listados en la spec del backend (§6).

#### E2-T06 · Funcionalidad · Servicio de metas
- **Historias:** H1, H2, H3, H7, H8 · **Depende de:** T03, T04, T05
- **DoD:**
  - `meta.service.ts` implementa las funciones de la spec del backend (§4) usando las funciones puras de T05.
  - Todos los errores se lanzan con `ApiError` y con los mensajes exactos de la spec.

#### E2-T07 · Funcionalidad · Integración con videojuegos y partidas
- **Historias:** H3, H4, H8 · **Depende de:** T06
- **DoD:**
  - Al eliminar un videojuego se eliminan sus metas.
  - Al pasar a completado o abandonado se archiva la meta; «pausado» no la toca.
  - Al crear, actualizar o eliminar una partida se actualizan los hitos alcanzados.
  - Verificación manual de H3-C1, H3-C4, H3-C6, H4-C1, H8-C1, H8-C2 y H8-C3 contra la API en local.

#### E2-T08 · Funcionalidad · Endpoints
- **Historias:** H1, H2, H5, H6, H7, H9 · **Depende de:** T06
- **DoD:**
  - `meta.routes.ts` y `meta.controller.ts` están montados en `app.ts` con las rutas, los cuerpos y los códigos de la spec del backend (§5).
  - Un `:id` inválido devuelve 400 y un videojuego inexistente, 404.
  - Ningún controlador pasa `req.body` crudo.
  - Cada ruta comprobada manualmente en local.

#### E2-T09 · Funcionalidad · Tipos y `metaApi`
- **Historias:** H1, H2, H5–H9 · **Depende de:** T08
- **DoD:**
  - Los tipos de la spec del frontend (§3) están en `types.ts`.
  - `frontend/src/api/metaApi.ts` sigue el patrón de `videojuegoApi.ts`, usa `VITE_API_URL` y propaga el mensaje de error de la API.
  - `npm run build` pasa.

#### E2-T10 · Funcionalidad · Sección «Meta semanal»
- **Historias:** H1, H2, H3, H5 · **Depende de:** T02, T09
- **DoD:**
  - `DetalleVideojuego.tsx` muestra la sección con el estado vacío, el formulario para fijar o cambiar la meta, la acción de quitarla, las barras accesibles de la semana actual y el formulario deshabilitado en juegos completados o abandonados.
  - Las funciones de formato están probadas.
  - Verificación manual de los criterios de H1, H2, H3 y H5 según la spec del frontend (§6).

#### E2-T11 · Funcionalidad · Racha y últimas 4 semanas
- **Historias:** H6, H9 · **Depende de:** T10
- **DoD:**
  - Se muestran la racha («N días seguidos» o «Sin racha») y los 4 indicadores semanales con el total «X de N», sin gráficos.
  - Verificación manual de H6 y H9.

#### E2-T12 · Funcionalidad · Hitos en la interfaz
- **Historias:** H7, H8 · **Depende de:** T10
- **DoD:**
  - Se muestra la lista de hitos con su estado y fecha.
  - El formulario de alta se deshabilita con 5 hitos y no aparece sin meta.
  - Eliminar un hito pide confirmación y los errores de la API se muestran.
  - Verificación manual de H7 y H8.

#### E2-T13 · Funcionalidad · Aviso al eliminar un videojuego
- **Historias:** H4 · **Depende de:** T07
- **DoD:**
  - La confirmación de borrado en `DetalleVideojuego.tsx` avisa que también se borrarán la meta semanal y los hitos.
  - Verificación manual de H4-C2.

#### E2-T14 · Documentación · Cierre de E2
- **Historias:** todas · **Depende de:** T01–T13
- **DoD:**
  - El README documenta los endpoints nuevos y cómo ejecutar los tests.
  - `docs/diagnostico.md` marca #1, #4, #14 y #17 como resueltos.
  - Todas las filas de «criterio → verificación» de las dos specs están comprobadas.
  - `npm test` y `npm run build` pasan en backend y frontend.
