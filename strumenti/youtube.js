// Video YouTube: una riga che contiene SOLO un link YouTube diventa un player.
// Un link YouTube dentro una frase resta un normale link.

const MODELLI = [
  /^https?:\/\/(?:www\.|m\.)?youtube\.com\/watch\?(?:.*&)?v=([A-Za-z0-9_-]{11})(?:[&#].*)?$/,
  /^https?:\/\/youtu\.be\/([A-Za-z0-9_-]{11})(?:[?#].*)?$/,
  /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/([A-Za-z0-9_-]{11})(?:[?#].*)?$/,
];

// "90", "90s", "1m30s", "1h2m3s" → secondi
function leggiTempo(valore) {
  if (!valore) return null;
  if (/^\d+s?$/.test(valore)) return parseInt(valore, 10);
  const parti = valore.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!parti || !parti[0]) return null;
  const [, h = 0, m = 0, s = 0] = parti;
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

export function estraiYoutube(riga) {
  const testo = String(riga).trim();
  for (const modello of MODELLI) {
    const trovato = testo.match(modello);
    if (trovato) {
      const t = new URL(testo).searchParams.get("t");
      return { id: trovato[1], inizio: leggiTempo(t) };
    }
  }
  return null;
}

function escapa(testo) {
  return String(testo)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function htmlVideo(video, titoloProgetto, etichetta) {
  const inizio = video.inizio ? `?start=${video.inizio}` : "";
  return (
    `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${video.id}${inizio}" ` +
    `title="${escapa(`${etichetta} ${titoloProgetto}`)}" loading="lazy" allowfullscreen ` +
    `allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"></iframe></div>`
  );
}

export function sostituisciVideo(corpo, titolo, etichetta) {
  const blocchi = String(corpo).replace(/\r\n/g, "\n").split(/\n\s*\n/);
  return blocchi
    .map((blocco) => {
      const video = estraiYoutube(blocco);
      return video ? htmlVideo(video, titolo, etichetta) : blocco;
    })
    .join("\n\n");
}
