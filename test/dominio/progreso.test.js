const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const {
  aProgresoSemanal,
  calcularProgresoDesde,
  hitosPorAlcanzar,
  validarNuevoHito,
  debeArchivarMeta,
} = require("../../backend/src/dominio/progreso");

// «Hoy» de referencia: sábado 7 de noviembre de 2026 a mediodía en Ecuador.
// Semana actual: lunes 2 – domingo 8 de noviembre.
// Últimas 4 semanas: 5–11 oct, 12–18 oct, 19–25 oct y 26 oct – 1 nov.
const AHORA = new Date("2026-11-07T17:00:00Z");

let contador = 0;
/** Partida guardada a medianoche UTC del día indicado (como la envía el formulario). */
function partida(dia, duracionMinutos, porcentajeAvance) {
  contador++;
  return {
    fecha: new Date(`${dia}T00:00:00Z`),
    createdAt: new Date(Date.UTC(2026, 0, 1) + contador * 1000),
    duracionMinutos,
    porcentajeAvance,
  };
}

/** Meta con instantes reales de vigencia (ISO). Sin `hasta` → activa. */
function meta(horasSemanales, diasPorSemana, desde, hasta) {
  return {
    horasSemanales,
    diasPorSemana,
    activa: !hasta,
    vigenteDesde: new Date(desde),
    ...(hasta ? { vigenteHasta: new Date(hasta) } : {}),
  };
}

const META_DESDE_OCTUBRE = "2026-10-01T15:00:00Z";

