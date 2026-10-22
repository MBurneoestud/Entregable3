import { Router } from "express";
import * as partidaController from "../controllers/partida.controller";

export const partidaRouter = Router();

partidaRouter.get("/", partidaController.listar);
partidaRouter.post("/", partidaController.crear);
partidaRouter.get("/:id", partidaController.obtenerPorId);
partidaRouter.put("/:id", partidaController.actualizar);
partidaRouter.delete("/:id", partidaController.eliminar);
