/**
 * dominio/progreso.ts
 * -------------------
 * Cálculo puro (sin base de datos) del progreso semanal, la racha, las
 * últimas 4 semanas y las reglas de hitos. Spec E2 backend §4.1 y §4.3.
 */

import { EstadoVideojuego } from "../models/videojuego.model";
import {
  MAX_HITOS,
  MENSAJES_META,
  porcentajeObjetivoValido,
} from "../models/meta.model";
import { diaCalendario, hoyEcuador, inicioSemana, sumarDias } from "./fechas";
import { avanceActual, PartidaOrdenable } from "./partidas";

export interface PartidaCalculo extends PartidaOrdenable {
  duracionMinutos: number;
}

export interface HitoCalculo {
  porcentajeObjetivo: number;
  alcanzadoEn?: Date | null;
}

export interface MetaCalculo {
  horasSemanales: number;
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
  /** Semana actual con horas y días jugados, haya o no meta (B-23). */
  semana: { inicio: string; fin: string; horas: number; dias: number };
  semanaActual: EvaluacionSemana | null;
  racha: number;
  mejorRacha: number;
  porcentajeAvanceActual: number | null;
  ultimas4: SemanaHistorial[];
  semanasCumplidas: number;
  semanasConMeta: number;
}

/** Horas y días distintos jugados entre `inicio` y `fin` (ambos incluidos). */
function jugadoEntre(
  porDia: Map<string, number>,
  inicio: string,
  fin: string,
): { horas: number; dias: number } {
  let dias = 0;
  let minutos = 0;
  for (const [dia, minutosDia] of porDia) {
    if (dia >= inicio && dia <= fin) {
      dias++;
      minutos += minutosDia;
    }
  }
  return { horas: minutos / 60, dias };
}

