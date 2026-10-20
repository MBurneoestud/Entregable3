import { ApiError } from "../apiError";
import {
  EstadoVideojuego,
  Genero,
  IVideojuego,
  Plataforma,
  Videojuego,
} from "../models/videojuego.model";

type CamposVideojuego = "nombre" | "plataforma" | "genero" | "estado" | "logros";

export type DatosVideojuego = Pick<IVideojuego, "nombre"> &
  Partial<Pick<IVideojuego, Exclude<CamposVideojuego, "nombre">>>;

export type CambiosVideojuego = Partial<Pick<IVideojuego, CamposVideojuego>>;

export interface FiltrosVideojuego {
  plataforma?: Plataforma;
  genero?: Genero;
  estado?: EstadoVideojuego;
}

export async function listarVideojuegos(
  filtros: FiltrosVideojuego = {}
): Promise<IVideojuego[]> {
  return Videojuego.find(filtros).sort({ createdAt: -1 });
}

export async function buscarVideojuegoPorId(id: string): Promise<IVideojuego> {
  const videojuego = await Videojuego.findById(id);
  if (!videojuego) {
    throw new ApiError(404, `No existe un videojuego con id ${id}`);
  }
  return videojuego;
}

export async function crearVideojuego(datos: DatosVideojuego): Promise<IVideojuego> {
  return Videojuego.create(datos);
}

export async function actualizarVideojuego(
  id: string,
  cambios: CambiosVideojuego
): Promise<IVideojuego> {
  const actualizada = await Videojuego.findByIdAndUpdate(id, cambios, {
    new: true,
    runValidators: true,
  });
  if (!actualizada) {
    throw new ApiError(404, `No existe un videojuego con id ${id}`);
  }
  return actualizada;
}

export async function eliminarVideojuego(id: string): Promise<void> {
  const resultado = await Videojuego.findByIdAndDelete(id);
  if (!resultado) {
    throw new ApiError(404, `No existe un videojuego con id ${id}`);
  }
}
