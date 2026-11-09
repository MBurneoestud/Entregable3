const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const {
  diaCalendario,
  interpretarFecha,
  hoyEcuador,
  esFechaFutura,
  sumarDias,
  inicioSemana,
} = require("../../backend/src/dominio/fechas");

// Todas las fechas se construyen en UTC para que los tests no dependan de la
// zona horaria del proceso (diagnóstico #17).
function utc(anio, mes, dia, hora = 0, minuto = 0) {
  return new Date(Date.UTC(anio, mes - 1, dia, hora, minuto));
}

describe("diaCalendario", () => {
  test("devuelve la parte UTC de la fecha en formato AAAA-MM-DD", () => {
    assert.equal(diaCalendario(utc(2026, 10, 21)), "2026-10-21");
  });

  test("las 00:01 y las 23:59 UTC caen el mismo día", () => {
    assert.equal(
      diaCalendario(utc(2026, 10, 28, 0, 1)),
      diaCalendario(utc(2026, 10, 28, 23, 59)),
    );
  });

  test("las 23:59 y las 00:00 siguientes son días distintos", () => {
    assert.ok(
      diaCalendario(utc(2026, 10, 28, 23, 59)) <
        diaCalendario(utc(2026, 10, 29)),
    );
  });

  test("ordena los días a través de un cambio de mes y de año", () => {
    assert.ok(
      diaCalendario(utc(2026, 10, 31)) < diaCalendario(utc(2026, 11, 1)),
    );
    assert.ok(
      diaCalendario(utc(2026, 12, 31)) < diaCalendario(utc(2027, 1, 1)),
    );
  });
});

describe("interpretarFecha", () => {
  test("interpreta AAAA-MM-DD como las 00:00 UTC de ese día", () => {
    assert.equal(
      interpretarFecha("2026-10-21").toISOString(),
      "2026-10-21T00:00:00.000Z",
    );
  });

  test("es la inversa de diaCalendario", () => {
    assert.equal(diaCalendario(interpretarFecha("2027-01-01")), "2027-01-01");
  });

  for (const invalida of [
    "2026-02-30",
    "2026-13-01",
    "21/10/2026",
    "2026-10-21T10:00:00Z",
    "",
  ]) {
    test(`rechaza "${invalida}" con un error 400`, () => {
      assert.throws(
        () => interpretarFecha(invalida),
        (error) => {
          assert.equal(error.name, "ApiError");
          assert.equal(error.status, 400);
          return true;
        },
      );
    });
  }
});

describe("hoyEcuador", () => {
  test("a las 04:59 UTC todavía es el día anterior en Ecuador", () => {
    assert.equal(hoyEcuador(new Date("2026-11-09T04:59:00Z")), "2026-11-08");
  });

  test("a las 05:00 UTC ya es el día siguiente en Ecuador", () => {
    assert.equal(hoyEcuador(new Date("2026-11-09T05:00:00Z")), "2026-11-09");
  });
});

describe("esFechaFutura", () => {
  test("mañana es futuro", () => {
    assert.equal(esFechaFutura("2026-10-29", "2026-10-28"), true);
  });

  test("hoy no es futuro", () => {
    assert.equal(esFechaFutura("2026-10-28", "2026-10-28"), false);
  });

  test("ayer no es futuro", () => {
    assert.equal(esFechaFutura("2026-10-27", "2026-10-28"), false);
  });
});

describe("sumarDias", () => {
  test("suma y resta días dentro del mes", () => {
    assert.equal(sumarDias("2026-11-07", 1), "2026-11-08");
    assert.equal(sumarDias("2026-11-07", -6), "2026-11-01");
  });

  test("cruza el cambio de mes", () => {
    assert.equal(sumarDias("2026-10-31", 1), "2026-11-01");
    assert.equal(sumarDias("2026-11-01", -1), "2026-10-31");
  });

  test("cruza el cambio de año", () => {
    assert.equal(sumarDias("2026-12-31", 1), "2027-01-01");
    assert.equal(sumarDias("2027-01-01", -1), "2026-12-31");
  });

  test("n = 0 devuelve el mismo día", () => {
    assert.equal(sumarDias("2026-11-07", 0), "2026-11-07");
  });
});

describe("inicioSemana", () => {
  test("un lunes es su propio inicio de semana", () => {
    assert.equal(inicioSemana("2026-11-02"), "2026-11-02");
  });

  test("un domingo pertenece a la semana que empezó el lunes anterior", () => {
    assert.equal(inicioSemana("2026-11-08"), "2026-11-02");
  });

  test("un sábado a mitad de semana", () => {
    assert.equal(inicioSemana("2026-11-07"), "2026-11-02");
  });

  test("cruza el cambio de mes", () => {
    assert.equal(inicioSemana("2026-11-01"), "2026-10-26");
  });

  test("cruza el cambio de año", () => {
    assert.equal(inicioSemana("2026-01-01"), "2025-12-29");
  });
});
