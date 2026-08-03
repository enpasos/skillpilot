import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { Script } from "node:vm";

function assertInlineScriptParses(html, filename) {
  const match = html.match(/<script>([\s\S]*)<\/script>\s*<\/body>/i);
  assert.ok(match, `${filename} must contain one inline JavaScript bundle`);
  assert.doesNotThrow(
    () => new Script(match[1], { filename }),
    `${filename} must contain syntactically valid JavaScript`
  );
}

for (const locale of ["de", "en"]) {
  test(`${locale} widget is a self-contained MCP App document`, async () => {
    const html = await readFile(new URL(`../dist/${locale}/widget.html`, import.meta.url), "utf8");
    assert.match(html, /^<!doctype html>/i);
    assert.match(html, /<script>/);
    assert.doesNotMatch(html, /<script[^>]+src=/i);
    assert.doesNotMatch(html, /<link[^>]+rel=["']stylesheet/i);
    assert.doesNotMatch(html, /serviceWorker/i);
    assert.doesNotMatch(
      html,
      /<(?:script|link|img|iframe|source)[^>]+(?:src|href)=["']https?:\/\//i,
      "widget must not load external runtime assets"
    );
    assert.doesNotMatch(html, /spapp_[0-9a-f-]+|choice_[0-9a-f-]+/i);
    assert.match(html, /ui\/message/);
    assert.match(html, /MCP-Bridge|MCP bridge/);
    assertInlineScriptParses(html, `${locale}/widget.html`);
    assert.ok(
      Buffer.byteLength(html) < 500_000,
      "widget including the official MCP Apps protocol client should remain bounded"
    );
  });
}

test("German and English payload widgets share the one neutral tool catalog", async () => {
  const de = await readFile(new URL("../dist/de/widget.html", import.meta.url), "utf8");
  const en = await readFile(new URL("../dist/en/widget.html", import.meta.url), "utf8");
  assert.notEqual(de, en);
  assert.match(de, /choose_skillpilot_path/);
  assert.match(de, /L(?:ösung|\\xF6sung) jetzt bewerten lassen/);
  assert.match(en, /choose_skillpilot_path/);
  assert.match(en, /Evaluate answer now/);
  assert.doesNotMatch(de, /choose_skillpilot_path_(?:de|en)/);
  assert.doesNotMatch(en, /choose_skillpilot_path_(?:de|en)/);
});
