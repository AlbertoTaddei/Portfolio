// Aiuti per i test: costruisce il sito in una cartella temporanea.
import { execFile } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function costruisci({ contenuti, prefisso = "/", sitoUrl = "" }) {
  const uscita = await mkdtemp(join(tmpdir(), "portfolio-"));
  await new Promise((risolvi, rifiuta) => {
    execFile(
      "npx",
      ["@11ty/eleventy", `--output=${uscita}`, "--quiet"],
      { env: { ...process.env, CONTENUTI: contenuti, PATH_PREFIX: prefisso, SITO_URL: sitoUrl } },
      (errore, stdout, stderr) => {
        if (errore) rifiuta(new Error(`Costruzione fallita:\n${stderr}\n${stdout}`));
        else risolvi();
      }
    );
  });
  return uscita;
}
