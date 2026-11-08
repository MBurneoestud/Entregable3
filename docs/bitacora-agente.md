# Bitácora del trabajo con el agente — E2 · Metas y rachas

Proyecto: Diario de Progreso Gamer · Agente: Claude Code · Rama: `feature/e2-metas-rachas` · Del 2026-11-07 al 2026-11-08

> **Revisado por el usuario (2026-11-08).** El agente reconstruyó un primer borrador a partir de los planes guardados ([AUDITORIA, Apéndice A](AUDITORIA.md#apendice-a)), el historial de Git y la conversación. Después, la persona que hizo el trabajo revisó cada momento, sección por sección: corrigió quién pidió, detectó y decidió cada cosa, y añadió los prompts exactos donde los hubo.

Cada momento sigue el mismo formato: **qué se le pidió**, **qué hizo bien o mal** y **cómo se corrigió**.

---

## 1. Diagnóstico inicial del Proyecto 3

- **Qué se le pidió:** diagnosticar el proyecto ([plan 1](AUDITORIA.md#a-1)). El prompt exacto fue: *«Diagnostica este proyecto. Lee el codigo y el README, analiza el archivo Demo-Diario_Gamer.mp4 que sirve como evidencia de pruebas. Entrega el estado del proyecto y una tabla de problemas»*.
- **Qué hizo:**
  - *Bien:* leyó backend, frontend y video, y detectó en el video un bug real: una partida del 21/10 aparece como «20 oct». Armó una tabla de 13 problemas con gravedad y evidencia.
  - *Mal:* la primera versión no comprobó si los tests y el harness funcionaban de verdad. Se limitó a leer la configuración.
- **Cómo se corrigió:** el segundo diagnóstico no estaba planeado. El usuario lo pidió cuando se dio cuenta de que el primero no había verificado nada, después de añadir los tests base ([plan 2](AUDITORIA.md#a-2)). Ejecutó `npm test` (45 en verde, 3 suites omitidas) y añadió los hallazgos N1–N7, entre ellos #14 (no había specs) y #16 (el hook de Prettier no hacía nada).

## 2. El hook de Prettier que no hacía nada

- **Qué se le pidió:** nada específico sobre el hook. El agente encontró el problema mientras auditaba el estado del harness y lo señaló como uno de varios puntos a corregir.
- **Qué hizo bien:** vio que el hook PostToolUse de Prettier estaba registrado pero no hacía nada. Prettier no estaba instalado y el `catch` silenciaba el error. Además solo procesaba `.js/.jsx/.json/.css`, cuando el código del proyecto es `.ts/.tsx`. Parecía que funcionaba y no hacía nada. El usuario no sabía que el hook no funcionaba hasta que el agente lo señaló.
- **Cómo se corrigió:** el diagnóstico lo registró como #16. En `6cb3b0a` se añadió `prettier` al `package.json` de la raíz y las extensiones `.ts/.tsx`. Ahora se comprueba en cada edición: Claude Code avisa de que el hook reformateó el archivo, como pasó con `meta.service.ts` y `dominio/metas.ts` en E2-T15. Lección: un hook que nunca falla también tiene que demostrar que hace algo.

## 3. Encontrar y resolver los huecos de la ficha

- **Qué se le pidió:** la ficha de hechos se envió sola como prompt, sin modificar ([plan 3](AUDITORIA.md#a-3)). Al recibirla, el agente lanzó una serie de preguntas al usuario y con esas respuestas convirtió la ficha en el PRD. Después de crear el PRD, se le enviaron como prompt los 8 huecos concretos del enunciado.
- **Qué hizo bien:** antes de recibir los 8 huecos ya había encontrado varios por su cuenta, como las partidas con fecha futura, los hitos repetidos y las semanas en pausa. Para cada hueco propuso una decisión con un ejemplo concreto.
- **Qué hubo que decidir:** el agente no puede tomar decisiones de producto. El usuario tomó estas tres, y en las tres eligió la opción que recomendaba el agente:
  - 140 % sin límite y con la barra llena;
  - la semana en curso se evalúa con la meta nueva;
  - archivar la meta al completar o abandonar el juego.

  Las decisiones quedaron en el PRD (§7.2) y bajaron a las reglas B-xx de la spec y a los tests ([AUDITORIA §6](AUDITORIA.md#6-decisiones-del-usuario-en-la-conversación)).

## 4. Los commits de T01–T14, hechos en dos minutos

- **Qué se le pidió:** se le pidió en dos prompts. El primero: *«prepara un plan basado en el spec E2-backend-meta-y-progreso-semanal.md divide el plan por los tickets presentados en el spec»*. El segundo: *«1. verifica contra la base actual de Atlas 2. Un commit por ticket»*. El plan resultante ([plan 4](AUDITORIA.md#a-4)) prometía, por iniciativa del agente, escribir los tests primero en cada ticket.
- **Qué hizo mal:** escribió todo el código y al final lo repartió en 8 commits, hechos entre las 22:58 y las 22:59. En varios, el test y el código van juntos, así que Git no puede demostrar el orden «test primero» que prometía su propio plan. El usuario lo detectó al revisar el historial de Git.
- **Cómo se corrigió:** el agente decidió no reescribir el historial. Documentó la limitación ([AUDITORIA §2 y §9](AUDITORIA.md#2-orden-tests-primero-después-código)). Para el cambio siguiente (B-24, el 409) se impuso a sí mismo el ciclo rojo → verde registrado: 145/155 con los tests escritos y 155/155 tras el código ([Apéndice B](AUDITORIA.md#apendice-b)).

## 5. Partidas con fecha futura (B-07)

- **Qué se le pidió:** nada específico. Mientras auditaba los cambios al backend, el agente corrió los tests, detectó el problema y se lo planteó como pregunta al usuario.
- **Qué hizo mal:** en su implementación, la regla «la partida más reciente» tomaba también una partida con fecha futura. Así, un registro adelantado podía marcar hitos como alcanzados antes de tiempo, aunque el PRD (S-2) dice que esas partidas no cuentan.
- **Cómo se corrigió:** el usuario le indicó que lo resolviera, y el agente decidió separarlo en su propio arreglo: `798de52` añade `avanceActualHastaHoy` y `1a168f7` añade el test que lo cubre y alinea la spec y el diagnóstico.

## 6. ¿Se guarda o se calcula el estado «alcanzado»?

- **Qué se le pidió:** nada específico. El agente detectó el problema mientras auditaba el backend. El usuario le indicó que lo resolviera ([plan 5](AUDITORIA.md#a-5)).
- **Qué hizo mal:** su primera implementación guardaba `alcanzadoEn` y lo usaba como estado, así que un hito no dejaba de estar alcanzado nunca. Contradecía el enunciado: un hito está alcanzado si el avance actual es mayor o igual que su objetivo.
- **Cómo se corrigió:** el agente propuso la decisión H-6 y el usuario aceptó la solución recomendada. `alcanzado` se calcula con el avance actual y `alcanzadoEn` se conserva solo como historial de la primera vez. Quedó en el PRD, en B-15 y B-23, y en el caso 17 de `progreso.test.js`.

## 7. Auditoría contra el enunciado y CRUD de Meta (E2-T15 a T17)

- **Qué se le pidió:** el prompt fue *«verifica el estado del proyecto contra estas instrucciones:»*, seguido del enunciado completo del ejercicio.
- **Qué hizo bien:** confirmó que los tests y los builds pasaban y encontró lo que faltaba. El usuario ya había identificado estos puntos, pero no se los señaló al agente, y él los encontró todos por su cuenta:
  - esta bitácora;
  - una auditoría por criterio;
  - la sección de deuda técnica;
  - el CRUD completo de Meta, con el 409 por segunda meta activa;
  - el `.gitignore` corrupto;
  - commits sin el id del ticket.
- **Qué hizo mal:** en un primer intento de esta tarea, el agente hizo varios commits mientras trabajaba, algo que no había hecho antes. Se esperaba que no hiciera commits salvo que el usuario invocara la skill de commit. Por eso el usuario revirtió el árbol de trabajo.
- **Qué pasó por el camino:** el árbol de trabajo quedó con ese intento revertido a medias, y el backend no compilaba. El agente no lo arregló por su cuenta: preguntó desde qué estado partir. El usuario eligió rehacerlo desde `ae7c06d` y sin commits.
- **Cómo se resolvió:**
  - primero la spec (B-25 a B-29) y el backlog (E2-T15, T16 y T17);
  - después las reglas puras en `dominio/metas.ts`, con su test por regla, y el servicio, el controlador y las rutas;
  - al final la §0 de la auditoría, que marca como ⏳ lo que aún no se ha verificado a mano en lugar de darlo por bueno.
