# Portfolio v2 — Strato 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un sito portfolio statico (home bento + filtro, pagina progetto, About, 404) generato da cartelle Markdown che Alberto modifica a mano, pubblicato su GitHub Pages.

**Architecture:** Eleventy v3 con template Nunjucks in `modelli/`. I contenuti in `contenuti/` NON sono template Eleventy: li legge `strumenti/contenuti.js` (gray-matter + markdown-it), che li valida, prepara le immagini con eleventy-img e li espone come dati globali (`sito`, `testi`, `progetti`, `about`). Le pagine progetto nascono da una paginazione su `progetti`. Nel browser c'è un solo script, il filtro.

**Tech Stack:** Node ≥ 20, ESM (`"type": "module"`), `@11ty/eleventy@^3`, `@11ty/eleventy-img@^6`, `gray-matter`, `markdown-it` (dipendenza diretta), `@fontsource/space-grotesk`, `@fontsource/space-mono`, test con `node --test`.

**Spec:** `docs/superpowers/specs/2026-11-05-portfolio-strato-1-design.md` (copia nel progetto claude.ai: `claude/spec-strato-1.md`). Leggere lo spec prima di ogni task: i valori citati come "§x" sono lì.

**Repository:** `C:\Users\albyt\Documents\Portfolio` (vuota). Se l'esecuzione avviene in un altro ambiente, lavorare in una cartella `Portfolio/` e alla fine copiarla lì.

## Global Constraints

- Node `>=20` (campo `engines` in package.json); niente TypeScript, niente framework lato browser.
- Tutti i nomi di file, cartelle, funzioni esportate e commenti in **italiano**; messaggi d'errore in italiano, formato `progetti/<cartella>/progetto.md: <problema>`.
- Nessun testo dell'interfaccia scritto nei modelli: ogni etichetta viene da `testi.<chiave>` (§5.4).
- Ogni link interno passa dal filtro Nunjucks `url` (necessario per `pathPrefix`, §9).
- `lang="it"`; aree cliccabili ≥ 44 px; focus visibile; contrasto ≥ 4.5:1 (§2).
- Nessuna risorsa esterna tranne l'iframe `youtube-nocookie.com` (§2.5).
- Colori, larghezze e margini esattamente come §6.10.
- Cartelle che iniziano con `_` in `contenuti/progetti/` sono ignorate; anche quelle con `bozza: sì`.
- La cartella dei contenuti è configurabile con la variabile d'ambiente `CONTENUTI` (default `contenuti`), per i test.

