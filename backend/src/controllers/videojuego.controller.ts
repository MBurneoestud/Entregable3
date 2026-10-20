import { NextFunction, Request, Response } from "express";
import { ApiError } from "../apiError";
import {
  EstadoVideojuego,
  Genero,
  Plataforma,
} from "../models/videojuego.model";
import * as partidaService from "../services/partida.service";
import * as videojuegoService from "../services/videojuego.service";

const plataformas: readonly Plataforma[] = ["PC", "PlayStation", "Xbox", "Switch", "Movil"];
const generos: readonly Genero[] = [
  "accion",
  "rol",
  "estrategia",
  "puzzle",
  "deportes",
  "otro",
];
const estados: readonly EstadoVideojuego[] = [
  "jugando",
  "pausado",
  "completado",
  "abandonado",
];

function leerFiltro<T extends string>(
  valor: unknown,
  valoresPermitidos: readonly T[],
  campo: string
): T | undefined {
  if (valor === undefined) {
    return undefined;
  }

  if (typeof valor !== "string") {
    throw new ApiError(400, `El filtro ${campo} debe ser un valor válido`);
  }

  const valorValido = valoresPermitidos.find((valorPermitido) => valorPermitido === valor);
  if (!valorValido) {
    throw new ApiError(400, `El filtro ${campo} debe ser uno de: ${valoresPermitidos.join(", ")}`);
  }
  return valorValido;
}

export async function listar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filtros = {
      ...(req.query.plataforma === undefined
        ? {}
        : { plataforma: leerFiltro(req.query.plataforma, plataformas, "plataforma") }),
      ...(req.query.genero === undefined
        ? {}
        : { genero: leerFiltro(req.query.genero, generos, "genero") }),
      ...(req.query.estado === undefined
        ? {}
        : { estado: leerFiltro(req.query.estado, estados, "estado") }),
    };
    const videojuegos = await videojuegoService.listarVideojuegos(filtros);
    res.json({ total: videojuegos.length, videojuegos });
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
    const videojuego = await videojuegoService.buscarVideojuegoPorId(req.params.id);
    res.json({ videojuego });
  } catch (error) {
    next(error);
  }
}

export async function crear(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const videojuego = await videojuegoService.crearVideojuego(req.body);
    res.status(201).json({ videojuego });
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
    const videojuego = await videojuegoService.actualizarVideojuego(req.params.id, req.body);
    res.json({ videojuego });
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
    await videojuegoService.eliminarVideojuego(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function listarPartidasDeVideojuego(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const partidas = await partidaService.listarPartidasDeVideojuego(req.params.id);
    res.json({ total: partidas.length, partidas });
  } catch (error) {
    next(error);
  }
}

export async function obtenerResumen(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const resumen = await videojuegoService.obtenerResumenVideojuego(req.params.id);
    res.json(resumen);
  } catch (error) {
    next(error);
  }
}