describe("calcularProgresoDesde — semana", () => {
  test("caso 1: partida en domingo cuenta en esa semana; en lunes, en la siguiente", () => {
    const progreso = calcularProgresoDesde(
      [partida("2026-11-01", 60), partida("2026-11-02", 30)],
      [meta(1, 1, META_DESDE_OCTUBRE)],
      AHORA,
    );
    assert.equal(progreso.semanaActual.inicio, "2026-11-02");
    assert.equal(progreso.semanaActual.horas, 0.5);
    assert.equal(progreso.semanaActual.dias, 1);
    const anterior = progreso.ultimas4[3];
    assert.equal(anterior.fin, "2026-11-01");
    assert.equal(anterior.horas, 1);
    assert.equal(anterior.estado, "cumplida");
  });

  test("caso 2: domingo 23:30 en Ecuador sigue en la semana del 2 al 8 de noviembre", () => {
    const progreso = calcularProgresoDesde(
      [partida("2026-11-08", 60)],
      [meta(1, 1, META_DESDE_OCTUBRE)],
      new Date("2026-11-09T04:30:00Z"),
    );
    assert.equal(progreso.hoy, "2026-11-08");
    assert.equal(progreso.semanaActual.inicio, "2026-11-02");
    assert.equal(progreso.semanaActual.fin, "2026-11-08");
    assert.equal(progreso.semanaActual.horas, 1);
  });

  test("caso 3: cumplir solo horas o solo días no basta; ambas sí", () => {
    const metas = [meta(5, 3, META_DESDE_OCTUBRE)];
    const soloHoras = calcularProgresoDesde(
      [partida("2026-11-02", 300)],
      metas,
      AHORA,
    );
    assert.equal(soloHoras.semanaActual.cumplida, false);

    const soloDias = calcularProgresoDesde(
      [
        partida("2026-11-02", 10),
        partida("2026-11-03", 10),
        partida("2026-11-04", 10),
      ],
      metas,
      AHORA,
    );
    assert.equal(soloDias.semanaActual.cumplida, false);

    const ambas = calcularProgresoDesde(
      [
        partida("2026-11-02", 100),
        partida("2026-11-03", 100),
        partida("2026-11-04", 100),
      ],
      metas,
      AHORA,
    );
    assert.equal(ambas.semanaActual.cumplida, true);
  });

  test("caso 4: dos partidas el mismo día (60 + 30 min) → 1 día y 1,5 h", () => {
    const progreso = calcularProgresoDesde(
      [partida("2026-11-03", 60), partida("2026-11-03", 30)],
      [meta(5, 3, META_DESDE_OCTUBRE)],
      AHORA,
    );
    assert.equal(progreso.semanaActual.dias, 1);
    assert.equal(progreso.semanaActual.horas, 1.5);
  });

  test("caso 5: una partida de 120 min cuenta entera en su día", () => {
    const progreso = calcularProgresoDesde(
      [partida("2026-11-05", 120)],
      [meta(5, 3, META_DESDE_OCTUBRE)],
      AHORA,
    );
    assert.equal(progreso.semanaActual.horas, 2);
    assert.equal(progreso.semanaActual.dias, 1);
  });

  test("caso 6: 7 h con una meta de 5 h → 140 % y cumplida", () => {
    const progreso = calcularProgresoDesde(
      [
        partida("2026-11-02", 140),
        partida("2026-11-03", 140),
        partida("2026-11-04", 140),
      ],
      [meta(5, 3, META_DESDE_OCTUBRE)],
      AHORA,
    );
    assert.equal(progreso.semanaActual.horas, 7);
    assert.equal(progreso.semanaActual.porcentajeHoras, 140);
    assert.equal(progreso.semanaActual.cumplida, true);
  });

  test("H5-C1: 2 h el lunes + 1,5 h el miércoles con meta {5,3}", () => {
    const progreso = calcularProgresoDesde(
      [partida("2026-11-02", 120), partida("2026-11-04", 90)],
      [meta(5, 3, META_DESDE_OCTUBRE)],
      AHORA,
    );
    assert.deepEqual(progreso.semanaActual, {
      inicio: "2026-11-02",
      fin: "2026-11-08",
      horas: 3.5,
      dias: 2,
      porcentajeHoras: 70,
      porcentajeDias: 67,
      cumplida: false,
    });
  });

  test("caso 7: meta cambiada el miércoles de la semana actual → se usa la nueva", () => {
    const progreso = calcularProgresoDesde(
      [partida("2026-11-02", 150)],
      [
        meta(10, 5, META_DESDE_OCTUBRE, "2026-11-04T15:00:00Z"),
        meta(2, 1, "2026-11-04T15:00:00Z"),
      ],
      AHORA,
    );
    assert.equal(progreso.meta.horasSemanales, 2);
    assert.equal(progreso.semanaActual.porcentajeHoras, 125);
    assert.equal(progreso.semanaActual.cumplida, true);
  });

  test("caso 12: una partida con fecha futura se ignora en semana, racha y avance", () => {
    const progreso = calcularProgresoDesde(
      [partida("2026-11-05", 30, 20), partida("2026-11-08", 600, 90)],
      [meta(5, 3, META_DESDE_OCTUBRE)],
      AHORA,
    );
    assert.equal(progreso.semanaActual.horas, 0.5);
    assert.equal(progreso.semanaActual.dias, 1);
    assert.equal(progreso.racha, 0);
    assert.equal(progreso.porcentajeAvanceActual, 20);
  });

  test("sin meta activa, meta y semanaActual son null y el resto se calcula", () => {
    const progreso = calcularProgresoDesde(
      [partida("2026-11-06", 30, 15), partida("2026-11-07", 30, 25)],
      [],
      AHORA,
    );
    assert.equal(progreso.meta, null);
    assert.equal(progreso.semanaActual, null);
    assert.equal(progreso.racha, 2);
    assert.equal(progreso.porcentajeAvanceActual, 25);
    assert.equal(progreso.ultimas4.length, 4);
  });
});

