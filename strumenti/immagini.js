// Immagini: le ridimensiona (400, 800, 1600 px) e le converte in WebP + JPEG.
// Si caricano immagini grandi: il sito crea da solo le versioni leggere.

import Image from "@11ty/eleventy-img";
import { extname } from "node:path";

export const ESTENSIONI_IMMAGINE = [".jpg", ".jpeg", ".png", ".webp"];

export const eImmagine = (file) => ESTENSIONI_IMMAGINE.includes(extname(file).toLowerCase());

// Quanto spazio occupa l'immagine sullo schermo in ogni contesto.
export const MISURE = {
  casella: "(min-width: 1100px) 25vw, (min-width: 800px) 33vw, 50vw",
  evidenza: "(min-width: 1100px) 50vw, (min-width: 800px) 66vw, 100vw",
  corpo: "(min-width: 1100px) 1040px, 100vw",
  foto: "(min-width: 800px) 360px, 100vw",
};

export async function preparaImmagine(percorso, { alt, misure, eager = false, prefisso, uscita }) {
  const metadati = await Image(percorso, {
    widths: [400, 800, 1600],
    formats: ["webp", "jpeg"],
    outputDir: `${uscita}/img/`,
    urlPath: `${prefisso}img/`,
  });
  const html = Image.generateHTML(metadati, {
    alt,
    sizes: misure,
    loading: eager ? "eager" : "lazy",
    decoding: "async",
  });
  const jpeg = metadati.jpeg[metadati.jpeg.length - 1].url;
  return { html, jpeg };
}
