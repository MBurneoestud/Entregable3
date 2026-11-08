export type Plataforma = "PC" | "PlayStation" | "Xbox" | "Switch" | "Movil";
export type Genero =
  "accion" | "rol" | "estrategia" | "puzzle" | "deportes" | "otro";
export type EstadoVideojuego =
  "jugando" | "pausado" | "completado" | "abandonado";

export const PLATAFORMAS: Plataforma[] = [
  "PC",
  "PlayStation",
  "Xbox",
  "Switch",
  "Movil",
];
export const GENEROS: Genero[] = [
  "accion",
  "rol",
  "estrategia",
  "puzzle",
  "deportes",
  "otro",
];
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
  videojuego: string | Videojuego | null;
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

// E2 — Meta semanal (spec frontend §3, alineada con la spec backend §5)
export interface Hito {
  _id: string;
  descripcion: string;
  porcentajeObjetivo: number;
  alcanzadoEn?: string;
}

export interface Meta {
  _id: string;
  horasSemanales: number;
  diasPorSemana: number;
  activa: boolean;
  vigenteDesde: string;
  hitos: Hito[];
}

export type EstadoSemana = "cumplida" | "no_cumplida" | "sin_meta";

export interface SemanaHistorial {
  inicio: string;
  fin: string;
  estado: EstadoSemana;
  horas?: number;
  dias?: number;
  porcentajeHoras?: number;
  porcentajeDias?: number;
}

export interface HitoProgreso {
  _id: string;
  descripcion: string;
  porcentajeObjetivo: number;
  alcanzado: boolean;
  alcanzadoEn: string | null;
}

export interface ProgresoSemanal {
  semana: { inicio: string; fin: string };
  meta: { horasSemanales: number; diasPorSemana: number } | null;
  horasSemana: number;
  porcentajeHoras: number | null;
  diasJugadosSemana: number;
  porcentajeDias: number | null;
  cumplida: boolean | null;
  rachaActual: number;
  mejorRacha: number;
  porcentajeAvanceActual: number | null;
  hitos: HitoProgreso[];
  ultimas4: SemanaHistorial[];
  semanasCumplidas: number;
  semanasConMeta: number;
}

export interface MetaFormulario {
  horasSemanales: number;
  diasPorSemana: number;
}

export interface HitoFormulario {
  descripcion: string;
  porcentajeObjetivo: number;
}

export interface MetaRespuesta {
  meta: Meta;
}
