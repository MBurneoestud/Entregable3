const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("../../backend/node_modules/mongoose");
const { errorHandler } = require("../../backend/src/middlewares/errorHandler");
const { ApiError } = require("../../backend/src/apiError");

/** Respuesta mínima de Express que guarda el status y el JSON enviados. */
function respuestaFalsa() {
  return {
    statusCode: undefined,
    cuerpo: undefined,
    status(codigo) {
      this.statusCode = codigo;
      return this;
    },
    json(cuerpo) {
      this.cuerpo = cuerpo;
      return this;
    },
  };
}

function manejar(error) {
  const res = respuestaFalsa();
  errorHandler(error, { id: "req-1" }, res, () => {});
  return res;
}

describe("errorHandler (B-20, B-24)", () => {
  test("ApiError(409) → 409 con su mensaje", () => {
    const res = manejar(
      new ApiError(409, "Ya existe un hito con porcentaje objetivo 50 %"),
    );
    assert.equal(res.statusCode, 409);
    assert.deepEqual(res.cuerpo, {
      error: "Ya existe un hito con porcentaje objetivo 50 %",
      requestId: "req-1",
    });
  });

  test("error E11000 de MongoDB (índice único) → 409", () => {
    const duplicado = Object.assign(
      new Error("E11000 duplicate key error collection: metas"),
      { name: "MongoServerError", code: 11000 },
    );
    const res = manejar(duplicado);
    assert.equal(res.statusCode, 409);
    assert.deepEqual(res.cuerpo, {
      error: "Ya existe un recurso con esos datos; vuelve a intentarlo",
      requestId: "req-1",
    });
  });

  test("CastError (id con formato inválido) → 400", () => {
    const res = manejar(new mongoose.Error.CastError("ObjectId", "abc", "_id"));
    assert.equal(res.statusCode, 400);
    assert.match(res.cuerpo.error, /"abc" no es un id válido/);
  });
});