function evaluar(
  porDia: Map<string, number>,
  inicio: string,
  fin: string,
  meta: MetaCalculo,
): EvaluacionSemana {
  const { horas, dias } = jugadoEntre(porDia, inicio, fin);
  return {
    inicio,
    fin,
    horas,
    dias,
    porcentajeHoras: Math.round((horas / meta.horasSemanales) * 100), // B-09
    porcentajeDias: Math.round((dias / meta.diasPorSemana) * 100), // B-09
    cumplida: horas >= meta.horasSemanales && dias >= meta.diasPorSemana, // B-08
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
  const domingo = sumarDias(lunes, 6);

  const semana = {
    inicio: lunes,
    fin: domingo,
    ...jugadoEntre(porDia, lunes, domingo),
  };
  const semanaActual = metaActiva
    ? evaluar(porDia, lunes, domingo, metaActiva)
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

  // B-22: la serie más larga de días consecutivos en todo el historial.
  let mejorRacha = 0;
  let serie = 0;
  let anterior: string | null = null;
  for (const diaJugado of [...porDia.keys()].sort()) {
    serie =
      anterior !== null && sumarDias(anterior, 1) === diaJugado ? serie + 1 : 1;
    mejorRacha = Math.max(mejorRacha, serie);
    anterior = diaJugado;
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
    semana,
    semanaActual,
    racha,
    mejorRacha,
    porcentajeAvanceActual: avanceActual(validas),
    ultimas4,
    semanasCumplidas: ultimas4.filter((s) => s.estado === "cumplida").length,
    semanasConMeta: ultimas4.filter((s) => s.estado !== "sin_meta").length,
  };
}

export interface HitoDescrito extends HitoCalculo {
  _id: { toString(): string };
  descripcion: string;
}

export interface MetaConHitos extends MetaCalculo {
  hitos: readonly HitoDescrito[];
}

export interface HitoProgreso {
  _id: string;
  descripcion: string;
  porcentajeObjetivo: number;
  alcanzado: boolean;
  alcanzadoEn: Date | null;
}

/** Respuesta de `GET /api/videojuegos/:id/progreso-semanal` (spec §5, B-23). */
export interface ProgresoSemanal {
  semana: { inicio: string; fin: string };
  meta: { horasSemanales: number; diasPorSemana: number } | null;
  horasSemana: number;
  porcentajeHoras: number | null;
  diasJugadosSemana: number;
  porcentajeDias: number | null;
  cumplida: boolean | null;
  rachaActual: number;
  mejorRacha: number;
  porcentajeAvanceActual: number | null;
  hitos: HitoProgreso[];
  ultimas4: SemanaHistorial[];
  semanasCumplidas: number;
  semanasConMeta: number;
}

/** Convierte el progreso interno en la respuesta de la API (B-23). */
export function aProgresoSemanal(
  progreso: Progreso<MetaConHitos>,
): ProgresoSemanal {
  const { meta, semana, semanaActual } = progreso;
  const avance = progreso.porcentajeAvanceActual;
  const hitos = meta
    ? [...meta.hitos]
        .sort((a, b) => a.porcentajeObjetivo - b.porcentajeObjetivo)
        .map((hito) => ({
          _id: hito._id.toString(), // para eliminarlo desde la interfaz
          descripcion: hito.descripcion,
          porcentajeObjetivo: hito.porcentajeObjetivo,
          // B-15: el estado se calcula con el avance actual (sin partidas, ninguno).
          alcanzado: avance !== null && avance >= hito.porcentajeObjetivo,
          alcanzadoEn: hito.alcanzadoEn ?? null, // H-6: fecha de la primera vez
        }))
    : [];

  return {
    semana: { inicio: semana.inicio, fin: semana.fin },
    meta: meta
      ? {
          horasSemanales: meta.horasSemanales,
          diasPorSemana: meta.diasPorSemana,
        }
      : null,
    horasSemana: Math.round(semana.horas * 10) / 10, // 1 decimal
    porcentajeHoras: semanaActual?.porcentajeHoras ?? null,
    diasJugadosSemana: semana.dias,
    porcentajeDias: semanaActual?.porcentajeDias ?? null,
    cumplida: semanaActual?.cumplida ?? null,
    rachaActual: progreso.racha,
    mejorRacha: progreso.mejorRacha,
    porcentajeAvanceActual: progreso.porcentajeAvanceActual,
    hitos,
    ultimas4: progreso.ultimas4,
    semanasCumplidas: progreso.semanasCumplidas,
    semanasConMeta: progreso.semanasConMeta,
  };
}

/** Hitos sin `alcanzadoEn` cuyo porcentaje objetivo se alcanza por primera vez (B-15). */
export function hitosPorAlcanzar<H extends HitoCalculo>(
  hitos: readonly H[],
  avance: number | null,
): H[] {
  if (avance === null) return [];
  return hitos.filter(
    (hito) => !hito.alcanzadoEn && hito.porcentajeObjetivo <= avance,
  );
}

/** Error al crear un hito: 400 si los datos no son válidos, 409 si choca con otro hito (B-24). */
export interface ErrorHito {
  status: 400 | 409;
  mensaje: string;
}

/** Error de B-13 / B-14 / B-24, o `null` si el hito se puede crear. */
export function validarNuevoHito(
  meta: { hitos: readonly HitoCalculo[] },
  {
    descripcion,
    porcentajeObjetivo,
  }: { descripcion: unknown; porcentajeObjetivo: unknown },
  avance: number | null,
): ErrorHito | null {
  const invalido = (mensaje: string): ErrorHito => ({ status: 400, mensaje });
  if (typeof descripcion !== "string" || descripcion.trim() === "") {
    return invalido(MENSAJES_META.descripcionHito);
  }
  if (!porcentajeObjetivoValido(porcentajeObjetivo)) {
    return invalido(MENSAJES_META.porcentajeObjetivoHito);
  }
  if (meta.hitos.length >= MAX_HITOS) {
    return invalido(MENSAJES_META.maxHitos);
  }
  if (
    meta.hitos.some((hito) => hito.porcentajeObjetivo === porcentajeObjetivo)
  ) {
    // B-24: choca con un hito que ya existe → conflicto, no petición mal formada.
    return {
      status: 409,
      mensaje: MENSAJES_META.hitoRepetido(porcentajeObjetivo),
    };
  }
  const avanceActualONulo = avance ?? 0;
  if (porcentajeObjetivo <= avanceActualONulo) {
    return invalido(MENSAJES_META.objetivoBajo(avanceActualONulo));
  }
  return null;
}

/** `true` si al pasar a este estado hay que archivar la meta activa (B-18). */
export function debeArchivarMeta(
  estado: EstadoVideojuego | undefined | null,
): boolean {
  return estado === "completado" || estado === "abandonado";
}
