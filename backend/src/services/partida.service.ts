import { ApiError } from "../apiError";
import { ORDEN_RECIENTES } from "../dominio/partidas";
import { IPartida, Partida } from "../models/partida.model";
import { actualizarHitosAlcanzados } from "./meta.service";
import { Videojuego } from "../models/videojuego.model";

type CamposPartida =
  "videojuego" | "fecha" | "duracionMinutos" | "porcentajeAvance" | "notas";

export type DatosPartida = Pick<
  IPartida,
  "videojuego" | "fecha" | "duracionMinutos"
> &
  Partial<Pick<IPartida, "porcentajeAvance" | "notas">>;

export type CambiosPartida = Partial<Pick<IPartida, CamposPartida>>;

export async function listarPartidas(
  videojuegoId?: string,
): Promise<IPartida[]> {
  const filtro = videojuegoId ? { videojuego: videojuegoId } : {};
  return Partida.find(filtro).populate("videojuego").sort(ORDEN_RECIENTES);
}

export async function listarPartidasDeVideojuego(
  videojuegoId: string,
): Promise<IPartida[]> {
  const videojuego = await Videojuego.findById(videojuegoId);
  if (!videojuego) {
    throw new ApiError(404, `No existe un videojuego con id ${videojuegoId}`);
  }
  return Partida.find({ videojuego: videojuegoId }).sort(ORDEN_RECIENTES);
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
    throw new ApiError(
      404,
      `No existe un videojuego con id ${datos.videojuego}`,
    );
  }
  const partida = await Partida.create(datos);
  await actualizarHitosAlcanzados(String(videojuego._id));
  return partida;
}

export async function actualizarPartida(
  id: string,
  cambios: CambiosPartida,
): Promise<IPartida> {
  if (cambios.videojuego) {
    const videojuego = await Videojuego.findById(cambios.videojuego);
    if (!videojuego) {
      throw new ApiError(
        404,
        `No existe un videojuego con id ${cambios.videojuego}`,
      );
    }
  }

  const actualizada = await Partida.findByIdAndUpdate(id, cambios, {
    new: true,
    runValidators: true,
  }).populate("videojuego");

  if (!actualizada) {
    throw new ApiError(404, `No existe una partida con id ${id}`);
  }

  // Con populate, `populated()` devuelve el id original aunque el videojuego ya no exista.
  const videojuegoId = String(
    actualizada.populated("videojuego") ?? actualizada.videojuego,
  );
  if (await Videojuego.exists({ _id: videojuegoId })) {
    await actualizarHitosAlcanzados(videojuegoId);
  }
  return actualizada;
}

export async function eliminarPartida(id: string): Promise<void> {
  const resultado = await Partida.findByIdAndDelete(id);
  if (!resultado) {
    throw new ApiError(404, `No existe una partida con id ${id}`);
  }
  // B-15: al borrar la partida más reciente el avance actual puede subir.
  const videojuegoId = String(resultado.videojuego);
  if (await Videojuego.exists({ _id: videojuegoId })) {
    await actualizarHitosAlcanzados(videojuegoId);
  }
}