**Scostamenti dallo spec, decisi qui:** i layout comuni stanno in `modelli/_base/` (Eleventy richiede la cartella include dentro l'input); i font vengono copiati in `/stile/font/` a build time da `@fontsource` (licenza OFL inclusa nel pacchetto) invece di essere salvati nel repository; oltre a `contenuti.js`, `youtube.js` e `immagini.js`, `strumenti/` contiene `testo.js`, `validazione.js`, `ordine.js` e `crea-segnaposto.js`, per tenere ogni file piccolo.

## Review Focus

1. **File d'immagine con spazi o accenti** (`![x](Foto finale.jpg)`, che markdown-it codifica in `Foto%20finale.jpg`): devono essere trovati e mostrati. → test in Task 7.
2. **File salvati con a capo Windows (CRLF)** (Blocco note): la riga YouTube e la separazione dell'intro devono funzionare uguale. → test in Task 2 e Task 3.
3. **Errori YAML** (es. `titolo: Progetto: parte 2` senza virgolette): messaggio italiano con percorso del file, non uno stack trace. → test in Task 7.
4. **Estensioni maiuscole o diverse** (`.JPG`, `.jpeg`, `.png`, `.webp`) per copertine e immagini. → test in Task 6.
5. **Un solo progetto pubblicato:** la home funziona e la pagina progetto non mostra né precedente né successivo. → test in Task 8.

---

### Task 1: Scheletro del progetto e prima costruzione

**Files:**
- Create: `package.json`, `.gitignore`, `eleventy.config.js`, `contenuti/impostazioni.json`, `contenuti/testi.json`, `modelli/index.njk`, `test/costruzione.test.js`, `test/aiuti.js`

**Interfaces:**
- Produces: script npm `start` (`eleventy --serve`), `build` (`eleventy`), `test` (`node --test test/`); in `test/aiuti.js` la funzione `costruisci({ contenuti: string, prefisso?: string }): Promise<string>`, che lancia `npx @11ty/eleventy --output=<tmp>` con env `CONTENUTI` e `PATH_PREFIX` e restituisce la cartella di output; lancia un errore con lo stderr se il codice d'uscita ≠ 0.
- Produces: `eleventy.config.js` con `dir: { input: "modelli", includes: "_base", output: "_site" }`, `pathPrefix: process.env.PATH_PREFIX || "/"`, `markdownTemplateEngine: false`.

- [ ] **Step 1:** `git init` nella cartella del repository; `.gitignore` con `node_modules/`, `_site/`, `.cache/`.
- [ ] **Step 2:** Creare `package.json` (`"type": "module"`, `engines.node: ">=20"`, gli script sopra) e installare le dipendenze del Tech Stack.
- [ ] **Step 3:** Creare `contenuti/impostazioni.json` e `contenuti/testi.json` con **esattamente** i valori di §5.1 e §5.4.
- [ ] **Step 4: Test che fallisce:** in `test/costruzione.test.js`, `test("la costruzione produce la home", …)`: `const out = await costruisci({ contenuti: "contenuti" })`; assert che `out/index.html` esista.
- [ ] **Step 5:** `npm test` → FAIL (manca la configurazione o la pagina).
- [ ] **Step 6:** Scrivere `eleventy.config.js` minimo e un `modelli/index.njk` provvisorio con `<h1>ok</h1>`.
- [ ] **Step 7:** `npm test` → PASS.
- [ ] **Step 8:** Commit: `chore: scheletro Eleventy`.

### Task 2: Funzioni di testo (`strumenti/testo.js`)

**Files:**
- Create: `strumenti/testo.js`
- Test: `test/testo.test.js`

**Ordine di esecuzione:** questo task usa `estraiYoutube` del Task 3. **Eseguire il Task 3 prima del Task 2.**

**Interfaces:**
- Consumes: `estraiYoutube` (Task 3).
- Produces:
  - `slugCategoria(nome: string): string`: minuscole, spazi → `-`, solo `[a-z0-9-]`.
  - `normalizzaBooleano(v: unknown): boolean`: `true` per `true`, `"sì"`, `"si"`, `"true"` (senza distinzione di maiuscole); altrimenti `false`.
  - `nomeCartellaValido(nome: string): boolean`: `/^[a-z0-9]+(-[a-z0-9]+)*$/`.
  - `suggerisciNome(nome: string): string`: toglie gli accenti (NFD + rimozione dei diacritici), minuscole, ogni sequenza non alfanumerica → `-`, nessun trattino ai bordi.
  - `separaIntro(corpo: string, intro?: string): { intro: string, corpo: string }`: §5.2, regola di intro.

- [ ] **Step 1: Test che falliscono** (`test/testo.test.js`):
  - `slugCategoria("Film Making") === "film-making"`.
  - `normalizzaBooleano("Sì") === true`, `normalizzaBooleano("no") === false`, `normalizzaBooleano(undefined) === false`.
  - `nomeCartellaValido("corto-notturno") === true`; `"Corto Notturno"` e `"città"` → `false`.
  - `suggerisciNome("Città Notturna 2") === "citta-notturna-2"`.
  - `separaIntro("Prima riga.\n\nSeconda.", "Data")` → `{ intro: "Data", corpo: "Prima riga.\n\nSeconda." }`.
  - `separaIntro("Prima riga.\n\nSeconda.")` → `{ intro: "Prima riga.", corpo: "Seconda." }`.
  - `separaIntro("## Titolo\n\n![x](a.jpg)\n\nTesto.\n\nAltro.")` → `{ intro: "Testo.", corpo: "## Titolo\n\n![x](a.jpg)\n\nAltro." }`.
  - Il corpo che inizia con una riga YouTube salta quella riga.
  - `separaIntro("## Solo titolo")` → `{ intro: "", corpo: "## Solo titolo" }`.
  - **CRLF:** `separaIntro("Prima.\r\n\r\nSeconda.")` → `{ intro: "Prima.", corpo: "Seconda." }`.
- [ ] **Step 2:** `node --test test/testo.test.js` → FAIL.
- [ ] **Step 3:** Implementare. `separaIntro` normalizza `\r\n` → `\n`, divide in blocchi su righe vuote (`/\n\s*\n/`) e considera paragrafo semplice un blocco che non inizia con `#`, `![`, `-`, `*`, `>`, `<`, `\d+.` e non è una riga YouTube (`estraiYoutube(blocco) !== null`). L'intro restituita è il blocco con le righe unite da uno spazio.
- [ ] **Step 4:** PASS.
- [ ] **Step 5:** Commit: `feat: funzioni di testo`.

### Task 3: Video YouTube (`strumenti/youtube.js`)

**Files:**
- Create: `strumenti/youtube.js`
- Test: `test/youtube.test.js`

**Interfaces:**
- Produces:
  - `estraiYoutube(riga: string): { id: string, inizio: number | null } | null`: la riga, tolti gli spazi ai bordi, deve essere **solo** un URL `https?://(www.)?youtube.com/watch?v=ID`, `youtu.be/ID` o `youtube.com/shorts/ID` (ID di 11 caratteri `[A-Za-z0-9_-]`), con parametri opzionali; `t` può valere `90`, `90s` o `1m30s` (→ 90).
  - `htmlVideo(video, titoloProgetto: string, etichetta: string): string` → `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/ID[?start=N]" title="<etichetta> <titolo>" loading="lazy" allowfullscreen allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"></iframe></div>`, con il titolo escapato per HTML.
  - `sostituisciVideo(corpo: string, titolo: string, etichetta: string): string`: sostituisce ogni blocco (separato da righe vuote) composto da una sola riga YouTube con `htmlVideo(...)` e lascia invariato tutto il resto.

- [ ] **Step 1: Test che falliscono:**
  - `estraiYoutube("https://www.youtube.com/watch?v=dQw4w9WgXcQ")` → `{ id: "dQw4w9WgXcQ", inizio: null }`.
  - `estraiYoutube("https://youtu.be/dQw4w9WgXcQ?t=1m30s").inizio === 90`; `…watch?v=dQw4w9WgXcQ&t=45` → `45`.
  - `estraiYoutube("https://youtube.com/shorts/dQw4w9WgXcQ").id === "dQw4w9WgXcQ"`.
  - `estraiYoutube("Guarda https://youtu.be/dQw4w9WgXcQ qui") === null`; `estraiYoutube("https://vimeo.com/123") === null`.
  - `htmlVideo({id:"dQw4w9WgXcQ",inizio:90},"A & B","Video:")` contiene `youtube-nocookie.com/embed/dQw4w9WgXcQ?start=90`, `title="Video: A &amp; B"` e `loading="lazy"`.
  - `sostituisciVideo("Testo.\n\nhttps://youtu.be/dQw4w9WgXcQ\n\nAltro.", "T", "Video:")` contiene `<div class="video">`, `Testo.` e `Altro.`.
  - Un link YouTube dentro una frase non viene sostituito.
  - **CRLF:** `sostituisciVideo("A\r\n\r\nhttps://youtu.be/dQw4w9WgXcQ\r\n\r\nB", …)` contiene `<div class="video">`.
- [ ] **Step 2:** FAIL. **Step 3:** Implementare. **Step 4:** PASS.
- [ ] **Step 5:** Commit: `feat: video YouTube`.

### Task 4: Validazione (`strumenti/validazione.js`)

**Files:**
- Create: `strumenti/validazione.js`
- Test: `test/validazione.test.js`

**Interfaces:**
- Consumes: `nomeCartellaValido`, `suggerisciNome` (Task 2).
- Produces:
  - `CAMPI_PROGETTO`: array dei campi di §5.2.
  - `validaImpostazioni(imp: object): string[]` (errori).
  - `validaProgetto({ dati, cartella, categorie: string[], esiste: (file: string) => boolean, immaginiCorpo: string[], intro: string }): { errori: string[], avvisi: string[] }`. Ogni messaggio inizia con `progetti/<cartella>/progetto.md: `.
  - `class ErroreContenuti extends Error`, con il campo `messaggi: string[]`; `message` = i messaggi uniti da `\n`.

- [ ] **Step 1: Test che falliscono**, con i testi **esatti** di §7:
  - manca `titolo` → errore `progetti/x/progetto.md: manca "titolo"` (lo stesso per `categoria`, `anno`, `copertina`);
  - `categoria: "Render"` → `progetti/x/progetto.md: categoria "Render" non esiste. Valori possibili: Film Making, Renders, Videogames, Others`;
  - `anno: "duemila"` → errore che contiene `anno "duemila" non valido`;
  - `esiste` restituisce false per `02.jpg` in `immaginiCorpo` → `progetti/x/progetto.md: immagine "02.jpg" non trovata` (lo stesso per la copertina);
  - `cartella: "Corto Notturno"` → errore che contiene `nome della cartella non valido` e `corto-notturno`;
  - campo `titlo` → avviso che contiene `campo sconosciuto "titlo"`;
  - `intro` di 301 caratteri → avviso che contiene `intro più lunga di 300 caratteri`;
  - `validaImpostazioni({})` → contiene un errore per `nome` e uno per `categorie`;
  - un progetto valido → `{ errori: [], avvisi: [] }`.
- [ ] **Step 2:** FAIL. **Step 3:** Implementare. **Step 4:** PASS.
- [ ] **Step 5:** Commit: `feat: validazione dei contenuti`.

### Task 5: Ordine e vicini (`strumenti/ordine.js`)

**Files:**
- Create: `strumenti/ordine.js`
- Test: `test/ordine.test.js`

**Interfaces:**
- Produces:
  - `ordinaProgetti<T extends { evidenza: boolean, ordine?: number, anno: number, titolo: string }>(lista: T[]): T[]`: una nuova lista, ordinata secondo §6.4; il confronto dei titoli usa `localeCompare(b, "it")`.
  - `collegaVicini(lista): lista`: aggiunge a ogni elemento `precedente` e `successivo` (`{ url, titolo } | null`), senza giro circolare.

- [ ] **Step 1: Test che falliscono:**
  - evidenza prima dei non in evidenza, anche con anno più vecchio;
  - nello stesso gruppo, `ordine: 1` prima di `ordine: 2`, entrambi prima di quelli senza `ordine`;
  - senza `ordine`: 2025 prima di 2023; a parità di anno, "Alba" prima di "Zeta";
  - `collegaVicini` su 3 elementi: il primo ha `precedente === null`, l'ultimo ha `successivo === null`, quello in mezzo ha entrambi;
  - con 1 elemento: entrambi `null`.
- [ ] **Step 2:** FAIL. **Step 3:** Implementare. **Step 4:** PASS.
- [ ] **Step 5:** Commit: `feat: ordine dei progetti`.

### Task 6: Immagini (`strumenti/immagini.js`, `strumenti/crea-segnaposto.js`)

**Files:**
- Create: `strumenti/immagini.js`, `strumenti/crea-segnaposto.js`
- Test: `test/immagini.test.js`

**Interfaces:**
- Produces:
  - `MISURE = { casella: "(min-width: 1100px) 25vw, (min-width: 800px) 33vw, 50vw", evidenza: "(min-width: 1100px) 50vw, (min-width: 800px) 66vw, 100vw", corpo: "(min-width: 1100px) 1040px, 100vw", foto: "(min-width: 800px) 360px, 100vw" }`.
  - `preparaImmagine(percorso: string, { alt: string, misure: string, eager?: boolean, prefisso: string, uscita: string }): Promise<{ html: string, jpeg: string }>`: eleventy-img con `widths: [400, 800, 1600]`, `formats: ["webp", "jpeg"]`, `outputDir: <uscita>/img/`, `urlPath: <prefisso>img/`; `html` = `Image.generateHTML` con `alt`, `sizes`, `loading` (`eager`/`lazy`) e `decoding="async"`; `jpeg` = URL del JPEG più largo (per Open Graph).
  - `ESTENSIONI_IMMAGINE = [".jpg", ".jpeg", ".png", ".webp"]` (confronto senza distinzione di maiuscole).
  - CLI `node strumenti/crea-segnaposto.js <file.jpg> <colore-hex> <testo>`: crea con sharp un JPEG 1600×1200 a tinta unita con il testo centrato (overlay SVG). Serve per le fixture e per i progetti di esempio.

- [ ] **Step 1:** Con la CLI creare `test/esempio-immagini/prova.JPG` e `prova.png` (si committano).
- [ ] **Step 2: Test che falliscono:** `preparaImmagine` su `prova.JPG` restituisce `html` che contiene `srcset`, `width=`, `height=`, `loading="lazy"`, `type="image/webp"` e l'alt passato; con `eager: true` contiene `loading="eager"`; `jpeg` inizia con il prefisso + `img/`; lo stesso funziona con `prova.png`.
- [ ] **Step 3:** FAIL. **Step 4:** Implementare. **Step 5:** PASS.
- [ ] **Step 6:** Commit: `feat: ottimizzazione immagini`.

### Task 7: Caricamento dei contenuti (`strumenti/contenuti.js`)

**Files:**
- Create: `strumenti/contenuti.js`, fixture `test/esempio/` (impostazioni.json, testi.json, about.md, foto.jpg, `progetti/alfa/` con evidenza + video + immagine "Foto finale.jpg", `progetti/beta/` senza intro, `progetti/_modello/`, `progetti/gamma/` con `bozza: sì`)
- Test: `test/contenuti.test.js`

**Interfaces:**
- Consumes: Task 2–6.
- Produces:
  - `leggiDati(dir: string): { sito: object, testi: object }`: lancia `ErroreContenuti` se un file manca o il JSON non è valido (messaggio con il nome del file), oppure se `validaImpostazioni` trova errori.
  - `caricaProgetti(dir: string, { prefisso: string, uscita: string }): Promise<Progetto[]>`, ordinati e collegati. `Progetto = { cartella, url: "/progetti/<cartella>/", titolo, categoria, colore, slug, anno: number, evidenza: boolean, intro, software: string[], crediti, contesto, corpoHtml: string, copertina: { casella: string, evidenza: string, eagerCasella: string, eagerEvidenza: string, jpeg: string }, precedente, successivo }` (`url` senza prefisso: il prefisso lo aggiunge il filtro `url`).
  - `caricaAbout(dir, opzioni): Promise<{ sottotitolo, frase, software: string[], corpoHtml, foto: string | null }>`.
  - Tutti gli errori di tutti i progetti vengono raccolti e lanciati insieme in un unico `ErroreContenuti`; gli avvisi vanno su `console.warn`. Avviso "nessun progetto in evidenza" se nessuno ha `evidenza`.
- Rendering del corpo: `separaIntro` → `sostituisciVideo` → markdown-it (`html: true`) con una regola `image` personalizzata che decodifica `src` con `decodeURIComponent` e usa l'HTML pre-calcolato con `preparaImmagine(..., MISURE.corpo)`, avvolto in `<figure>` + `<figcaption>` solo se l'alt non è vuoto (alt vuoto → alt = titolo). Le immagini del corpo vanno raccolte e preparate **prima** del rendering, perché markdown-it è sincrono.
- Errori YAML (gray-matter): intercettati e convertiti in `progetti/<cartella>/progetto.md: errore di formato nell'intestazione (riga N). Se un valore contiene ":" mettilo tra virgolette.`

- [ ] **Step 1: Test che falliscono** su `test/esempio`:
  - restituisce 2 progetti (`gamma` e `_modello` esclusi), con `alfa` primo (evidenza);
  - `alfa.corpoHtml` contiene `youtube-nocookie`, `<figcaption>` e un `<img`, cioè l'immagine `Foto finale.jpg` è stata trovata;
  - `beta.intro` è il suo primo paragrafo e `beta.corpoHtml` non lo contiene;
  - `alfa.precedente === null` e `alfa.successivo.titolo === beta.titolo`;
  - una fixture temporanea con `titolo: Progetto: parte 2` → `ErroreContenuti` il cui messaggio contiene `progetti/` e `virgolette`;
  - una fixture con due progetti sbagliati → un solo errore che contiene entrambi i messaggi;
  - `leggiDati` su una cartella senza `testi.json` → errore che contiene `testi.json`.
- [ ] **Step 2:** FAIL. **Step 3:** Implementare. **Step 4:** PASS.
- [ ] **Step 5:** Commit: `feat: caricamento contenuti`.

### Task 8: Modelli delle pagine e dati globali

**Files:**
- Modify: `eleventy.config.js`
- Create: `modelli/_base/base.njk`, `modelli/index.njk` (sostituisce il provvisorio), `modelli/progetto.njk`, `modelli/about.njk`, `modelli/404.njk`
- Test: `test/costruzione.test.js`

**Interfaces:**
- Consumes: `leggiDati`, `caricaProgetti`, `caricaAbout` (Task 7).
- Produces: dati globali `sito`, `testi`, `progetti`, `about` (`addGlobalData`, i caricamenti asincroni come funzioni async); la passthrough copy di `stile/` → `stile/`, `script/` → `script/` e dei `.woff2` latin di Space Grotesk 500/700 e Space Mono 400/700 da `node_modules/@fontsource/*/files/` → `stile/font/`; `addWatchTarget(CONTENUTI)`.
- Markup (classi usate dal CSS del Task 9): `base.njk` → `<html lang="it">`, `<header class="barra">` con `.barra-nome` e `<nav class="barra-menu">` (link con `aria-current="page"` sulla pagina attuale, scelta con la variabile di front matter `sezione: progetti|about`), `<main>`, `<link rel="stylesheet" href="{{ '/stile/stile.css' | url }}">`, meta description e Open Graph (§6.5).
  - Home: `.filtro` (con l'attributo `hidden`; lo script lo toglie) con un bottone `.filtro-bottone[data-categoria=<slug>|tutti][aria-pressed]` per "Tutti" e per ogni categoria con almeno un progetto; `.griglia` con `<a class="casella[ casella--evidenza]" data-categoria="<slug>" style="--colore-categoria: <colore>">`, che contiene la copertina (la prima casella in versione eager), `.casella-titolo`, `.casella-meta` (pallino `.pallino` + categoria + anno) e, se in evidenza, `.casella-intro`; `<footer class="piede">` con email (`mailto:`), LinkedIn (solo se c'è) e `testi.aboutLink`.
  - Progetto (`pagination: { data: progetti, size: 1, alias: p }`, `permalink: "progetti/{{ p.cartella }}/"`): `.torna`, `.intestazione` (`.meta-categoria`, `h1`, `.fascia` solo con i campi presenti, `.intro`), `.corpo` (`corpoHtml`), `nav.vicini` con tre celle; una cella vuota resta un `<span>` vuoto.
  - About (`permalink: "about/"`): `.about` con `.about-foto` (solo se `about.foto`), `.about-testo` (h1 = `sito.nome`, `.sottotitolo`, corpo, `.frase`, `.fascia` software, `.contatti` con email, LinkedIn e Curriculum, gli ultimi due con `target="_blank" rel="noopener"`), `.torna`.
  - 404 (`permalink: "404.html"`): `testi.erroreTitolo` + link `testi.erroreLink`.

- [ ] **Step 1: Test che falliscono** (`costruisci({ contenuti: "test/esempio" })`):
  - esistono `index.html`, `progetti/alfa/index.html`, `progetti/beta/index.html`, `about/index.html`, `404.html`, `stile/font/` con 4 file `.woff2`;
  - non esistono `progetti/gamma/` e `progetti/_modello/`;
  - `index.html` contiene `casella--evidenza`, `data-categoria="film-making"` e `aria-current="page"`;
  - `progetti/alfa/index.html` contiene `<h1`, `youtube-nocookie` e il titolo di beta in `.vicini`;
  - `about/index.html` contiene `rel="noopener"` e `mailto:`;
  - nessun file HTML generato contiene `fonts.googleapis`;
  - **un solo progetto:** fixture temporanea con solo `alfa` → la costruzione riesce e la pagina non contiene i testi `testi.precedente` né `testi.successivo`;
  - **costruzione che fallisce:** fixture con categoria sbagliata → `costruisci` lancia un errore il cui testo contiene `non esiste. Valori possibili`.
- [ ] **Step 2:** FAIL. **Step 3:** Implementare config e modelli. **Step 4:** PASS.
- [ ] **Step 5:** Commit: `feat: modelli delle pagine`.

### Task 9: Stile (`stile/stile.css`)

**Files:**
- Create: `stile/stile.css`

**Interfaces:**
- Consumes: le classi del Task 8.

- [ ] **Step 1:** Scrivere il CSS in sezioni commentate in italiano: `/* 1. Variabili */` (§6.10, valori esatti), `/* 2. Font */` (`@font-face` verso `font/…woff2`, `font-display: swap`), `/* 3. Base */` (sfondo, testo, focus-visible `2px solid var(--testo)`, `.contenitore` con `max-width: var(--larghezza-max)` e margine `clamp(16px, 4.5vw, 64px)`), `/* 4. Barra */`, `/* 5. Filtro */` (bottoni pill, minimo 44 px, attivo = invertito, come nel mockup), `/* 6. Griglia */` (4/3/2 colonne a 1100/800 px, `grid-auto-flow: dense`, evidenza 2×2 sopra gli 800 px e a tutta larghezza 16:9 sotto, copertine 4:3 con `object-fit: cover`), `/* 7. Pagina progetto */` (larghezze 1040/680, gap 56 px, `.video` 16:9), `/* 8. About */` (due colonne flex-wrap che vanno a capo sotto gli 800 px; foto 4:5), `/* 9. Piè di pagina e 404 */`.
- [ ] **Step 2:** `npm start`, controllare a 360, 800 e 1440 px: nessuno scorrimento orizzontale, layout come nel mockup (tela "Portfolio v2 — Strato 1").
- [ ] **Step 3:** `npm test` → PASS (nessuna regressione).
- [ ] **Step 4:** Commit: `feat: stile strato 1`.

### Task 10: Filtro (`script/filtro.js`)

**Files:**
- Create: `script/filtro.js`
- Modify: `modelli/index.njk` (`<script type="module" src="{{ '/script/filtro.js' | url }}">`)
- Test: `test/filtro.test.js`

**Interfaces:**
- Produces: `export function scegliCategoria(search: string, slugValidi: string[]): string`, che restituisce lo slug di `?categoria=` se è in `slugValidi`, altrimenti `"tutti"`. Il codice DOM è eseguito solo se `typeof document !== "undefined"`: toglie `hidden` da `.filtro`, applica la categoria iniziale, al click imposta `aria-pressed`, nasconde con `hidden` le caselle che non corrispondono e aggiorna l'indirizzo con `history.replaceState` (`?categoria=<slug>`, oppure senza parametro per "tutti").

- [ ] **Step 1: Test che falliscono:** `scegliCategoria("?categoria=renders", ["renders"]) === "renders"`; `scegliCategoria("?categoria=boh", ["renders"]) === "tutti"`; `scegliCategoria("", ["renders"]) === "tutti"`.
- [ ] **Step 2:** FAIL. **Step 3:** Implementare. **Step 4:** PASS.
- [ ] **Step 5:** Verifica a mano con `npm start`: il filtro funziona, l'indirizzo cambia, `…/?categoria=renders` apre la home già filtrata; con JavaScript disabilitato i bottoni non si vedono e i progetti sì.
- [ ] **Step 6:** Commit: `feat: filtro categorie`.

### Task 11: Contenuti di esempio, modello e pubblicazione

**Files:**
- Create: `contenuti/about.md`, `contenuti/progetti/_modello/progetto.md` (tutti i campi di §5.2, ognuno commentato con `#`), 3 progetti di esempio (§11: uno in evidenza, uno con video, uno senza intro; titoli che iniziano con "[ESEMPIO]"; immagini create con `crea-segnaposto.js`), `.github/workflows/pubblica.yml`
- Test: `test/costruzione.test.js`

**Interfaces:**
- Workflow: `on: push: branches: [main]` + `workflow_dispatch`; permessi `pages: write`, `id-token: write`, `contents: read`; job: checkout, `actions/setup-node@v4` (node 20, cache npm), `npm ci`, `npm test`, `npm run build` con `PATH_PREFIX: /${{ github.event.repository.name }}/` (vuoto se il repository finisce con `.github.io`), `actions/configure-pages`, `actions/upload-pages-artifact` (path `_site`), `actions/deploy-pages`.

- [ ] **Step 1: Test che fallisce:** `costruisci({ contenuti: "contenuti", prefisso: "/portfolio/" })` → `index.html` contiene `href="/portfolio/stile/stile.css"` e `href="/portfolio/progetti/`; e la costruzione su `contenuti` reali riesce.
- [ ] **Step 2:** FAIL o PASS; se fallisce, correggere i link senza il filtro `url` (cercare `href="/` nei modelli).
- [ ] **Step 3:** Creare i contenuti di esempio, il modello e il workflow.
- [ ] **Step 4:** `npm test` → PASS; `npm run build` senza errori né avvisi inattesi.
- [ ] **Step 5:** Commit: `feat: contenuti di esempio e pubblicazione`.

### Task 12: Guida e verifica finale

**Files:**
- Create: `GUIDA.md`, `README.md`

- [ ] **Step 1:** Scrivere `GUIDA.md` con le 10 sezioni di §10, in italiano semplice, con blocchi da copiare. Includere: la tabella dei campi di `progetto.md`; i 3 tipi di blocco; i messaggi d'errore di §7 con la correzione per ciascuno; come cancellare i progetti "[ESEMPIO]"; GitHub Desktop (clona → modifica → Commit → Push) e la scheda Actions per vedere l'esito; come attivare GitHub Pages (Settings → Pages → Source: GitHub Actions); il dominio personalizzato (CNAME); la checklist di §8.
- [ ] **Step 2:** `README.md`: 5 righe, rimanda a `GUIDA.md`.
- [ ] **Step 3: Verifica finale** con la checklist di §8: home a 360/800/1440 px, filtro con e senza JS, tutta la navigazione da tastiera (Tab arriva a ogni link e bottone, il focus si vede), progetto con video, 404, `npm test` verde.
- [ ] **Step 4:** Seguire la guida alla lettera per aggiungere un progetto finto, e correggere la guida dove non basta. Poi rimuovere il progetto.
- [ ] **Step 5:** Commit: `docs: guida di manutenzione`.
