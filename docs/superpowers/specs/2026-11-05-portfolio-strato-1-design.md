# Spec — Portfolio v2, Strato 1 (struttura e contenuto)

Data: 05/11/2026 · Stato: **approvato da Alberto (05/11/2026)**
Fonti: `claude/decisioni-brainstorming.md` (decisioni), tela "Portfolio v2 — Strato 1" (mockup di home, progetto, about).
Questo spec è pensato per essere eseguito anche da un modello meno capace: ogni comportamento è descritto in modo esplicito.

---

## 1. Obiettivo e ambito

Costruire un sito portfolio statico, funzionante e pubblicabile, con **look neutro** (scuro, font puliti). Il sito mostra subito i progetti e si aggiorna modificando solo file di testo e immagini.

**Dentro lo strato 1:** home con griglia bento e filtro, pagina progetto, pagina About, pagina 404, generazione da Markdown, ottimizzazione immagini, video YouTube, validazione dei contenuti, pubblicazione automatica, guida di manutenzione.

**Fuori dallo strato 1** (strati 2–4, vedi decisioni e archivio v1): estetica VHS/CRT, effetti hover elaborati, transizioni, statico, TV, attract mode, canali CH, render, versione inglese. Il codice va scritto in modo che queste cose si possano aggiungere sopra senza riscrivere la struttura: classi CSS chiare per ogni componente, un solo file di stile, testi dell'interfaccia in un file separato.

## 2. Requisiti trasversali

1. **Manutenibilità a mano** (requisito principale). Alberto deve poter aggiungere, togliere e modificare progetti, testi, immagini, contatti e colori senza IA e senza toccare i modelli HTML. File e cartelle hanno nomi in italiano e chiari. CSS e modelli hanno commenti in italiano.
2. **Mobile:** tutte le pagine funzionano da 360 px di larghezza in su, senza scorrimento orizzontale.
3. **Accessibilità:** `lang="it"`, contrasto del testo ≥ 4.5:1, focus visibile, aree cliccabili ≥ 44 px, `alt` su ogni immagine, link e bottoni veri.
4. **Prestazioni:** nessun framework JavaScript lato browser. Immagini ridimensionate e caricate pigramente (lazy). Video caricati solo quando servono.
5. **Privacy:** font ospitati nel sito, niente Google Fonts remoti. YouTube in modalità `youtube-nocookie`. Nessun tracciamento.
6. **Nessun testo dell'interfaccia scritto nei modelli:** tutte le etichette fisse vengono da `contenuti/testi.json` (§5.4).

## 3. Tecnologia

- **Eleventy (11ty) v3**, con template **Nunjucks** (`.njk`) e Markdown tramite `markdown-it` (incluso in Eleventy).
- **@11ty/eleventy-img** per le immagini.
- **Node.js 20 LTS o successivo**. Comandi: `npm start` (anteprima locale con aggiornamento automatico), `npm run build` (costruisce in `_site/`), `npm test` (esegue i test).
- **JavaScript lato browser:** un solo file piccolo, `script/filtro.js`, scritto senza librerie.
- **Pubblicazione:** GitHub Pages tramite GitHub Actions.
- **Font:** Space Grotesk (500, 700) per titoli e nome; Space Mono (400, 700) per il resto. File `.woff2` in `stile/font/`, con licenza OFL inclusa.

## 4. Struttura delle cartelle

