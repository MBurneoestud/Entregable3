/**
 * dominio/fechas.ts
 * -----------------
 * Días calendario como strings "AAAA-MM-DD" (ordenables lexicográficamente)
 * y semanas de lunes a domingo con «hoy» en hora de Ecuador (UTC-5 fijo).
 */

import { ApiError } from "../apiError";

const DESFASE_ECUADOR_MS = 5 * 3600 * 1000;
const FORMATO_DIA = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Día calendario de una fecha guardada: su parte UTC, sin convertir de zona (B-06). */
export function diaCalendario(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

/** "AAAA-MM-DD" → Date a las 00:00 UTC de ese día. Lanza ApiError(400) si no es válida. */
export function interpretarFecha(texto: string): Date {
  const coincidencia =
    typeof texto === "string" ? FORMATO_DIA.exec(texto) : null;
  if (coincidencia) {
    const [, anio, mes, dia] = coincidencia;
    const fecha = new Date(
      Date.UTC(Number(anio), Number(mes) - 1, Number(dia)),
    );
    if (diaCalendario(fecha) === texto) {
      return fecha;
    }
  }
  throw new ApiError(
    400,
    `"${texto}" no es una fecha válida (formato AAAA-MM-DD)`,
  );
}

/** Día actual (o de cualquier instante real) en hora de Ecuador. */
export function hoyEcuador(ahora: Date = new Date()): string {
  return diaCalendario(new Date(ahora.getTime() - DESFASE_ECUADOR_MS));
}

export function esFechaFutura(
  dia: string,
  hoy: string = hoyEcuador(),
): boolean {
  return dia > hoy;
}

export function sumarDias(dia: string, n: number): string {
  const fecha = interpretarFecha(dia);
  fecha.setUTCDate(fecha.getUTCDate() + n);
  return diaCalendario(fecha);
}

/** Lunes de la semana de `dia`. */
export function inicioSemana(dia: string): string {
  const diaSemana = interpretarFecha(dia).getUTCDay(); // domingo = 0
  return sumarDias(dia, -((diaSemana + 6) % 7));
}
