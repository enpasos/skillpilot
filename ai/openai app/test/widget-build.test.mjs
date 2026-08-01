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

test("German and English widgets are compiled as separate artifacts", async () => {
  const de = await readFile(new URL("../dist/de/widget.html", import.meta.url), "utf8");
  const en = await readFile(new URL("../dist/en/widget.html", import.meta.url), "utf8");
  assert.notEqual(de, en);
  assert.match(de, /choose_skillpilot_path_de/);
  assert.match(de, /L(?:ösung|\\xF6sung) jetzt bewerten lassen/);
  assert.match(en, /choose_skillpilot_path_en/);
  assert.match(en, /Evaluate answer now/);
  assert.doesNotMatch(de, /choose_skillpilot_path_en/);
  assert.doesNotMatch(en, /choose_skillpilot_path_de/);
});

test("goal visualization widget is self-contained and uses the standards-first MCP Apps bridge", async () => {
  const html = await readFile(
    new URL("../dist/goal-visualization/widget.html", import.meta.url),
    "utf8"
  );
  const backendHtml = await readFile(
    new URL(
      "../../../backend/src/main/resources/openai/skillpilot-goal-visualization-v1.html",
      import.meta.url
    ),
    "utf8"
  );
  assert.equal(
    backendHtml,
    html,
    "the Java MCP server must embed the exact tested widget bundle"
  );
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /ui\/notifications\/tool-result/);
  assert.match(html, /ui\/open-link/);
  assert.match(html, /goalVisualization/);
  assert.match(html, /toolOutput/, "ChatGPT's initial compatibility payload remains supported");
  assert.match(
    html,
    /widgetState/,
    "ChatGPT's persisted widget snapshot must rehydrate a remounted result"
  );
  assert.match(
    html,
    /setWidgetState/,
    "the last valid visualization must be persisted after rendering"
  );
  assert.match(
    html,
    /openai:set_globals/,
    "ChatGPT global updates must rehydrate the widget after a host remount"
  );
  assert.match(
    html,
    /\.contains\(/,
    "a stale image error from one host delivery must not erase a newer render"
  );
  assert.match(html, /\.hidden/, "missing or broken images must collapse the widget");
  assert.match(html, /SkillPilot(?: |\\x20)Lernziel/);
  assert.match(html, /SkillPilot-Cockpit/);
  assert.match(html, /aria-labelledby/);
  assertInlineScriptParses(html, "goal-visualization/widget.html");
  assert.doesNotMatch(html, /<script[^>]+src=/i);
  assert.doesNotMatch(html, /<link[^>]+rel=["']stylesheet/i);
  assert.doesNotMatch(
    html,
    /<(?:script|link|img|iframe|source)[^>]+(?:src|href)=["']https?:\/\//i,
    "widget must receive its image URL at runtime instead of hard-coding an external asset"
  );
  assert.ok(
    Buffer.byteLength(html) < 450_000,
    "widget including the official MCP Apps protocol client should remain bounded"
  );
});
