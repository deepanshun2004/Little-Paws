import assert from "node:assert/strict";
import test from "node:test";

import { getImageSrc } from "../src/lib/image.js";

test("getImageSrc returns a non-empty image string as-is", () => {
  assert.equal(getImageSrc("https://example.com/pet.jpg"), "https://example.com/pet.jpg");
});

test("getImageSrc returns an encoded placeholder for missing images", () => {
  assert.equal(
    getImageSrc("", "Little Paws adoption"),
    "https://placehold.co/600x400?text=Little%20Paws%20adoption"
  );
});

test("getImageSrc uses the default fallback text", () => {
  assert.equal(
    getImageSrc(null),
    "https://placehold.co/600x400?text=Little%20Paws"
  );
});