```
Portfolio/
  contenuti/
    impostazioni.json        ← dati generali (§5.1)
    testi.json               ← etichette fisse dell'interfaccia (§5.4)
    about.md                 ← pagina About (§5.3)
    foto.jpg                 ← facoltativa, nome indicato in about.md
    progetti/
      _modello/progetto.md   ← modello commentato da copiare (ignorato dal sito)
      <nome-cartella>/       ← una cartella per progetto
        progetto.md
        copertina.jpg
        01.jpg, 02.jpg, …    ← nomi liberi
  modelli/
    base.njk                 ← scheletro comune (head, barra in alto, piè di pagina)
    home.njk
    progetto.njk
    about.njk
    404.njk
  stile/
    stile.css                ← tutto l'aspetto, diviso in sezioni commentate
    font/                    ← file .woff2 + licenza
  script/
    filtro.js
  strumenti/                 ← codice di supporto (non da modificare di solito)
    contenuti.js             ← lettura, ordinamento e validazione dei progetti
    youtube.js               ← trasformazione dei link YouTube
    immagini.js              ← shortcode/trasformazione immagini
  test/                      ← test automatici
  docs/superpowers/          ← spec e piani
  eleventy.config.js
  package.json
  .github/workflows/pubblica.yml
  GUIDA.md                   ← guida di manutenzione per Alberto
  README.md                  ← breve, rimanda a GUIDA.md
```

`_site/` (risultato della costruzione) e `node_modules/` sono esclusi da git (`.gitignore`). Le cartelle di `contenuti/progetti/` che iniziano con `_` vengono ignorate dal sito.

## 5. Formato dei contenuti

### 5.1 `contenuti/impostazioni.json`

```json
{
  "nome": "Nome Cognome",
  "descrizioneSito": "Portfolio di Nome Cognome: film, render e videogiochi.",
  "email": "nome@esempio.it",
  "linkedin": "https://www.linkedin.com/in/...",
  "curriculum": "https://drive.google.com/...",
  "categorie": [
    { "nome": "Film Making", "colore": "#ef4444" },
    { "nome": "Renders",     "colore": "#facc15" },
    { "nome": "Videogames",  "colore": "#38bdf8" },
    { "nome": "Others",      "colore": "#4ade80" }
  ]
}
```

- `curriculum` e `linkedin` sono facoltativi: se vuoti, il link corrispondente non compare.
- L'ordine di `categorie` è l'ordine dei bottoni del filtro.

### 5.2 `progetto.md`

Intestazione tra due righe `---` (front matter YAML), poi il corpo.

| Campo | Obbligatorio | Formato | Note |
|---|---|---|---|
| `titolo` | sì | testo | |
| `categoria` | sì | uno dei `nome` in `impostazioni.json` | maiuscole e minuscole devono coincidere |
| `anno` | sì | numero di 4 cifre | |
| `copertina` | sì | nome di un file nella cartella | usata nella home e come immagine di anteprima social |
| `intro` | no | testo (1–2 righe) | vedi la regola sotto |
| `evidenza` | no | `sì` / `no` (accetta anche `si`, `true`, `false`) | default `no` |
| `ordine` | no | numero intero | più basso = prima, vedi §6.4 |
| `software` | no | testo, elementi separati da virgola | |
| `crediti` | no | testo libero | |
| `contesto` | no | testo libero | es. corso o università |
| `bozza` | no | `sì` / `no` | se `sì`, il progetto non viene pubblicato |

**Regola di `intro`:** se `intro` è presente, compare sotto il titolo e nelle caselle in evidenza, e il corpo resta intero. Se è assente, si usa il **primo paragrafo** del corpo come intro, e quel paragrafo viene **tolto dal corpo**, così non compare due volte. Il primo paragrafo è il primo blocco di testo semplice: non un titoletto, un'immagine o un video. Se il corpo non ha paragrafi, l'intro resta vuota.

**Corpo:** Markdown normale. Blocchi riconosciuti:
- **Testo:** paragrafi, titoletti `##` e `###`, elenchi, grassetto e corsivo, link.
- **Immagine:** `![didascalia](file.jpg)`. La didascalia diventa sia `alt` sia `<figcaption>`. Se è vuota, l'`alt` è il titolo del progetto e la figcaption non compare.
- **Video YouTube:** una riga che contiene **solo** un link YouTube (`youtube.com/watch?v=ID`, `youtu.be/ID`, `youtube.com/shorts/ID`, eventualmente con `&t=…`). Diventa un player incorporato. Un link YouTube dentro una frase resta un normale link.

### 5.3 `contenuti/about.md`

