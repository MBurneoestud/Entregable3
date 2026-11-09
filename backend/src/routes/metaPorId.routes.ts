import { Router } from "express";
import * as metaController from "../controllers/meta.controller";

// Montado en app.ts como /api/metas (E2-T15, spec B-27 a B-29).
export const metaPorIdRouter = Router();

metaPorIdRouter.get("/:metaId", metaController.obtenerPorId);
metaPorIdRouter.patch("/:metaId", metaController.actualizar);
metaPorIdRouter.patch("/:metaId/desactivar", metaController.desactivar);
