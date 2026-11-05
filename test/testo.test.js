import { test } from "node:test";
import assert from "node:assert/strict";
import { slugCategoria, normalizzaBooleano, nomeCartellaValido, suggerisciNome, separaIntro } from "../strumenti/testo.js";

test("slugCategoria", () => {
  assert.equal(slugCategoria("Film Making"), "film-making");
});

test("normalizzaBooleano", () => {
  assert.equal(normalizzaBooleano("Sì"), true);
  assert.equal(normalizzaBooleano("si"), true);
  assert.equal(normalizzaBooleano(true), true);
  assert.equal(normalizzaBooleano("TRUE"), true);
  assert.equal(normalizzaBooleano("no"), false);
  assert.equal(normalizzaBooleano(undefined), false);
});

test("nomeCartellaValido e suggerisciNome", () => {
  assert.equal(nomeCartellaValido("corto-notturno"), true);
  assert.equal(nomeCartellaValido("Corto Notturno"), false);
  assert.equal(nomeCartellaValido("città"), false);
  assert.equal(suggerisciNome("Città Notturna 2"), "citta-notturna-2");
});

test("separaIntro: intro data lascia il corpo intero", () => {
  assert.deepEqual(separaIntro("Prima riga.\n\nSeconda.", "Data"), { intro: "Data", corpo: "Prima riga.\n\nSeconda." });
});

test("separaIntro: ricava e toglie il primo paragrafo", () => {
  assert.deepEqual(separaIntro("Prima riga.\n\nSeconda."), { intro: "Prima riga.", corpo: "Seconda." });
});

test("separaIntro: salta titoletti, immagini e video", () => {
  assert.deepEqual(separaIntro("## Titolo\n\n![x](a.jpg)\n\nTesto.\n\nAltro."), {
    intro: "Testo.",
    corpo: "## Titolo\n\n![x](a.jpg)\n\nAltro.",
  });
  assert.deepEqual(separaIntro("https://youtu.be/dQw4w9WgXcQ\n\nTesto."), {
    intro: "Testo.",
    corpo: "https://youtu.be/dQw4w9WgXcQ",
  });
});

test("separaIntro: corpo senza paragrafi", () => {
  assert.deepEqual(separaIntro("## Solo titolo"), { intro: "", corpo: "## Solo titolo" });
});

test("separaIntro: a capo Windows (CRLF)", () => {
  assert.deepEqual(separaIntro("Prima.\r\n\r\nSeconda."), { intro: "Prima.", corpo: "Seconda." });
});
