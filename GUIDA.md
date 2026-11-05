# Guida al tuo portfolio

Questa guida spiega come aggiornare il sito da solo, senza toccare il codice.
In breve: **modifichi i file nella cartella `contenuti/`, li carichi su GitHub e il sito si aggiorna da solo in un paio di minuti.**

---

## 1. Com'è fatta la cartella

```
Portfolio/
  contenuti/               ← QUI lavori tu
    impostazioni.json      ← nome, email, LinkedIn, curriculum, categorie e colori
    testi.json             ← le scritte fisse del sito ("Tutti i progetti", "← Precedente"…)
    about.md               ← la pagina About
    progetti/              ← una cartella per ogni progetto
      _modello/            ← modello da copiare (non compare nel sito)
  stile/stile.css          ← l'aspetto del sito (colori, misure, font)
  modelli/                 ← l'HTML delle pagine: di solito non serve toccarlo
  strumenti/, test/, script/  ← il "motore": non toccare
  GUIDA.md                 ← questa guida
```

Puoi aprire e modificare i file con qualsiasi editor di testo. Il Blocco note va bene; [Visual Studio Code](https://code.visualstudio.com/) è più comodo perché colora il testo.

> **Il formato `.md` (Markdown)** è testo normale con poche regole: una riga vuota separa i paragrafi, `## ` all'inizio della riga crea un titoletto, `**parola**` mette in grassetto.

---

## 2. Aggiungere un progetto

1. Dentro `contenuti/progetti/` **copia** la cartella `_modello`.
2. **Rinomina** la copia con un nome breve: solo lettere minuscole, numeri e trattini, senza spazi né accenti. Esempio: `corto-notturno`. Questo nome diventa l'indirizzo della pagina (`…/progetti/corto-notturno/`).
3. Metti nella cartella la **copertina** e le altre **immagini** (jpg, png o webp). Puoi usarle grandi come escono dal programma: il sito le ridimensiona da solo.
4. Apri `progetto.md` e compila l'intestazione, cioè la parte tra le due righe `---`:

| Campo | Obbligatorio | Cosa scrivere |
|---|---|---|
| `titolo` | sì | il titolo del progetto |
| `categoria` | sì | `Film Making`, `Renders`, `Videogames` oppure `Others` (scritte esattamente così) |
| `anno` | sì | 4 cifre, es. `2025` |
| `copertina` | sì | il nome del file, es. `copertina.jpg` |
| `intro` | no | una o due righe che compaiono sotto il titolo. Se la togli, il sito usa il primo paragrafo del testo |
| `evidenza` | no | `sì` = casella grande in cima alla home |
| `ordine` | no | un numero: i progetti con il numero più basso vengono prima |
| `software` | no | separati da virgole: `Blender, DaVinci Resolve` |
| `crediti` | no | testo libero: `Regia — Alberto · Fotografia — Nome` |
| `contesto` | no | es. il corso o l'università |
| `bozza` | no | `sì` = il progetto resta nascosto finché non è pronto |

   Le righe che iniziano con `#` sono solo note: puoi cancellarle.

5. Sotto la seconda riga `---` scrivi il **testo** del progetto (vedi la sezione 4).
6. Controlla il sito sul PC (sezione 6), poi pubblica (sezione 7).

**Esempio completo:**

```
---
titolo: Corto notturno
categoria: Film Making
anno: 2025
evidenza: sì
copertina: copertina.jpg
intro: Un cortometraggio girato in una notte, solo con luci pratiche.
software: Blender, DaVinci Resolve
crediti: Regia — Alberto · Fotografia — Giulia
contesto: Corso di regia, Università di …
---
https://www.youtube.com/watch?v=XXXXXXXXXXX

## L'idea

Qui racconti da dove sei partito.

![Lo storyboard della scena 2](storyboard.jpg)

## Il processo

Come l'hai fatto.
```

---

## 3. Modificare, nascondere o mettere in evidenza

- **Modificare:** apri il `progetto.md` e cambia quello che vuoi.
- **Nascondere** senza cancellare: aggiungi `bozza: sì`.
- **Cancellare:** elimina la cartella del progetto.
- **In evidenza:** `evidenza: sì` (casella grande); `evidenza: no` per toglierla. Conviene averne 2 o 3.
- **Ordine:** di base vengono prima quelli in evidenza, poi dal più recente. Per decidere tu, aggiungi `ordine: 1`, `ordine: 2`… Lo stesso ordine vale per i link "Precedente / Successivo".
- **I 3 progetti `[ESEMPIO]`** servono solo a vedere com'è il sito: quando hai messo i tuoi, cancella le cartelle `esempio-cortometraggio`, `esempio-render` ed `esempio-videogioco`.

---

## 4. Il testo del progetto: tre tipi di blocco

Scrivi i blocchi nell'ordine in cui vuoi vederli, separati da una riga vuota.

**Testo:** paragrafi normali. Per un titoletto: `## Titolo` (o `### Titolo più piccolo`).

**Immagine con didascalia:**

```
![Didascalia che compare sotto l'immagine](nome-file.jpg)
```

Il nome del file deve essere uguale a quello nella cartella, maiuscole comprese. Se le parentesi quadre sono vuote, `![](nome-file.jpg)`, l'immagine compare senza didascalia.

**Video YouTube:** incolla il link **da solo su una riga**, con una riga vuota prima e dopo:

```
https://www.youtube.com/watch?v=XXXXXXXXXXX
```

Funzionano anche i link `youtu.be/…` e `youtube.com/shorts/…`. Per far partire il video da un certo punto, usa il link "condividi dal minuto…" di YouTube (`?t=90`). Un link YouTube dentro una frase resta un normale link.

---

## 5. About, contatti, categorie, scritte

- **About:** `contenuti/about.md`. In alto `sottotitolo`, `frase` (la frase in grande), `software` e `foto` (il nome di un'immagine messa in `contenuti/`, oppure vuoto se non vuoi la foto). Sotto, il testo di presentazione.
- **Nome, email, LinkedIn, curriculum:** `contenuti/impostazioni.json`. Il curriculum è un link (per esempio a Google Drive) che si apre in una nuova scheda: il sito non fa scaricare niente. Se lasci `"linkedin": ""` o `"curriculum": ""`, quel link sparisce.
- **Categorie e colori:** sempre in `impostazioni.json`, nella lista `categorie`. L'ordine della lista è l'ordine dei bottoni del filtro. Se rinomini una categoria, aggiorna anche i progetti che la usano.
- **Scritte fisse** ("Tutti i progetti", "← Precedente", il messaggio della pagina che non esiste…): `contenuti/testi.json`.

> Nei file `.json` fai attenzione alle **virgolette** e alle **virgole** tra una riga e l'altra (l'ultima riga di un elenco non ha la virgola). Se sbagli, il sito te lo dice (sezione 8).

---

## 6. Vedere il sito sul PC prima di pubblicarlo (facoltativo)

**Una volta sola:**
1. Installa [Node.js](https://nodejs.org/) (versione "LTS").
2. Apri un terminale nella cartella `Portfolio`. In Esplora file: clic destro nella cartella → "Apri nel terminale".
3. Scrivi `npm install` e premi Invio.

**Ogni volta:**
1. Nel terminale scrivi `npm start`.
2. Apri nel browser l'indirizzo che compare (di solito `http://localhost:8080`).
3. Il sito si aggiorna da solo quando salvi un file. Per fermarlo: `Ctrl + C` nel terminale.

---

## 7. Pubblicare

Il sito vive su **GitHub Pages**: ogni volta che carichi le modifiche sul ramo `main`, GitHub controlla i contenuti, costruisce il sito e lo pubblica.

**La prima volta:**
1. Crea un repository su GitHub e caricaci la cartella `Portfolio` (con [GitHub Desktop](https://desktop.github.com/): *File → Add local repository*, poi *Publish repository*).
2. Su github.com, nel repository: **Settings → Pages → Source: GitHub Actions**.
3. Indirizzo del sito: `https://<tuo-utente>.github.io/<nome-repository>/`. Se chiami il repository `<tuo-utente>.github.io`, l'indirizzo è direttamente `https://<tuo-utente>.github.io/`.

**Ogni volta (con GitHub Desktop):**
1. Scrivi due parole su cosa hai cambiato (in basso a sinistra) → **Commit to main**.
2. **Push origin**.
3. Su github.com, scheda **Actions**: dopo un paio di minuti compare una spunta verde ✓. Il sito è aggiornato.

**Dominio personalizzato** (es. `albertonome.it`): compralo da un registrar, poi su GitHub **Settings → Pages → Custom domain** e segui le istruzioni per i record DNS. GitHub crea da solo il file `CNAME`.

---

## 8. Se qualcosa va storto

Se c'è un errore nei contenuti, il sito **non** si rompe: la costruzione si ferma e online resta la versione precedente.

- **Sul PC:** il messaggio compare nel terminale.
- **Su GitHub:** scheda **Actions**, X rossa → clicca sul tentativo fallito → apri il passaggio in rosso.

Il messaggio dice **quale file** correggere e **cosa** non va. I più comuni:

| Messaggio | Cosa fare |
|---|---|
| `manca "titolo"` (o `categoria`, `anno`, `copertina`) | aggiungi il campo nell'intestazione |
| `categoria "Render" non esiste. Valori possibili: …` | scrivi la categoria esattamente come nella lista |
| `anno "…" non valido` | scrivi 4 cifre |
| `immagine "02.jpg" non trovata` | controlla che il file sia nella cartella e che il nome sia identico, maiuscole ed estensione comprese (`.JPG` ≠ `.jpg`) |
| `nome della cartella non valido … Rinominala in "…"` | rinomina la cartella come suggerito |
| `errore di formato nell'intestazione (riga N)` | alla riga indicata c'è una virgoletta non chiusa o un rientro sbagliato |
| `impostazioni.json: JSON non valido` / `testi.json: JSON non valido` | manca o avanza una virgola o una virgoletta |

Gli **avvisi** (`Avviso: …`) non bloccano niente: ti segnalano possibili errori di battitura (un campo scritto male, un'intro troppo lunga).

---

## 9. Controlli prima di pubblicare (quando cambi molte cose)

- [ ] La home si vede bene sul telefono, su un tablet e sul computer: nel browser `F12` → icona del telefono, prova 360, 800 e 1440 px di larghezza.
- [ ] I bottoni del filtro funzionano e "Tutti" mostra tutto.
- [ ] Con il tasto **Tab** si arriva a ogni link e bottone, e si vede dove si è.
- [ ] Un progetto con video: il video parte.
- [ ] Un indirizzo inventato (es. `/pagina-che-non-esiste`) mostra la pagina "Questa pagina non esiste."

---

## 10. Per le prossime versioni (strati 2–4)

- **Aspetto:** tutto in `stile/stile.css`. Le variabili all'inizio del file (`--sfondo`, `--testo`…) cambiano colori e misure in tutto il sito.
- **Struttura delle pagine:** in `modelli/` (`index.njk` = home, `progetto.njk`, `about.njk`, `404.njk`, `_base/base.njk` = parti comuni).
- **Filtro:** `script/filtro.js`.
- Prima di pubblicare modifiche al codice: `npm test` (devono passare tutti i test).
