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
    const { horasPorSemana, diasPorSemana } = cuerpo(req);
    const { meta, creada } = await metaService.fijarMeta(req.params.id, {
      horasPorSemana,
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
    const { nombre, objetivo } = cuerpo(req);
    const meta = await metaService.agregarHito(req.params.id, {
      nombre,
      objetivo,
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
    const progreso = await metaService.calcularProgreso(req.params.id);
    res.json({ progreso });
  } catch (error) {
    next(error);
  }
}
