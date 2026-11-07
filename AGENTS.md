# Diario de Progreso Gamer

## Proyecto
API REST para registrar progreso en videojuegos, partidas individuales y logros.

## Stack
- Backend: Node.js 20+, Express 4, Mongoose 8, TypeScript (compilado a CommonJS)
- Sintaxis `import` / `export` en el código fuente; `tsx watch` en desarrollo, `tsc` para compilar a `dist/`
- Base de datos: MongoDB Atlas (URI en la variable de entorno `MONGODB_URI`)
- Frontend: React 18 + TypeScript + Vite + React Router

## Estructura
- `backend/src/app.ts` — `crearApp()`: configuración de la app Express (sin `listen`)
- `backend/src/index.ts` — punto de entrada: conexión a MongoDB y arranque del servidor
- `backend/src/DBconnection.ts` — conexión a MongoDB
- `backend/src/config/env.ts` — único archivo que lee variables de entorno; el resto importa `env`
- `backend/src/apiError.ts` — clase `ApiError` para errores HTTP
- `backend/src/models/` — modelos de Mongoose (`videojuego.model.ts`, `partida.model.ts`)
- `backend/src/routes/` — routers de Express
- `backend/src/controllers/` — controladores (manejo de `req` / `res`)
- `backend/src/services/` — lógica de negocio y acceso a datos (p. ej. el resumen de progreso)
- `backend/src/middlewares/` — `requestId`, `logger` y `errorHandler`
- `frontend/src/pages/` — páginas de React
- `frontend/src/api/` — servicios que llaman a la API (las páginas no usan `fetch` directamente)
- `frontend/src/types.ts` — tipos compartidos del frontend
- `docs/` — documentación (`diagnostico.md`)
- `docs/specs/` — especificaciones de cada funcionalidad

## Comandos
- `cd backend && npm run dev` — arranca la API en modo desarrollo (`http://localhost:3000`)
- `cd backend && npm run build` — compila el backend a `dist/`
- `cd frontend && npm run dev` — arranca el frontend (`http://localhost:5173`)
- `cd frontend && npm run build` — comprueba tipos y genera el build del frontend

## Convenciones
- Nombres del dominio en español (`videojuego`, `partida`, `logro`, `resumen`).
- camelCase para variables y funciones; archivos del backend con sufijo por capa (`*.model.ts`, `*.routes.ts`, `*.controller.ts`, `*.service.ts`).
- Rutas REST bajo `/api` (p. ej. `/api/videojuegos`, `/api/videojuegos/:id/partidas`, `/api/partidas`).
- Los errores HTTP se lanzan con `ApiError` y los resuelve el middleware centralizado `errorHandler`.

## Reglas
- Nunca leer ni modificar `.env`.
- Nunca escribir credenciales en el código; usar variables de entorno.
- Ninguna funcionalidad se implementa sin una spec en `docs/specs/`.
- Ejecutar `npm test` antes de dar una tarea por terminada.

## Frontend
- Vive en `frontend/` (React + Vite + TypeScript).
- Llama a la API mediante los módulos de `frontend/src/api/`, usando `VITE_API_URL` como base; en local, Vite también hace de proxy de las rutas `/api` hacia `http://localhost:3000`.
- Estilos con Tailwind CSS (`frontend/tailwind.config.js`) y variables de color en `frontend/src/styles.css`; reutilizar esos colores y fuentes en lugar de valores sueltos.
- Textos de la interfaz en español.
- Arranque: `cd frontend && npm run dev` (con la API levantada con `cd backend && npm run dev`).
