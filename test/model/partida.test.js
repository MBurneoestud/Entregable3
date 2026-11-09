const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const { Partida } = require("../../backend/src/models/partida.model");

// ObjectId válido en texto: Mongoose lo convierte al validar y así el test
// no necesita importar mongoose desde fuera de backend/.
const ID_VIDEOJUEGO = "507f1f77bcf86cd799439011";

function datosValidos() {
  return {
    videojuego: ID_VIDEOJUEGO,
    fecha: new Date(2026, 9, 21),
    duracionMinutos: 90,
  };
}

function erroresDe(datos) {
  return new Partida(datos).validateSync()?.errors ?? {};
}

describe("Modelo Partida", () => {
  test("una partida con videojuego, fecha y duración es válida", () => {
    const partida = new Partida(datosValidos());
    assert.equal(partida.validateSync(), undefined);
    assert.equal(String(partida.videojuego), ID_VIDEOJUEGO);
    assert.equal(partida.duracionMinutos, 90);
  });

  test("porcentajeAvance y notas son opcionales y se guardan si se indican", () => {
    const partida = new Partida({
      ...datosValidos(),
      porcentajeAvance: 45,
      notas: "Llegué al segundo jefe",
    });
    assert.equal(partida.validateSync(), undefined);
    assert.equal(partida.porcentajeAvance, 45);
    assert.equal(partida.notas, "Llegué al segundo jefe");
  });

  for (const campo of ["videojuego", "fecha", "duracionMinutos"]) {
    test(`rechaza una partida sin ${campo}`, () => {
      const datos = datosValidos();
      delete datos[campo];
      const errores = erroresDe(datos);
      assert.deepEqual(Object.keys(errores), [campo]);
      assert.match(errores[campo].message, /obligatori|vinculada/);
    });
  }

  test("informa de todos los datos que faltan", () => {
    const errores = erroresDe({});
    assert.deepEqual(Object.keys(errores).sort(), [
      "duracionMinutos",
      "fecha",
      "videojuego",
    ]);
  });

  test("rechaza un videojuego con un identificador que no es válido", () => {
    const errores = erroresDe({ ...datosValidos(), videojuego: "abc" });
    assert.ok(errores.videojuego);
  });

  test("acepta una fecha en formato YYYY-MM-DD", () => {
    const partida = new Partida({ ...datosValidos(), fecha: "2026-10-21" });
    assert.equal(partida.validateSync(), undefined);
    assert.ok(partida.fecha instanceof Date);
  });

  test("rechaza una fecha que no es válida", () => {
    const errores = erroresDe({ ...datosValidos(), fecha: "no es una fecha" });
    assert.ok(errores.fecha);
  });

  test("acepta una duración de 0 minutos", () => {
    assert.deepEqual(erroresDe({ ...datosValidos(), duracionMinutos: 0 }), {});
  });

  test("rechaza una duración negativa", () => {
    const errores = erroresDe({ ...datosValidos(), duracionMinutos: -1 });
    assert.match(errores.duracionMinutos.message, /menor que 0/);
  });

  test("rechaza una duración que no es un número", () => {
    const errores = erroresDe({
      ...datosValidos(),
      duracionMinutos: "noventa",
    });
    assert.ok(errores.duracionMinutos);
  });

  for (const porcentajeAvance of [0, 100]) {
    test(`acepta un avance del ${porcentajeAvance} %`, () => {
      assert.deepEqual(erroresDe({ ...datosValidos(), porcentajeAvance }), {});
    });
  }

  test("rechaza un avance menor que 0", () => {
    const errores = erroresDe({ ...datosValidos(), porcentajeAvance: -5 });
    assert.match(errores.porcentajeAvance.message, /menor que 0/);
  });

  test("rechaza un avance mayor que 100", () => {
    const errores = erroresDe({ ...datosValidos(), porcentajeAvance: 101 });
    assert.match(errores.porcentajeAvance.message, /mayor que 100/);
  });
});