```
---
sottotitolo: Studente di … · Università di …
foto: foto.jpg            (facoltativa)
frase: Risolvo problemi: è quello che mi piace fare.
software: Blender, DaVinci Resolve, Unity, After Effects
---
Due o tre frasi su di te.

Cosa cerchi: collaborazioni, tirocini…
```

Il nome, l'email, LinkedIn e il curriculum vengono da `impostazioni.json`, così sono scritti in un posto solo.

### 5.4 `contenuti/testi.json`

Contiene tutte le etichette fisse dell'interfaccia. I modelli non contengono testo scritto direttamente: lo leggono da qui. Valori iniziali:

```json
{
  "menuProgetti": "Progetti",
  "menuAbout": "About",
  "filtroTutti": "Tutti",
  "tuttiIProgetti": "Tutti i progetti",
  "tornaAiProgetti": "← Tutti i progetti",
  "precedente": "← Precedente",
  "successivo": "Successivo →",
  "software": "Software",
  "crediti": "Crediti",
  "contesto": "Contesto",
  "contatti": "Contatti",
  "curriculum": "Curriculum ↗",
  "guardaIProgetti": "← Guarda i progetti",
  "aboutLink": "About →",
  "videoTitolo": "Video:",
  "erroreTitolo": "Questa pagina non esiste.",
  "erroreLink": "← Torna ai progetti"
}
```

Serve a cambiare un'etichetta senza toccare l'HTML ed è la base per la futura versione inglese (§12).

## 6. Comportamenti

### 6.1 Indirizzi
- Home: `/`
- Progetto: `/progetti/<nome-cartella>/`
- About: `/about/`
- 404: `/404.html`

Il nome della cartella deve contenere solo lettere minuscole, numeri e trattini (vedi validazione §7). Questi indirizzi non devono cambiare quando si aggiungerà l'inglese: la versione inglese andrà sotto `/en/…`.

### 6.2 Home
- **Barra in alto** (uguale su tutte le pagine): a sinistra il nome, che porta alla home; a destra "Progetti" e "About", con la pagina attuale sottolineata e marcata `aria-current="page"`.
- **Filtro:** bottone "Tutti" più un bottone per ogni categoria che ha almeno un progetto pubblicato. Ogni bottone ha un pallino del colore della categoria. Lo stato attivo è dato da `aria-pressed`.
- **Griglia bento:**
  - ≥ 1100 px: 4 colonne. 800–1099 px: 3 colonne. < 800 px: 2 colonne.
  - Progetto in evidenza: 2×2 caselle sopra gli 800 px; sotto gli 800 px occupa tutta la larghezza (2 colonne) con immagine 16:9.
  - Casella normale: copertina 4:3, titolo, pallino della categoria + nome della categoria + anno.
  - Casella in evidenza: copertina che riempie l'altezza, titolo più grande, categoria + anno, e intro.
  - CSS `grid-auto-flow: dense` per non lasciare buchi.
  - Tutta la casella è un link alla pagina del progetto.
- **Piè di pagina:** email, LinkedIn, "About →".

### 6.3 Filtro (`script/filtro.js`)
- **Senza JavaScript:** i bottoni del filtro sono nascosti (la classe che li mostra viene aggiunta solo quando lo script parte) e tutti i progetti sono visibili.
- **Con JavaScript:** al click mostra solo le caselle con `data-categoria` corrispondente; "Tutti" le mostra tutte. L'ordine e le misure non cambiano.
- La categoria scelta si scrive nell'indirizzo (`?categoria=renders`), così un link può aprire la home già filtrata. Il nome nell'indirizzo è quello della categoria in minuscolo, con i trattini al posto degli spazi (`film-making`). Un valore sconosciuto equivale a "Tutti".

### 6.4 Ordine dei progetti
1. Prima i progetti con `evidenza: sì`, poi gli altri.
2. Dentro ciascun gruppo: chi ha `ordine` viene prima, in ordine crescente; poi gli altri per `anno` decrescente; a parità di anno, per `titolo` in ordine alfabetico.

Lo stesso ordine vale per la home e per "precedente/successivo".

