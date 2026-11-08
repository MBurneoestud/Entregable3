# PRD — Diario de Progreso Gamer

Versión 2 (añade la épica E2 · Metas y rachas) · Fecha: 2026-11-07
Estado: E1 en producción · E2 propuesta, lista para refinar
Documentos relacionados: [épicas](../backlog/epicas.md) · [historias y tickets de E2](../backlog/E2-metas-y-rachas.md) · [diagnóstico](../diagnostico.md)

> Este documento describe **qué** debe hacer el producto y **por qué**. El **cómo** está en las specs de `docs/specs/`.

## 1. Producto

El Diario de Progreso Gamer es un diario personal en la web para llevar el registro de los videojuegos que una persona juega, sus logros y cada partida jugada, y ver cómo avanza en cada juego.

| Épica | Nombre | Estado |
|---|---|---|
| E1 | Registro de videojuegos, partidas y logros | Existente (Proyecto 3), en producción |
| E2 | Metas y rachas | Nueva (esta versión) |

## 2. Problema

**Lo que ya resuelve (E1).** Quien juega varios títulos a la vez pierde la cuenta de cuánto ha jugado, en qué punto se quedó y qué logros le faltan. El Diario reúne todo eso por juego y muestra un resumen: número de partidas, horas totales, última partida y avance actual.

**Lo que falta (E2).** La persona registra sus partidas, pero no sabe si está jugando lo que se propuso ni si es constante: juega mucho un fin de semana y luego deja el juego dos semanas. Hoy el Diario solo muestra totales acumulados; no dice nada del ritmo semanal ni de la constancia.

## 3. Usuarios

- **Persona usuaria única:** alguien que juega con regularidad, a menudo varios juegos a la vez y en distintas plataformas, y que quiere llevar su propio registro.
- **Uso individual:** no hay cuentas, perfiles compartidos ni otros usuarios.
- **Necesidades:**
  - recordar dónde se quedó y cuánto ha jugado (E1);
  - proponerse un ritmo de juego, ver si lo cumple y mantener la constancia (E2).

## 4. Objetivo y métrica de éxito

| Épica | Objetivo | Métrica |
|---|---|---|
| E1 | Tener en un solo lugar los juegos, sus logros y sus partidas, con un resumen de progreso por juego. | El resumen de cada juego refleja todas sus partidas registradas, sin cálculos manuales (ya se cumple). |
| E2 | Que la persona pueda fijarse una meta semanal por videojuego y ver, en el detalle del juego, cómo va esta semana, cuántos días seguidos lleva jugando, qué hitos de avance ha alcanzado y cuántas de las últimas 4 semanas cumplió. | **En un mes, la persona cumple su meta semanal al menos 3 de cada 4 semanas.** |

Cómo se mide en E2: el detalle del juego muestra «X de N semanas con meta cumplidas», calculado sobre las 4 semanas completas anteriores a la actual.

## 5. Alcance

### 5.1 E1 — Lo existente

- Registrar, editar y eliminar videojuegos con nombre, plataforma, género y estado (jugando, pausado, completado o abandonado).
- Listar los videojuegos y filtrarlos por plataforma, género y estado.
- Ver el detalle de un juego: sus datos, sus logros, su historial de partidas y su resumen de progreso.
- Marcar logros como obtenidos o pendientes.
- Registrar partidas con fecha, duración, avance (%) y notas; ver el listado de todas las partidas y eliminarlas.
- Mostrar estados de carga, error y vacío.

### 5.2 E2 — Metas y rachas

- **Meta semanal por videojuego:** cuántas horas y cuántos días por semana quiere jugar la persona. Puede fijarla, cambiarla y quitarla.
- **Progreso de la semana actual:** horas y días jugados frente a la meta, con su porcentaje y si ya está cumplida.
- **Racha:** cuántos días seguidos lleva jugando a ese juego.
- **Hitos de avance:** hasta 5 por meta (p. ej. «Llegar al 50 %»), que se marcan solos como alcanzados.
- **Últimas 4 semanas:** el estado de cada una (cumplida, no cumplida o sin meta) y el total «X de N».

