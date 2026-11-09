// Utilidades de formato puras (sin React ni import.meta) para poder probarlas
// con node:test. Spec: docs/specs/E2-frontend-meta-semanal.md §2.

const FECHA_NO_DISPONIBLE = "Fecha no disponible";

const formatoFechaUTC = new Intl.DateTimeFormat("es", {
  dateStyle: "medium",
  timeZone: "UTC",
});

const formatoInstanteEcuador = new Intl.DateTimeFormat("es", {
  dateStyle: "medium",
  timeZone: "America/Guayaquil",
});

const formatoDiaUTC = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function aFecha(fecha: string): Date | null {
  const valor = new Date(fecha);
  return Number.isNaN(valor.getTime()) ? null : valor;
}

/**
 * Fechas de partida (AAAA-MM-DD guardadas a medianoche UTC): se formatean en UTC
 * para que no se muestren un día antes (F-02, diagnóstico #1).
 */
export function formatearFecha(fecha: string): string {
  const valor = aFecha(fecha);
  return valor ? formatoFechaUTC.format(valor) : FECHA_NO_DISPONIBLE;
}

/** Instantes reales (p. ej. `alcanzadoEn` de un hito): día de Ecuador. */
export function formatearInstante(fecha: string): string {
  const valor = aFecha(fecha);
  return valor ? formatoInstanteEcuador.format(valor) : FECHA_NO_DISPONIBLE;
}

/** `"2026-10-12"` → «12 oct», para los rangos de semanas. */
export function formatearDia(dia: string): string {
  const valor = aFecha(dia);
  return valor
    ? formatoDiaUTC.format(valor).replace(/\.$/, "")
    : FECHA_NO_DISPONIBLE;
}

/** Hasta 1 decimal y coma decimal: 3.5 → «3,5», 7 → «7». */
export function formatearHoras(horas: number): string {
  return horas.toLocaleString("es", { maximumFractionDigits: 1 });
}

/** Ancho visual de una barra de progreso, acotado a 0–100 (F-05). */
export function anchoBarra(porcentaje: number): number {
  return Math.min(Math.max(porcentaje, 0), 100);
}

/** 0 → «Sin racha», 1 → «1 día seguido», n → «n días seguidos». */
export function textoRacha(racha: number): string {
  if (racha <= 0) return "Sin racha";
  return racha === 1 ? "1 día seguido" : `${racha} días seguidos`;
}
