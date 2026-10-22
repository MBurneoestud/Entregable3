import { Document, model, Schema } from "mongoose";

export type Plataforma = "PC" | "PlayStation" | "Xbox" | "Switch" | "Movil";
export type Genero = "accion" | "rol" | "estrategia" | "puzzle" | "deportes" | "otro";
export type EstadoVideojuego = "jugando" | "pausado" | "completado" | "abandonado";

export interface ILogro {
  nombre: string;
  obtenido: boolean;
}

export interface IVideojuego extends Document {
  nombre: string;
  plataforma?: Plataforma;
  genero?: Genero;
  estado?: EstadoVideojuego;
  logros: ILogro[];
  createdAt: Date;
  updatedAt: Date;
}

const LogroSchema = new Schema<ILogro>(
  {
    nombre: { type: String, required: true },
    obtenido: { type: Boolean, required: true },
  },
  { _id: false }
);

const VideojuegoSchema = new Schema<IVideojuego>(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del videojuego es obligatorio"],
      trim: true,
    },
    plataforma: {
      type: String,
      enum: ["PC", "PlayStation", "Xbox", "Switch", "Movil"],
    },
    genero: {
      type: String,
      enum: ["accion", "rol", "estrategia", "puzzle", "deportes", "otro"],
    },
    estado: {
      type: String,
      enum: ["jugando", "pausado", "completado", "abandonado"],
    },
    logros: { type: [LogroSchema], default: [] },
  },
  { timestamps: true }
);

export const Videojuego = model<IVideojuego>("Videojuego", VideojuegoSchema);
