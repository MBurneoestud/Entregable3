import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { eliminarPartida, obtenerPartidas } from "../api/partidaApi";
import type { Partida } from "../types";
import { MarcoPagina } from "./MarcoPagina";

function formatearFecha(fecha: string): string {
  const fechaValida = new Date(fecha);
  if (Number.isNaN(fechaValida.getTime())) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(fechaValida);
}

function formatearDuracion(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;

  if (horas === 0) return `${minutosRestantes} min`;
  if (minutosRestantes === 0) return `${horas} h`;
  return `${horas} h ${minutosRestantes} min`;
}

function nombreVideojuego(partida: Partida): string {
  return typeof partida.videojuego === "string"
    ? "Videojuego"
    : partida.videojuego.nombre;
}

export function ListaPartidas() {
  const [parametros, setParametros] = useSearchParams();
  const videojuegoId = parametros.get("videojuegoId") ?? undefined;
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [cargando, setCargando] = useState(true);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let activa = true;
    setCargando(true);
    setError(null);

    obtenerPartidas({ videojuegoId })
      .then((respuesta) => {
        if (activa) setPartidas(respuesta.partidas);
      })
      .catch((err: unknown) => {
        if (activa) {
          setError(err instanceof Error ? err.message : "Error al cargar las partidas.");
        }
      })
      .finally(() => {
        if (activa) setCargando(false);
      });

    return () => {
      activa = false;
    };
  }, [videojuegoId, recarga]);

  async function manejarEliminar(partida: Partida) {
    if (eliminandoId || !window.confirm("¿Seguro que quieres eliminar esta partida?")) return;

    setError(null);
    setEliminandoId(partida._id);
    try {
      await eliminarPartida(partida._id);
      setRecarga((actual) => actual + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la partida.");
    } finally {
      setEliminandoId(null);
    }
  }

  const totalMinutos = partidas.reduce((total, partida) => total + partida.duracionMinutos, 0);

  return (
    <MarcoPagina>
      <div className="space-y-8">
        <section className="panel relative isolate overflow-hidden p-7 sm:p-10">
          <div
            aria-hidden="true"
            className="absolute -right-12 -top-28 -z-10 h-80 w-80 rounded-full bg-gradient-to-br from-earth/15 to-signal/10 blur-2xl"
          />
          <div className="relative max-w-3xl">
            <span className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-earth/25 bg-earth/[0.09] text-xl">
              <span aria-hidden="true">◷</span>
            </span>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-signal">
              Diario de juego
            </p>
            <h1 className="text-3xl font-extrabold tracking-[-0.045em] text-white sm:text-5xl">
              Historial de partidas
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-mist sm:text-base">
              Consulta las sesiones registradas y el tiempo que has dedicado a cada juego.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/" className="secondary-button">
                Volver a videojuegos
              </Link>
              {videojuegoId && (
                <button
                  type="button"
                  onClick={() => setParametros({})}
                  className="secondary-button"
                >
                  Ver todas las partidas
                </button>
              )}
            </div>
          </div>
        </section>

        {error && (
          <div role="alert" className="panel border-rose-400/20 p-6 text-sm text-rose-200">
            No se pudieron completar las partidas: {error}
          </div>
        )}

        {!cargando && !error && partidas.length > 0 && (
          <section aria-label="Resumen de partidas" className="grid gap-4 sm:grid-cols-2">
            <div className="panel p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-mist">
                Partidas registradas
              </p>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-white">
                {partidas.length}
              </p>
            </div>
            <div className="panel p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-mist">
                Tiempo de juego
              </p>
              <p className="mt-3 text-3xl font-extrabold tracking-tight text-white">
                {formatearDuracion(totalMinutos)}
              </p>
            </div>
          </section>
        )}

        {cargando && (
          <div role="status" className="panel flex items-center gap-4 p-8 text-sm text-mist">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-signal shadow-[0_0_18px_rgba(217,164,65,0.8)]" />
            Cargando partidas...
          </div>
        )}

        {!cargando && !error && partidas.length === 0 && (
          <div className="panel p-8 text-center">
            <p className="text-sm text-mist">
              {videojuegoId
                ? "Todavía no hay partidas registradas para este videojuego."
                : "Todavía no hay partidas registradas."}
            </p>
            <Link to="/" className="secondary-button mt-5">
              Explorar videojuegos
            </Link>
          </div>
        )}

        {!cargando && !error && partidas.length > 0 && (
          <div className="panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line bg-white/[0.018]">
                    <th scope="col" className="table-heading">Fecha</th>
                    <th scope="col" className="table-heading">Videojuego</th>
                    <th scope="col" className="table-heading">Duración</th>
                    <th scope="col" className="table-heading">Avance</th>
                    <th scope="col" className="table-heading">Notas</th>
                    <th scope="col" className="table-heading">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {partidas.map((partida) => (
                    <tr key={partida._id} className="transition hover:bg-white/[0.025]">
                      <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-mist">
                        {formatearFecha(partida.fecha)}
                      </td>
                      <td className="px-5 py-4">
                        {typeof partida.videojuego === "string" ? (
                          <span className="font-semibold text-white">{nombreVideojuego(partida)}</span>
                        ) : (
                          <Link
                            to={`/videojuegos/${partida.videojuego._id}`}
                            className="font-bold text-white transition hover:text-signal"
                          >
                            {nombreVideojuego(partida)}
                          </Link>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-stone-300">
                        {formatearDuracion(partida.duracionMinutos)}
                      </td>
                      <td className="px-5 py-4 text-stone-300">
                        {partida.porcentajeAvance == null ? "—" : `${partida.porcentajeAvance}%`}
                      </td>
                      <td className="max-w-xs px-5 py-4 text-stone-300">
                        <span className="block truncate" title={partida.notas}>
                          {partida.notas || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => manejarEliminar(partida)}
                          disabled={eliminandoId !== null}
                          className="inline-flex items-center justify-center rounded-xl border border-rose-400/20 bg-rose-400/[0.05] px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:border-rose-400/50 hover:bg-rose-400/[0.12] disabled:cursor-wait disabled:opacity-50"
                        >
                          {eliminandoId === partida._id ? "Eliminando..." : "Eliminar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MarcoPagina>
  );
}
