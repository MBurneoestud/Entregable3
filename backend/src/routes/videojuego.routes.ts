import { Router } from "express";
import * as videojuegoController from "../controllers/videojuego.controller";

export const videojuegoRouter = Router();

videojuegoRouter.get("/", videojuegoController.listar);
videojuegoRouter.post("/", videojuegoController.crear);
videojuegoRouter.get("/:id/partidas", videojuegoController.listarPartidasDeVideojuego);
videojuegoRouter.get("/:id/resumen", videojuegoController.obtenerResumen);
videojuegoRouter.get("/:id", videojuegoController.obtenerPorId);
videojuegoRouter.put("/:id", videojuegoController.actualizar);
videojuegoRouter.patch("/:id/logros/:indiceLogro", videojuegoController.actualizarEstadoLogro);
videojuegoRouter.delete("/:id", videojuegoController.eliminar);
