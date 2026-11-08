// Hook PreToolUse: bloquea cualquier lectura o edición de archivos .env (p. ej. .env, .env.local).
// Sale con código 2 para que Claude Code cancele la herramienta y muestre el motivo.
const path = require("node:path");

let entrada = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (trozo) => {
  entrada += trozo;
});
process.stdin.on("end", () => {
  let filePath = "";
  try {
    const datos = JSON.parse(entrada);
    filePath = datos?.tool_input?.file_path ?? datos?.tool_input?.path ?? "";
  } catch {
    process.exit(0);
  }
  const nombre = path.basename(String(filePath)).toLowerCase();
  if (nombre === ".env" || nombre.startsWith(".env.")) {
    if (nombre === ".env.example") process.exit(0);
    process.stderr.write(
      `Bloqueado: las reglas del proyecto prohíben leer o modificar ${nombre}. Usa variables de entorno vía config/env.ts.\n`,
    );
    process.exit(2);
  }
  process.exit(0);
});
