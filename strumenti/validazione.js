// Controlli sui contenuti: trovano gli errori prima che il sito venga pubblicato.
// Tutti i messaggi sono in italiano e indicano il file da correggere.

import { nomeCartellaValido, suggerisciNome } from "./testo.js";

export const CAMPI_PROGETTO = [
  "titolo", "categoria", "anno", "copertina", "intro", "evidenza",
  "ordine", "software", "crediti", "contesto", "bozza",
];
const OBBLIGATORI = ["titolo", "categoria", "anno", "copertina"];

export class ErroreContenuti extends Error {
  constructor(messaggi) {
    super(messaggi.join("\n"));
    this.name = "ErroreContenuti";
    this.messaggi = messaggi;
    // Niente righe di codice nel messaggio: solo gli errori da correggere.
    this.stack = `Errori nei contenuti:\n${messaggi.join("\n")}`;
  }
}

const vuoto = (v) => v === undefined || v === null || String(v).trim() === "";

export function validaImpostazioni(imp) {
  const errori = [];
  if (vuoto(imp?.nome)) errori.push('impostazioni.json: manca "nome"');
  if (!Array.isArray(imp?.categorie) || imp.categorie.length === 0) {
    errori.push('impostazioni.json: manca "categorie" (serve almeno una categoria)');
  } else {
    imp.categorie.forEach((c, i) => {
      if (vuoto(c?.nome) || vuoto(c?.colore)) {
        errori.push(`impostazioni.json: la categoria n. ${i + 1} deve avere "nome" e "colore"`);
      }
    });
  }
  return errori;
}

export function validaProgetto({ dati, cartella, categorie, esiste, suggerisci = () => null, immaginiCorpo = [], intro = "" }) {
  const p = `progetti/${cartella}/progetto.md: `;
  const errori = [];
  const avvisi = [];

  if (!nomeCartellaValido(cartella)) {
    errori.push(
      `${p}nome della cartella non valido (solo minuscole, numeri e trattini). Rinominala in "${suggerisciNome(cartella)}"`
    );
  }
  for (const campo of OBBLIGATORI) {
    if (vuoto(dati[campo])) errori.push(`${p}manca "${campo}"`);
  }
  if (!vuoto(dati.categoria) && !categorie.includes(dati.categoria)) {
    errori.push(`${p}categoria "${dati.categoria}" non esiste. Valori possibili: ${categorie.join(", ")}`);
  }
  if (!vuoto(dati.anno) && !/^\d{4}$/.test(String(dati.anno).trim())) {
    errori.push(`${p}anno "${dati.anno}" non valido (scrivi 4 cifre, es. 2025)`);
  }
  if (!vuoto(dati.ordine) && !/^-?\d+$/.test(String(dati.ordine).trim())) {
    errori.push(`${p}ordine "${dati.ordine}" non valido (scrivi un numero intero)`);
  }
  const immagini = [...(vuoto(dati.copertina) ? [] : [String(dati.copertina)]), ...immaginiCorpo];
  for (const file of new Set(immagini)) {
    if (esiste(file)) continue;
    const simile = suggerisci(file);
    errori.push(`${p}immagine "${file}" non trovata${simile ? `: forse intendevi "${simile}"?` : ""}`);
  }

  for (const campo of Object.keys(dati)) {
    if (!CAMPI_PROGETTO.includes(campo)) avvisi.push(`${p}campo sconosciuto "${campo}" (errore di battitura?)`);
  }
  if (intro.length > 300) avvisi.push(`${p}intro più lunga di 300 caratteri: meglio accorciarla`);

  return { errori, avvisi };
}
