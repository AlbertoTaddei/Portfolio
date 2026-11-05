import { test } from "node:test";
import assert from "node:assert/strict";
import { validaProgetto, validaImpostazioni, ErroreContenuti } from "../strumenti/validazione.js";

const CAT = ["Film Making", "Renders", "Videogames", "Others"];
const buono = { titolo: "T", categoria: "Renders", anno: 2025, copertina: "c.jpg" };
const base = (sovra = {}) => ({ dati: { ...buono }, cartella: "x", categorie: CAT, esiste: () => true, immaginiCorpo: [], intro: "", ...sovra });
const P = "progetti/x/progetto.md: ";

test("progetto valido", () => {
  assert.deepEqual(validaProgetto(base()), { errori: [], avvisi: [] });
});

test("campi obbligatori mancanti", () => {
  for (const campo of ["titolo", "categoria", "anno", "copertina"]) {
    const dati = { ...buono };
    delete dati[campo];
    assert.ok(validaProgetto(base({ dati })).errori.includes(`${P}manca "${campo}"`), campo);
  }
});

test("categoria sconosciuta", () => {
  const r = validaProgetto(base({ dati: { ...buono, categoria: "Render" } }));
  assert.ok(r.errori.includes(`${P}categoria "Render" non esiste. Valori possibili: Film Making, Renders, Videogames, Others`));
});

test("anno non valido", () => {
  const r = validaProgetto(base({ dati: { ...buono, anno: "duemila" } }));
  assert.ok(r.errori.some((e) => e.startsWith(P) && e.includes('anno "duemila" non valido')));
});

test("immagini non trovate", () => {
  const r = validaProgetto(base({ esiste: (f) => f !== "02.jpg" && f !== "c.jpg", immaginiCorpo: ["02.jpg"] }));
  assert.ok(r.errori.includes(`${P}immagine "02.jpg" non trovata`));
  assert.ok(r.errori.includes(`${P}immagine "c.jpg" non trovata`));
});

test("nome cartella non valido", () => {
  const r = validaProgetto(base({ cartella: "Corto Notturno" }));
  assert.ok(r.errori.some((e) => e.includes("nome della cartella non valido") && e.includes("corto-notturno")));
});

test("avvisi: campo sconosciuto e intro lunga", () => {
  const r = validaProgetto(base({ dati: { ...buono, titlo: "x" }, intro: "a".repeat(301) }));
  assert.ok(r.avvisi.some((a) => a.includes('campo sconosciuto "titlo"')));
  assert.ok(r.avvisi.some((a) => a.includes("intro più lunga di 300 caratteri")));
  assert.deepEqual(r.errori, []);
});

test("validaImpostazioni", () => {
  const e = validaImpostazioni({});
  assert.ok(e.some((m) => m.includes('"nome"')));
  assert.ok(e.some((m) => m.includes('"categorie"')));
  assert.deepEqual(validaImpostazioni({ nome: "N", categorie: [{ nome: "A", colore: "#fff" }] }), []);
});

test("ErroreContenuti unisce i messaggi", () => {
  const err = new ErroreContenuti(["a", "b"]);
  assert.ok(err instanceof Error);
  assert.deepEqual(err.messaggi, ["a", "b"]);
  assert.equal(err.message, "a\nb");
});
