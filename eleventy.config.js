// Configurazione di Eleventy: dice come trasformare i file in sito.
// Di solito non serve modificarla: i contenuti stanno in "contenuti/".

export default function (eleventyConfig) {
  return {
    dir: { input: "modelli", includes: "_base", output: "_site" },
    pathPrefix: process.env.PATH_PREFIX || "/",
    markdownTemplateEngine: false,
  };
}
