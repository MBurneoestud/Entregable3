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
- **Servicios frontend:** `frontend/src/api/videojuegoApi.ts` y `frontend/src/api/partidaApi.ts`; las páginas consumen estos módulos en lugar de llamar a `fetch` directamente.

## Funcionalidades

- Listar videojuegos y filtrarlos por plataforma, género y estado.
- Consultar el detalle de un videojuego, sus logros, partidas y resumen calculado.
- Crear, editar y eliminar videojuegos.
- Marcar logros como obtenidos o pendientes.
- Listar y filtrar partidas, ver su videojuego relacionado y eliminar sesiones.
- Registrar una partida con fecha, duración, avance y notas.
- Mostrar estados de carga, error y contenido vacío en las vistas que dependen de la API.
- Incluir un identificador de petición, registrar solicitudes y centralizar el manejo de errores HTTP.

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

### Códigos de error

- **400:** errores de validación de esquema o identificadores con formato inválido.
- **404:** recurso inexistente o videojuego referenciado que no existe.
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
