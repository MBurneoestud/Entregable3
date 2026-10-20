import { Document, model, Schema, Types } from "mongoose";

export interface IPartida extends Document {
  videojuego: Types.ObjectId;
  fecha: Date;
  duracionMinutos: number;
  porcentajeAvance?: number;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PartidaSchema = new Schema<IPartida>(
  {
    videojuego: {
      type: Schema.Types.ObjectId,
      ref: "Videojuego",
      required: [true, "La partida debe estar vinculada a un videojuego"],
    },
    fecha: {
      type: Date,
      required: [true, "La fecha de la partida es obligatoria"],
    },
    duracionMinutos: {
      type: Number,
      required: [true, "La duración de la partida es obligatoria"],
    },
    porcentajeAvance: {
      type: Number,
      min: [0, "El porcentaje de avance no puede ser menor que 0"],
      max: [100, "El porcentaje de avance no puede ser mayor que 100"],
    },
    notas: { type: String, required: false },
  },
  { timestamps: true }
);

export const Partida = model<IPartida>("Partida", PartidaSchema);