describe("calcularProgresoDesde — últimas 4 semanas", () => {
  test("H9-C4: son las 4 semanas completas anteriores, de la más antigua a la más reciente", () => {
    const { ultimas4 } = calcularProgresoDesde([], [], AHORA);
    assert.deepEqual(
      ultimas4.map((s) => [s.inicio, s.fin]),
      [
        ["2026-10-05", "2026-10-11"],
        ["2026-10-12", "2026-10-18"],
        ["2026-10-19", "2026-10-25"],
        ["2026-10-26", "2026-11-01"],
      ],
    );
    assert.ok(ultimas4.every((s) => s.inicio !== "2026-11-02"));
  });

  test("H9-C1: 3 de 4 semanas cumplidas", () => {
    const progreso = calcularProgresoDesde(
      [
        partida("2026-10-06", 60),
        partida("2026-10-13", 60),
        partida("2026-10-20", 60),
      ],
      [meta(1, 1, META_DESDE_OCTUBRE)],
      AHORA,
    );
    assert.deepEqual(
      progreso.ultimas4.map((s) => s.estado),
      ["cumplida", "cumplida", "cumplida", "no_cumplida"],
    );
    assert.equal(progreso.semanasCumplidas, 3);
    assert.equal(progreso.semanasConMeta, 4);
  });

  test("caso 8: meta cambiada a mitad de una semana pasada → se usa la vigente al domingo", () => {
    const progreso = calcularProgresoDesde(
      [partida("2026-10-20", 90)],
      [
        meta(10, 5, META_DESDE_OCTUBRE, "2026-10-21T15:00:00Z"),
        meta(1, 1, "2026-10-21T15:00:00Z"),
      ],
      AHORA,
    );
    const semana = progreso.ultimas4[2];
    assert.equal(semana.inicio, "2026-10-19");
    assert.equal(semana.estado, "cumplida");
    assert.equal(semana.porcentajeHoras, 150);
    assert.equal(progreso.ultimas4[0].estado, "no_cumplida"); // evaluada con {10,5}
  });

  test("caso 9: semanas anteriores a la primera meta → sin_meta y fuera de semanasConMeta", () => {
    const progreso = calcularProgresoDesde(
      [partida("2026-10-06", 600)],
      [meta(1, 1, "2026-10-14T15:00:00Z")],
      AHORA,
    );
    assert.deepEqual(progreso.ultimas4[0], {
      inicio: "2026-10-05",
      fin: "2026-10-11",
      estado: "sin_meta",
    });
    assert.notEqual(progreso.ultimas4[1].estado, "sin_meta");
    assert.equal(progreso.semanasConMeta, 3);
  });

  test("caso 10: meta quitada → las semanas en que estuvo vigente conservan su estado", () => {
    const progreso = calcularProgresoDesde(
      [
        partida("2026-10-06", 60),
        partida("2026-10-13", 60),
        partida("2026-10-20", 60),
        partida("2026-10-27", 60),
      ],
      [meta(1, 1, META_DESDE_OCTUBRE, "2026-11-03T15:00:00Z")],
      AHORA,
    );
    assert.equal(progreso.meta, null);
    assert.equal(progreso.semanaActual, null);
    assert.deepEqual(
      progreso.ultimas4.map((s) => s.estado),
      ["cumplida", "cumplida", "cumplida", "cumplida"],
    );
    assert.equal(progreso.semanasConMeta, 4);
  });

  test("las semanas sin_meta solo llevan inicio, fin y estado", () => {
    const { ultimas4 } = calcularProgresoDesde(
      [partida("2026-10-06", 60)],
      [],
      AHORA,
    );
    assert.deepEqual(Object.keys(ultimas4[0]).sort(), [
      "estado",
      "fin",
      "inicio",
    ]);
  });
});

describe("calcularProgresoDesde — racha (caso 11)", () => {
  function racha(dias, ahora = AHORA) {
    return calcularProgresoDesde(
      dias.map((dia) => partida(dia, 30)),
      [],
      ahora,
    ).racha;
  }

  test("partida hoy, ayer y anteayer → 3", () => {
    assert.equal(racha(["2026-11-07", "2026-11-06", "2026-11-05"]), 3);
  });

  test("solo ayer y anteayer → 2", () => {
    assert.equal(racha(["2026-11-06", "2026-11-05"]), 2);
  });

  test("ni hoy ni ayer → 0", () => {
    assert.equal(racha(["2026-11-05", "2026-11-04"]), 0);
  });

  test("un hueco de un día corta la racha", () => {
    assert.equal(
      racha(["2026-11-07", "2026-11-06", "2026-11-04", "2026-11-03"]),
      2,
    );
  });

  test("cruza el cambio de mes (31 oct → 1 nov)", () => {
    assert.equal(
      racha(
        ["2026-11-01", "2026-10-31", "2026-10-30"],
        new Date("2026-11-01T17:00:00Z"),
      ),
      3,
    );
  });

  test("una partida de 0 minutos cuenta como día jugado", () => {
    const progreso = calcularProgresoDesde(
      [partida("2026-11-07", 0)],
      [],
      AHORA,
    );
    assert.equal(progreso.racha, 1);
  });
});

