const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const {
  ordenarPartidasRecientes,
  avanceActual,
} = require("../../backend/src/dominio/partidas");

function partida(dia, creadaA, porcentajeAvance) {
  return {
    fecha: new Date(`${dia}T00:00:00Z`),
    createdAt: new Date(creadaA),
    porcentajeAvance,
  };
}

describe("ordenarPartidasRecientes", () => {
  test("ordena por fecha descendente", () => {
    const a = partida("2026-11-01", "2026-11-01T10:00Z", 10);
    const b = partida("2026-11-03", "2026-11-03T10:00Z", 30);
    assert.deepEqual(ordenarPartidasRecientes([a, b]), [b, a]);
  });

  test("a igual fecha, la creada más tarde va primero", () => {
    const temprana = partida("2026-11-03", "2026-11-03T09:00Z", 40);
    const tardia = partida("2026-11-03", "2026-11-03T21:00Z", 55);
    assert.deepEqual(ordenarPartidasRecientes([temprana, tardia]), [
      tardia,
      temprana,
    ]);
  });

  test("no modifica la lista original", () => {
    const lista = [
      partida("2026-11-01", "2026-11-01T10:00Z"),
      partida("2026-11-03", "2026-11-03T10:00Z"),
    ];
    const copia = [...lista];
    ordenarPartidasRecientes(lista);
    assert.deepEqual(lista, copia);
  });
});

describe("avanceActual", () => {
  test("con dos partidas el mismo día devuelve el avance de la creada más tarde", () => {
    const tardia = partida("2026-11-03", "2026-11-03T21:00Z", 55);
    const temprana = partida("2026-11-03", "2026-11-03T09:00Z", 40);
    assert.equal(avanceActual([tardia, temprana]), 55);
    assert.equal(avanceActual([temprana, tardia]), 55);
  });

  test("una fecha posterior gana aunque se haya creado antes", () => {
    const posterior = partida("2026-11-05", "2026-11-01T10:00Z", 70);
    const anterior = partida("2026-11-02", "2026-11-04T10:00Z", 20);
    assert.equal(avanceActual([anterior, posterior]), 70);
  });

  test("sin partidas devuelve null", () => {
    assert.equal(avanceActual([]), null);
  });

  test("si la partida más reciente no indica avance devuelve null", () => {
    assert.equal(
      avanceActual([partida("2026-11-03", "2026-11-03T10:00Z")]),
      null,
    );
  });
});
