import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { preparaImmagine, MISURE, ESTENSIONI_IMMAGINE, eImmagine } from "../strumenti/immagini.js";

const opzioni = async (extra = {}) => ({ alt: "Una prova", misure: MISURE.casella, prefisso: "/p/", uscita: await mkdtemp(join(tmpdir(), "img-")), ...extra });

test("JPG maiuscolo: html responsive e lazy", async () => {
  const r = await preparaImmagine("test/esempio-immagini/prova.JPG", await opzioni());
  for (const parte of ["srcset", "width=", "height=", 'loading="lazy"', 'decoding="async"', 'type="image/webp"', 'alt="Una prova"']) {
    assert.ok(r.html.includes(parte), parte);
  }
  assert.ok(r.jpeg.startsWith("/p/img/"));
  assert.ok(r.jpeg.endsWith(".jpeg"));
});

test("eager e png", async () => {
  const r = await preparaImmagine("test/esempio-immagini/prova.png", await opzioni({ eager: true }));
  assert.ok(r.html.includes('loading="eager"'));
});

test("estensioni accettate", () => {
  assert.deepEqual(ESTENSIONI_IMMAGINE, [".jpg", ".jpeg", ".png", ".webp"]);
  assert.equal(eImmagine("A.JPG"), true);
  assert.equal(eImmagine("a.webp"), true);
  assert.equal(eImmagine("a.gif"), false);
});
