import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  actualizarEstadoLogro,
  eliminarVideojuego,
  obtenerPartidasDeVideojuego,
  obtenerResumenVideojuego,
  obtenerVideojuegoPorId,
} from "../api/videojuegoApi";
import type {
  EstadoVideojuego,
  Genero,
  Partida,
  ResumenVideojuego,
  Videojuego,
} from "../types";
import { MarcoPagina } from "./MarcoPagina";

const etiquetasEstado: Record<EstadoVideojuego, string> = {
  jugando: "Jugando",
  pausado: "En pausa",
  completado: "Completado",
  abandonado: "Abandonado",
};

const etiquetasGenero: Record<Genero, string> = {
  accion: "Acción",
  rol: "Rol",
  estrategia: "Estrategia",
  puzzle: "Puzzle",
  deportes: "Deportes",
  otro: "Otro",
};

function formatearFecha(fecha: string): string {
  const fechaValida = new Date(fecha);
  if (Number.isNaN(fechaValida.getTime())) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(fechaValida);
}

export function DetalleVideojuego() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [videojuego, setVideojuego] = useState<Videojuego | null>(null);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [resumen, setResumen] = useState<ResumenVideojuego | null>(null);
  const [cargando, setCargando] = useState(true);
  const [eliminando, setEliminando] = useState(false);
  const [actualizandoLogro, setActualizandoLogro] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No se especificó el videojuego que se quiere consultar.");
      setCargando(false);
      return;
    }

    let activa = true;
    setCargando(true);
    setError(null);

    Promise.all([
      obtenerVideojuegoPorId(id),
      obtenerPartidasDeVideojuego(id),
      obtenerResumenVideojuego(id),
    ])
      .then(([respuestaVideojuego, respuestaPartidas, respuestaResumen]) => {
        if (!activa) return;
        setVideojuego(respuestaVideojuego.videojuego);
        setPartidas(respuestaPartidas.partidas);
        setResumen(respuestaResumen);
      })
      .catch((err: unknown) => {
        if (activa) {
          setError(err instanceof Error ? err.message : "No se pudo cargar el videojuego.");
        }
      })
      .finally(() => {
        if (activa) setCargando(false);
      });

    return () => {
      activa = false;
    };
  }, [id]);

  async function manejarEliminar() {
    if (!id || !videojuego || eliminando) return;
    if (!window.confirm(`¿Seguro que quieres eliminar "${videojuego.nombre}"?`)) return;

    setError(null);
    setEliminando(true);
    try {
      await eliminarVideojuego(id);
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el videojuego.");
      setEliminando(false);
    }
  }

  async function manejarCambioLogro(indice: number, obtenido: boolean) {
    if (!id || actualizandoLogro !== null) return;

    setError(null);
    setActualizandoLogro(indice);
    try {
      const respuesta = await actualizarEstadoLogro(id, indice, obtenido);
      setVideojuego(respuesta.videojuego);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el logro.");
    } finally {
      setActualizandoLogro(null);
    }
  }

  if (cargando) {
    return (
      <MarcoPagina>
        <div role="status" className="panel flex items-center gap-4 p-8 text-sm text-mist">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-signal shadow-[0_0_18px_rgba(217,164,65,0.8)]" />
          Cargando videojuego...
        </div>
      </MarcoPagina>
    );
  }

  if (error && !videojuego) {
    return (
      <MarcoPagina>
        <div className="space-y-5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-400 transition hover:text-signal"
          >
            <span aria-hidden="true">←</span>
            Volver a videojuegos
          </Link>
          <div role="alert" className="panel border-rose-400/20 p-6 text-sm text-rose-200">
            No se pudo cargar el videojuego: {error}
          </div>
        </div>
      </MarcoPagina>
    );
  }

  if (!videojuego) {
    return (
      <MarcoPagina>
        <div className="panel p-8 text-sm text-mist">No se encontró el videojuego.</div>
      </MarcoPagina>
    );
  }

  const logrosObtenidos = videojuego.logros.filter((logro) => logro.obtenido).length;

  return (
    <MarcoPagina>
      <div className="space-y-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-400 transition hover:text-signal"
        >
          <span aria-hidden="true">←</span>
          Volver a videojuegos
        </Link>

        {error && (
          <div role="alert" className="panel border-rose-400/20 p-5 text-sm text-rose-200">
            {error}
          </div>
        )}

        <section className="panel relative isolate overflow-hidden p-7 sm:p-10">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-24 -z-10 h-80 w-80 rounded-full bg-gradient-to-br from-signal/10 to-earth/15 blur-2xl"
          />
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-signal/20 bg-signal/[0.08] text-xl">
                <span aria-hidden="true">🎮</span>
              </span>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-signal">
                Detalle del videojuego
              </p>
              <h1 className="text-4xl font-extrabold tracking-[-0.045em] text-white sm:text-5xl">
                {videojuego.nombre}
              </h1>
              <div className="mt-5 flex flex-wrap gap-2">
                {videojuego.genero && (
                  <span className="rounded-full border border-earth/25 bg-earth/[0.09] px-3 py-1.5 text-xs font-semibold text-earth-light">
                    {etiquetasGenero[videojuego.genero]}
                  </span>
                )}
                {videojuego.estado && (
                  <span className="rounded-full border border-signal/20 bg-signal/[0.06] px-3 py-1.5 text-xs font-semibold text-signal">
                    {etiquetasEstado[videojuego.estado]}
                  </span>
                )}
                {videojuego.plataforma && (
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-stone-300">
                    {videojuego.plataforma === "Movil" ? "Móvil" : videojuego.plataforma}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to={`/videojuegos/${videojuego._id}/editar`} className="secondary-button">
                Editar
              </Link>
              <button
                type="button"
                onClick={manejarEliminar}
                disabled={eliminando}
                className="inline-flex items-center justify-center rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-2.5 text-sm font-semibold text-rose-200 transition hover:border-rose-400/50 hover:bg-rose-400/[0.12] disabled:cursor-wait disabled:opacity-60"
              >
                {eliminando ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </section>

        <section aria-label="Resumen de actividad" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-mist">Partidas</p>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-white">
              {resumen?.totalPartidas ?? partidas.length}
            </p>
          </div>
          <div className="panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-mist">Horas jugadas</p>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-white">
              {(resumen?.horasTotales ?? 0).toLocaleString("es", { maximumFractionDigits: 1 })}
              <span className="ml-2 text-sm font-medium text-mist">h</span>
            </p>
          </div>
          <div className="panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-mist">Avance actual</p>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-white">
              {resumen?.porcentajeAvanceActual == null ? "—" : `${resumen.porcentajeAvanceActual}%`}
            </p>
          </div>
          <div className="panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-mist">Última partida</p>
            <p className="mt-3 text-lg font-bold text-white">
              {resumen?.ultimaPartida ? formatearFecha(resumen.ultimaPartida) : "Sin partidas"}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="panel p-6 sm:p-8">
            <h2 className="text-xl font-bold tracking-tight text-white">Información</h2>
            <dl className="mt-4 divide-y divide-line">
              <div className="flex items-start justify-between gap-4 py-4">
                <dt className="text-sm text-mist">Plataforma</dt>
                <dd className="text-right text-sm font-semibold text-white">
                  {videojuego.plataforma === "Movil"
                    ? "Móvil"
                    : videojuego.plataforma ?? "Sin especificar"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-4">
                <dt className="text-sm text-mist">Género</dt>
                <dd className="text-right text-sm font-semibold text-white">
                  {videojuego.genero ? etiquetasGenero[videojuego.genero] : "Sin especificar"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-4">
                <dt className="text-sm text-mist">Estado</dt>
                <dd className="text-right text-sm font-semibold text-white">
                  {videojuego.estado ? etiquetasEstado[videojuego.estado] : "Sin especificar"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-4">
                <dt className="text-sm text-mist">Añadido</dt>
                <dd className="text-right text-sm font-semibold text-white">
                  {formatearFecha(videojuego.createdAt)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="panel p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Logros</h2>
                <p className="mt-1 text-sm text-mist">
                  {logrosObtenidos} de {videojuego.logros.length} obtenidos
                </p>
              </div>
              <Link
                to={`/videojuegos/${videojuego._id}/editar`}
                className="secondary-button shrink-0 !text-xs"
              >
                Gestionar logros
              </Link>
            </div>
            {videojuego.logros.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-line px-5 py-8 text-center text-sm text-mist">
                Todavía no hay logros registrados para este videojuego.
              </p>
            ) : (
              <ul className="mt-5 divide-y divide-line">
                {videojuego.logros.map((logro, indice) => (
                  <li key={`${logro.nombre}-${indice}`} className="flex items-center gap-3 py-3">
                    <input
                      id={`logro-${indice}`}
                      type="checkbox"
                      checked={logro.obtenido}
                      disabled={actualizandoLogro !== null}
                      onChange={(evento) => manejarCambioLogro(indice, evento.target.checked)}
                      className="h-4 w-4 shrink-0 accent-amber-400 disabled:cursor-wait"
                    />
                    <label
                      htmlFor={`logro-${indice}`}
                      className={`flex-1 text-sm ${
                        logro.obtenido ? "text-stone-300" : "text-white"
                      }`}
                    >
                      {logro.nombre}
                    </label>
                    {logro.obtenido && (
                      <span className="text-xs font-semibold text-signal">Obtenido</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="panel p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Historial de partidas</h2>
              <p className="mt-1 text-sm text-mist">Sesiones registradas para este videojuego.</p>
            </div>
            <Link
              to={`/partidas?videojuegoId=${encodeURIComponent(videojuego._id)}`}
              className="secondary-button shrink-0 !text-xs"
            >
              Ver todas las partidas
            </Link>
          </div>

          {partidas.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-line px-5 py-8 text-center text-sm text-mist">
              Todavía no hay partidas registradas para este videojuego.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-line">
              {partidas.map((partida) => (
                <li key={partida._id} className="flex gap-4 py-5">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-signal shadow-[0_0_12px_rgba(217,164,65,0.7)]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">{formatearFecha(partida.fecha)}</p>
                      <span className="text-xs font-semibold text-signal">
                        {partida.duracionMinutos} min
                      </span>
                    </div>
                    {partida.porcentajeAvance != null && (
                      <p className="mt-1 text-sm text-mist">
                        Avance al finalizar: {partida.porcentajeAvance}%
                      </p>
                    )}
                    {partida.notas && (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-300">
                        {partida.notas}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </MarcoPagina>
  );
}
