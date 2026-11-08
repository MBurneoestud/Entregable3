/**
 * services/meta.service.ts
 * ------------------------
 * Meta semanal activa, hitos y progreso de un videojuego (spec E2 backend §4.2).
 * Las reglas viven en dominio/progreso.ts; aquí solo se accede a la base de datos.
 */

import { Types } from "mongoose";
import { ApiError } from "../apiError";
import { avanceActual } from "../dominio/partidas";
import {
  calcularProgresoDesde,
  debeArchivarMeta,
  hitosPorAlcanzar,
  Progreso,
  validarNuevoHito,
} from "../dominio/progreso";
import {
  diasValidos,
  horasValidas,
  IMeta,
  Meta,
  MENSAJES_META,
} from "../models/meta.model";
import { Partida } from "../models/partida.model";
// Import circular (videojuego.service → partida.service → meta.service → videojuego.service):
// es seguro porque solo se usa dentro de funciones, nunca al cargar el módulo.
import { buscarVideojuegoPorId } from "./videojuego.service";

export interface DatosMeta {
  horasPorSemana: unknown;
  diasPorSemana: unknown;
}

export interface DatosHito {
  nombre: unknown;
  objetivo: unknown;
}

async function buscarMetaActiva(videojuegoId: string): Promise<IMeta | null> {
  return Meta.findOne({ videojuego: videojuegoId, activa: true });
}

async function buscarMetaActivaOFallar(videojuegoId: string): Promise<IMeta> {
  const meta = await buscarMetaActiva(videojuegoId);
  if (!meta) {
    throw new ApiError(404, "El videojuego no tiene una meta activa");
  }
  return meta;
}

async function avanceDe(videojuegoId: string): Promise<number | null> {
  const partidas = await Partida.find({ videojuego: videojuegoId }).select(
    "fecha createdAt porcentajeAvance",
  );
  return avanceActual(partidas);
}

export async function obtenerMetaActiva(videojuegoId: string): Promise<IMeta> {
  await buscarVideojuegoPorId(videojuegoId);
  return buscarMetaActivaOFallar(videojuegoId);
}

export async function fijarMeta(
  videojuegoId: string,
  { horasPorSemana, diasPorSemana }: DatosMeta,
): Promise<{ meta: IMeta; creada: boolean }> {
  const videojuego = await buscarVideojuegoPorId(videojuegoId);
  if (!horasValidas(horasPorSemana)) {
    throw new ApiError(400, MENSAJES_META.horas);
  }
  if (!diasValidos(diasPorSemana)) {
    throw new ApiError(400, MENSAJES_META.dias);
  }
  if (debeArchivarMeta(videojuego.estado)) {
    throw new ApiError(400, MENSAJES_META.juegoCerrado);
  }

  const ahora = new Date();
  const actual = await buscarMetaActiva(videojuegoId);

  if (
    actual &&
    actual.horasPorSemana === horasPorSemana &&
    actual.diasPorSemana === diasPorSemana
  ) {
    return { meta: actual, creada: false }; // B-04
  }

  // B-03: archivar antes de crear para respetar el índice único parcial (B-01).
  const hitos = actual
    ? actual.hitos.map(({ nombre, objetivo, alcanzadoEn }) => ({
        nombre,
        objetivo,
        alcanzadoEn,
      }))
    : [];
  if (actual) {
    actual.activa = false;
    actual.vigenteHasta = ahora;
    await actual.save();
  }

  const meta = await Meta.create({
    videojuego: videojuegoId,
    horasPorSemana,
    diasPorSemana,
    activa: true,
    vigenteDesde: ahora,
    hitos,
  });
  return { meta, creada: true };
}

export async function archivarMeta(
  videojuegoId: string,
  { siExiste = false }: { siExiste?: boolean } = {},
): Promise<void> {
  await buscarVideojuegoPorId(videojuegoId);
  const meta = await buscarMetaActiva(videojuegoId);
  if (!meta) {
    if (siExiste) return;
    throw new ApiError(404, "El videojuego no tiene una meta activa");
  }
  meta.activa = false;
  meta.vigenteHasta = new Date();
  await meta.save();
}

export async function agregarHito(
  videojuegoId: string,
  datos: DatosHito,
): Promise<IMeta> {
  await buscarVideojuegoPorId(videojuegoId);
  const meta = await buscarMetaActivaOFallar(videojuegoId);

  const error = validarNuevoHito(meta, datos, await avanceDe(videojuegoId));
  if (error) {
    throw new ApiError(400, error);
  }

  meta.hitos.push({
    nombre: (datos.nombre as string).trim(),
    objetivo: datos.objetivo as number,
  });
  return meta.save();
}

export async function eliminarHito(
  videojuegoId: string,
  hitoId: string,
): Promise<IMeta> {
  await buscarVideojuegoPorId(videojuegoId);
  if (!Types.ObjectId.isValid(hitoId)) {
    throw new ApiError(
      400,
      `"${hitoId}" no es un id válido para el campo "hitoId"`,
    );
  }
  const meta = await buscarMetaActivaOFallar(videojuegoId);

  const hito = meta.hitos.id(hitoId);
  if (!hito) {
    throw new ApiError(404, `No existe un hito con id ${hitoId}`);
  }
  hito.deleteOne();
  return meta.save();
}

/** Marca como alcanzados los hitos cuyo objetivo ya se superó (B-15). Nunca los revierte. */
export async function actualizarHitosAlcanzados(
  videojuegoId: string,
): Promise<void> {
  await buscarVideojuegoPorId(videojuegoId);
  const meta = await buscarMetaActiva(videojuegoId);
  if (!meta) return;

  const pendientes = hitosPorAlcanzar(meta.hitos, await avanceDe(videojuegoId));
  if (pendientes.length === 0) return;

  const ahora = new Date();
  for (const hito of pendientes) {
    hito.alcanzadoEn = ahora;
  }
  await meta.save();
}

export async function calcularProgreso(
  videojuegoId: string,
  ahora: Date = new Date(),
): Promise<Progreso<IMeta>> {
  await buscarVideojuegoPorId(videojuegoId);
  const [partidas, metas] = await Promise.all([
    Partida.find({ videojuego: videojuegoId }).select(
      "fecha createdAt duracionMinutos porcentajeAvance",
    ),
    Meta.find({ videojuego: videojuegoId }).sort({ vigenteDesde: 1 }),
  ]);
  return calcularProgresoDesde(partidas, metas, ahora);
}
