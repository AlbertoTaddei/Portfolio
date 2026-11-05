// Legge i contenuti (cartella "contenuti/"), li controlla e li prepara per le pagine.
// Se trova errori li raccoglie tutti e ferma la costruzione con un messaggio chiaro.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import { separaIntro, slugCategoria, normalizzaBooleano } from "./testo.js";
import { sostituisciVideo } from "./youtube.js";
import { validaImpostazioni, validaProgetto, ErroreContenuti } from "./validazione.js";
import { ordinaProgetti, collegaVicini } from "./ordine.js";
import { preparaImmagine, MISURE } from "./immagini.js";

// Immagine in un blocco da sola: ![didascalia](file.jpg) — il nome può contenere spazi.
const IMMAGINE = /!\[([^\]]*)\]\(\s*<?([^)>]+?)>?\s*\)/g;
const IMMAGINE_SOLA = /^!\[([^\]]*)\]\(\s*<?([^)>]+?)>?\s*\)$/;

function leggiJson(dir, nome) {
  const file = join(dir, nome);
  if (!existsSync(file)) throw new ErroreContenuti([`${nome}: file mancante`]);
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    throw new ErroreContenuti([`${nome}: JSON non valido (${e.message})`]);
  }
}

export function leggiDati(dir) {
  const sito = leggiJson(dir, "impostazioni.json");
  const testi = leggiJson(dir, "testi.json");
  const errori = validaImpostazioni(sito);
  if (errori.length) throw new ErroreContenuti(errori);
  return { sito, testi };
}

// Legge un file .md con intestazione; un errore di formato diventa un messaggio italiano.
function leggiMd(file, etichetta) {
  try {
    const { data, content } = matter(readFileSync(file, "utf8").replace(/\r\n/g, "\n"));
    return { dati: data, corpo: content };
  } catch (e) {
    const riga = e.mark ? ` (riga ${e.mark.line + 2})` : "";
    return {
      errore: `${etichetta}: errore di formato nell'intestazione${riga}. Se un valore contiene ":" mettilo tra virgolette.`,
    };
  }
}

