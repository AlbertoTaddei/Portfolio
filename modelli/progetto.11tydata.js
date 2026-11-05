// Titolo e anteprima social della pagina progetto (calcolati in JS per non
// escapare due volte apostrofi e "&").
export default {
  eleventyComputed: {
    titoloPagina: (dati) => dati.p?.titolo,
    descrizione: (dati) => dati.p?.intro,
    immagineOg: (dati) => dati.p?.copertina?.jpeg,
  },
};
