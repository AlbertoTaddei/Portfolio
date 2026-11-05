import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { mkdtemp, cp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { costruisci } from "./aiuti.js";

const leggi = (out, f) => readFileSync(join(out, f), "utf8");

async function copiaEsempio() {
  const dir = await mkdtemp(join(tmpdir(), "esempio-"));
  await cp("test/esempio", dir, { recursive: true });
  return dir;
}

test("la costruzione produce la home", async () => {
  const out = await costruisci({ contenuti: "contenuti" });
  assert.ok(existsSync(join(out, "index.html")));
});

test("pagine generate dai contenuti di prova", async () => {
  const out = await costruisci({ contenuti: "test/esempio" });
  for (const f of ["index.html", "progetti/alfa/index.html", "progetti/beta/index.html", "about/index.html", "404.html"]) {
    assert.ok(existsSync(join(out, f)), f);
  }
  assert.ok(!existsSync(join(out, "progetti/gamma")));
  assert.ok(!existsSync(join(out, "progetti/_modello")));
  assert.equal(readdirSync(join(out, "stile/font")).filter((f) => f.endsWith(".woff2")).length, 4);

  const home = leggi(out, "index.html");
  assert.match(home, /casella--evidenza/);
  assert.match(home, /data-categoria="film-making"/);
  assert.match(home, /aria-current="page"/);
  assert.match(home, /<html lang="it">/);

  const alfa = leggi(out, "progetti/alfa/index.html");
  assert.match(alfa, /<h1[^>]*>Alfa<\/h1>/);
  assert.match(alfa, /youtube-nocookie/);
  assert.match(alfa, /<title>Alfa — Nome Cognome<\/title>/);
  assert.match(alfa, /class="vicini"[\s\S]*Beta/);

  const about = leggi(out, "about/index.html");
  assert.match(about, /rel="noopener"/);
  assert.match(about, /mailto:nome@esempio\.it/);

  for (const f of ["index.html", "progetti/alfa/index.html", "about/index.html", "404.html"]) {
    assert.doesNotMatch(leggi(out, f), /fonts\.googleapis/);
  }
});

test("un solo progetto: niente precedente né successivo", async () => {
  const dir = await copiaEsempio();
  await rm(join(dir, "progetti/beta"), { recursive: true });
  const out = await costruisci({ contenuti: dir });
  const alfa = leggi(out, "progetti/alfa/index.html");
  assert.doesNotMatch(alfa, /← Precedente/);
  assert.doesNotMatch(alfa, /Successivo →/);
});

test("la costruzione fallisce con un messaggio chiaro", async () => {
  const dir = await copiaEsempio();
  await writeFile(join(dir, "progetti/alfa/progetto.md"), "---\ntitolo: A\ncategoria: Boh\nanno: 2024\ncopertina: copertina.jpg\n---\nx\n");
  await assert.rejects(costruisci({ contenuti: dir }), /non esiste\. Valori possibili/);
});

test("contenuti reali con sottopercorso (GitHub Pages)", async () => {
  const out = await costruisci({ contenuti: "contenuti", prefisso: "/portfolio/" });
  const home = leggi(out, "index.html");
  assert.match(home, /href="\/portfolio\/stile\/stile\.css"/);
  assert.match(home, /href="\/portfolio\/progetti\//);
  assert.match(home, /src="\/portfolio\/img\//);
  assert.doesNotMatch(home, /(href|src)="\/(?!portfolio\/)/);
});
