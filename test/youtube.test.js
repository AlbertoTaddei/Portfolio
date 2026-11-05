import { test } from "node:test";
import assert from "node:assert/strict";
import { estraiYoutube, htmlVideo, sostituisciVideo } from "../strumenti/youtube.js";

const ID = "dQw4w9WgXcQ";

test("riconosce watch, youtu.be e shorts", () => {
  assert.deepEqual(estraiYoutube(`https://www.youtube.com/watch?v=${ID}`), { id: ID, inizio: null });
  assert.equal(estraiYoutube(`https://youtube.com/shorts/${ID}`).id, ID);
  assert.equal(estraiYoutube(`  https://youtu.be/${ID}  `).id, ID);
});

test("legge il tempo di inizio", () => {
  assert.equal(estraiYoutube(`https://youtu.be/${ID}?t=1m30s`).inizio, 90);
  assert.equal(estraiYoutube(`https://www.youtube.com/watch?v=${ID}&t=45`).inizio, 45);
  assert.equal(estraiYoutube(`https://youtu.be/${ID}?t=90s`).inizio, 90);
});

test("ignora link dentro frasi e link non YouTube", () => {
  assert.equal(estraiYoutube(`Guarda https://youtu.be/${ID} qui`), null);
  assert.equal(estraiYoutube("https://vimeo.com/123"), null);
});

test("htmlVideo produce un iframe nocookie", () => {
  const html = htmlVideo({ id: ID, inizio: 90 }, "A & B", "Video:");
  assert.match(html, /youtube-nocookie\.com\/embed\/dQw4w9WgXcQ\?start=90/);
  assert.match(html, /title="Video: A &amp; B"/);
  assert.match(html, /loading="lazy"/);
});

test("sostituisciVideo trasforma solo le righe isolate", () => {
  const out = sostituisciVideo(`Testo.\n\nhttps://youtu.be/${ID}\n\nAltro.`, "T", "Video:");
  assert.match(out, /<div class="video">/);
  assert.match(out, /Testo\./);
  assert.match(out, /Altro\./);
  const frase = `Guarda https://youtu.be/${ID} qui.`;
  assert.equal(sostituisciVideo(frase, "T", "Video:"), frase);
});

test("sostituisciVideo funziona con a capo Windows (CRLF)", () => {
  const out = sostituisciVideo(`A\r\n\r\nhttps://youtu.be/${ID}\r\n\r\nB`, "T", "Video:");
  assert.match(out, /<div class="video">/);
});
