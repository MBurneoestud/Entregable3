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
  if (partida.videojuego === null) return "Videojuego eliminado";
  return typeof partida.videojuego === "string" ? "Videojuego" : partida.videojuego.nombre;
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
        <section className="page-hero p-7 sm:p-10">
          <div
            aria-hidden="true"
            className="absolute -right-12 -top-28 -z-10 h-80 w-80 rounded-full bg-gradient-to-br from-earth/15 to-signal/10 blur-2xl"
          />
          <div className="relative max-w-3xl">
            <span className="icon-tile-session">
              <span aria-hidden="true">◷</span>
            </span>
            <p className="eyebrow">
              Diario de juego
            </p>
            <h1 className="page-title">
              Historial de partidas
            </h1>
            <p className="page-description">
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
          <div role="alert" className="error-state">
            No se pudieron completar las partidas: {error}
          </div>
        )}

        {!cargando && !error && partidas.length > 0 && (
          <section aria-label="Resumen de partidas" className="grid gap-4 sm:grid-cols-2">
            <div className="panel p-5">
              <p className="stat-label">
                Partidas registradas
              </p>
              <p className="stat-value">
                {partidas.length}
              </p>
            </div>
            <div className="panel p-5">
              <p className="stat-label">
                Tiempo de juego
              </p>
              <p className="stat-value">
                {formatearDuracion(totalMinutos)}
              </p>
            </div>
          </section>
        )}

        {cargando && (
          <div role="status" className="loading-state">
            <span className="loading-dot" />
            Cargando partidas...
          </div>
        )}

        {!cargando && !error && partidas.length === 0 && (
          <div className="panel p-8 text-center">
            <p className="empty-state">
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
                        {partida.videojuego && typeof partida.videojuego !== "string" ? (
                          <Link
                            to={`/videojuegos/${partida.videojuego._id}`}
                            className="font-bold text-white transition hover:text-signal"
                          >
                            {nombreVideojuego(partida)}
                          </Link>
                        ) : (
                          <span className="font-semibold text-white">{nombreVideojuego(partida)}</span>
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
                          className="danger-button !min-h-8 !px-3 !py-1.5 !text-xs"
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
