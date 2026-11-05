// Ordine dei progetti (spec §6.4): prima quelli in evidenza; poi chi ha
// "ordine" (dal più basso); poi dal più recente; a parità, per titolo.

const haOrdine = (p) => p.ordine !== undefined && p.ordine !== null && p.ordine !== "";

function confronta(a, b) {
  if (a.evidenza !== b.evidenza) return a.evidenza ? -1 : 1;
  if (haOrdine(a) !== haOrdine(b)) return haOrdine(a) ? -1 : 1;
  if (haOrdine(a) && Number(a.ordine) !== Number(b.ordine)) return Number(a.ordine) - Number(b.ordine);
  if (a.anno !== b.anno) return b.anno - a.anno;
  return a.titolo.localeCompare(b.titolo, "it");
}

export function ordinaProgetti(lista) {
  return [...lista].sort(confronta);
}

// Aggiunge "precedente" e "successivo" a ogni progetto (il primo e l'ultimo
// non fanno il giro).
export function collegaVicini(lista) {
  const vicino = (p) => (p ? { url: p.url, titolo: p.titolo } : null);
  return lista.map((p, i) => ({ ...p, precedente: vicino(lista[i - 1]), successivo: vicino(lista[i + 1]) }));
}
