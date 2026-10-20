import { ApiError } from "../apiError";
import { IPartida, Partida } from "../models/partida.model";
import { Videojuego } from "../models/videojuego.model";

type CamposPartida = "videojuego" | "fecha" | "duracionMinutos" | "porcentajeAvance" | "notas";

export type DatosPartida = Pick<IPartida, "videojuego" | "fecha" | "duracionMinutos"> &
  Partial<Pick<IPartida, "porcentajeAvance" | "notas">>;

export type CambiosPartida = Partial<Pick<IPartida, CamposPartida>>;

export async function listarPartidas(videojuegoId?: string): Promise<IPartida[]> {
  const filtro = videojuegoId ? { videojuego: videojuegoId } : {};
  return Partida.find(filtro).populate("videojuego").sort({ fecha: -1 });
}

export async function listarPartidasDeVideojuego(videojuegoId: string): Promise<IPartida[]> {
  const videojuego = await Videojuego.findById(videojuegoId);
  if (!videojuego) {
    throw new ApiError(404, `No existe un videojuego con id ${videojuegoId}`);
  }
  return Partida.find({ videojuego: videojuegoId }).sort({ fecha: -1 });
}

export async function buscarPartidaPorId(id: string): Promise<IPartida> {
  const partida = await Partida.findById(id).populate("videojuego");
  if (!partida) {
    throw new ApiError(404, `No existe una partida con id ${id}`);
  }
  return partida;
}

export async function crearPartida(datos: DatosPartida): Promise<IPartida> {
  const videojuego = await Videojuego.findById(datos.videojuego);
  if (!videojuego) {
    throw new ApiError(404, `No existe un videojuego con id ${datos.videojuego}`);
  }
  return Partida.create(datos);
}

export async function actualizarPartida(
  id: string,
  cambios: CambiosPartida
): Promise<IPartida> {
  if (cambios.videojuego) {
    const videojuego = await Videojuego.findById(cambios.videojuego);
    if (!videojuego) {
      throw new ApiError(404, `No existe un videojuego con id ${cambios.videojuego}`);
    }
  }

  const actualizada = await Partida.findByIdAndUpdate(id, cambios, {
    new: true,
    runValidators: true,
  }).populate("videojuego");

  if (!actualizada) {
    throw new ApiError(404, `No existe una partida con id ${id}`);
  }
  return actualizada;
}

export async function eliminarPartida(id: string): Promise<void> {
  const resultado = await Partida.findByIdAndDelete(id);
  if (!resultado) {
    throw new ApiError(404, `No existe una partida con id ${id}`);
  }
}
