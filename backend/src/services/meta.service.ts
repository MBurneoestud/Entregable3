/**
 * services/meta.service.ts
 * ------------------------
 * Meta semanal activa, hitos y progreso de un videojuego (spec E2 backend §4.2).
 * Las reglas viven en dominio/progreso.ts; aquí solo se accede a la base de datos.
 */

import { Types } from "mongoose";
import { ApiError } from "../apiError";
import { avanceActualHastaHoy } from "../dominio/partidas";
import {
  aProgresoSemanal,
  calcularProgresoDesde,
  hitosPorAlcanzar,
  ProgresoSemanal,
  validarNuevoHito,
} from "../dominio/progreso";
import {
  CifrasMeta,
  combinarCambiosMeta,
  ErrorMeta,
  MENSAJES_CRUD_META,
  validarCreacionMeta,
  validarDatosMeta,
  validarDesactivacionMeta,
  validarIdMeta,
  validarModificacionMeta,
} from "../dominio/metas";
import { IMeta, Meta } from "../models/meta.model";
import { Partida } from "../models/partida.model";
import { EstadoVideojuego } from "../models/videojuego.model";
// Import circular (videojuego.service → partida.service → meta.service → videojuego.service):
// es seguro porque solo se usa dentro de funciones, nunca al cargar el módulo.
import { buscarVideojuegoPorId } from "./videojuego.service";

export interface DatosMeta {
  horasSemanales: unknown;
  diasPorSemana: unknown;
}

export interface DatosHito {
  descripcion: unknown;
  porcentajeObjetivo: unknown;
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
  // B-07: las partidas con fecha futura no cuentan para el avance.
  return avanceActualHastaHoy(partidas);
}

export async function obtenerMetaActiva(videojuegoId: string): Promise<IMeta> {
  await buscarVideojuegoPorId(videojuegoId);
  return buscarMetaActivaOFallar(videojuegoId);
}

/** Lanza el error de una regla pura de `dominio/metas.ts` si la hay. */
function lanzarSiError(error: ErrorMeta | null): void {
  if (error) {
    throw new ApiError(error.status, error.mensaje);
  }
}

/** Valida las cifras (B-02) y el estado del juego (B-18) ya leído de la BD. */
function cifrasValidadas(
  datos: DatosMeta,
  estadoJuego: EstadoVideojuego | undefined,
): CifrasMeta {
  lanzarSiError(validarDatosMeta(datos, estadoJuego));
  return datos as CifrasMeta;
}

export async function fijarMeta(
  videojuegoId: string,
  datos: DatosMeta,
): Promise<{ meta: IMeta; creada: boolean }> {
  const videojuego = await buscarVideojuegoPorId(videojuegoId);
  const cifras = cifrasValidadas(datos, videojuego.estado);
  const actual = await buscarMetaActiva(videojuegoId);
  return reemplazarMeta(videojuegoId, actual, cifras);
}

/**
 * B-03 / B-04: si las cifras cambian, archiva la meta activa y crea una nueva con
 * sus hitos; si no cambian, la devuelve tal cual. Lo comparten `PUT /meta` y `PATCH /api/metas/:metaId`.
 */
async function reemplazarMeta(
  videojuegoId: string,
  actual: IMeta | null,
  { horasSemanales, diasPorSemana }: CifrasMeta,
): Promise<{ meta: IMeta; creada: boolean }> {
  const ahora = new Date();

  if (
    actual &&
    actual.horasSemanales === horasSemanales &&
    actual.diasPorSemana === diasPorSemana
  ) {
    return { meta: actual, creada: false }; // B-04
  }

  // B-03: archivar antes de crear para respetar el índice único parcial (B-01).
  const hitos = actual
    ? actual.hitos.map(({ descripcion, porcentajeObjetivo, alcanzadoEn }) => ({
        descripcion,
        porcentajeObjetivo,
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
    horasSemanales,
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
    throw new ApiError(error.status, error.mensaje);
  }

  meta.hitos.push({
    descripcion: (datos.descripcion as string).trim(),
    porcentajeObjetivo: datos.porcentajeObjetivo as number,
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

/** Marca como alcanzados los hitos cuyo porcentaje objetivo ya se superó (B-15). Nunca los revierte. */
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

// ---- CRUD REST del recurso Meta (E2-T15, spec B-25 a B-29) ----

/** B-25: crea la meta activa; 409 si ya hay una, sin tocar la existente. */
export async function crearMeta(
  videojuegoId: string,
  datos: DatosMeta,
): Promise<IMeta> {
  const videojuego = await buscarVideojuegoPorId(videojuegoId);
  const { horasSemanales, diasPorSemana } = cifrasValidadas(
    datos,
    videojuego.estado,
  );
  lanzarSiError(
    validarCreacionMeta(Boolean(await buscarMetaActiva(videojuegoId))),
  );
  // Si otra petición crea una meta activa entre la comprobación y el create, el
  // índice único parcial (B-01) lanza E11000 y errorHandler responde 409 (B-24).
  return Meta.create({
    videojuego: videojuegoId,
    horasSemanales,
    diasPorSemana,
    activa: true,
    vigenteDesde: new Date(),
    hitos: [],
  });
}

/** B-26: historial completo del videojuego, la más reciente primero. */
export async function listarMetas(videojuegoId: string): Promise<IMeta[]> {
  await buscarVideojuegoPorId(videojuegoId);
  return Meta.find({ videojuego: videojuegoId }).sort({ vigenteDesde: -1 });
}

async function buscarMetaPorIdOFallar(metaId: string): Promise<IMeta> {
  lanzarSiError(validarIdMeta(metaId));
  const meta = await Meta.findById(metaId);
  if (!meta) {
    throw new ApiError(404, MENSAJES_CRUD_META.noExiste(metaId));
  }
  return meta;
}

/** B-27: una meta por id, activa o archivada. */
export async function obtenerMetaPorId(metaId: string): Promise<IMeta> {
  return buscarMetaPorIdOFallar(metaId);
}

/** B-28: actualización parcial de la meta activa, con las mismas reglas que `PUT /meta`. */
export async function actualizarMeta(
  metaId: string,
  cambios: Partial<DatosMeta>,
): Promise<{ meta: IMeta; creada: boolean }> {
  const meta = await buscarMetaPorIdOFallar(metaId);
  lanzarSiError(validarModificacionMeta(meta));
  const videojuegoId = meta.videojuego.toString();
  const videojuego = await buscarVideojuegoPorId(videojuegoId);
  const cifras = cifrasValidadas(
    combinarCambiosMeta(meta, cambios),
    videojuego.estado,
  );
  return reemplazarMeta(videojuegoId, meta, cifras);
}

/** B-29: desactiva la meta sin borrarla ni borrar sus hitos. */
export async function desactivarMetaPorId(metaId: string): Promise<IMeta> {
  const meta = await buscarMetaPorIdOFallar(metaId);
  lanzarSiError(validarDesactivacionMeta(meta));
  meta.activa = false;
  meta.vigenteHasta = new Date();
  return meta.save();
}

export async function calcularProgreso(
  videojuegoId: string,
  ahora: Date = new Date(),
): Promise<ProgresoSemanal> {
  await buscarVideojuegoPorId(videojuegoId);
  const [partidas, metas] = await Promise.all([
    Partida.find({ videojuego: videojuegoId }).select(
      "fecha createdAt duracionMinutos porcentajeAvance",
    ),
    Meta.find({ videojuego: videojuegoId }).sort({ vigenteDesde: 1 }),
  ]);
  return aProgresoSemanal(calcularProgresoDesde(partidas, metas, ahora));
}