describe("hitosPorAlcanzar (caso 13)", () => {
  const yaAlcanzado = new Date("2026-10-30T22:10:00Z");
  const hitos = [
    { porcentajeObjetivo: 25, alcanzadoEn: yaAlcanzado },
    { porcentajeObjetivo: 50 },
    { porcentajeObjetivo: 75 },
  ];

  test("devuelve los hitos pendientes con porcentaje objetivo ≤ avance", () => {
    assert.deepEqual(hitosPorAlcanzar(hitos, 50), [hitos[1]]);
    assert.deepEqual(hitosPorAlcanzar(hitos, 80), [hitos[1], hitos[2]]);
  });

  test("no toca los ya alcanzados aunque el avance baje", () => {
    assert.deepEqual(hitosPorAlcanzar(hitos, 10), []);
    assert.equal(hitos[0].alcanzadoEn, yaAlcanzado);
  });

  test("sin avance no alcanza nada", () => {
    assert.deepEqual(hitosPorAlcanzar(hitos, null), []);
  });
});

describe("validarNuevoHito (caso 14)", () => {
  const metaCon = (...porcentajesObjetivo) => ({
    hitos: porcentajesObjetivo.map((porcentajeObjetivo) => ({
      porcentajeObjetivo,
    })),
  });

  test("un hito válido devuelve null", () => {
    assert.deepEqual(
      validarNuevoHito(
        metaCon(),
        { descripcion: "Llegar al 50 %", porcentajeObjetivo: 50 },
        40,
      ),
      null,
    );
  });

  test("porcentajeObjetivo menor que el avance → error", () => {
    assert.deepEqual(
      validarNuevoHito(
        metaCon(),
        { descripcion: "A", porcentajeObjetivo: 30 },
        40,
      ),
      {
        status: 400,
        mensaje:
          "El porcentaje objetivo del hito debe ser mayor que el avance actual (40 %)",
      },
    );
  });

  test("porcentajeObjetivo igual al avance → error", () => {
    assert.deepEqual(
      validarNuevoHito(
        metaCon(),
        { descripcion: "A", porcentajeObjetivo: 40 },
        40,
      ),
      {
        status: 400,
        mensaje:
          "El porcentaje objetivo del hito debe ser mayor que el avance actual (40 %)",
      },
    );
  });

  test("sin avance cuenta como 0", () => {
    assert.deepEqual(
      validarNuevoHito(
        metaCon(),
        { descripcion: "A", porcentajeObjetivo: 1 },
        null,
      ),
      null,
    );
  });

  test("porcentajeObjetivo repetido → 409 (B-24)", () => {
    assert.deepEqual(
      validarNuevoHito(
        metaCon(50),
        { descripcion: "A", porcentajeObjetivo: 50 },
        0,
      ),
      {
        status: 409,
        mensaje: "Ya existe un hito con porcentaje objetivo 50 %",
      },
    );
  });

  test("sexto hito → error", () => {
    assert.deepEqual(
      validarNuevoHito(
        metaCon(10, 20, 30, 40, 50),
        { descripcion: "A", porcentajeObjetivo: 60 },
        0,
      ),
      { status: 400, mensaje: "Una meta admite como máximo 5 hitos" },
    );
  });

  test("descripción vacía → error", () => {
    assert.deepEqual(
      validarNuevoHito(
        metaCon(),
        { descripcion: "  ", porcentajeObjetivo: 60 },
        0,
      ),
      { status: 400, mensaje: "La descripción del hito es obligatoria" },
    );
  });

  for (const porcentajeObjetivo of [0, 101, 2.5, "50"]) {
    test(`porcentajeObjetivo ${JSON.stringify(porcentajeObjetivo)} → error`, () => {
      assert.deepEqual(
        validarNuevoHito(
          metaCon(),
          { descripcion: "A", porcentajeObjetivo },
          0,
        ),
        {
          status: 400,
          mensaje:
            "El porcentaje objetivo del hito debe ser un entero entre 1 y 100",
        },
      );
    });
  }
});