### 6.5 Pagina progetto
- In alto: "← Tutti i progetti" (porta alla home).
- **Intestazione** (larghezza massima 1040 px, centrata): pallino e categoria + anno; titolo grande (`h1`); una fascia con SOFTWARE, CREDITI e CONTESTO, che mostra solo i campi presenti (se nessuno è presente, la fascia non compare); intro.
- **Corpo:** testo in una colonna di larghezza massima 680 px; immagini e video larghi fino a 1040 px. Spazio di 56 px tra i blocchi.
- **In fondo:** "← Precedente" (titolo), "Tutti i progetti", "Successivo →" (titolo). Il primo progetto non ha precedente e l'ultimo non ha successivo: quel lato resta vuoto, senza giro circolare.
- **Metadati:** `<title>` = "Titolo — Nome"; description = intro (o `descrizioneSito` se l'intro è vuota); immagine Open Graph = copertina.

### 6.6 About
Barra, poi due colonne che sotto gli 800 px vanno una sopra l'altra:
- a sinistra la foto (4:5), solo se c'è; se manca, il testo occupa tutta la larghezza;
- a destra il nome (`h1`), il sottotitolo, il corpo di `about.md`, la `frase` in evidenza (più grande), la fascia SOFTWARE, i CONTATTI (email come `mailto:`, LinkedIn, "Curriculum ↗") e in fondo "← Guarda i progetti".

LinkedIn e Curriculum si aprono in una nuova scheda (`target="_blank" rel="noopener"`). Il sito non scarica nessun file.

### 6.7 404
Barra, il messaggio "Questa pagina non esiste." e un link "← Torna ai progetti".

### 6.8 Immagini
- Larghezze generate: 400, 800, 1600 px (mai più larghe dell'originale), nei formati WebP e JPEG (fallback), con `srcset` e `sizes` corretti per il contesto (casella, casella in evidenza, corpo della pagina).
- Attributi `loading="lazy"` e `decoding="async"`. Fa eccezione la copertina del primo progetto in home, che usa `loading="eager"`.
- `width` e `height` sono sempre presenti, per evitare salti della pagina durante il caricamento.

### 6.9 Video YouTube
- Contenitore 16:9 largo come le immagini.
- Iframe `https://www.youtube-nocookie.com/embed/<ID>` con `loading="lazy"`, `title="Video: <titolo progetto>"` e `allowfullscreen`. Il parametro `start` viene dal `t=` del link, se presente (accetta `90`, `90s`, `1m30s`).

### 6.10 Aspetto (strato 1)
Variabili CSS all'inizio di `stile.css`, così si cambiano in un punto solo:

| Variabile | Valore |
|---|---|
| `--sfondo` | `#111111` |
| `--testo` | `#ece8e1` |
| `--testo-secondario` | `#a8a39b` |
| `--testo-debole` | `#c9c4bb` |
| `--bordo` | `#2c2c2c` |
| `--segnaposto` | `#262626` |
| `--larghezza-max` | `1440px` |
| `--colonna-testo` | `680px` |
| `--colonna-media` | `1040px` |

- Margine laterale: `clamp(16px, 4.5vw, 64px)`.
- Il colore di ogni categoria arriva dall'HTML come variabile `--colore-categoria`.

## 7. Validazione ed errori

Durante la costruzione `strumenti/contenuti.js` controlla tutti i progetti, raccoglie **tutti** gli errori e li stampa insieme, in italiano, con il percorso del file. Se c'è almeno un errore la costruzione fallisce (codice di uscita ≠ 0) e su GitHub resta online la versione precedente.

**Errori (bloccano la costruzione):**
- campo obbligatorio mancante → `progetti/x/progetto.md: manca "titolo"`;
- categoria sconosciuta → `progetti/x/progetto.md: categoria "Render" non esiste. Valori possibili: Film Making, Renders, Videogames, Others`;
- `anno` non valido;
- file indicato da `copertina`, `foto` o da un'immagine nel corpo che non esiste nella cartella → `progetti/x/progetto.md: immagine "02.jpg" non trovata`;
- nome della cartella non valido (maiuscole, spazi, accenti) → il messaggio suggerisce il nome corretto;
- `impostazioni.json` o `testi.json` mancanti o con JSON non valido; `impostazioni.json` senza `nome` o `categorie`.

**Avvisi (non bloccano):**
- campo sconosciuto (probabile errore di battitura);
- intro (data o ricavata) più lunga di 300 caratteri;
- nessun progetto in evidenza.

## 8. Test

Si usa il test runner incluso in Node (`node --test`), senza librerie aggiuntive. Si scrivono i test prima del codice (TDD).

- `youtube.js`: riconosce le varianti di link (watch, youtu.be, shorts, con `t=`); un link dentro una frase non viene trasformato; un link non YouTube non viene trasformato.
- `contenuti.js`, ordinamento: casi con evidenza, `ordine`, anno e titolo, come in §6.4.
- `contenuti.js`, intro: intro data; intro ricavata e tolta dal corpo; corpo che inizia con titoletto o immagine; corpo senza paragrafi.
- `contenuti.js`, validazione: ogni errore e avviso di §7 produce il messaggio atteso; le bozze e le cartelle `_…` vengono escluse.
- Costruzione completa su una cartella di contenuti di prova (`test/esempio/`): la costruzione riesce e le pagine attese esistono in `_site/`.

**Controllo a mano** prima della prima pubblicazione (la lista va anche in GUIDA.md): home a 360, 800 e 1440 px; filtro con e senza JavaScript; navigazione completa con la tastiera; un progetto con video; la pagina 404.

## 9. Pubblicazione

- Repository GitHub di Alberto. Il workflow `.github/workflows/pubblica.yml` parte a ogni push su `main`: installa, esegue i test, costruisce e pubblica su GitHub Pages (azioni ufficiali `actions/upload-pages-artifact` e `actions/deploy-pages`).
- Se il repository non è `<utente>.github.io`, il sito vive in un sottopercorso (`/<repo>/`): usare `pathPrefix` di Eleventy, letto da una variabile d'ambiente nel workflow, e il filtro `url` in tutti i link. L'anteprima locale funziona comunque alla radice.
- Un dominio personalizzato si potrà aggiungere più avanti (file `CNAME`); la procedura va nella guida.

## 10. Consegna: `GUIDA.md`

Scritta per Alberto, in italiano semplice, con esempi da copiare:
1. Com'è fatta la cartella (cosa si tocca e cosa no).
2. Aggiungere un progetto (passo per passo, partendo da `_modello`).
3. Modificare o nascondere un progetto (bozza), cambiare quelli in evidenza e l'ordine.
4. Aggiungere un video, un'immagine con didascalia, un titoletto.
5. Modificare About, contatti, curriculum, categorie e colori, etichette (`testi.json`).
6. Vedere il sito sul PC (installare Node una volta, poi `npm start`).
7. Pubblicare (GitHub Desktop o caricamento da web) e controllare che sia andata a buon fine.
8. Cosa fare se la costruzione fallisce (leggere il messaggio, gli errori più comuni).
9. Lista di controlli prima di pubblicare.
10. Dove intervenire per gli strati successivi (stile.css, modelli).

## 11. Contenuti iniziali

Finché Alberto non inserisce i suoi, il sito contiene 3 progetti di esempio con immagini segnaposto, marcati in modo evidente come esempi (uno in evidenza, uno con video, uno senza intro). La guida spiega come cancellarli.

## 12. Fuori ambito (memo per gli strati successivi)

- **Strato 2:** look VHS statico (palette, grana, scanline, tipografia), basato sulle reference di Alberto.
- **Strato 3:** hover = anteprima, transizioni tra pagine, feedback.
- **Strato 4:** "mondo" (TV, statico, attract mode, canali CH ed extra nascosti), ripreso dall'archivio v1.
- **Versione inglese (predisposta, non inclusa):** si aggiungerà un `testi.en.json` e campi tradotti (o file `progetto.en.md`) con pagine sotto `/en/…`. Gli indirizzi italiani restano invariati.
