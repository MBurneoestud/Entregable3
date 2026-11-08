/**
 * dominio/progreso.ts
 * -------------------
 * Cálculo puro (sin base de datos) del progreso semanal, la racha, las
 * últimas 4 semanas y las reglas de hitos. Spec E2 backend §4.1 y §4.3.
 */

import { EstadoVideojuego } from "../models/videojuego.model";
import { MAX_HITOS, MENSAJES_META, objetivoValido } from "../models/meta.model";
import { diaCalendario, hoyEcuador, inicioSemana, sumarDias } from "./fechas";
import { avanceActual, PartidaOrdenable } from "./partidas";

export interface PartidaCalculo extends PartidaOrdenable {
  duracionMinutos: number;
}

export interface HitoCalculo {
  objetivo: number;
  alcanzadoEn?: Date | null;
}

export interface MetaCalculo {
  horasPorSemana: number;
  diasPorSemana: number;
  activa: boolean;
  vigenteDesde: Date;
  vigenteHasta?: Date | null;
}

export interface EvaluacionSemana {
  inicio: string;
  fin: string;
  horas: number;
  dias: number;
  porcentajeHoras: number;
  porcentajeDias: number;
  cumplida: boolean;
}

export type SemanaHistorial =
  | { inicio: string; fin: string; estado: "sin_meta" }
  | ({ estado: "cumplida" | "no_cumplida" } & Omit<
      EvaluacionSemana,
      "cumplida"
    >);

export interface Progreso<M extends MetaCalculo = MetaCalculo> {
  hoy: string;
  meta: M | null;
  semanaActual: EvaluacionSemana | null;
  racha: number;
  porcentajeAvanceActual: number | null;
  ultimas4: SemanaHistorial[];
  semanasCumplidas: number;
  semanasConMeta: number;
}

function evaluar(
  porDia: Map<string, number>,
  inicio: string,
  fin: string,
  meta: MetaCalculo,
): EvaluacionSemana {
  let dias = 0;
  let minutos = 0;
  for (const [dia, minutosDia] of porDia) {
    if (dia >= inicio && dia <= fin) {
      dias++;
      minutos += minutosDia;
    }
  }
  const horas = minutos / 60;
  return {
    inicio,
    fin,
    horas,
    dias,
    porcentajeHoras: Math.round((horas / meta.horasPorSemana) * 100), // B-09
    porcentajeDias: Math.round((dias / meta.diasPorSemana) * 100), // B-09
    cumplida: horas >= meta.horasPorSemana && dias >= meta.diasPorSemana, // B-08
  };
}

/** Meta vigente al cierre (`fin`, domingo) de una semana; si hay varias, la más reciente (B-11). */
function metaVigenteAl<M extends MetaCalculo>(
  metas: readonly M[],
  fin: string,
): M | null {
  let vigente: M | null = null;
  for (const meta of metas) {
    const desde = hoyEcuador(meta.vigenteDesde);
    const hasta = meta.vigenteHasta ? hoyEcuador(meta.vigenteHasta) : null;
    if (desde <= fin && (hasta === null || hasta > fin)) {
      vigente = meta; // las metas vienen ordenadas por vigenteDesde asc.
    }
  }
  return vigente;
}

export function calcularProgresoDesde<M extends MetaCalculo>(
  partidas: readonly PartidaCalculo[],
  metas: readonly M[],
  ahora: Date = new Date(),
): Progreso<M> {
  const hoy = hoyEcuador(ahora);
  const ayer = sumarDias(hoy, -1);

  // B-06, B-07: día calendario de la partida y descartar las futuras.
  const validas = partidas.filter(
    (partida) => diaCalendario(partida.fecha) <= hoy,
  );
  const porDia = new Map<string, number>();
  for (const partida of validas) {
    const dia = diaCalendario(partida.fecha);
    porDia.set(dia, (porDia.get(dia) ?? 0) + partida.duracionMinutos);
  }

  const ordenadas = [...metas].sort(
    (a, b) => a.vigenteDesde.getTime() - b.vigenteDesde.getTime(),
  );
  const metaActiva = ordenadas.find((meta) => meta.activa) ?? null;
  const lunes = inicioSemana(hoy);

  const semanaActual = metaActiva
    ? evaluar(porDia, lunes, sumarDias(lunes, 6), metaActiva)
    : null;

  // B-10: racha hacia atrás desde hoy o, si hoy no hay partida, desde ayer.
  let racha = 0;
  let dia: string | null = porDia.has(hoy)
    ? hoy
    : porDia.has(ayer)
      ? ayer
      : null;
  while (dia !== null && porDia.has(dia)) {
    racha++;
    dia = sumarDias(dia, -1);
  }

  // B-11, B-12: las 4 semanas completas anteriores, de la más antigua a la más reciente.
  const ultimas4: SemanaHistorial[] = [];
  for (let k = 4; k >= 1; k--) {
    const inicio = sumarDias(lunes, -7 * k);
    const fin = sumarDias(inicio, 6);
    const meta = metaVigenteAl(ordenadas, fin);
    if (!meta) {
      ultimas4.push({ inicio, fin, estado: "sin_meta" });
    } else {
      const { cumplida, ...evaluacion } = evaluar(porDia, inicio, fin, meta);
      ultimas4.push({
        ...evaluacion,
        estado: cumplida ? "cumplida" : "no_cumplida",
      });
    }
  }

  return {
    hoy,
    meta: metaActiva,
    semanaActual,
    racha,
    porcentajeAvanceActual: avanceActual(validas),
    ultimas4,
    semanasCumplidas: ultimas4.filter((s) => s.estado === "cumplida").length,
    semanasConMeta: ultimas4.filter((s) => s.estado !== "sin_meta").length,
  };
}

/** Hitos sin `alcanzadoEn` cuyo objetivo ya se alcanzó (B-15). */
export function hitosPorAlcanzar<H extends HitoCalculo>(
  hitos: readonly H[],
  avance: number | null,
): H[] {
  if (avance === null) return [];
  return hitos.filter((hito) => !hito.alcanzadoEn && hito.objetivo <= avance);
}

/** Mensaje de error de B-13 / B-14, o `null` si el hito se puede crear. */
export function validarNuevoHito(
  meta: { hitos: readonly HitoCalculo[] },
  { nombre, objetivo }: { nombre: unknown; objetivo: unknown },
  avance: number | null,
): string | null {
  if (typeof nombre !== "string" || nombre.trim() === "") {
    return MENSAJES_META.nombreHito;
  }
  if (!objetivoValido(objetivo)) {
    return MENSAJES_META.objetivoHito;
  }
  if (meta.hitos.length >= MAX_HITOS) {
    return MENSAJES_META.maxHitos;
  }
  if (meta.hitos.some((hito) => hito.objetivo === objetivo)) {
    return MENSAJES_META.hitoRepetido(objetivo);
  }
  const avanceActualONulo = avance ?? 0;
  if (objetivo <= avanceActualONulo) {
    return MENSAJES_META.objetivoBajo(avanceActualONulo);
  }
  return null;
}

/** `true` si al pasar a este estado hay que archivar la meta activa (B-18). */
export function debeArchivarMeta(
  estado: EstadoVideojuego | undefined | null,
): boolean {
  return estado === "completado" || estado === "abandonado";
}
