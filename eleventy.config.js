// Configurazione di Eleventy: dice come trasformare i file in sito.
// Di solito non serve modificarla: i contenuti stanno in "contenuti/".

import { leggiDati, caricaProgetti, caricaAbout } from "./strumenti/contenuti.js";
import { slugCategoria } from "./strumenti/testo.js";

// Cartella dei contenuti (i test ne usano una diversa).
const CONTENUTI = process.env.CONTENUTI || "contenuti";
const PREFISSO = process.env.PATH_PREFIX || "/";

// Font copiati da node_modules nel sito (niente Google Fonts esterni).
const FONT = {
  "space-grotesk": ["500", "700"],
  "space-mono": ["400", "700"],
};

export default function (eleventyConfig) {
  eleventyConfig.setNunjucksEnvironmentOptions({ autoescape: true });

  eleventyConfig.addPassthroughCopy({ stile: "stile" });
  eleventyConfig.addPassthroughCopy({ script: "script" });
  for (const [famiglia, pesi] of Object.entries(FONT)) {
    for (const peso of pesi) {
      eleventyConfig.addPassthroughCopy({
        [`node_modules/@fontsource/${famiglia}/files/${famiglia}-latin-${peso}-normal.woff2`]: `stile/font/${famiglia}-${peso}.woff2`,
      });
    }
    eleventyConfig.addPassthroughCopy({ [`node_modules/@fontsource/${famiglia}/LICENSE`]: `stile/font/LICENSE-${famiglia}.txt` });
  }

  eleventyConfig.addWatchTarget(CONTENUTI);

  // I contenuti vengono letti una volta per costruzione.
  const opzioni = () => ({ prefisso: PREFISSO, uscita: eleventyConfig.directories.output });
  let progetti;
  const caricaUnaVolta = () => (progetti ??= caricaProgetti(CONTENUTI, opzioni()));
  eleventyConfig.on("eleventy.before", () => { progetti = undefined; });

  eleventyConfig.addGlobalData("sito", () => leggiDati(CONTENUTI).sito);
  eleventyConfig.addGlobalData("testi", () => leggiDati(CONTENUTI).testi);
  eleventyConfig.addGlobalData("progetti", () => caricaUnaVolta());
  eleventyConfig.addGlobalData("about", () => caricaAbout(CONTENUTI, opzioni()));
  // Categorie che hanno almeno un progetto (per i bottoni del filtro).
  eleventyConfig.addGlobalData("categorieUsate", async () => {
    const usate = new Set((await caricaUnaVolta()).map((p) => p.categoria));
    return leggiDati(CONTENUTI).sito.categorie
      .filter((c) => usate.has(c.nome))
      .map((c) => ({ ...c, slug: slugCategoria(c.nome) }));
  });

  return {
    dir: { input: "modelli", includes: "_base", output: "_site" },
    pathPrefix: PREFISSO,
    markdownTemplateEngine: false,
    templateFormats: ["njk"],
  };
}
