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
  const visualizationSource = await readFile(
    new URL("../widget/src/goal-visualization-main.ts", import.meta.url),
    "utf8"
  );
  assert.equal(
    backendHtml,
    html,
    "the Java MCP server must embed the exact tested widget bundle"
  );
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /ui\/notifications\/tool-result/);
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
    /requestTeardown/,
    "hosts that cannot load the image must receive the standard teardown request"
  );
  assert.match(
    html,
    /requestClose/,
    "ChatGPT's optional compatibility close hook must remain feature-detected"
  );
  assert.match(
    html,
    /["']load["']/,
    "the widget must wait for a successful image load before becoming visible"
  );
  assert.match(
    html,
    /["']error["']/,
    "an actual image-load failure must collapse and dismiss the widget"
  );
  assert.match(
    html,
    /setTimeout/,
    "a host that never completes image loading must not leave an empty widget forever"
  );
  assert.doesNotMatch(
    visualizationSource,
    /isMobileGoalVisualizationHost|navigator\.userAgent|getHostContext|hostcontextchanged/,
    "device class and user-agent strings must not decide whether an image-capable host can render"
  );
  assert.match(
    html,
    /\.contains\(/,
    "a stale image error from one host delivery must not erase a newer render"
  );
  assert.match(html, /\.hidden/, "missing or broken images must collapse the widget");
  assert.doesNotMatch(html, /SkillPilot(?: |\\x20)Lernziel/);
  assert.doesNotMatch(html, /SkillPilot-Cockpit/);
  assert.doesNotMatch(html, /aria-labelledby/);
  assert.doesNotMatch(html, /goal-card|goal-content|cockpit-link/);
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

test("SkillPilot start widget is standards-first, bounded, and embedded byte-exactly", async () => {
  const html = await readFile(
    new URL("../dist/skillpilot-start/widget.html", import.meta.url),
    "utf8"
  );
  const backendHtml = await readFile(
    new URL(
      "../../../backend/src/main/resources/openai/skillpilot-start-v1.html",
      import.meta.url
    ),
    "utf8"
  );
  const source = await readFile(
    new URL("../widget/src/skillpilot-start-main.ts", import.meta.url),
    "utf8"
  );

  assert.equal(backendHtml, html, "the Java server must embed the tested widget bytes");
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /ui\/initialize/);
  assert.match(html, /ui\/notifications\/tool-result/);
  assert.match(html, /tools\/call/);
  assert.match(html, /ui\/message/);
  assert.match(html, /ui\/open-link/);
  assert.match(html, /issue_skillpilot_start_capability/);
  assert.match(
    html,
    /https:\/\/mcp-coach-v1\.skillpilot\.com\/bootstrap\/v1\/launch/
  );
  assert.match(html, /providerEligibilityConfirmed/);
  assert.match(html, /providerNoticeVersion/);
  assert.match(html, /clientRequestId/);
  assert.match(html, /ID_REQUIRED/);
  assert.match(html, /ISSUING_CAPABILITY/);
  assert.match(html, /VALIDATING_AND_LAUNCHING/);
  assert.match(html, /SESSION_CREATED_PENDING_HOST_ACCEPTANCE/);
  assert.match(html, /HOST_MESSAGE_OUTCOME_UNKNOWN/);
  assert.match(html, /HOST_MESSAGE_ACCEPTED/);
  assert.match(html, /policyRevision/);
  assert.match(html, /ALLOW_CURRENT_MAJOR/);
  assert.match(html, /START_CURRENT_MAJOR/);
  assert.match(html, /credentials:\s*["']omit["']/);
  assert.match(html, /redirect:\s*["']error["']/);
  assert.match(html, /Verwende SkillPilot Coach v1 und fahre fort\./);
  assert.match(html, /Use SkillPilot Coach v1 and continue\./);
  assert.match(html, /toolOutput/, "ChatGPT's initial compatibility payload remains read-only input");
  assert.match(html, /toolResponseMetadata/);
  assert.match(html, /openai:set_globals/);
  assert.doesNotMatch(
    source,
    /window\.openai\?\.(?:callTool|sendFollowUpMessage|openExternal)/,
    "mutations and navigation must use the standard MCP Apps bridge"
  );
  assert.doesNotMatch(html, /launch_skillpilot_session/);
  assert.doesNotMatch(source, /linked SkillPilot profile|verknüpften SkillPilot-Profil/i);
  assert.doesNotMatch(source, /\bPIN\b|password|type\s*=\s*["']file["']/i);
  assert.match(source, /private App-Metadaten/);
  assert.match(source, /private app metadata/);
  assert.match(source, /zur Aufnahme in Chat und Modellkontext/);
  assert.match(source, /for inclusion in the chat and model context/);
  assert.match(source, /kann dieselbe Nachricht doppelt in den Chat einfügen/);
  assert.match(source, /can add the same message to the chat twice/);
  assertInlineScriptParses(html, "skillpilot-start/widget.html");
  assert.doesNotMatch(html, /<script[^>]+src=/i);
  assert.doesNotMatch(html, /<link[^>]+rel=["']stylesheet/i);
  assert.doesNotMatch(
    html,
    /<(?:script|link|img|iframe|source)[^>]+(?:src|href)=["']https?:\/\//i,
    "widget must not hard-code external runtime assets"
  );
  assert.ok(
    Buffer.byteLength(html) < 500_000,
    "start widget including the official MCP Apps protocol client should remain bounded"
  );
});

test("memory-card practice widget is private-data-safe, interactive, and embedded byte-exactly", async () => {
  const html = await readFile(
    new URL("../dist/memory-card-practice/widget.html", import.meta.url),
    "utf8"
  );
  const backendHtml = await readFile(
    new URL(
      "../../../backend/src/main/resources/openai/skillpilot-memory-card-practice-v1.html",
      import.meta.url
    ),
    "utf8"
  );
  const source = await readFile(
    new URL("../widget/src/memory-card-practice-main.ts", import.meta.url),
    "utf8"
  );
  const parserSource = await readFile(
    new URL("../widget/src/memory-card-practice.ts", import.meta.url),
    "utf8"
  );

  assert.equal(backendHtml, html, "the Java server must embed the tested widget bytes");
  assert.match(html, /^<!doctype html>/i);
  assert.match(html, /start_skillpilot_memory_practice/);
  assert.match(html, /review_skillpilot_memory_practice_card/);
  assert.match(html, /tools\/call/);
  assert.match(html, /toolResponseMetadata/);
  assert.match(html, /skillpilotMemoryCard/);
  assert.match(html, /Karteikarten lernen/);
  assert.match(html, /Learn with flashcards/);
  assert.match(html, /Antwort zeigen/);
  assert.match(html, /Show answer/);
  assert.match(html, /Noch nicht gewusst/);
  assert.match(html, /Not yet/);
  assert.match(html, /Gewusst/);
  assert.match(html, /Got it/);
  assert.match(html, /Stapel/);
  assert.match(html, /Open next batch/);
  assert.match(html, /ArrowLeft/);
  assert.match(html, /ArrowRight/);
  assert.match(html, /Space/);
  assert.doesNotMatch(html, /(?:Nochmal|Again|Schwer|Hard|Einfach|Easy)/);
  assert.match(html, /setTimeout/, "loading and writes must have finite timeouts");
  assert.match(html, /Im Cockpit (?:öffnen|\\xF6ffnen)/);
  assert.match(html, /Open cockpit/);
  assert.match(html, /clientRequestId/);
  assert.match(html, /expectedStateVersion/);
  assert.match(
    parserSource,
    /Never traverse structuredContent/,
    "the parser documents its private-metadata boundary; behavior is covered separately"
  );
  assert.doesNotMatch(
    source,
    /navigator\.userAgent|isMobile|deviceType/,
    "the widget contract must not branch on a guessed client surface"
  );
  assertInlineScriptParses(html, "memory-card-practice/widget.html");
  assert.doesNotMatch(html, /<script[^>]+src=/i);
  assert.doesNotMatch(html, /<link[^>]+rel=["']stylesheet/i);
  assert.doesNotMatch(
    html,
    /<(?:script|link|img|iframe|source)[^>]+(?:src|href)=["']https?:\/\//i,
    "widget must not hard-code external runtime assets"
  );
  assert.ok(
    Buffer.byteLength(html) < 800_000,
    "widget bundle including the self-contained KaTeX/MathML renderer must remain bounded"
  );
});
