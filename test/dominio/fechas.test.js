const { describe, test } = require("node:test");
const assert = require("node:assert/strict");

// backend/src/dominio/fechas.ts todavía no existe: se implementará cuando haya
// una spec en docs/specs/ (p. ej. la de metas y rachas). Mientras tanto, la
// suite se marca como omitida en lugar de fallar.
let fechas = null;
try {
  fechas = require("../../backend/src/dominio/fechas");
} catch (error) {
  if (error.code !== "MODULE_NOT_FOUND") throw error;
}
const opciones = fechas
  ? {}
  : { skip: "backend/src/dominio/fechas.ts no existe todavía" };
const { diaCalendario, interpretarFecha, esFechaFutura } = fechas ?? {};

// Las fechas se construyen en hora local para que los tests no dependan de TZ.
const hoy = new Date(2026, 9, 28, 10, 0);

function haceDias(dias, hora = 10, minuto = 0) {
  return new Date(2026, 9, 28 - dias, hora, minuto);
}

describe("diaCalendario", opciones, () => {
  test("dos partidas a las 00:01 y a las 23:59 caen el mismo día", () => {
    assert.equal(
      diaCalendario(new Date(2026, 9, 28, 0, 1)),
      diaCalendario(new Date(2026, 9, 28, 23, 59)),
    );
  });

  test("las 23:59 y las 00:00 siguientes son días distintos", () => {
    assert.ok(
      diaCalendario(new Date(2026, 9, 28, 23, 59)) <
        diaCalendario(new Date(2026, 9, 29, 0, 0)),
    );
  });

  test("ordena los días a través de un cambio de mes y de año", () => {
    assert.ok(
      diaCalendario(new Date(2026, 9, 31)) <
        diaCalendario(new Date(2026, 10, 1)),
    );
    assert.ok(
      diaCalendario(new Date(2026, 11, 31)) <
        diaCalendario(new Date(2027, 0, 1)),
    );
  });
});

describe("interpretarFecha", opciones, () => {
  test("interpreta la fecha del formulario (YYYY-MM-DD) como medianoche en hora local", () => {
    const fecha = interpretarFecha("2026-10-21");
    assert.equal(fecha.getFullYear(), 2026);
    assert.equal(fecha.getMonth(), 9);
    assert.equal(fecha.getDate(), 21);
    assert.equal(fecha.getHours(), 0);
  });

  test("deja igual cualquier otro valor", () => {
    const fecha = new Date();
    assert.equal(interpretarFecha(fecha), fecha);
    assert.equal(
      interpretarFecha("2026-10-21T10:00:00Z"),
      "2026-10-21T10:00:00Z",
    );
    assert.equal(interpretarFecha(undefined), undefined);
  });
});

describe("esFechaFutura", opciones, () => {
  test("una partida de mañana es futura", () => {
    assert.equal(esFechaFutura(haceDias(-1, 0, 0), hoy), true);
  });

  test("una partida de hoy a las 23:59 no es futura", () => {
    assert.equal(esFechaFutura(haceDias(0, 23, 59), hoy), false);
  });

  test("una partida de ayer no es futura", () => {
    assert.equal(esFechaFutura(haceDias(1), hoy), false);
  });
});
