/**
 * dominio/partidas.ts
 * -------------------
 * Orden de partidas «más reciente primero» y avance actual (B-16), sin
 * acceso a la base de datos para que resumen y progreso compartan criterio.
 */

export interface PartidaOrdenable {
  fecha: Date;
  createdAt: Date;
  porcentajeAvance?: number | null;
}

/** Orden de Mongoose equivalente a `ordenarPartidasRecientes`. */
export const ORDEN_RECIENTES = { fecha: -1, createdAt: -1 } as const;

/** Copia ordenada por `fecha` desc. y, a igual fecha, por `createdAt` desc. */
export function ordenarPartidasRecientes<T extends PartidaOrdenable>(
  partidas: readonly T[],
): T[] {
  return [...partidas].sort(
    (a, b) =>
      b.fecha.getTime() - a.fecha.getTime() ||
      b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

/** `porcentajeAvance` de la partida más reciente, o `null` si no hay partidas o no lo indica. */
export function avanceActual(
  partidas: readonly PartidaOrdenable[],
): number | null {
  return ordenarPartidasRecientes(partidas)[0]?.porcentajeAvance ?? null;
}
