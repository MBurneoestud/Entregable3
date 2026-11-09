import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  agregarHito,
  eliminarHito,
  fijarMeta,
  obtenerProgreso,
  quitarMeta,
} from "../api/metasApi";
import type {
  EstadoSemana,
  EstadoVideojuego,
  HitoProgreso,
  ProgresoSemanal,
} from "../types";
import {
  anchoBarra,
  formatearDia,
  formatearHoras,
  formatearInstante,
  textoRacha,
} from "../utils/formato";

// Spec: docs/specs/E2-frontend-meta-semanal.md (E2-T10 a E2-T12).
// F-03: este componente no calcula progreso, racha, semanas ni estado de hitos;
// solo formatea lo que devuelve /progreso-semanal.

const MAX_HITOS = 5;
const TEXTO_BLOQUEADO =
  "No se puede fijar una meta en un juego completado o abandonado";
const AVISO_ARCHIVADO =
  "La meta actual quedará archivada y la nueva se aplicará a toda esta semana";

const etiquetasSemana: Record<EstadoSemana, string> = {
  cumplida: "Cumplida",
  no_cumplida: "No cumplida",
  sin_meta: "Sin meta",
};

function mensajeDeError(err: unknown, porDefecto: string): string {
  return err instanceof Error ? err.message : porDefecto;
}

function textoDias(dias: number): string {
  return dias === 1 ? "1 día" : `${dias} días`;
}

type Props = {
  videojuegoId: string;
  estado?: EstadoVideojuego;
  /** F-19: al cambiar, la sección vuelve a pedir el progreso (p. ej. tras eliminar una partida). */
  recarga?: number;
};