**Experiencia esperada.** En el detalle de cada juego aparece una sección **«Meta semanal»**:

1. **Sin meta:** un estado vacío invita a fijar una meta (horas y días por semana).
2. **Con meta:** se ven el progreso de la semana («3,5 de 5 h · 70 %», «2 de 3 días · 67 %») con la indicación «En curso» o «Meta cumplida», la racha («4 días seguidos»), los hitos con su estado y fecha, y las últimas 4 semanas con el total.
3. La persona puede cambiar la meta, quitarla, añadir hitos (hasta 5) y eliminarlos.
4. **Juego completado o abandonado:** no se puede fijar una meta y se explica el motivo; la racha y las últimas 4 semanas se siguen viendo.

## 6. Fuera de alcance

- Cuentas de usuario y uso compartido.
- Notificaciones.
- Recordatorios.
- Metas compartidas entre usuarios.
- Rankings.
- Gráficos históricos (las 4 semanas se muestran como indicadores simples).
- Consultar o editar desde la interfaz el historial de metas anteriores.

## 7. Reglas de negocio

### 7.1 Reglas existentes (E1)

| ID | Regla |
|---|---|
| RN-01 | Toda partida pertenece a un videojuego que existe. |
| RN-02 | La duración de una partida no puede ser negativa y su avance va de 0 % a 100 %. |
| RN-03 | La fecha de una partida es el día que la persona eligió al registrarla, y así se muestra en todas las pantallas. *(Hoy aparece un día antes; se corrige como parte de E2, ver diagnóstico #1.)* |
| RN-04 | El avance actual de un juego es el de su partida más reciente. Si hay varias partidas el mismo día, cuenta la que se registró más tarde. *(Aclaración nueva, ver diagnóstico #4.)* |

### 7.2 Los 8 huecos del enunciado, resueltos (E2)

| # | Hueco | Decisión | Ejemplo |
|---|---|---|---|
| H-1 | **Racha y día de hoy:** si hoy todavía no hay partida pero ayer sí, ¿la racha sigue viva o ya se rompió? | **Sigue viva.** La racha cuenta los días seguidos que terminan hoy o, si hoy aún no hay partida, ayer. Solo se rompe si no hubo partida ni hoy ni ayer. | Partidas el lunes y el martes; el miércoles a mediodía, sin partida aún → «2 días seguidos». El jueves sin haber jugado el miércoles → «Sin racha». |
| H-2 | **Varias partidas el mismo día:** ¿cuentan como uno o varios días jugados? | **Un solo día jugado.** Sus horas sí se suman. | Dos partidas el martes, de 1 h y 30 min → 1 día y 1,5 h. |
| H-3 | **Partida que cruza la medianoche:** ¿a qué día pertenece? | **Al día en que empezó**, que es el que la persona elige al registrarla. Cuenta entera en ese día, porque la partida no guarda hora de inicio ni de fin. | Partida del martes de 23:00 a 01:00 → 2 h el martes. |
| H-4 | **Cambio de meta a mitad de semana:** ¿el porcentaje de la semana se calcula con la meta nueva o con la anterior? | **Con la meta nueva.** Cada semana se evalúa con la meta que estaba vigente al cerrarse (domingo); para la semana en curso, es la meta actual. La meta anterior no se pierde: se guarda para evaluar las semanas en que estuvo vigente. | Meta de 5 h; el miércoles se cambia a 8 h; con 6 h jugadas → «6 de 8 h · 75 %». |
| H-5 | **Meta superada:** si se juegan 7 horas con una meta de 5, ¿el porcentaje es 140 % o se limita a 100 %? | **140 %**, el valor real y sin límite. La barra de progreso se llena hasta el 100 % y no se sale. | «7 de 5 h · 140 %» con la barra llena. |
| H-6 | **Hito ya alcanzado:** si después se registra una partida con menos avance, ¿el hito deja de estar alcanzado? | **No.** Una vez alcanzado, queda alcanzado con su fecha original, aunque el avance baje o se borre la partida que lo alcanzó. | Hito «50 %» alcanzado el 30/10; el 2/11 se registra un 45 % → sigue «Alcanzado el 30 oct 2026». |
| H-7 | **Videojuego completado o abandonado:** ¿puede tener meta activa? | **No.** Al pasar a completado o abandonado, su meta se archiva sola y no se puede fijar otra mientras siga en ese estado. Si vuelve a «jugando» o «pausado», la meta anterior no se recupera, pero se puede fijar una nueva. «Pausado» no afecta a la meta. | Se marca «Completado» → la sección muestra el formulario deshabilitado con el motivo. |
| H-8 | **Eliminar un videojuego con meta:** ¿qué pasa con su meta y sus hitos? | **Se eliminan también** su meta actual, sus metas anteriores y todos sus hitos. La confirmación de borrado lo avisa. | «¿Seguro que quieres eliminar "Hades"? También se borrarán su meta semanal y sus hitos.» |

### 7.3 Otras reglas de E2

| ID | Regla |
|---|---|
| RN-05 | La semana va de **lunes a domingo**. «Hoy» y la semana actual se calculan en **hora de Ecuador**. |
| RN-06 | Cada videojuego tiene **como máximo una meta activa**, con horas por semana y días por semana; las dos cifras son obligatorias. |
| RN-07 | Cambiar la meta no la sobrescribe: la anterior se guarda en el historial con sus fechas de vigencia. Guardar los mismos valores no crea una meta nueva. |
| RN-08 | Una semana se **cumple** solo si se alcanzan **las horas y los días** de la meta. |
| RN-09 | **Últimas 4 semanas:** son las 4 semanas completas anteriores a la actual. Una semana sin meta vigente aparece como «Sin meta» y no cuenta en el total N. |
| RN-10 | Una meta tiene **como máximo 5 hitos**. Cada hito tiene un nombre y un objetivo de avance (%). No puede haber dos hitos con el mismo objetivo. |
| RN-11 | No se puede crear un hito cuyo objetivo sea **menor o igual** que el avance actual del juego, porque ya estaría alcanzado. |
| RN-12 | Un hito se alcanza cuando el avance actual del juego llega a su objetivo. Al cambiar la meta, los hitos pasan a la nueva con su estado y su fecha de alcance. |

## 8. Supuestos (pendientes de validar con la persona usuaria)

- S-1: una partida de 0 minutos cuenta como día jugado y para la racha.
- S-2: las partidas con fecha futura no cuentan en el progreso ni en la racha hasta que llegue su día.
- S-3: límites razonables para la meta: más de 0 y como máximo 168 horas por semana (las horas de una semana), y de 1 a 7 días por semana, en números enteros.
- S-4: el objetivo de un hito es un porcentaje entero de 1 a 100.
- S-5: las semanas en las que el juego estuvo en «pausado» con meta activa cuentan como semanas con meta (normalmente, no cumplidas).
- S-6: la persona registra sus partidas con la fecha real en que las jugó.

## 9. Puntos abiertos

| # | Pregunta | Por qué importa | Decisión provisional |
|---|---|---|---|
| P-1 | ¿Se deben rechazar las partidas con fecha futura al registrarlas? | Hoy se aceptan; E2 solo las ignora en sus cálculos (S-2). | Se ignoran; el rechazo queda para otra épica. |
| P-2 | Al eliminar un videojuego, ¿deben borrarse también sus partidas? | Hoy quedan huérfanas y siguen apareciendo en el listado general (diagnóstico #2). E2 solo borra metas e hitos (H-8). | Fuera de E2; se trata como corrección aparte. |
| P-3 | ¿La métrica de éxito se mide por juego o sumando todos los juegos con meta? | Cambia cómo se interpreta «3 de 4 semanas». | Por juego, que es lo que muestra la app. |
| P-4 | ¿La persona necesita consultar el historial de metas anteriores? | Hoy solo se usa internamente para evaluar las semanas pasadas. | No en E2 (fuera de alcance). |
| P-5 | ¿Una semana en «pausado» debería mostrarse como «Sin meta» en lugar de «No cumplida»? | Puede desanimar ver semanas no cumplidas mientras el juego está en pausa (S-5). | Cuenta como semana con meta. |
