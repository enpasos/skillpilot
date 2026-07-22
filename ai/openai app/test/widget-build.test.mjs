import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

for (const locale of ["de", "en"]) {
  test(`${locale} widget is a self-contained MCP App document`, async () => {
    const html = await readFile(new URL(`../dist/${locale}/widget.html`, import.meta.url), "utf8");
    assert.match(html, /^<!doctype html>/i);
    assert.match(html, /<script>/);
    assert.doesNotMatch(html, /<script[^>]+src=/i);
    assert.doesNotMatch(html, /<link[^>]+rel=["']stylesheet/i);
    assert.doesNotMatch(html, /serviceWorker|https?:\/\//i);
    assert.doesNotMatch(html, /spapp_[0-9a-f-]+|choice_[0-9a-f-]+/i);
    assert.ok(Buffer.byteLength(html) < 30_000, "widget should remain compact");
  });
}

test("German and English widgets are compiled as separate artifacts", async () => {
  const de = await readFile(new URL("../dist/de/widget.html", import.meta.url), "utf8");
  const en = await readFile(new URL("../dist/en/widget.html", import.meta.url), "utf8");
  assert.notEqual(de, en);
  assert.match(de, /choose_skillpilot_path_de/);
  assert.match(en, /choose_skillpilot_path_en/);
  assert.doesNotMatch(de, /choose_skillpilot_path_en/);
  assert.doesNotMatch(en, /choose_skillpilot_path_de/);
});
