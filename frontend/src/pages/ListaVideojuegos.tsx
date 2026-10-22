import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerVideojuegos } from "../api/videojuegoApi";
import {
  ESTADOS_VIDEOJUEGO,
  GENEROS,
  PLATAFORMAS,
  type EstadoVideojuego,
  type Genero,
  type Plataforma,
  type Videojuego,
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

export function ListaVideojuegos() {
  const [videojuegos, setVideojuegos] = useState<Videojuego[]>([]);
  const [filtroPlataforma, setFiltroPlataforma] = useState<Plataforma | "">("");
  const [filtroGenero, setFiltroGenero] = useState<Genero | "">("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoVideojuego | "">("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activa = true;
    setCargando(true);
    setError(null);

    obtenerVideojuegos({
      plataforma: filtroPlataforma || undefined,
      genero: filtroGenero || undefined,
      estado: filtroEstado || undefined,
    })
      .then((respuesta) => {
        if (activa) setVideojuegos(respuesta.videojuegos);
      })
      .catch((err: unknown) => {
        if (activa) {
          setError(err instanceof Error ? err.message : "Error al cargar los videojuegos.");
        }
      })
      .finally(() => {
        if (activa) setCargando(false);
      });

    return () => {
      activa = false;
    };
  }, [filtroPlataforma, filtroGenero, filtroEstado]);

  return (
    <MarcoPagina>
      <div className="space-y-8">
        <section className="page-hero p-7 sm:p-10">
          <div
            aria-hidden="true"
            className="absolute -right-10 -top-32 -z-10 h-80 w-80 rounded-full border border-signal/10 bg-gradient-to-br from-signal/10 to-earth/10 blur-[1px]"
          />
          <div className="max-w-3xl">
            <span className="icon-tile">
              <span aria-hidden="true">🎮</span>
            </span>
            <h1 className="page-title">
              Mi colección de videojuegos
            </h1>
            <p className="page-description">
              Organiza tu biblioteca y lleva un registro de tu progreso.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/videojuegos/nuevo" className="primary-button">
                Añadir videojuego
              </Link>
              <Link to="/partidas" className="secondary-button">
                Ver todas las partidas
              </Link>
            </div>
          </div>
        </section>

        <section
          aria-label="Filtros de videojuegos"
          className="panel grid gap-5 p-5 sm:grid-cols-3 sm:px-7"
        >
          <div>
            <label htmlFor="filtro-plataforma" className="field-label">
              Plataforma
            </label>
            <select
              id="filtro-plataforma"
              className="field"
              value={filtroPlataforma}
              onChange={(evento) => setFiltroPlataforma(evento.target.value as Plataforma | "")}
            >
              <option value="">Todas las plataformas</option>
              {PLATAFORMAS.map((plataforma) => (
                <option key={plataforma} value={plataforma}>
                  {plataforma === "Movil" ? "Móvil" : plataforma}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filtro-genero" className="field-label">
              Género
            </label>
            <select
              id="filtro-genero"
              className="field"
              value={filtroGenero}
              onChange={(evento) => setFiltroGenero(evento.target.value as Genero | "")}
            >
              <option value="">Todos los géneros</option>
              {GENEROS.map((genero) => (
                <option key={genero} value={genero}>
                  {etiquetasGenero[genero]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filtro-estado" className="field-label">
              Estado
            </label>
            <select
              id="filtro-estado"
              className="field"
              value={filtroEstado}
              onChange={(evento) => setFiltroEstado(evento.target.value as EstadoVideojuego | "")}
            >
              <option value="">Todos los estados</option>
              {ESTADOS_VIDEOJUEGO.map((estado) => (
                <option key={estado} value={estado}>
                  {etiquetasEstado[estado]}
                </option>
              ))}
            </select>
          </div>
        </section>

        {cargando && (
          <div role="status" className="loading-state">
            <span className="loading-dot" />
            Cargando videojuegos...
          </div>
        )}

        {!cargando && error && (
          <div role="alert" className="error-state">
            No se pudieron cargar los videojuegos: {error}
          </div>
        )}

        {!cargando && !error && videojuegos.length === 0 && (
          <div className="panel p-8 text-center text-sm text-mist">
            No hay videojuegos que coincidan con los filtros.
          </div>
        )}

        {!cargando && !error && videojuegos.length > 0 && (
          <div className="panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line bg-white/[0.018]">
                    <th scope="col" className="table-heading">Videojuego</th>
                    <th scope="col" className="table-heading">Plataforma</th>
                    <th scope="col" className="table-heading">Género</th>
                    <th scope="col" className="table-heading">Estado</th>
                    <th scope="col" className="table-heading">Logros</th>
                    <th scope="col" className="table-heading">Partidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {videojuegos.map((videojuego) => {
                    const logrosObtenidos = videojuego.logros.filter((logro) => logro.obtenido).length;

                    return (
                      <tr key={videojuego._id} className="transition hover:bg-white/[0.025]">
                        <th scope="row" className="px-5 py-4 text-left font-bold text-white">
                          {videojuego.nombre}
                        </th>
                        <td className="px-5 py-4 text-stone-300">
                          {videojuego.plataforma === "Movil"
                            ? "Móvil"
                            : videojuego.plataforma ?? "Sin especificar"}
                        </td>
                        <td className="px-5 py-4 text-stone-300">
                          {videojuego.genero ? etiquetasGenero[videojuego.genero] : "Sin especificar"}
                        </td>
                        <td className="px-5 py-4">
                          {videojuego.estado ? (
                            <span className="status-badge status-badge-session">
                              {etiquetasEstado[videojuego.estado]}
                            </span>
                          ) : (
                            <span className="text-stone-400">Sin especificar</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-stone-300">
                          {logrosObtenidos} / {videojuego.logros.length}
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            to={`/partidas?videojuegoId=${encodeURIComponent(videojuego._id)}`}
                            className="secondary-button !px-3 !py-1.5 !text-xs"
                          >
                            Ver partidas
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MarcoPagina>
  );
}