describe("debeArchivarMeta (caso 15)", () => {
  for (const estado of ["completado", "abandonado"]) {
    test(`${estado} → true`, () =>
      assert.equal(debeArchivarMeta(estado), true));
  }
  for (const estado of ["jugando", "pausado", undefined]) {
    test(`${estado} → false`, () =>
      assert.equal(debeArchivarMeta(estado), false));
  }
});

describe("calcularProgresoDesde — mejor racha (caso 16)", () => {
  function rachas(dias) {
    const { racha, mejorRacha } = calcularProgresoDesde(
      dias.map((dia) => partida(dia, 30)),
      [],
      AHORA,
    );
    return { racha, mejorRacha };
  }

  test("sin partidas → 0", () => {
    assert.deepEqual(rachas([]), { racha: 0, mejorRacha: 0 });
  });

  test("una serie pasada de 5 días y la actual de 2 → mejor 5, actual 2", () => {
    assert.deepEqual(
      rachas([
        "2026-10-10",
        "2026-10-11",
        "2026-10-12",
        "2026-10-13",
        "2026-10-14",
        "2026-11-06",
        "2026-11-07",
      ]),
      { racha: 2, mejorRacha: 5 },
    );
  });

  test("la mejor puede ser una serie pasada (cruce de mes); si es la actual, coincide con rachaActual", () => {
    assert.deepEqual(
      rachas(["2026-10-20", "2026-10-30", "2026-10-31", "2026-11-01"]),
      { racha: 0, mejorRacha: 3 },
    );
    assert.deepEqual(rachas(["2026-11-05", "2026-11-06", "2026-11-07"]), {
      racha: 3,
      mejorRacha: 3,
    });
  });

  test("varias partidas el mismo día cuentan como un día", () => {
    assert.deepEqual(rachas(["2026-11-07", "2026-11-07", "2026-11-06"]), {
      racha: 2,
      mejorRacha: 2,
    });
  });

  test("las partidas futuras no cuentan", () => {
    assert.deepEqual(
      rachas(["2026-11-07", "2026-11-08", "2026-11-09", "2026-11-10"]),
      { racha: 1, mejorRacha: 1 },
    );
  });
});

