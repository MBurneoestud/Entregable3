import { Router } from "express";
import * as metaController from "../controllers/meta.controller";

// Montado en app.ts como /api/videojuegos/:id; mergeParams expone req.params.id.
export const metaRouter = Router({ mergeParams: true });

metaRouter.get("/meta", metaController.obtener);
metaRouter.put("/meta", metaController.fijar);
metaRouter.delete("/meta", metaController.quitar);
metaRouter.post("/meta/hitos", metaController.agregarHito);
metaRouter.delete("/meta/hitos/:hitoId", metaController.eliminarHito);
metaRouter.get("/progreso", metaController.obtenerProgreso);
