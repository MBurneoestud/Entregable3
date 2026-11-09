/**
 * dominio/metas.ts
 * ----------------
 * Reglas puras (sin base de datos) del CRUD de Meta: validación de cifras,
 * segunda meta activa, id de meta y estado activa/desactivada.
 * Spec E2 backend, reglas B-02, B-18 y B-25 a B-29 (ticket E2-T15).
 */

import { Types } from "mongoose";
import { EstadoVideojuego } from "../models/videojuego.model";
import { diasValidos, horasValidas, MENSAJES_META } from "../models/meta.model";
import { debeArchivarMeta } from "./progreso";

/** Error de una operación sobre una meta: 400 si los datos no son válidos, 409 si choca con el estado actual. */
export interface ErrorMeta {
  status: 400 | 409;
  mensaje: string;
}

export const MENSAJES_CRUD_META = {
  yaHayActiva:
    "El videojuego ya tiene una meta activa; cámbiala o desactívala antes de crear otra",
  desactivadaNoModificable: "La meta está desactivada y no se puede modificar",
  yaDesactivada: "La meta ya está desactivada",
  idInvalido: (id: string) =>
    `"${id}" no es un id válido para el campo "metaId"`,
  noExiste: (id: string) => `No existe una meta con id ${id}`,
} as const;

export interface CifrasMeta {
  horasSemanales: number;
  diasPorSemana: number;
}

/** B-02 y B-18: rangos de las cifras y videojuego no cerrado. `null` si se puede guardar. */
export function validarDatosMeta(
  {
    horasSemanales,
    diasPorSemana,
  }: { horasSemanales: unknown; diasPorSemana: unknown },
  estadoJuego: EstadoVideojuego | undefined | null,
): ErrorMeta | null {
  if (!horasValidas(horasSemanales)) {
    return { status: 400, mensaje: MENSAJES_META.horas };
  }
  if (!diasValidos(diasPorSemana)) {
    return { status: 400, mensaje: MENSAJES_META.dias };
  }
  if (debeArchivarMeta(estadoJuego)) {
    return { status: 400, mensaje: MENSAJES_META.juegoCerrado };
  }
  return null;
}

/** B-25: no se crea una segunda meta activa. */
export function validarCreacionMeta(hayMetaActiva: boolean): ErrorMeta | null {
  return hayMetaActiva
    ? { status: 409, mensaje: MENSAJES_CRUD_META.yaHayActiva }
    : null;
}

/** B-27: el id de la meta debe tener formato de ObjectId. */
export function validarIdMeta(id: string): ErrorMeta | null {
  return Types.ObjectId.isValid(id)
    ? null
    : { status: 400, mensaje: MENSAJES_CRUD_META.idInvalido(id) };
}

/** B-28: solo se modifica una meta activa. */
export function validarModificacionMeta(meta: {
  activa: boolean;
}): ErrorMeta | null {
  return meta.activa
    ? null
    : { status: 409, mensaje: MENSAJES_CRUD_META.desactivadaNoModificable };
}

/** B-28: los campos omitidos en el PATCH conservan el valor actual. */
export function combinarCambiosMeta(
  actual: CifrasMeta,
  cambios: { horasSemanales?: unknown; diasPorSemana?: unknown },
): { horasSemanales: unknown; diasPorSemana: unknown } {
  return {
    horasSemanales:
      cambios.horasSemanales === undefined
        ? actual.horasSemanales
        : cambios.horasSemanales,
    diasPorSemana:
      cambios.diasPorSemana === undefined
        ? actual.diasPorSemana
        : cambios.diasPorSemana,
  };
}

/** B-29: no se desactiva una meta ya desactivada. */
export function validarDesactivacionMeta(meta: {
  activa: boolean;
}): ErrorMeta | null {
  return meta.activa
    ? null
    : { status: 409, mensaje: MENSAJES_CRUD_META.yaDesactivada };
}
