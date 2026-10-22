import type {
  CambiosPartida,
  ListaPartidasRespuesta,
  PartidaFormulario,
  PartidaRespuesta,
} from "../types";

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
const BASE = `${API_URL}/api/partidas`;

type FiltrosPartida = {
  videojuegoId?: string;
};

async function manejarRespuesta<T>(respuesta: Response): Promise<T> {
  if (!respuesta.ok) {
    const cuerpo: { error?: string } | null = await respuesta.json().catch(() => null);
    throw new Error(cuerpo?.error ?? `Error HTTP ${respuesta.status}`);
  }

  return respuesta.json() as Promise<T>;
}

async function manejarRespuestaVacia(respuesta: Response): Promise<void> {
  if (!respuesta.ok) {
    const cuerpo: { error?: string } | null = await respuesta.json().catch(() => null);
    throw new Error(cuerpo?.error ?? `Error HTTP ${respuesta.status}`);
  }
}

export async function obtenerPartidas(
  filtros: FiltrosPartida = {}
): Promise<ListaPartidasRespuesta> {
  const parametros = new URLSearchParams();
  if (filtros.videojuegoId) parametros.set("videojuegoId", filtros.videojuegoId);

  const queryString = parametros.toString();
  const query = queryString ? `?${queryString}` : "";
  const respuesta = await fetch(`${BASE}${query}`);
  return manejarRespuesta<ListaPartidasRespuesta>(respuesta);
}

export async function obtenerPartidaPorId(id: string): Promise<PartidaRespuesta> {
  const respuesta = await fetch(`${BASE}/${encodeURIComponent(id)}`);
  return manejarRespuesta<PartidaRespuesta>(respuesta);
}

export async function crearPartida(datos: PartidaFormulario): Promise<PartidaRespuesta> {
  const respuesta = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return manejarRespuesta<PartidaRespuesta>(respuesta);
}

export async function actualizarPartida(
  id: string,
  cambios: CambiosPartida
): Promise<PartidaRespuesta> {
  const respuesta = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cambios),
  });
  return manejarRespuesta<PartidaRespuesta>(respuesta);
}

export async function eliminarPartida(id: string): Promise<void> {
  const respuesta = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  await manejarRespuestaVacia(respuesta);
}
