// Reglas puras del CRUD de Meta (spec E2 backend §6, metas.test.js; ticket E2-T15).
const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const {
  validarDatosMeta,
  validarCreacionMeta,
  validarIdMeta,
  validarModificacionMeta,
  combinarCambiosMeta,
  validarDesactivacionMeta,
  MENSAJES_CRUD_META,
} = require("../../backend/src/dominio/metas");
const { MENSAJES_META } = require("../../backend/src/models/meta.model");

describe("validarDatosMeta (caso 1, B-02 y B-18)", () => {
  const validos = { horasSemanales: 5, diasPorSemana: 3 };

  for (const horasSemanales of [0, 101, -1, "5", null, undefined, NaN]) {
    test(`horas ${String(horasSemanales)} → 400 con el mensaje de horas`, () => {
      assert.deepEqual(
        validarDatosMeta({ ...validos, horasSemanales }, "jugando"),
        { status: 400, mensaje: MENSAJES_META.horas },
      );
    });
  }

  for (const diasPorSemana of [0, 8, 2.5, "3", undefined]) {
    test(`días ${String(diasPorSemana)} → 400 con el mensaje de días`, () => {
      assert.deepEqual(
        validarDatosMeta({ ...validos, diasPorSemana }, "jugando"),
        { status: 400, mensaje: MENSAJES_META.dias },
      );
    });
  }

  test("los límites 100 h y 1 y 7 días son válidos", () => {
    assert.equal(
      validarDatosMeta({ horasSemanales: 100, diasPorSemana: 7 }, "jugando"),
      null,
    );
    assert.equal(
      validarDatosMeta({ horasSemanales: 0.5, diasPorSemana: 1 }, "jugando"),
      null,
    );
  });

  for (const estado of ["completado", "abandonado"]) {
    test(`juego ${estado} → 400 «juego cerrado»`, () => {
      assert.deepEqual(validarDatosMeta(validos, estado), {
        status: 400,
        mensaje: MENSAJES_META.juegoCerrado,
      });
    });
  }

  for (const estado of ["jugando", "pausado"]) {
    test(`datos válidos en juego ${estado} → null`, () => {
      assert.equal(validarDatosMeta(validos, estado), null);
    });
  }
});

describe("validarCreacionMeta (caso 2, B-25)", () => {
  test("con una meta activa → 409 con el mensaje de B-25", () => {
    assert.deepEqual(validarCreacionMeta(true), {
      status: 409,
      mensaje:
        "El videojuego ya tiene una meta activa; cámbiala o desactívala antes de crear otra",
    });
  });

  test("sin meta activa → null", () => {
    assert.equal(validarCreacionMeta(false), null);
  });
});

describe("validarIdMeta (caso 3, B-27)", () => {
  test('"abc" → 400 con el mensaje de id inválido', () => {
    assert.deepEqual(validarIdMeta("abc"), {
      status: 400,
      mensaje: '"abc" no es un id válido para el campo "metaId"',
    });
  });

  test("un ObjectId válido → null", () => {
    assert.equal(validarIdMeta("6630f1a2b3c4d5e6f7a8b9c0"), null);
  });

  test("el mensaje de 404 nombra el id", () => {
    assert.equal(
      MENSAJES_CRUD_META.noExiste("6630f1a2b3c4d5e6f7a8b9c0"),
      "No existe una meta con id 6630f1a2b3c4d5e6f7a8b9c0",
    );
  });
});

describe("validarModificacionMeta (caso 4, B-28)", () => {
  test("meta desactivada → 409", () => {
    assert.deepEqual(validarModificacionMeta({ activa: false }), {
      status: 409,
      mensaje: "La meta está desactivada y no se puede modificar",
    });
  });

  test("meta activa → null", () => {
    assert.equal(validarModificacionMeta({ activa: true }), null);
  });
});

describe("combinarCambiosMeta (caso 5, B-28)", () => {
  const actual = { horasSemanales: 5, diasPorSemana: 3 };

  test("solo horasSemanales → conserva diasPorSemana", () => {
    assert.deepEqual(combinarCambiosMeta(actual, { horasSemanales: 8 }), {
      horasSemanales: 8,
      diasPorSemana: 3,
    });
  });

  test("solo diasPorSemana → conserva horasSemanales", () => {
    assert.deepEqual(combinarCambiosMeta(actual, { diasPorSemana: 4 }), {
      horasSemanales: 5,
      diasPorSemana: 4,
    });
  });

  test("cuerpo vacío → los dos valores actuales", () => {
    assert.deepEqual(combinarCambiosMeta(actual, {}), actual);
  });

  test("un valor no válido se pasa tal cual para que lo rechace validarDatosMeta", () => {
    const combinadas = combinarCambiosMeta(actual, { horasSemanales: 0 });
    assert.deepEqual(combinadas, { horasSemanales: 0, diasPorSemana: 3 });
    assert.equal(validarDatosMeta(combinadas, "jugando").status, 400);
  });
});

describe("validarDesactivacionMeta (caso 6, B-29)", () => {
  test("meta ya desactivada → 409", () => {
    assert.deepEqual(validarDesactivacionMeta({ activa: false }), {
      status: 409,
      mensaje: "La meta ya está desactivada",
    });
  });

  test("meta activa → null", () => {
    assert.equal(validarDesactivacionMeta({ activa: true }), null);
  });
});