const lista = (v) =>
  Array.isArray(v) ? v.map(String).map((s) => s.trim()).filter(Boolean)
  : String(v ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const testo = (v) => (v === undefined || v === null ? "" : String(v).trim());

function immaginiNelCorpo(corpo) {
  return [...corpo.matchAll(IMMAGINE)].map((m) => m[2].trim());
}

const md = new MarkdownIt({ html: true, linkify: false, typographer: false });

// Trasforma il corpo in HTML. Le immagini devono essere già preparate (markdown-it è sincrono).
async function corpoInHtml(corpo, { cartella, titolo, testi, opzioni }) {
  const conVideo = sostituisciVideo(corpo, titolo, testi.videoTitolo);
  const preparate = new Map();
  for (const [, didascalia, file] of conVideo.matchAll(IMMAGINE)) {
    const alt = didascalia.trim() || titolo;
    const chiave = `${file.trim()}\u0000${alt}`;
    if (!preparate.has(chiave)) {
      const { html } = await preparaImmagine(join(cartella, file.trim()), { alt, misure: MISURE.corpo, ...opzioni });
      preparate.set(chiave, html);
    }
  }
  const html = (didascalia, file) => preparate.get(`${file.trim()}\u0000${didascalia.trim() || titolo}`);
  const blocchi = conVideo.split(/\n\s*\n/).map((blocco) => {
    const sola = blocco.trim().match(IMMAGINE_SOLA);
    if (!sola) return blocco.replace(IMMAGINE, (_, d, f) => html(d, f));
    const [, didascalia, file] = sola;
    const caption = didascalia.trim() ? `<figcaption>${md.utils.escapeHtml(didascalia.trim())}</figcaption>` : "";
    return `<figure>${html(didascalia, file)}${caption}</figure>`;
  });
  return md.render(blocchi.join("\n\n"));
}

async function copertina(file, titolo, opzioni) {
  const c = (misure, eager) => preparaImmagine(file, { alt: titolo, misure, eager, ...opzioni });
  const [casella, evidenza, eagerCasella, eagerEvidenza] = await Promise.all([
    c(MISURE.casella, false), c(MISURE.evidenza, false), c(MISURE.casella, true), c(MISURE.evidenza, true),
  ]);
  return { casella: casella.html, evidenza: evidenza.html, eagerCasella: eagerCasella.html, eagerEvidenza: eagerEvidenza.html, jpeg: casella.jpeg };
}

export async function caricaProgetti(dir, opzioni) {
  const { sito, testi } = leggiDati(dir);
  const radice = join(dir, "progetti");
  if (!existsSync(radice)) return [];
  const categorie = sito.categorie.map((c) => c.nome);
  const errori = [];
  const letti = [];

  for (const cartella of readdirSync(radice).sort()) {
    const percorso = join(radice, cartella);
    if (cartella.startsWith("_") || cartella.startsWith(".") || !statSync(percorso).isDirectory()) continue;
    const etichetta = `progetti/${cartella}/progetto.md`;
    const fileMd = join(percorso, "progetto.md");
    if (!existsSync(fileMd)) {
      errori.push(`${etichetta}: file mancante`);
      continue;
    }
    const letto = leggiMd(fileMd, etichetta);
    if (letto.errore) {
      errori.push(letto.errore);
      continue;
    }
    const { dati, corpo } = letto;
    if (normalizzaBooleano(dati.bozza)) continue;
    const separato = separaIntro(corpo, testo(dati.intro));
    const esito = validaProgetto({
      dati, cartella, categorie,
      esiste: (f) => existsSync(join(percorso, f)),
      immaginiCorpo: immaginiNelCorpo(separato.corpo),
      intro: separato.intro,
    });
    esito.avvisi.forEach((a) => console.warn(`Avviso: ${a}`));
    if (esito.errori.length) {
      errori.push(...esito.errori);
      continue;
    }
    letti.push({ cartella, percorso, dati, ...separato });
  }
  if (errori.length) throw new ErroreContenuti(errori);

  const progetti = [];
  for (const { cartella, percorso, dati, intro, corpo } of letti) {
    const titolo = testo(dati.titolo);
    const categoria = sito.categorie.find((c) => c.nome === dati.categoria);
    progetti.push({
      cartella,
      url: `/progetti/${cartella}/`,
      titolo,
      categoria: categoria.nome,
      colore: categoria.colore,
      slug: slugCategoria(categoria.nome),
      anno: Number(dati.anno),
      evidenza: normalizzaBooleano(dati.evidenza),
      ordine: testo(dati.ordine) === "" ? undefined : Number(dati.ordine),
      intro,
      software: lista(dati.software),
      crediti: testo(dati.crediti),
      contesto: testo(dati.contesto),
      corpoHtml: await corpoInHtml(corpo, { cartella: percorso, titolo, testi, opzioni }),
      copertina: await copertina(join(percorso, String(dati.copertina)), titolo, opzioni),
    });
  }
  if (progetti.length && !progetti.some((p) => p.evidenza)) {
    console.warn('Avviso: nessun progetto in evidenza (aggiungi "evidenza: sì" ai progetti migliori)');
  }
  return collegaVicini(ordinaProgetti(progetti));
}

export async function caricaAbout(dir, opzioni) {
  const { sito, testi } = leggiDati(dir);
  const file = join(dir, "about.md");
  if (!existsSync(file)) throw new ErroreContenuti(["about.md: file mancante"]);
  const letto = leggiMd(file, "about.md");
  if (letto.errore) throw new ErroreContenuti([letto.errore]);
  const { dati, corpo } = letto;
  const nomeFoto = testo(dati.foto);
  if (nomeFoto && !existsSync(join(dir, nomeFoto))) {
    throw new ErroreContenuti([`about.md: immagine "${nomeFoto}" non trovata`]);
  }
  const foto = nomeFoto
    ? (await preparaImmagine(join(dir, nomeFoto), { alt: sito.nome, misure: MISURE.foto, ...opzioni })).html
    : null;
  return {
    sottotitolo: testo(dati.sottotitolo),
    frase: testo(dati.frase),
    software: lista(dati.software),
    corpoHtml: await corpoInHtml(corpo, { cartella: dir, titolo: sito.nome, testi, opzioni }),
    foto,
  };
}
