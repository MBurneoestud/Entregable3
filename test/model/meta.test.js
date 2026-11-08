const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const { Meta } = require("../../backend/src/models/meta.model");

const ID_VIDEOJUEGO = "507f1f77bcf86cd799439011";

function datosValidos() {
  return {
    videojuego: ID_VIDEOJUEGO,
    horasPorSemana: 5,
    diasPorSemana: 3,
    vigenteDesde: new Date(Date.UTC(2026, 10, 2, 15)),
  };
}

function hitos(n) {
  return Array.from({ length: n }, (_, i) => ({
    nombre: `Hito ${i + 1}`,
    objetivo: (i + 1) * 10,
  }));
}

function erroresDe(datos) {
  return new Meta(datos).validateSync()?.errors ?? {};
}

describe("Modelo Meta", () => {
  test("una meta con horas, días y vigencia es válida y activa por defecto", () => {
    const meta = new Meta(datosValidos());
    assert.equal(meta.validateSync(), undefined);
    assert.equal(meta.activa, true);
    assert.deepEqual([...meta.hitos], []);
  });

  for (const horasPorSemana of [0.5, 168]) {
    test(`acepta ${horasPorSemana} horas por semana`, () => {
      assert.deepEqual(erroresDe({ ...datosValidos(), horasPorSemana }), {});
    });
  }

  for (const horasPorSemana of [0, -1, 169]) {
    test(`rechaza ${horasPorSemana} horas por semana`, () => {
      const errores = erroresDe({ ...datosValidos(), horasPorSemana });
      assert.equal(
        errores.horasPorSemana.message,
        "Las horas por semana deben ser un número mayor que 0 y como máximo 168",
      );
    });
  }

  test("exige horasPorSemana", () => {
    const datos = datosValidos();
    delete datos.horasPorSemana;
    assert.ok(erroresDe(datos).horasPorSemana);
  });

  for (const diasPorSemana of [1, 7]) {
    test(`acepta ${diasPorSemana} días por semana`, () => {
      assert.deepEqual(erroresDe({ ...datosValidos(), diasPorSemana }), {});
    });
  }

  for (const diasPorSemana of [0, 8, 2.5]) {
    test(`rechaza ${diasPorSemana} días por semana`, () => {
      const errores = erroresDe({ ...datosValidos(), diasPorSemana });
      assert.equal(
        errores.diasPorSemana.message,
        "Los días por semana deben ser un entero entre 1 y 7",
      );
    });
  }

  test("exige diasPorSemana", () => {
    const datos = datosValidos();
    delete datos.diasPorSemana;
    assert.ok(erroresDe(datos).diasPorSemana);
  });

  test("acepta 5 hitos, cada uno con su propio _id", () => {
    const meta = new Meta({ ...datosValidos(), hitos: hitos(5) });
    assert.equal(meta.validateSync(), undefined);
    assert.ok(meta.hitos.every((hito) => hito._id));
  });

  test("rechaza un sexto hito", () => {
    const errores = erroresDe({ ...datosValidos(), hitos: hitos(6) });
    assert.equal(errores.hitos.message, "Una meta admite como máximo 5 hitos");
  });

  for (const nombre of ["", "   "]) {
    test(`rechaza un hito con nombre ${JSON.stringify(nombre)}`, () => {
      const errores = erroresDe({
        ...datosValidos(),
        hitos: [{ nombre, objetivo: 50 }],
      });
      assert.equal(
        errores["hitos.0.nombre"].message,
        "El nombre del hito es obligatorio",
      );
    });
  }

  test("recorta los espacios del nombre del hito", () => {
    const meta = new Meta({
      ...datosValidos(),
      hitos: [{ nombre: "  Jefe final  ", objetivo: 50 }],
    });
    assert.equal(meta.hitos[0].nombre, "Jefe final");
  });

  for (const objetivo of [0, 101, 2.5]) {
    test(`rechaza un hito con objetivo ${objetivo}`, () => {
      const errores = erroresDe({
        ...datosValidos(),
        hitos: [{ nombre: "Hito", objetivo }],
      });
      assert.equal(
        errores["hitos.0.objetivo"].message,
        "El objetivo del hito debe ser un entero entre 1 y 100",
      );
    });
  }

  test("rechaza dos hitos con el mismo objetivo", () => {
    const errores = erroresDe({
      ...datosValidos(),
      hitos: [
        { nombre: "A", objetivo: 50 },
        { nombre: "B", objetivo: 50 },
      ],
    });
    assert.ok(errores.hitos);
  });
});
