const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const { Meta } = require("../../backend/src/models/meta.model");

const ID_VIDEOJUEGO = "507f1f77bcf86cd799439011";

function datosValidos() {
  return {
    videojuego: ID_VIDEOJUEGO,
    horasSemanales: 5,
    diasPorSemana: 3,
    vigenteDesde: new Date(Date.UTC(2026, 10, 2, 15)),
  };
}

function hitos(n) {
  return Array.from({ length: n }, (_, i) => ({
    descripcion: `Hito ${i + 1}`,
    porcentajeObjetivo: (i + 1) * 10,
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

  for (const horasSemanales of [0.5, 100]) {
    test(`acepta ${horasSemanales} horas por semana`, () => {
      assert.deepEqual(erroresDe({ ...datosValidos(), horasSemanales }), {});
    });
  }

  for (const horasSemanales of [0, -1, 100.5, 101]) {
    test(`rechaza ${horasSemanales} horas por semana`, () => {
      const errores = erroresDe({ ...datosValidos(), horasSemanales });
      assert.equal(
        errores.horasSemanales.message,
        "Las horas por semana deben ser un número mayor que 0 y como máximo 100",
      );
    });
  }

  test("exige horasSemanales", () => {
    const datos = datosValidos();
    delete datos.horasSemanales;
    assert.ok(erroresDe(datos).horasSemanales);
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

  for (const descripcion of ["", "   "]) {
    test(`rechaza un hito con descripción ${JSON.stringify(descripcion)}`, () => {
      const errores = erroresDe({
        ...datosValidos(),
        hitos: [{ descripcion, porcentajeObjetivo: 50 }],
      });
      assert.equal(
        errores["hitos.0.descripcion"].message,
        "La descripción del hito es obligatoria",
      );
    });
  }

  test("recorta los espacios de la descripción del hito", () => {
    const meta = new Meta({
      ...datosValidos(),
      hitos: [{ descripcion: "  Jefe final  ", porcentajeObjetivo: 50 }],
    });
    assert.equal(meta.hitos[0].descripcion, "Jefe final");
  });

  for (const porcentajeObjetivo of [0, 101, 2.5]) {
    test(`rechaza un hito con porcentaje objetivo ${porcentajeObjetivo}`, () => {
      const errores = erroresDe({
        ...datosValidos(),
        hitos: [{ descripcion: "Hito", porcentajeObjetivo }],
      });
      assert.equal(
        errores["hitos.0.porcentajeObjetivo"].message,
        "El porcentaje objetivo del hito debe ser un entero entre 1 y 100",
      );
    });
  }

  test("rechaza dos hitos con el mismo porcentaje objetivo", () => {
    const errores = erroresDe({
      ...datosValidos(),
      hitos: [
        { descripcion: "A", porcentajeObjetivo: 50 },
        { descripcion: "B", porcentajeObjetivo: 50 },
      ],
    });
    assert.ok(errores.hitos);
  });
});
