const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const { Videojuego } = require("../../backend/src/models/videojuego.model");

function datosValidos() {
  return {
    nombre: "Hollow Knight",
    plataforma: "PC",
    genero: "accion",
    estado: "jugando",
  };
}

function erroresDe(datos) {
  return new Videojuego(datos).validateSync()?.errors ?? {};
}

describe("Modelo Videojuego", () => {
  test("un videojuego con todos sus datos es válido", () => {
    const videojuego = new Videojuego(datosValidos());
    assert.equal(videojuego.validateSync(), undefined);
    assert.equal(videojuego.nombre, "Hollow Knight");
    assert.equal(videojuego.plataforma, "PC");
    assert.equal(videojuego.genero, "accion");
    assert.equal(videojuego.estado, "jugando");
  });

  test("solo el nombre es obligatorio", () => {
    assert.deepEqual(erroresDe({ nombre: "Celeste" }), {});
  });

  test("logros está vacío por defecto", () => {
    const videojuego = new Videojuego(datosValidos());
    assert.equal(videojuego.logros.length, 0);
  });

  test("rechaza un videojuego sin nombre", () => {
    const datos = datosValidos();
    delete datos.nombre;
    const errores = erroresDe(datos);
    assert.deepEqual(Object.keys(errores), ["nombre"]);
    assert.match(errores.nombre.message, /obligatorio/);
  });

  test("rechaza un nombre con solo espacios", () => {
    const errores = erroresDe({ ...datosValidos(), nombre: "   " });
    assert.deepEqual(Object.keys(errores), ["nombre"]);
  });

  test("recorta los espacios del nombre", () => {
    const videojuego = new Videojuego({
      ...datosValidos(),
      nombre: "  Hollow Knight  ",
    });
    assert.equal(videojuego.nombre, "Hollow Knight");
  });

  for (const plataforma of ["PC", "PlayStation", "Xbox", "Switch", "Movil"]) {
    test(`acepta la plataforma ${plataforma}`, () => {
      assert.deepEqual(erroresDe({ ...datosValidos(), plataforma }), {});
    });
  }

  for (const genero of [
    "accion",
    "rol",
    "estrategia",
    "puzzle",
    "deportes",
    "otro",
  ]) {
    test(`acepta el género ${genero}`, () => {
      assert.deepEqual(erroresDe({ ...datosValidos(), genero }), {});
    });
  }

  for (const estado of ["jugando", "pausado", "completado", "abandonado"]) {
    test(`acepta el estado ${estado}`, () => {
      assert.deepEqual(erroresDe({ ...datosValidos(), estado }), {});
    });
  }

  for (const [campo, valor] of [
    ["plataforma", "GameBoy"],
    ["genero", "terror"],
    ["estado", "pendiente"],
  ]) {
    test(`rechaza ${campo} con un valor fuera de la lista (${valor})`, () => {
      const errores = erroresDe({ ...datosValidos(), [campo]: valor });
      assert.deepEqual(Object.keys(errores), [campo]);
    });
  }

  test("informa de todos los campos no válidos a la vez", () => {
    const errores = erroresDe({
      plataforma: "GameBoy",
      estado: "pendiente",
    });
    assert.deepEqual(Object.keys(errores).sort(), [
      "estado",
      "nombre",
      "plataforma",
    ]);
  });

  test("acepta logros con nombre y estado de obtención", () => {
    const errores = erroresDe({
      ...datosValidos(),
      logros: [
        { nombre: "Derrotar al Falso Caballero", obtenido: true },
        { nombre: "Completar el juego", obtenido: false },
      ],
    });
    assert.deepEqual(errores, {});
  });

  test("rechaza un logro sin nombre", () => {
    const errores = erroresDe({
      ...datosValidos(),
      logros: [{ obtenido: false }],
    });
    assert.ok(errores["logros.0.nombre"]);
  });

  test("rechaza un logro sin estado de obtención", () => {
    const errores = erroresDe({
      ...datosValidos(),
      logros: [{ nombre: "Completar el juego" }],
    });
    assert.ok(errores["logros.0.obtenido"]);
  });

  test("los logros no tienen _id propio (se identifican por índice)", () => {
    const videojuego = new Videojuego({
      ...datosValidos(),
      logros: [{ nombre: "Completar el juego", obtenido: false }],
    });
    assert.equal(videojuego.logros[0]._id, undefined);
  });
});
