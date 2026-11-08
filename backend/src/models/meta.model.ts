import { Document, model, Schema, Types } from "mongoose";

export const MENSAJES_META = {
  horas:
    "Las horas por semana deben ser un número mayor que 0 y como máximo 100",
  dias: "Los días por semana deben ser un entero entre 1 y 7",
  descripcionHito: "La descripción del hito es obligatoria",
  porcentajeObjetivoHito:
    "El porcentaje objetivo del hito debe ser un entero entre 1 y 100",
  maxHitos: "Una meta admite como máximo 5 hitos",
  hitoRepetido: (porcentajeObjetivo: number) =>
    `Ya existe un hito con porcentaje objetivo ${porcentajeObjetivo} %`,
  objetivoBajo: (avance: number) =>
    `El porcentaje objetivo del hito debe ser mayor que el avance actual (${avance} %)`,
  juegoCerrado:
    "No se puede fijar una meta en un videojuego completado o abandonado",
} as const;

export const MAX_HITOS = 5;

export function horasValidas(valor: unknown): valor is number {
  return (
    typeof valor === "number" &&
    Number.isFinite(valor) &&
    valor > 0 &&
    valor <= 100
  );
}

export function diasValidos(valor: unknown): valor is number {
  return (
    typeof valor === "number" &&
    Number.isInteger(valor) &&
    valor >= 1 &&
    valor <= 7
  );
}

export function porcentajeObjetivoValido(valor: unknown): valor is number {
  return (
    typeof valor === "number" &&
    Number.isInteger(valor) &&
    valor >= 1 &&
    valor <= 100
  );
}

export interface IHito {
  _id: Types.ObjectId;
  descripcion: string;
  porcentajeObjetivo: number;
  alcanzadoEn?: Date;
}

export interface IMeta extends Document {
  videojuego: Types.ObjectId;
  horasSemanales: number;
  diasPorSemana: number;
  activa: boolean;
  vigenteDesde: Date;
  vigenteHasta?: Date;
  hitos: Types.DocumentArray<IHito>;
  createdAt: Date;
  updatedAt: Date;
}

const HitoSchema = new Schema<IHito>({
  descripcion: {
    type: String,
    required: [true, MENSAJES_META.descripcionHito],
    trim: true,
  },
  porcentajeObjetivo: {
    type: Number,
    required: [true, MENSAJES_META.porcentajeObjetivoHito],
    validate: {
      validator: porcentajeObjetivoValido,
      message: MENSAJES_META.porcentajeObjetivoHito,
    },
  },
  alcanzadoEn: { type: Date },
});

const MetaSchema = new Schema<IMeta>(
  {
    videojuego: {
      type: Schema.Types.ObjectId,
      ref: "Videojuego",
      required: [true, "La meta debe estar vinculada a un videojuego"],
    },
    horasSemanales: {
      type: Number,
      required: [true, MENSAJES_META.horas],
      validate: { validator: horasValidas, message: MENSAJES_META.horas },
    },
    diasPorSemana: {
      type: Number,
      required: [true, MENSAJES_META.dias],
      validate: { validator: diasValidos, message: MENSAJES_META.dias },
    },
    activa: { type: Boolean, default: true },
    vigenteDesde: {
      type: Date,
      required: [
        true,
        "La fecha de inicio de vigencia de la meta es obligatoria",
      ],
    },
    vigenteHasta: { type: Date },
    hitos: {
      type: [HitoSchema],
      default: [],
      validate: [
        {
          validator: (hitos: IHito[]) => hitos.length <= MAX_HITOS,
          message: MENSAJES_META.maxHitos,
        },
        {
          validator: (hitos: IHito[]) =>
            new Set(hitos.map((hito) => hito.porcentajeObjetivo)).size ===
            hitos.length,
          message:
            "No puede haber dos hitos con el mismo porcentaje objetivo en una meta",
        },
      ],
    },
  },
  { timestamps: true },
);

// B-01: como máximo una meta activa por videojuego.
MetaSchema.index(
  { videojuego: 1 },
  { unique: true, partialFilterExpression: { activa: true } },
);
MetaSchema.index({ videojuego: 1, vigenteDesde: 1 });

export const Meta = model<IMeta>("Meta", MetaSchema);
