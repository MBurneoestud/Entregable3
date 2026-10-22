/**
 * app.ts
 * ------
 * Ensambla Express: middlewares globales, rutas de ambas colecciones,
 * y el middleware centralizado de errores al final.
 */

import express, { Express, Request, Response } from "express";
import cors from "cors";
import { requestId } from "./middlewares/requestId";
import { logger } from "./middlewares/logger";
import { errorHandler } from "./middlewares/errorHandler";
import { videojuegoRouter } from "./routes/videojuego.routes";
import { partidaRouter } from "./routes/partida.routes";
import { ApiError } from "./apiError";

export function crearApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestId);
  app.use(logger);

  app.get("/api/salud", (req: Request, res: Response) => {
    res.json({ estado: "ok", requestId: req.id });
  });

  app.use("/api/videojuegos", videojuegoRouter);
  app.use("/api/partidas", partidaRouter);

  app.use((req: Request, res: Response, next) => {
    next(new ApiError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
  });

  app.use(errorHandler);

  return app;
}
