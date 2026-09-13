import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";
import { chromium } from "playwright";
import YAML from "yaml";

test("learner Quickstart starts with Pro and Marketplace, with visual-only disclosure and natural Gemini speech", async () => {
  const scenario = YAML.parse(await readFile(resolve("scenarios/skillpilot-claude-quickstart.de.yaml"), "utf8"));
  assert.match(scenario.chapters[0].scriptedNarration, /aktivem Pro-Abo/u);
  assert.deepEqual(scenario.chapters.slice(1, 5).map((chapter: { id: string }) => chapter.id), ["marketplace", "repository", "plugin-install", "plugin-connect"]);
  assert.equal(scenario.narration.disclosureMode, "visual-only");
  assert.equal(scenario.narration.visualDisclosure, "KI-generierte Sprecherstimme");
  assert.match(scenario.narration.ttsModel, /^gemini-/u);
  const text = scenario.chapters.map((chapter: { scriptedNarration: string }) => chapter.scriptedNarration).join(" ");
  assert.doesNotMatch(text, /KI-generiert|Plugin hochladen|Lade die Datei unverändert hoch/u);
  assert.doesNotMatch(text, /(?:musst|brauchst).{0,55}(?:nicht|kein)|(?:nicht|kein).{0,55}(?:musst|brauchst)|nicht nötig|keine MCP-Adresse|kein GitHub-Konnektor/iu);
  assert.match(text, /Automatisch synchronisieren eingeschaltet/u);
  assert.ok(text.split(/\s+/u).length < 600, "Keep the script short instead of speeding up narration");
});

test("Claude screenshot instruction cards fit one frame and use the supplied source without showing the account strip", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const screenshotAvailable = await access(resolve("assets/quickstart/claude-marketplace.png")).then(() => true, () => false);
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    for (const card of ["intro", "marketplace", "repository", "install", "connect", "start", "mobile", "finish"]) {
      await page.goto(`${pathToFileURL(resolve("assets/quickstart/cards.html")).href}#${card}`);
      const active = page.locator(".screen.active");
      assert.equal(await active.getAttribute("data-card"), card);
      const bounds = await active.boundingBox();
      assert.ok(bounds && bounds.y >= 0 && bounds.y + bounds.height < 678, `${card} must not overlap the footer`);
      for (const image of await active.locator(".screenshot-crop img").all()) {
        // The real screenshot is a private operator input, not a public Git asset.
        // CI still verifies all authored layout/crop bounds without that input.
        if (screenshotAvailable) assert.ok(await image.evaluate((element) => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth === 2457));
        // The supplied montage's name/account strip is in its top 160px.
        // CSS viewports show only the lower settings/menu/dialog sections.
        assert.ok(await image.evaluate(element => parseFloat(getComputedStyle(element).top) < -160));
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
  } finally { await browser.close(); }
});
