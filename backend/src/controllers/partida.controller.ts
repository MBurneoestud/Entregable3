import { NextFunction, Request, Response } from "express";
import { ApiError } from "../apiError";
import * as partidaService from "../services/partida.service";

export async function listar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const videojuegoId = req.query.videojuegoId;
    if (videojuegoId !== undefined && typeof videojuegoId !== "string") {
      throw new ApiError(400, "El filtro videojuegoId debe ser un valor válido");
    }

    const partidas = await partidaService.listarPartidas(videojuegoId);
    res.json({ total: partidas.length, partidas });
  } catch (error) {
    next(error);
  }
}

export async function obtenerPorId(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const partida = await partidaService.buscarPartidaPorId(req.params.id);
    res.json({ partida });
  } catch (error) {
    next(error);
  }
}

export async function crear(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const partida = await partidaService.crearPartida(req.body);
    res.status(201).json({ partida });
  } catch (error) {
    next(error);
  }
}

export async function actualizar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const partida = await partidaService.actualizarPartida(req.params.id, req.body);
    res.json({ partida });
  } catch (error) {
    next(error);
  }
}

export async function eliminar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await partidaService.eliminarPartida(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
