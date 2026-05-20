import assert from "node:assert/strict";
import test from "node:test";

import { cn } from "../src/lib/utils.js";

test("cn joins truthy class names", () => {
  assert.equal(cn("flex", false && "hidden", "items-center"), "flex items-center");
});

test("cn resolves Tailwind class conflicts with the later class", () => {
  assert.equal(cn("p-2 text-sm", "p-4"), "text-sm p-4");
});
