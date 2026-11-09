// Hook PostToolUse: formatea con Prettier los archivos .ts, .tsx, .js, .jsx, .json y .css que Claude crea o edita.
// Nunca bloquea: ante cualquier error termina con código 0 sin hacer nada.
const fs = require("node:fs");
const path = require("node:path");

const EXTENSIONES = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".css"]);

async function formatear(filePath) {
  const prettier = require("prettier");
  const original = fs.readFileSync(filePath, "utf8");
  const config = (await prettier.resolveConfig(filePath)) ?? {};
  const formateado = await prettier.format(original, {
    ...config,
    filepath: filePath,
  });
  if (formateado !== original) {
    fs.writeFileSync(filePath, formateado);
  }
}

let entrada = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (trozo) => {
  entrada += trozo;
});
process.stdin.on("end", async () => {
  try {
    const filePath = JSON.parse(entrada)?.tool_input?.file_path;
    if (filePath && EXTENSIONES.has(path.extname(filePath).toLowerCase())) {
      await formatear(filePath);
    }
  } catch {
    // Sin bloquear: un fallo de formato no debe interrumpir a Claude.
  }
  process.exit(0);
});
