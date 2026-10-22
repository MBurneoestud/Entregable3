import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { crearPartida } from "../api/partidaApi";
import { obtenerVideojuegos } from "../api/videojuegoApi";
import type { PartidaFormulario, Videojuego } from "../types";
import { MarcoPagina } from "./MarcoPagina";

const FORMULARIO_VACIO: PartidaFormulario = {
  videojuego: "",
  fecha: "",
  duracionMinutos: 0,
};

export function FormularioPartida() {
  const [parametros] = useSearchParams();
  const navigate = useNavigate();
  const videojuegoIdInicial = parametros.get("videojuegoId") ?? "";

  const [videojuegos, setVideojuegos] = useState<Videojuego[]>([]);
  const [formulario, setFormulario] = useState<PartidaFormulario>({
    ...FORMULARIO_VACIO,
    videojuego: videojuegoIdInicial,
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activa = true;

    obtenerVideojuegos()
      .then(({ videojuegos: lista }) => {
        if (!activa) return;

        setVideojuegos(lista);
        setFormulario((actual) => ({
          ...actual,
          videojuego: lista.some((videojuego) => videojuego._id === videojuegoIdInicial)
            ? videojuegoIdInicial
            : lista[0]?._id ?? "",
        }));
      })
      .catch((err: unknown) => {
        if (activa) {
          setError(err instanceof Error ? err.message : "No se pudieron cargar los videojuegos.");
        }
      })
      .finally(() => {
        if (activa) setCargando(false);
      });

    return () => {
      activa = false;
    };
  }, [videojuegoIdInicial]);

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);

    if (!formulario.videojuego) {
      setError("Selecciona un videojuego para registrar la partida.");
      return;
    }
    if (!formulario.fecha) {
      setError("La fecha de la partida es obligatoria.");
      return;
    }
    if (
      !Number.isInteger(formulario.duracionMinutos) ||
      formulario.duracionMinutos < 0
    ) {
      setError("La duración debe ser un número entero de minutos igual o mayor que 0.");
      return;
    }
    if (
      formulario.porcentajeAvance !== undefined &&
      (formulario.porcentajeAvance < 0 || formulario.porcentajeAvance > 100)
    ) {
      setError("El porcentaje de avance debe estar entre 0 y 100.");
      return;
    }

    const datosAEnviar: PartidaFormulario = {
      ...formulario,
      notas: formulario.notas?.trim() || undefined,
    };

    try {
      setGuardando(true);
      await crearPartida(datosAEnviar);
      navigate("/partidas");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo registrar la partida.");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <MarcoPagina>
        <div role="status" className="panel flex items-center gap-4 p-8 text-sm text-mist">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-signal shadow-[0_0_18px_rgba(217,164,65,0.8)]" />
          Cargando formulario...
        </div>
      </MarcoPagina>
    );
  }

  return (
    <MarcoPagina>
      <div className="mx-auto max-w-3xl">
        <Link
          to="/partidas"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-stone-400 transition hover:text-signal"
        >
          <span aria-hidden="true">←</span>
          Volver a partidas
        </Link>

        <section className="panel overflow-hidden">
          <div className="border-b border-line bg-gradient-to-r from-signal/[0.08] via-transparent to-earth/[0.08] px-6 py-7 sm:px-9">
            <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-signal/20 bg-signal/[0.08] text-lg">
              <span aria-hidden="true">◷</span>
            </span>
            <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-white">
              Registrar partida
            </h1>
            <p className="mt-2 text-sm leading-6 text-mist">
              Añade una sesión a tu historial y actualiza tu progreso en el juego.
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="mx-6 mt-6 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-200 sm:mx-9"
            >
              {error}
            </p>
          )}

          {videojuegos.length === 0 && !error ? (
            <div className="space-y-4 p-6 sm:p-9">
              <p className="text-sm leading-6 text-mist">
                Necesitas añadir un videojuego antes de poder registrar una partida.
              </p>
              <Link to="/videojuegos/nuevo" className="primary-button">
                Añadir videojuego
              </Link>
            </div>
          ) : videojuegos.length > 0 ? (
            <form onSubmit={manejarEnvio} className="space-y-6 p-6 sm:p-9">
              <div>
                <label
                  htmlFor="videojuego"
                  className="mb-2 block text-sm font-semibold text-stone-200"
                >
                  Videojuego <span className="text-signal" aria-hidden="true">*</span>
                </label>
                <select
                  id="videojuego"
                  name="videojuego"
                  className="field"
                  required
                  value={formulario.videojuego}
                  onChange={(evento) =>
                    setFormulario((actual) => ({ ...actual, videojuego: evento.target.value }))
                  }
                >
                  {videojuegos.map((videojuego) => (
                    <option key={videojuego._id} value={videojuego._id}>
                      {videojuego.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="fecha" className="mb-2 block text-sm font-semibold text-stone-200">
                    Fecha <span className="text-signal" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="fecha"
                    name="fecha"
                    className="field"
                    type="date"
                    required
                    value={formulario.fecha}
                    onChange={(evento) =>
                      setFormulario((actual) => ({ ...actual, fecha: evento.target.value }))
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="duracionMinutos"
                    className="mb-2 block text-sm font-semibold text-stone-200"
                  >
                    Duración (minutos) <span className="text-signal" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="duracionMinutos"
                    name="duracionMinutos"
                    className="field"
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={formulario.duracionMinutos}
                    onChange={(evento) =>
                      setFormulario((actual) => ({
                        ...actual,
                        duracionMinutos: Number(evento.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="porcentajeAvance"
                  className="mb-2 block text-sm font-semibold text-stone-200"
                >
                  Avance actual (%)
                </label>
                <input
                  id="porcentajeAvance"
                  name="porcentajeAvance"
                  className="field"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formulario.porcentajeAvance ?? ""}
                  onChange={(evento) =>
                    setFormulario((actual) => ({
                      ...actual,
                      porcentajeAvance:
                        evento.target.value === "" ? undefined : Number(evento.target.value),
                    }))
                  }
                />
              </div>

              <div>
                <label htmlFor="notas" className="mb-2 block text-sm font-semibold text-stone-200">
                  Notas
                </label>
                <textarea
                  id="notas"
                  name="notas"
                  className="field min-h-28 resize-y"
                  rows={4}
                  value={formulario.notas ?? ""}
                  onChange={(evento) =>
                    setFormulario((actual) => ({ ...actual, notas: evento.target.value }))
                  }
                />
              </div>

              <div className="border-t border-line pt-6">
                <button
                  type="submit"
                  disabled={guardando}
                  className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {guardando ? "Guardando..." : "Registrar partida"}
                </button>
              </div>
            </form>
          ) : null}
        </section>
      </div>
    </MarcoPagina>
  );
}
