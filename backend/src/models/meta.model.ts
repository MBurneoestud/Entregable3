import { Document, model, Schema, Types } from "mongoose";

export const MENSAJES_META = {
  horas:
    "Las horas por semana deben ser un número mayor que 0 y como máximo 168",
  dias: "Los días por semana deben ser un entero entre 1 y 7",
  nombreHito: "El nombre del hito es obligatorio",
  objetivoHito: "El objetivo del hito debe ser un entero entre 1 y 100",
  maxHitos: "Una meta admite como máximo 5 hitos",
  hitoRepetido: (objetivo: number) =>
    `Ya existe un hito con objetivo ${objetivo} %`,
  objetivoBajo: (avance: number) =>
    `El objetivo del hito debe ser mayor que el avance actual (${avance} %)`,
  juegoCerrado:
    "No se puede fijar una meta en un videojuego completado o abandonado",
} as const;

export const MAX_HITOS = 5;

export function horasValidas(valor: unknown): valor is number {
  return (
    typeof valor === "number" &&
    Number.isFinite(valor) &&
    valor > 0 &&
    valor <= 168
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

export function objetivoValido(valor: unknown): valor is number {
  return (
    typeof valor === "number" &&
    Number.isInteger(valor) &&
    valor >= 1 &&
    valor <= 100
  );
}

export interface IHito {
  _id: Types.ObjectId;
  nombre: string;
  objetivo: number;
  alcanzadoEn?: Date;
}

export interface IMeta extends Document {
  videojuego: Types.ObjectId;
  horasPorSemana: number;
  diasPorSemana: number;
  activa: boolean;
  vigenteDesde: Date;
  vigenteHasta?: Date;
  hitos: Types.DocumentArray<IHito>;
  createdAt: Date;
  updatedAt: Date;
}

const HitoSchema = new Schema<IHito>({
  nombre: {
    type: String,
    required: [true, MENSAJES_META.nombreHito],
    trim: true,
  },
  objetivo: {
    type: Number,
    required: [true, MENSAJES_META.objetivoHito],
    validate: {
      validator: objetivoValido,
      message: MENSAJES_META.objetivoHito,
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
    horasPorSemana: {
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
            new Set(hitos.map((hito) => hito.objetivo)).size === hitos.length,
          message: "No puede haber dos hitos con el mismo objetivo en una meta",
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
