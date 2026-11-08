import type {
  HitoFormulario,
  MetaFormulario,
  MetaRespuesta,
  ProgresoSemanal,
} from "../types";

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
const BASE = `${API_URL}/api/videojuegos`;

async function manejarRespuesta<T>(respuesta: Response): Promise<T> {
  if (!respuesta.ok) {
    const cuerpo: { error?: string } | null = await respuesta
      .json()
      .catch(() => null);
    throw new Error(cuerpo?.error ?? `Error HTTP ${respuesta.status}`);
  }

  return respuesta.json() as Promise<T>;
}

async function manejarRespuestaVacia(respuesta: Response): Promise<void> {
  if (!respuesta.ok) {
    const cuerpo: { error?: string } | null = await respuesta
      .json()
      .catch(() => null);
    throw new Error(cuerpo?.error ?? `Error HTTP ${respuesta.status}`);
  }
}

function rutaMeta(id: string): string {
  return `${BASE}/${encodeURIComponent(id)}/meta`;
}

/** GET /api/videojuegos/:id/progreso-semanal (la respuesta no lleva envoltorio). */
export async function obtenerProgreso(id: string): Promise<ProgresoSemanal> {
  const respuesta = await fetch(
    `${BASE}/${encodeURIComponent(id)}/progreso-semanal`,
  );
  return manejarRespuesta<ProgresoSemanal>(respuesta);
}

export async function fijarMeta(
  id: string,
  datos: MetaFormulario,
): Promise<MetaRespuesta> {
  const respuesta = await fetch(rutaMeta(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return manejarRespuesta<MetaRespuesta>(respuesta);
}

export async function quitarMeta(id: string): Promise<void> {
  const respuesta = await fetch(rutaMeta(id), { method: "DELETE" });
  await manejarRespuestaVacia(respuesta);
}

export async function agregarHito(
  id: string,
  datos: HitoFormulario,
): Promise<MetaRespuesta> {
  const respuesta = await fetch(`${rutaMeta(id)}/hitos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return manejarRespuesta<MetaRespuesta>(respuesta);
}

export async function eliminarHito(
  id: string,
  hitoId: string,
): Promise<MetaRespuesta> {
  const respuesta = await fetch(
    `${rutaMeta(id)}/hitos/${encodeURIComponent(hitoId)}`,
    {
      method: "DELETE",
    },
  );
  return manejarRespuesta<MetaRespuesta>(respuesta);
}
