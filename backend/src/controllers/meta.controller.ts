import { NextFunction, Request, Response } from "express";
import * as metaService from "../services/meta.service";

// B-19: nunca se pasa req.body crudo; solo se copian los campos permitidos.
// Los tipos y rangos los valida el servicio con los mensajes exactos de la spec.
function cuerpo(req: Request): Record<string, unknown> {
  return req.body && typeof req.body === "object" ? req.body : {};
}

export async function obtener(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const meta = await metaService.obtenerMetaActiva(req.params.id);
    res.json({ meta });
  } catch (error) {
    next(error);
  }
}

export async function fijar(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { horasSemanales, diasPorSemana } = cuerpo(req);
    const { meta, creada } = await metaService.fijarMeta(req.params.id, {
      horasSemanales,
      diasPorSemana,
    });
    res.status(creada ? 201 : 200).json({ meta });
  } catch (error) {
    next(error);
  }
}

export async function quitar(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await metaService.archivarMeta(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function agregarHito(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { descripcion, porcentajeObjetivo } = cuerpo(req);
    const meta = await metaService.agregarHito(req.params.id, {
      descripcion,
      porcentajeObjetivo,
    });
    res.status(201).json({ meta });
  } catch (error) {
    next(error);
  }
}

export async function eliminarHito(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const meta = await metaService.eliminarHito(
      req.params.id,
      req.params.hitoId,
    );
    res.json({ meta });
  } catch (error) {
    next(error);
  }
}

export async function obtenerProgreso(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // B-23: el objeto de la spec §5, sin envoltorio.
    res.json(await metaService.calcularProgreso(req.params.id));
  } catch (error) {
    next(error);
  }
}