export function MetaSemanal({ videojuegoId, estado, recarga = 0 }: Props) {
  const [progreso, setProgreso] = useState<ProgresoSemanal | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const montado = useRef(true);

  const [editando, setEditando] = useState(false);
  const [guardandoMeta, setGuardandoMeta] = useState(false);
  const [quitandoMeta, setQuitandoMeta] = useState(false);
  const [errorMeta, setErrorMeta] = useState<string | null>(null);

  const [descripcionHito, setDescripcionHito] = useState("");
  const [porcentajeHito, setPorcentajeHito] = useState("");
  const [agregandoHito, setAgregandoHito] = useState(false);
  const [eliminandoHito, setEliminandoHito] = useState<string | null>(null);
  const [errorHito, setErrorHito] = useState<string | null>(null);

  const bloqueado = estado === "completado" || estado === "abandonado";

  // F-10: se vuelve a pedir el progreso tras cada cambio y al montar el detalle.
  const recargar = useCallback(async () => {
    try {
      const datos = await obtenerProgreso(videojuegoId);
      if (montado.current) {
        setProgreso(datos);
        setError(null);
      }
    } catch (err: unknown) {
      if (montado.current) {
        setError(mensajeDeError(err, "No se pudo cargar la meta semanal."));
      }
    }
  }, [videojuegoId]);

  useEffect(() => {
    montado.current = true;
    setCargando(true);
    setError(null);
    recargar().finally(() => {
      if (montado.current) setCargando(false);
    });
    return () => {
      montado.current = false;
    };
  }, [recargar]);

  // F-19: el detalle avisa con `recarga` cuando cambian sus partidas.
  useEffect(() => {
    if (recarga > 0) void recargar();
  }, [recarga, recargar]);

  async function manejarFijarMeta(
    horasSemanales: number,
    diasPorSemana: number,
  ) {
    setErrorMeta(null);
    setGuardandoMeta(true);
    try {
      await fijarMeta(videojuegoId, { horasSemanales, diasPorSemana });
      setEditando(false);
      await recargar();
    } catch (err: unknown) {
      setErrorMeta(mensajeDeError(err, "No se pudo guardar la meta."));
    } finally {
      if (montado.current) setGuardandoMeta(false);
    }
  }

  async function manejarQuitarMeta() {
    if (quitandoMeta) return;
    if (
      !window.confirm(
        "¿Seguro que quieres quitar la meta semanal? Quedará archivada.",
      )
    )
      return;

    setErrorMeta(null);
    setQuitandoMeta(true);
    try {
      await quitarMeta(videojuegoId);
      setEditando(false);
      await recargar();
    } catch (err: unknown) {
      setErrorMeta(mensajeDeError(err, "No se pudo quitar la meta."));
    } finally {
      if (montado.current) setQuitandoMeta(false);
    }
  }

  async function manejarAgregarHito(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrorHito(null);
    setAgregandoHito(true);
    try {
      await agregarHito(videojuegoId, {
        descripcion: descripcionHito,
        porcentajeObjetivo: Number(porcentajeHito),
      });
      setDescripcionHito("");
      setPorcentajeHito("");
      await recargar();
    } catch (err: unknown) {
      setErrorHito(mensajeDeError(err, "No se pudo añadir el hito."));
    } finally {
      if (montado.current) setAgregandoHito(false);
    }
  }

  async function manejarEliminarHito(hito: HitoProgreso) {
    if (eliminandoHito) return;
    if (
      !window.confirm(
        `¿Seguro que quieres eliminar el hito "${hito.descripcion}"?`,
      )
    )
      return;

    setErrorHito(null);
    setEliminandoHito(hito._id);
    try {
      await eliminarHito(videojuegoId, hito._id);
      await recargar();
    } catch (err: unknown) {
      setErrorHito(mensajeDeError(err, "No se pudo eliminar el hito."));
    } finally {
      if (montado.current) setEliminandoHito(null);
    }
  }

  const meta = progreso?.meta ?? null;

  return (
    <section aria-label="Meta semanal" className="panel p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="section-title">Meta semanal</h2>
            {meta && progreso?.cumplida != null && (
              <span
                className={`status-badge ${
                  progreso.cumplida
                    ? "status-badge-progress"
                    : "status-badge-neutral"
                }`}
              >
                {progreso.cumplida ? "Meta cumplida" : "En curso"}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-mist">
            {meta
              ? `Meta: ${formatearHoras(meta.horasSemanales)} h y ${textoDias(
                  meta.diasPorSemana,
                )} por semana`
              : "Elige cuántas horas y días quieres jugar cada semana."}
          </p>
        </div>
        {meta && !editando && (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setErrorMeta(null);
                setEditando(true);
              }}
              disabled={bloqueado}
              className="secondary-button shrink-0 !text-xs"
            >
              Cambiar meta
            </button>
            <button
              type="button"
              onClick={manejarQuitarMeta}
              disabled={quitandoMeta}
              className="danger-button shrink-0 !text-xs"
            >
              {quitandoMeta ? "Quitando..." : "Quitar meta"}
            </button>
          </div>
        )}
      </div>

      {cargando ? (
        <div role="status" className="loading-state mt-6">
          <span aria-hidden="true" className="loading-dot" />
          Cargando meta semanal...
        </div>
      ) : error || !progreso ? (
        <div role="alert" className="error-state mt-6">
          No se pudo cargar la meta semanal: {error ?? "respuesta vacía."}
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {!meta && (
            <div className="empty-state">
              <p>Aún no tienes una meta para este juego</p>
              <FormularioMeta
                horasIniciales=""
                diasIniciales=""
                textoBoton="Fijar meta"
                deshabilitado={bloqueado}
                enviando={guardandoMeta}
                error={errorMeta}
                onEnviar={manejarFijarMeta}
              />
            </div>
          )}

          {meta && bloqueado && (
            <p className="text-sm text-mist">{TEXTO_BLOQUEADO}</p>
          )}

          {meta && editando && (
            <div className="rounded-xl border border-line p-5">
              <p className="form-description !mt-0">{AVISO_ARCHIVADO}</p>
              <FormularioMeta
                horasIniciales={String(meta.horasSemanales)}
                diasIniciales={String(meta.diasPorSemana)}
                textoBoton="Guardar meta"
                deshabilitado={bloqueado}
                enviando={guardandoMeta}
                error={errorMeta}
                onEnviar={manejarFijarMeta}
                onCancelar={() => {
                  setErrorMeta(null);
                  setEditando(false);
                }}
              />
            </div>
          )}

          {meta && !editando && errorMeta && (
            <p role="alert" className="form-error">
              {errorMeta}
            </p>
          )}

          {meta && (
            <div className="grid gap-6 sm:grid-cols-2">
              <BarraProgreso
                etiqueta="Horas"
                descripcion="Progreso de horas"
                texto={`${formatearHoras(progreso.horasSemana)} de ${formatearHoras(
                  meta.horasSemanales,
                )} h`}
                porcentaje={progreso.porcentajeHoras ?? 0}
              />
              <BarraProgreso
                etiqueta="Días"
                descripcion="Progreso de días"
                texto={`${progreso.diasJugadosSemana} de ${textoDias(meta.diasPorSemana)}`}
                porcentaje={progreso.porcentajeDias ?? 0}
              />
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[0.8fr_2.2fr]">
            <div>
              <p className="stat-label">Racha</p>
              <p className="stat-value">{textoRacha(progreso.rachaActual)}</p>
              <p className="mt-1 text-sm text-mist">
                Mejor racha: {textoRacha(progreso.mejorRacha)}
              </p>
            </div>

            <div>
              <p className="stat-label">Últimas 4 semanas</p>
              <ul className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {progreso.ultimas4.map((semana) => (
                  <li
                    key={semana.inicio}
                    className="rounded-xl border border-line p-4"
                  >
                    <p className="text-sm font-semibold text-copy">
                      {formatearDia(semana.inicio)} – {formatearDia(semana.fin)}
                    </p>
                    <span
                      className={`status-badge mt-2 ${
                        semana.estado === "cumplida"
                          ? "status-badge-progress"
                          : "status-badge-neutral"
                      }`}
                    >
                      {etiquetasSemana[semana.estado]}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-mist">
                {progreso.semanasConMeta === 0
                  ? "Todavía no hay semanas completas con meta"
                  : `${progreso.semanasCumplidas} de ${progreso.semanasConMeta} semanas con meta cumplidas`}
              </p>
            </div>
          </div>

          {meta && (
            <div>
              <h3 className="section-title !text-lg">Hitos</h3>
              {progreso.hitos.length === 0 ? (
                <p className="empty-state mt-4">
                  Todavía no hay hitos para esta meta.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-line">
                  {progreso.hitos.map((hito) => (
                    <li
                      key={hito._id}
                      className="flex flex-wrap items-center gap-4 py-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-copy">
                          {hito.descripcion}
                        </p>
                        <p className="mt-1 text-sm text-mist">
                          Objetivo: {hito.porcentajeObjetivo} %
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          hito.alcanzado ? "text-signal" : "text-mist"
                        }`}
                      >
                        {hito.alcanzado
                          ? hito.alcanzadoEn
                            ? `Alcanzado el ${formatearInstante(hito.alcanzadoEn)}`
                            : "Alcanzado"
                          : "Pendiente"}
                      </span>
                      <button
                        type="button"
                        onClick={() => manejarEliminarHito(hito)}
                        disabled={eliminandoHito !== null}
                        className="danger-button !text-xs"
                      >
                        {eliminandoHito === hito._id
                          ? "Eliminando..."
                          : "Eliminar"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <form onSubmit={manejarAgregarHito} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
                  <div>
                    <label htmlFor="hito-descripcion" className="field-label">
                      Descripción del hito
                    </label>
                    <input
                      id="hito-descripcion"
                      type="text"
                      required
                      value={descripcionHito}
                      onChange={(evento) =>
                        setDescripcionHito(evento.target.value)
                      }
                      disabled={
                        progreso.hitos.length >= MAX_HITOS || agregandoHito
                      }
                      placeholder="Llegar al 50 %"
                      className="field"
                    />
                  </div>
                  <div>
                    <label htmlFor="hito-porcentaje" className="field-label">
                      Porcentaje objetivo
                    </label>
                    <input
                      id="hito-porcentaje"
                      type="number"
                      required
                      min="1"
                      max="100"
                      step="1"
                      value={porcentajeHito}
                      onChange={(evento) =>
                        setPorcentajeHito(evento.target.value)
                      }
                      disabled={
                        progreso.hitos.length >= MAX_HITOS || agregandoHito
                      }
                      className="field"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={
                      progreso.hitos.length >= MAX_HITOS || agregandoHito
                    }
                    className="secondary-button"
                  >
                    {agregandoHito ? "Guardando..." : "Añadir hito"}
                  </button>
                </div>
                <p className="text-xs text-mist">
                  Máximo {MAX_HITOS} hitos por meta.
                </p>
                {errorHito && (
                  <p role="alert" className="form-error">
                    {errorHito}
                  </p>
                )}
              </form>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

type BarraProgresoProps = {
  etiqueta: string;
  descripcion: string;
  texto: string;
  porcentaje: number;
};

function BarraProgreso({
  etiqueta,
  descripcion,
  texto,
  porcentaje,
}: BarraProgresoProps) {
  const ancho = anchoBarra(porcentaje);
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="stat-label">{etiqueta}</p>
        {/* F-05: el texto muestra el porcentaje real, aunque supere el 100 %. */}
        <p className="text-sm font-semibold text-copy">
          {texto} · {porcentaje} %
        </p>
      </div>
      <div
        role="progressbar"
        aria-label={descripcion}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={ancho}
        className="progress-track"
      >
        <div className="progress-fill" style={{ width: `${ancho}%` }} />
      </div>
    </div>
  );
}

type FormularioMetaProps = {
  horasIniciales: string;
  diasIniciales: string;
  textoBoton: string;
  deshabilitado: boolean;
  enviando: boolean;
  error: string | null;
  onEnviar: (horasSemanales: number, diasPorSemana: number) => void;
  onCancelar?: () => void;
};

function FormularioMeta({
  horasIniciales,
  diasIniciales,
  textoBoton,
  deshabilitado,
  enviando,
  error,
  onEnviar,
  onCancelar,
}: FormularioMetaProps) {
  const [horas, setHoras] = useState(horasIniciales);
  const [dias, setDias] = useState(diasIniciales);
  const inactivo = deshabilitado || enviando;

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    // La validación definitiva la hace el backend (F-15): no se bloquea aquí.
    onEnviar(Number(horas), Number(dias));
  }

  return (
    <form onSubmit={manejarEnvio} className="mt-5 space-y-4 text-left">
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor="meta-horas" className="field-label">
            Horas por semana
          </label>
          <input
            id="meta-horas"
            type="number"
            required
            min="0.1"
            max="100"
            step="0.1"
            value={horas}
            onChange={(evento) => setHoras(evento.target.value)}
            disabled={inactivo}
            className="field"
          />
        </div>
        <div>
          <label htmlFor="meta-dias" className="field-label">
            Días por semana
          </label>
          <input
            id="meta-dias"
            type="number"
            required
            min="1"
            max="7"
            step="1"
            value={dias}
            onChange={(evento) => setDias(evento.target.value)}
            disabled={inactivo}
            className="field"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={inactivo}
            className="secondary-button"
          >
            {enviando ? "Guardando..." : textoBoton}
          </button>
          {onCancelar && (
            <button
              type="button"
              onClick={onCancelar}
              disabled={enviando}
              className="secondary-button"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
      {deshabilitado && <p className="text-sm text-mist">{TEXTO_BLOQUEADO}</p>}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </form>
  );
}
