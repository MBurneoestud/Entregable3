import type {
  CambiosVideojuego,
  EstadoVideojuego,
  Genero,
  ListaPartidasRespuesta,
  ListaVideojuegosRespuesta,
  Plataforma,
  ResumenVideojuego,
  VideojuegoRespuesta,
  VideojuegoFormulario,
} from "../types";

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
const BASE = `${API_URL}/api/videojuegos`;

type FiltrosVideojuego = {
  plataforma?: Plataforma;
  genero?: Genero;
  estado?: EstadoVideojuego;
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

export async function obtenerVideojuegos(
  filtros: FiltrosVideojuego = {}
): Promise<ListaVideojuegosRespuesta> {
  const parametros = new URLSearchParams();
  if (filtros.plataforma) parametros.set("plataforma", filtros.plataforma);
  if (filtros.genero) parametros.set("genero", filtros.genero);
  if (filtros.estado) parametros.set("estado", filtros.estado);

  const queryString = parametros.toString();
  const query = queryString ? `?${queryString}` : "";
  const respuesta = await fetch(`${BASE}${query}`);
  return manejarRespuesta<ListaVideojuegosRespuesta>(respuesta);
}

export async function obtenerVideojuegoPorId(id: string): Promise<VideojuegoRespuesta> {
  const respuesta = await fetch(`${BASE}/${encodeURIComponent(id)}`);
  return manejarRespuesta<VideojuegoRespuesta>(respuesta);
}

export async function crearVideojuego(
  datos: VideojuegoFormulario
): Promise<VideojuegoRespuesta> {
  const respuesta = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return manejarRespuesta<VideojuegoRespuesta>(respuesta);
}

export async function actualizarVideojuego(
  id: string,
  cambios: CambiosVideojuego
): Promise<VideojuegoRespuesta> {
  const respuesta = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cambios),
  });
  return manejarRespuesta<VideojuegoRespuesta>(respuesta);
}

export async function actualizarEstadoLogro(
  id: string,
  indiceLogro: number,
  obtenido: boolean
): Promise<VideojuegoRespuesta> {
  const respuesta = await fetch(
    `${BASE}/${encodeURIComponent(id)}/logros/${indiceLogro}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ obtenido }),
    }
  );
  return manejarRespuesta<VideojuegoRespuesta>(respuesta);
}

export async function eliminarVideojuego(id: string): Promise<void> {
  const respuesta = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  await manejarRespuestaVacia(respuesta);
}

export async function obtenerPartidasDeVideojuego(
  id: string
): Promise<ListaPartidasRespuesta> {
  const respuesta = await fetch(
    `${BASE}/${encodeURIComponent(id)}/partidas`
  );
  return manejarRespuesta<ListaPartidasRespuesta>(respuesta);
}

export async function obtenerResumenVideojuego(id: string): Promise<ResumenVideojuego> {
  const respuesta = await fetch(`${BASE}/${encodeURIComponent(id)}/resumen`);
  return manejarRespuesta<ResumenVideojuego>(respuesta);
}
