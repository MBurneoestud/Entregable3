export type Plataforma = "PC" | "PlayStation" | "Xbox" | "Switch" | "Movil";
export type Genero = "accion" | "rol" | "estrategia" | "puzzle" | "deportes" | "otro";
export type EstadoVideojuego = "jugando" | "pausado" | "completado" | "abandonado";

export const PLATAFORMAS: Plataforma[] = ["PC", "PlayStation", "Xbox", "Switch", "Movil"];
export const GENEROS: Genero[] = ["accion", "rol", "estrategia", "puzzle", "deportes", "otro"];
export const ESTADOS_VIDEOJUEGO: EstadoVideojuego[] = [
  "jugando",
  "pausado",
  "completado",
  "abandonado",
];

export interface Logro {
  nombre: string;
  obtenido: boolean;
}

export interface Videojuego {
  _id: string;
  __v: number;
  nombre: string;
  plataforma?: Plataforma;
  genero?: Genero;
  estado?: EstadoVideojuego;
  logros: Logro[];
  createdAt: string;
  updatedAt: string;
}

export type VideojuegoFormulario = Pick<Videojuego, "nombre"> &
  Partial<Pick<Videojuego, "plataforma" | "genero" | "estado" | "logros">>;

export type CambiosVideojuego = Partial<VideojuegoFormulario>;

export interface Partida {
  _id: string;
  __v: number;
  videojuego: string | Videojuego;
  fecha: string;
  duracionMinutos: number;
  porcentajeAvance?: number;
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartidaFormulario {
  videojuego: string;
  fecha: string;
  duracionMinutos: number;
  porcentajeAvance?: number;
  notas?: string;
}

export type CambiosPartida = Partial<PartidaFormulario>;

export interface ListaVideojuegosRespuesta {
  total: number;
  videojuegos: Videojuego[];
}

export interface VideojuegoRespuesta {
  videojuego: Videojuego;
}

export interface ListaPartidasRespuesta {
  total: number;
  partidas: Partida[];
}

export interface PartidaRespuesta {
  partida: Partida;
}

export interface ResumenVideojuego {
  totalPartidas: number;
  horasTotales: number;
  ultimaPartida: string | null;
  porcentajeAvanceActual: number | null;
}