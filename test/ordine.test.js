import { test } from "node:test";
import assert from "node:assert/strict";
import { ordinaProgetti, collegaVicini } from "../strumenti/ordine.js";

const p = (titolo, anno, extra = {}) => ({ titolo, anno, evidenza: false, url: `/progetti/${titolo}/`, ...extra });
const titoli = (l) => l.map((x) => x.titolo);

test("evidenza prima, anche se più vecchio", () => {
  assert.deepEqual(titoli(ordinaProgetti([p("a", 2025), p("b", 2020, { evidenza: true })])), ["b", "a"]);
});

test("ordine esplicito prima, crescente", () => {
  assert.deepEqual(titoli(ordinaProgetti([p("x", 2025), p("y", 2020, { ordine: 2 }), p("z", 2019, { ordine: 1 })])), ["z", "y", "x"]);
});

test("anno decrescente, poi titolo alfabetico", () => {
  assert.deepEqual(titoli(ordinaProgetti([p("Zeta", 2023), p("Vecchio", 2023 - 2), p("Alba", 2023), p("Nuovo", 2025)])), ["Nuovo", "Alba", "Zeta", "Vecchio"]);
});

test("non modifica la lista originale", () => {
  const l = [p("b", 2020), p("a", 2025)];
  ordinaProgetti(l);
  assert.deepEqual(titoli(l), ["b", "a"]);
});

test("collegaVicini senza giro circolare", () => {
  const l = collegaVicini([p("a", 1), p("b", 1), p("c", 1)]);
  assert.equal(l[0].precedente, null);
  assert.deepEqual(l[0].successivo, { url: "/progetti/b/", titolo: "b" });
  assert.deepEqual(l[1].precedente, { url: "/progetti/a/", titolo: "a" });
  assert.deepEqual(l[1].successivo, { url: "/progetti/c/", titolo: "c" });
  assert.equal(l[2].successivo, null);
  const uno = collegaVicini([p("solo", 1)]);
  assert.equal(uno[0].precedente, null);
  assert.equal(uno[0].successivo, null);
});
