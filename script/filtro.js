// Filtro dei progetti per categoria (home).
// Senza JavaScript i bottoni restano nascosti e si vedono tutti i progetti.

export function scegliCategoria(search, slugValidi) {
  const scelta = new URLSearchParams(search).get("categoria");
  return scelta && slugValidi.includes(scelta) ? scelta : "tutti";
}

if (typeof document !== "undefined") {
  const filtro = document.querySelector(".filtro");
  if (filtro) {
    const bottoni = [...filtro.querySelectorAll(".filtro-bottone")];
    const caselle = [...document.querySelectorAll(".griglia .casella")];
    const slugValidi = bottoni.map((b) => b.dataset.categoria).filter((s) => s !== "tutti");

    const applica = (categoria) => {
      for (const b of bottoni) b.setAttribute("aria-pressed", String(b.dataset.categoria === categoria));
      for (const c of caselle) c.hidden = categoria !== "tutti" && c.dataset.categoria !== categoria;
      const url = new URL(window.location.href);
      if (categoria === "tutti") url.searchParams.delete("categoria");
      else url.searchParams.set("categoria", categoria);
      history.replaceState(null, "", url);
    };

    for (const b of bottoni) b.addEventListener("click", () => applica(b.dataset.categoria));
    filtro.hidden = false;
    applica(scegliCategoria(window.location.search, slugValidi));
  }
}