describe("aProgresoSemanal (caso 17)", () => {
  const alcanzado25 = new Date("2026-10-20T22:10:00Z");
  const alcanzado50 = new Date("2026-10-30T22:10:00Z");

  test("con meta: estructura de la spec §5, horas con 1 decimal e hitos ordenados", () => {
    const metaActiva = {
      ...meta(5, 4, META_DESDE_OCTUBRE),
      hitos: [
        {
          _id: "h100",
          descripcion: "Terminar el juego",
          porcentajeObjetivo: 100,
        },
        {
          _id: "h25",
          descripcion: "Llegar al 25 %",
          porcentajeObjetivo: 25,
          alcanzadoEn: alcanzado25,
        },
        {
          _id: "h50",
          descripcion: "Llegar al 50 %",
          porcentajeObjetivo: 50,
          alcanzadoEn: alcanzado50,
        },
      ],
    };
    const respuesta = aProgresoSemanal(
      calcularProgresoDesde(
        [
          partida("2026-11-04", 120, 40),
          partida("2026-11-05", 50, 55),
          partida("2026-11-06", 40, 60),
          partida("2026-11-07", 0, 62),
        ],
        [metaActiva],
        AHORA,
      ),
    );

    assert.deepEqual(respuesta.semana, {
      inicio: "2026-11-02",
      fin: "2026-11-08",
    });
    assert.deepEqual(respuesta.meta, { horasSemanales: 5, diasPorSemana: 4 });
    assert.equal(respuesta.horasSemana, 3.5); // 210 min
    assert.equal(respuesta.porcentajeHoras, 70);
    assert.equal(respuesta.diasJugadosSemana, 4);
    assert.equal(respuesta.porcentajeDias, 100);
    assert.equal(respuesta.cumplida, false);
    assert.equal(respuesta.rachaActual, 4);
    assert.equal(respuesta.mejorRacha, 4);
    assert.equal(respuesta.porcentajeAvanceActual, 62);
    assert.deepEqual(respuesta.hitos, [
      {
        _id: "h25",
        descripcion: "Llegar al 25 %",
        porcentajeObjetivo: 25,
        alcanzado: true,
        alcanzadoEn: alcanzado25,
      },
      {
        _id: "h50",
        descripcion: "Llegar al 50 %",
        porcentajeObjetivo: 50,
        alcanzado: true,
        alcanzadoEn: alcanzado50,
      },
      {
        _id: "h100",
        descripcion: "Terminar el juego",
        porcentajeObjetivo: 100,
        alcanzado: false,
        alcanzadoEn: null,
      },
    ]);
    assert.equal(respuesta.ultimas4.length, 4);
    assert.equal(respuesta.semanasConMeta, 4);
    assert.equal(respuesta.semanasCumplidas, 0);
  });

  test("redondea horasSemana a 1 decimal", () => {
    const respuesta = aProgresoSemanal(
      calcularProgresoDesde([partida("2026-11-03", 20)], [], AHORA),
    );
    assert.equal(respuesta.horasSemana, 0.3);
  });

  const metaConHitos = (...hitos) => ({
    ...meta(5, 4, META_DESDE_OCTUBRE),
    hitos,
  });

  test("hito con alcanzadoEn pero avance actual menor → no alcanzado, fecha conservada", () => {
    const respuesta = aProgresoSemanal(
      calcularProgresoDesde(
        [partida("2026-11-06", 30, 60), partida("2026-11-07", 30, 45)],
        [
          metaConHitos({
            _id: "h50",
            descripcion: "50",
            porcentajeObjetivo: 50,
            alcanzadoEn: alcanzado50,
          }),
        ],
        AHORA,
      ),
    );
    assert.equal(respuesta.hitos[0].alcanzado, false);
    assert.equal(respuesta.hitos[0].alcanzadoEn, alcanzado50);
  });

  test("avance igual al objetivo → alcanzado", () => {
    const respuesta = aProgresoSemanal(
      calcularProgresoDesde(
        [partida("2026-11-07", 30, 50)],
        [
          metaConHitos({
            _id: "h50",
            descripcion: "50",
            porcentajeObjetivo: 50,
          }),
        ],
        AHORA,
      ),
    );
    assert.equal(respuesta.hitos[0].alcanzado, true);
  });

  test("sin partidas → horas, días y rachas en 0 y ningún hito alcanzado", () => {
    const respuesta = aProgresoSemanal(
      calcularProgresoDesde(
        [],
        [
          metaConHitos(
            {
              _id: "h25",
              descripcion: "25",
              porcentajeObjetivo: 25,
              alcanzadoEn: alcanzado25,
            },
            { _id: "h50", descripcion: "50", porcentajeObjetivo: 50 },
          ),
        ],
        AHORA,
      ),
    );
    assert.equal(respuesta.horasSemana, 0);
    assert.equal(respuesta.diasJugadosSemana, 0);
    assert.equal(respuesta.rachaActual, 0);
    assert.equal(respuesta.mejorRacha, 0);
    assert.equal(respuesta.porcentajeAvanceActual, null);
    assert.ok(respuesta.hitos.every((hito) => hito.alcanzado === false));
    assert.equal(respuesta.hitos[0].alcanzadoEn, alcanzado25);
  });

  test("sin meta: campos de meta en null, sin hitos y el resto calculado", () => {
    const respuesta = aProgresoSemanal(
      calcularProgresoDesde(
        [partida("2026-11-06", 60), partida("2026-11-07", 30)],
        [],
        AHORA,
      ),
    );
    assert.deepEqual(respuesta, {
      semana: { inicio: "2026-11-02", fin: "2026-11-08" },
      meta: null,
      horasSemana: 1.5,
      porcentajeHoras: null,
      diasJugadosSemana: 2,
      porcentajeDias: null,
      cumplida: null,
      rachaActual: 2,
      mejorRacha: 2,
      porcentajeAvanceActual: null,
      hitos: [],
      ultimas4: [
        { inicio: "2026-10-05", fin: "2026-10-11", estado: "sin_meta" },
        { inicio: "2026-10-12", fin: "2026-10-18", estado: "sin_meta" },
        { inicio: "2026-10-19", fin: "2026-10-25", estado: "sin_meta" },
        { inicio: "2026-10-26", fin: "2026-11-01", estado: "sin_meta" },
      ],
      semanasCumplidas: 0,
      semanasConMeta: 0,
    });
  });
});
