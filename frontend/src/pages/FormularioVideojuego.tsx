import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { actualizarVideojuego, crearVideojuego, obtenerVideojuegoPorId } from "../api/videojuegoApi";
import {
  GENEROS,
  PLATAFORMAS,
  ESTADOS_VIDEOJUEGO,
  type EstadoVideojuego,
  type Genero,
  type Plataforma,
  type VideojuegoFormulario,
} from "../types";
import { MarcoPagina } from "./MarcoPagina";

const FORMULARIO_VACIO: VideojuegoFormulario = {
  nombre: "",
  logros: [],
};

const etiquetasGenero: Record<Genero, string> = {
  accion: "Acción",
  rol: "Rol",
  estrategia: "Estrategia",
  puzzle: "Puzzle",
  deportes: "Deportes",
  otro: "Otro",
};

const etiquetasEstado: Record<EstadoVideojuego, string> = {
  jugando: "Jugando",
  pausado: "En pausa",
  completado: "Completado",
  abandonado: "Abandonado",
};

export function FormularioVideojuego() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const esEdicion = Boolean(id);

  const [formulario, setFormulario] = useState<VideojuegoFormulario>(FORMULARIO_VACIO);
  const [cargando, setCargando] = useState(esEdicion);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let activa = true;
    obtenerVideojuegoPorId(id)
      .then(({ videojuego }) => {
        if (!activa) return;
        setFormulario({
          nombre: videojuego.nombre,
          plataforma: videojuego.plataforma,
          genero: videojuego.genero,
          estado: videojuego.estado,
          logros: videojuego.logros ?? [],
        });
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

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);

    const nombre = formulario.nombre.trim();
    if (!nombre) {
      setError("El nombre del videojuego es obligatorio.");
      return;
    }

    const datosAEnviar: VideojuegoFormulario = {
      ...formulario,
      nombre,
      logros: (formulario.logros ?? [])
        .map((logro) => ({ ...logro, nombre: logro.nombre.trim() }))
        .filter((logro) => logro.nombre.length > 0),
    };

    try {
      setGuardando(true);
      if (esEdicion && id) {
        await actualizarVideojuego(id, datosAEnviar);
      } else {
        await crearVideojuego(datosAEnviar);
      }
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el videojuego.");
    } finally {
      setGuardando(false);
    }
  }

  function actualizarLogro(
    indice: number,
    cambios: Partial<NonNullable<VideojuegoFormulario["logros"]>[number]>
  ) {
    setFormulario((actual) => ({
      ...actual,
      logros: (actual.logros ?? []).map((logro, posicion) =>
        posicion === indice ? { ...logro, ...cambios } : logro
      ),
    }));
  }

  if (cargando) {
    return (
      <MarcoPagina>
        <div role="status" className="loading-state">
          <span className="loading-dot" />
          Cargando videojuego...
        </div>
      </MarcoPagina>
    );
  }

  return (
    <MarcoPagina>
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="back-link mb-6"
        >
          <span aria-hidden="true">←</span>
          Volver a videojuegos
        </Link>

        <section className="panel overflow-hidden">
          <div className="form-header">
            <span className="form-icon-tile">
              <span aria-hidden="true">🎮</span>
            </span>
            <h1 className="form-title">
              {esEdicion ? "Editar videojuego" : "Añadir videojuego"}
            </h1>
            <p className="form-description">
              Guarda los detalles del juego y registra sus logros en tu colección.
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="form-error mx-6 mt-6 sm:mx-9"
            >
              {error}
            </p>
          )}

          {esEdicion && error && !formulario.nombre ? (
            <div className="p-6 sm:p-9">
              <Link to="/" className="secondary-button">
                Volver a la colección
              </Link>
            </div>
          ) : (
            <form onSubmit={manejarEnvio} className="space-y-6 p-6 sm:p-9">
              <div>
                <label htmlFor="nombre" className="field-label">
                  Nombre del videojuego <span className="text-signal" aria-hidden="true">*</span>
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  className="field"
                  type="text"
                  autoComplete="off"
                  required
                  maxLength={120}
                  value={formulario.nombre}
                  onChange={(evento) =>
                    setFormulario((actual) => ({ ...actual, nombre: evento.target.value }))
                  }
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="plataforma" className="field-label">
                    Plataforma
                  </label>
                  <select
                    id="plataforma"
                    name="plataforma"
                    className="field"
                    value={formulario.plataforma ?? ""}
                    onChange={(evento) =>
                      setFormulario((actual) => ({
                        ...actual,
                        plataforma: (evento.target.value || undefined) as Plataforma | undefined,
                      }))
                    }
                  >
                    <option value="">Sin especificar</option>
                    {PLATAFORMAS.map((plataforma) => (
                      <option key={plataforma} value={plataforma}>
                        {plataforma === "Movil" ? "Móvil" : plataforma}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="genero" className="field-label">
                    Género
                  </label>
                  <select
                    id="genero"
                    name="genero"
                    className="field"
                    value={formulario.genero ?? ""}
                    onChange={(evento) =>
                      setFormulario((actual) => ({
                        ...actual,
                        genero: (evento.target.value || undefined) as Genero | undefined,
                      }))
                    }
                  >
                    <option value="">Sin especificar</option>
                    {GENEROS.map((genero) => (
                      <option key={genero} value={genero}>
                        {etiquetasGenero[genero]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="estado" className="field-label">
                    Estado
                  </label>
                  <select
                    id="estado"
                    name="estado"
                    className="field"
                    value={formulario.estado ?? ""}
                    onChange={(evento) =>
                      setFormulario((actual) => ({
                        ...actual,
                        estado: (evento.target.value || undefined) as EstadoVideojuego | undefined,
                      }))
                    }
                  >
                    <option value="">Sin especificar</option>
                    {ESTADOS_VIDEOJUEGO.map((estado) => (
                      <option key={estado} value={estado}>
                        {etiquetasEstado[estado]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <fieldset className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <legend className="text-sm font-semibold text-stone-200">Logros</legend>
                    <p className="mt-1 text-xs text-mist">Los nombres vacíos no se guardarán.</p>
                  </div>
                  <button
                    type="button"
                    className="secondary-button !px-3 !py-2 !text-xs"
                    onClick={() =>
                      setFormulario((actual) => ({
                        ...actual,
                        logros: [...(actual.logros ?? []), { nombre: "", obtenido: false }],
                      }))
                    }
                  >
                    Añadir logro
                  </button>
                </div>

                {(formulario.logros ?? []).length === 0 ? (
                  <p className="empty-state">
                    Todavía no has añadido logros.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {(formulario.logros ?? []).map((logro, indice) => (
                      <li
                        key={indice}
                        className="grid gap-3 rounded-xl border border-line bg-white/[0.02] p-3 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                      >
                        <label className="sr-only" htmlFor={`logro-${indice}`}>
                          Nombre del logro {indice + 1}
                        </label>
                        <input
                          id={`logro-${indice}`}
                          className="field"
                          type="text"
                          maxLength={120}
                          placeholder="Nombre del logro"
                          value={logro.nombre}
                          onChange={(evento) =>
                            actualizarLogro(indice, { nombre: evento.target.value })
                          }
                        />
                        <label className="flex items-center gap-2 text-sm text-stone-300">
                          <input
                            type="checkbox"
                            checked={logro.obtenido}
                            onChange={(evento) =>
                              actualizarLogro(indice, { obtenido: evento.target.checked })
                            }
                            className="checkbox-control"
                          />
                          Obtenido
                        </label>
                        <button
                          type="button"
                          className="rounded-lg px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-400/10"
                          aria-label={`Eliminar logro ${indice + 1}`}
                          onClick={() =>
                            setFormulario((actual) => ({
                              ...actual,
                              logros: (actual.logros ?? []).filter((_, posicion) => posicion !== indice),
                            }))
                          }
                        >
                          Eliminar
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </fieldset>

              <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
                <Link to="/" className="secondary-button justify-center">
                  Cancelar
                </Link>
                <button type="submit" disabled={guardando} className="primary-button sm:ml-auto">
                  {guardando
                    ? "Guardando..."
                    : esEdicion
                      ? "Guardar cambios"
                      : "Crear videojuego"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </MarcoPagina>
  );
}
