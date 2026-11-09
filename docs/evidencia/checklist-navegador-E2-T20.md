<!-- Recorrido hecho por el usuario el 2026-11-09 (E2-T20). Resultados tal como los anotó. -->
# Checklist de verificación en el navegador (E2-T20)

Dónde: https://diario-gamer-burneo.onrender.com/ (o http://localhost:5173 con backend y frontend en `npm run dev`).
Anota en cada fila: ✅ / ❌ y lo que viste (y, si quieres, guarda una captura en `docs/evidencia/` con el número de paso).
Usa un juego nuevo llamado **[PRUEBA] Navegador**, estado «Jugando». Bórralo al final.

| Paso | Criterio | Qué hacer | Qué deberías ver | Resultado / nota |
|---|---|---|---|---|
| 1 | H0-C1, F-02 | Registrar una partida con fecha 21/10/2026 (60 min, 10 %) | En la lista de partidas y en el detalle: «21 oct 2026» |✅ |
| 2 | H5-C8, H2-C3, F-11, H7-C6 | Abrir el detalle del juego | Sección «Meta semanal» entre «Resumen de actividad» e «Información», con estado vacío «Aún no tienes una meta para este juego» y el formulario; se ve la racha; **no** hay barras ni formulario de hitos |✅ |
| 3 | H1-C5, F-15 | En el formulario, probar 0 h, 101 h, 0 días, 8 días y 2,5 días | El navegador lo impide o aparece en rojo el mensaje en español del backend; no se guarda | ✅|
| 4 | H1-C1 | Fijar 5 h y 3 días | «Meta: 5 h y 3 días por semana», dos barras e insignia «En curso» |✅ |
| 5 | H7-C1 | Añadir el hito «Llegar al 50 %» con 50 | Aparece en la lista como «Pendiente» |✅ |
| 6 | H7-C2, H7-C4 | Añadir un hito con porcentaje 5 (≤ avance actual) y otro con 50 (repetido) | Mensajes del backend: «…mayor que el avance actual (10 %)» y «Ya existe un hito con porcentaje objetivo 50 %» |✅ |
| 7 | H7-C3, F-07 | Añadir hitos hasta tener 5 (p. ej. 60, 70, 80, 90) | El formulario de hitos y «Añadir hito» quedan deshabilitados | ✅|
| 8 | H7-C5 | «Eliminar» el hito de 90 % | Pide confirmación y desaparece | ✅|
| 9 | H5-C1 | Registrar dos partidas **esta semana** en días distintos: 2 h (120 min) y 1,5 h (90 min) | «3,5 de 5 h · 70 %», «2 de 3 días · 67 %», «En curso» | ✅|
| 10 | H5-C3 | Con la meta {5, 3}, que haya 6 h en solo 2 días (edita una partida para subir la duración) | Sigue «En curso» | ✅|
| 11 | H5-C2, F-05 | Añadir una tercera partida esta semana en otro día hasta pasar 7 h en 3 días | «… de 5 h · 140 %» (o el % real), barra llena sin salirse, «Meta cumplida» |✅ |
| 12 | H8-C1, F-10 | Registrar una partida con avance 55 % y volver al detalle | El hito de 50 % aparece «Alcanzado el <hoy>» sin recargar a mano |✅ |
| 13 | F-17, F-18, F-19 | «Editar» una partida desde el historial del detalle, cambiar la duración y guardar; luego «Eliminar» otra | Formulario precargado con título «Editar partida» y botón «Guardar cambios»; al volver y al eliminar, el resumen y la barra de horas se actualizan sin recargar la página |✅ |
| 14 | H6-C1…C3, H6-C5, F-14 | Mirar la racha | «N días seguidos» / «1 día seguido» / «Sin racha» según tus partidas, y «Mejor racha: …» |✅ |
| 15 | H9-C1, H9-C5, H9-C2, F-13 | Mirar «Últimas 4 semanas» | 4 indicadores con rango («12 oct – 18 oct») y estado, sin gráfico; como la meta es de hoy: las 4 «Sin meta» y «Todavía no hay semanas completas con meta» | ✅|
| 16 | H1-C2, H1-C3, F-08 | «Cambiar meta» → 8 h y 3 días | Aparece el aviso «La meta actual quedará archivada…»; después, la barra dice «de 8 h» y los hitos siguen igual (el alcanzado conserva su fecha) |✅ |
| 17 | H2-C1, F-08 | «Quitar meta» | Pide confirmación y vuelve el estado vacío con «Fijar meta» |✅ |
| 18 | H3-C2, H3-C5, F-06 | Editar el juego y ponerlo en «Completado»; abrir el detalle | Formulario de meta deshabilitado con «No se puede fijar una meta en un juego completado o abandonado»; racha y 4 semanas visibles |✅ |
| 19 | H3-C3 | (Opcional) Desde las herramientas de desarrollo, quitar `disabled` del botón y enviar | Mensaje rojo «No se puede fijar una meta en un videojuego completado o abandonado» |✅ |
| 20 | H5-C8, F-11 | (Solo en local) Parar el backend y recargar el detalle | `error-state` rojo «No se pudo cargar la meta semanal…» |✅ |
| 21 | F-04, F-12, F-21 | Revisión visual de la sección | Mismos colores, fuentes y paneles que el resto de la app; verde para progreso, rosa solo en errores y botones de borrar |✅ |
| 22 | H4-C2, F-09 | «Eliminar» el juego [PRUEBA] Navegador | La confirmación dice «…También se borrarán su meta semanal y sus hitos.» Acepta para limpiar | ✅|
| 23 | Limpieza | Ir a «Partidas» | Borra las partidas que queden del juego de prueba (el borrado de un juego no borra sus partidas, diagnóstico #2) |✅ |

Nota: las correcciones de diseño del commit C (E2-T19) no estarán en Render hasta el siguiente despliegue; el paso 21 conviene repetirlo después.
