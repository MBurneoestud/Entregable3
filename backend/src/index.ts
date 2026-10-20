/**
 * index.ts
 * --------
 * Punto de entrada: conecta a MongoDB, crea la app y la pone a escuchar.
 * Ejecuta: npm run dev
 */

import { conectarDB } from "./DBconnection";
import { crearApp } from "./app";
import { env } from "./config/env";

async function main(): Promise<void> {
  await conectarDB();

  const app = crearApp();

  app.listen(env.puerto, () => {
    console.log(`API escuchando en http://localhost:${env.puerto}`);
    console.log(`Salud: http://localhost:${env.puerto}/api/salud`);
  });
}

main().catch((error: unknown) => {
  console.error("No se pudo iniciar la API:", error);
  process.exitCode = 1;
});
