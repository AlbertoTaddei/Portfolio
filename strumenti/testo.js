// Piccole funzioni sui testi: nomi per gli indirizzi, sì/no, intro.

import { estraiYoutube } from "./youtube.js";

// "Film Making" → "film-making" (usato negli indirizzi e nel filtro)
export function slugCategoria(nome) {
  return String(nome)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// Accetta sì / si / true (anche in maiuscolo); tutto il resto è "no".
export function normalizzaBooleano(valore) {
  if (valore === true) return true;
  return ["sì", "si", "true"].includes(String(valore ?? "").trim().toLowerCase());
}

export function nomeCartellaValido(nome) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(nome);
}

// "Città Notturna 2" → "citta-notturna-2"
export function suggerisciNome(nome) {
  return String(nome)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Un blocco è un "paragrafo semplice" se non è titoletto, immagine, elenco,
// citazione, HTML o riga YouTube.
function eParagrafo(blocco) {
  const t = blocco.trim();
  if (!t) return false;
  if (/^(#|!\[|[-*>]\s|<|\d+\.\s)/.test(t)) return false;
  return estraiYoutube(t) === null;
}

// Regola di intro (spec §5.2): se l'intro manca, il primo paragrafo diventa
// l'intro e viene tolto dal corpo.
export function separaIntro(corpo, intro) {
  const testo = String(corpo ?? "").replace(/\r\n/g, "\n").trim();
  if (intro && String(intro).trim()) {
    return { intro: String(intro).trim(), corpo: testo };
  }
  const blocchi = testo.split(/\n\s*\n/);
  const indice = blocchi.findIndex(eParagrafo);
  if (indice === -1) return { intro: "", corpo: testo };
  const trovato = blocchi[indice].trim().split("\n").map((r) => r.trim()).join(" ");
  blocchi.splice(indice, 1);
  return { intro: trovato, corpo: blocchi.join("\n\n").trim() };
}
