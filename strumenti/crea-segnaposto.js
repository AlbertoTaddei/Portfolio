// Crea un'immagine segnaposto (1600×1200, tinta unita con una scritta).
// Uso: node strumenti/crea-segnaposto.js <file.jpg|.png> <colore-hex> <testo>

import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export async function creaSegnaposto(file, colore, testo) {
  const sicuro = String(testo).replace(/[<&>]/g, "");
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200">` +
      `<rect width="100%" height="100%" fill="${colore}"/>` +
      `<text x="50%" y="50%" font-family="sans-serif" font-size="96" fill="#111111" text-anchor="middle" dominant-baseline="middle">${sicuro}</text>` +
      `</svg>`
  );
  mkdirSync(dirname(file), { recursive: true });
  await sharp(svg).toFile(file);
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop())) {
  const [file, colore, ...testo] = process.argv.slice(2);
  if (!file || !colore) {
    console.error("Uso: node strumenti/crea-segnaposto.js <file.jpg> <colore-hex> <testo>");
    process.exit(1);
  }
  await creaSegnaposto(file, colore, testo.join(" ") || "segnaposto");
}
