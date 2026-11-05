import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { costruisci } from "./aiuti.js";

test("la costruzione produce la home", async () => {
  const out = await costruisci({ contenuti: "contenuti" });
  assert.ok(existsSync(join(out, "index.html")));
});
