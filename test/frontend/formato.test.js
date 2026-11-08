const { describe, test, after } = require("node:test");
const assert = require("node:assert/strict");
const {
  formatearFecha,
  formatearInstante,
  formatearDia,
  formatearHoras,
  anchoBarra,
  textoRacha,
} = require("../../frontend/src/utils/formato");

describe("formatearFecha", () => {
  const tzOriginal = process.env.TZ;
  after(() => {
    if (tzOriginal === undefined) delete process.env.TZ;
    else process.env.TZ = tzOriginal;
  });

  for (const zona of ["UTC", "America/Guayaquil", "Asia/Tokyo"]) {
    test(`una partida del 21/10/2026 se ve «21 oct 2026» con TZ=${zona}`, () => {
      process.env.TZ = zona;
      assert.equal(formatearFecha("2026-10-21T00:00:00.000Z"), "21 oct 2026");
    });
  }

  test("una fecha inválida muestra «Fecha no disponible»", () => {
    assert.equal(formatearFecha("no-es-fecha"), "Fecha no disponible");
  });
});

describe("formatearInstante", () => {
  test("usa el día de Ecuador (02:00 UTC del 31 → 30 oct)", () => {
    assert.equal(formatearInstante("2026-10-31T02:00:00.000Z"), "30 oct 2026");
  });
});

describe("formatearDia", () => {
  test('"2026-10-12" → «12 oct»', () => {
    assert.equal(formatearDia("2026-10-12"), "12 oct");
  });
});

describe("formatearHoras", () => {
  test("usa coma decimal", () => {
    assert.equal(formatearHoras(3.5), "3,5");
  });

  test("sin decimales para enteros", () => {
    assert.equal(formatearHoras(7), "7");
  });
});

describe("anchoBarra", () => {
  test("no supera el 100 %", () => {
    assert.equal(anchoBarra(140), 100);
  });

  test("deja igual un porcentaje dentro del rango", () => {
    assert.equal(anchoBarra(70), 70);
  });

  test("no baja de 0", () => {
    assert.equal(anchoBarra(-5), 0);
  });
});

describe("textoRacha", () => {
  test("0 → «Sin racha»", () => {
    assert.equal(textoRacha(0), "Sin racha");
  });

  test("1 → «1 día seguido»", () => {
    assert.equal(textoRacha(1), "1 día seguido");
  });

  test("3 → «3 días seguidos»", () => {
    assert.equal(textoRacha(3), "3 días seguidos");
  });
});
