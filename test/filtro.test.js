import { test } from "node:test";
import assert from "node:assert/strict";
import { scegliCategoria } from "../script/filtro.js";

test("scegliCategoria legge ?categoria= solo se valida", () => {
  assert.equal(scegliCategoria("?categoria=renders", ["renders"]), "renders");
  assert.equal(scegliCategoria("?categoria=boh", ["renders"]), "tutti");
  assert.equal(scegliCategoria("", ["renders"]), "tutti");
});
