import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, cp, writeFile, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { caricaProgetti, caricaAbout, leggiDati } from "../strumenti/contenuti.js";

const tmp = () => mkdtemp(join(tmpdir(), "cont-"));
const opz = async () => ({ prefisso: "/", uscita: await tmp() });

async function copiaEsempio() {
  const dir = await tmp();
  await cp("test/esempio", dir, { recursive: true });
  return dir;
}

test("carica i progetti pubblicati, in ordine", async () => {
  const lista = await caricaProgetti("test/esempio", await opz());
  assert.deepEqual(lista.map((p) => p.cartella), ["alfa", "beta"]);
  const [alfa, beta] = lista;
  assert.equal(alfa.url, "/progetti/alfa/");
  assert.equal(alfa.slug, "film-making");
  assert.equal(alfa.colore, "#ef4444");
  assert.equal(alfa.anno, 2024);
  assert.equal(alfa.evidenza, true);
  assert.deepEqual(alfa.software, ["Blender", "DaVinci Resolve"]);
  assert.equal(alfa.precedente, null);
  assert.equal(alfa.successivo.titolo, "Beta");
  assert.equal(beta.successivo, null);
  for (const k of ["casella", "evidenza", "eagerCasella", "eagerEvidenza"]) assert.match(alfa.copertina[k], /<picture/);
  assert.match(alfa.copertina.eagerCasella, /loading="eager"/);
  assert.match(alfa.copertina.jpeg, /^\/img\/.+\.jpeg$/);
});

test("corpo: video, immagine con spazi e didascalia", async () => {
  const [alfa] = await caricaProgetti("test/esempio", await opz());
  assert.match(alfa.corpoHtml, /youtube-nocookie\.com\/embed\/dQw4w9WgXcQ\?start=10/);
  assert.match(alfa.corpoHtml, /<figure>[\s\S]*<img[\s\S]*<figcaption>La scena finale<\/figcaption><\/figure>/);
  assert.match(alfa.corpoHtml, /Primo paragrafo del corpo\./);
  assert.equal(alfa.intro, "Un corto di prova.");
});

test("intro ricavata e tolta dal corpo (file con CRLF)", async () => {
  const [, beta] = await caricaProgetti("test/esempio", await opz());
  assert.equal(beta.intro, "Intro di beta ricavata dal corpo.");
  assert.doesNotMatch(beta.corpoHtml, /Intro di beta/);
  assert.match(beta.corpoHtml, /Secondo paragrafo di beta/);
});

test("due punti nel valore: accettati senza virgolette", async () => {
  const dir = await copiaEsempio();
  await writeFile(join(dir, "progetti/alfa/progetto.md"), "---\ntitolo: Progetto: parte 2\ncategoria: Film Making\nanno: 2024\ncopertina: copertina.jpg\n---\nx\n");
  const lista = await caricaProgetti(dir, await opz());
  assert.ok(lista.some((p) => p.titolo === "Progetto: parte 2"));
  await writeFile(join(dir, "about.md"), "---\nfrase: Risolvo problemi: è quello che mi piace fare.\n---\nx\n");
  assert.equal((await caricaAbout(dir, await opz())).frase, "Risolvo problemi: è quello che mi piace fare.");
});

test("errore YAML: messaggio in italiano con il file", async () => {
  const dir = await copiaEsempio();
  await writeFile(join(dir, "progetti/alfa/progetto.md"), "---\ntitolo: \"aperta\n---\nx\n");
  await assert.rejects(caricaProgetti(dir, await opz()), (e) => e.message.includes("progetti/alfa/progetto.md") && e.message.includes("virgolette"));
});

test("errori di più progetti raccolti insieme", async () => {
  const dir = await copiaEsempio();
  await writeFile(join(dir, "progetti/alfa/progetto.md"), "---\ntitolo: A\ncategoria: Boh\nanno: 2024\ncopertina: copertina.jpg\n---\nx\n");
  await writeFile(join(dir, "progetti/beta/progetto.md"), "---\ncategoria: Renders\nanno: 2024\ncopertina: copertina.png\n---\nx\n");
  await assert.rejects(caricaProgetti(dir, await opz()), (e) =>
    e.messaggi.length === 2 && e.message.includes('categoria "Boh" non esiste') && e.message.includes('progetti/beta/progetto.md: manca "titolo"'));
});

test("leggiDati: file mancanti o JSON non valido", async () => {
  const dir = await copiaEsempio();
  await rm(join(dir, "testi.json"));
  assert.throws(() => leggiDati(dir), /testi\.json/);
  await writeFile(join(dir, "testi.json"), "{ rotto");
  assert.throws(() => leggiDati(dir), /testi\.json: JSON non valido/);
});

test("senza cartella progetti: lista vuota", async () => {
  const dir = await copiaEsempio();
  await rm(join(dir, "progetti"), { recursive: true });
  assert.deepEqual(await caricaProgetti(dir, await opz()), []);
});

test("about", async () => {
  const a = await caricaAbout("test/esempio", await opz());
  assert.equal(a.frase, "Risolvo problemi.");
  assert.deepEqual(a.software, ["Blender", "Unity"]);
  assert.match(a.corpoHtml, /Chi sono/);
  assert.match(a.foto, /<picture/);
  const dir = await copiaEsempio();
  await writeFile(join(dir, "about.md"), "---\nfoto: manca.jpg\n---\nx\n");
  await assert.rejects(caricaAbout(dir, await opz()), /about\.md: immagine "manca\.jpg" non trovata/);
});
