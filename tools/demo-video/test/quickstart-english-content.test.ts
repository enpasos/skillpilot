import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";
import { chromium } from "playwright";
import YAML from "yaml";
import { loadScenario } from "../src/config.js";

test("English Quickstart has its own English narration, interface actions and curriculum", async () => {
  const path = resolve("scenarios/skillpilot-claude-quickstart.en.yaml");
  const scenario = await loadScenario(path);
  const german = YAML.parse(await readFile(resolve("scenarios/skillpilot-claude-quickstart.de.yaml"), "utf8"));
  assert.equal(scenario.browser.locale, "en-GB");
  assert.equal(scenario.privacy.maskLabel, "PRIVATE");
  assert.deepEqual(scenario.chapters.map(chapter => chapter.id), german.chapters.map((chapter: { id: string }) => chapter.id));
  const ids = scenario.chapters.map(chapter => chapter.id);
  const chatIndex = ids.indexOf("chat-start");
  assert.equal(ids[chatIndex - 1], "feedback");
  assert.equal(ids[chatIndex + 1], "session");
  const chat = scenario.chapters[chatIndex]!;
  assert.match(chat.scriptedNarration ?? "", /prepared start message.*send.*tool request.*first message/su);
  assert.equal(chat.steps[0]?.action, "goto");
  assert.ok(chat.steps[0]?.action === "goto" && chat.steps[0].url === "quickstart-card:chat-start");
  assert.match(scenario.chapters[0]?.scriptedNarration ?? "", /active Pro subscription/u);
  assert.equal(scenario.narration.disclosureMode, "visual-only");
  assert.equal(scenario.narration.visualDisclosure, "AI-generated voice");
  assert.match(scenario.narration.ttsModel, /^gemini-/u);
  assert.equal(scenario.narration.voice, "Sulafat");
  const text = scenario.chapters.map(chapter => chapter.scriptedNarration).join(" ");
  assert.doesNotMatch(text, /AI-generated|download.{0,30}plugin|(?:do not|don't|need not|no need|doesn't need|don't need)/iu);
  assert.ok(text.split(/\s+/u).length < 650, "Keep English narration concise and naturally paced");
  const steps = scenario.chapters.flatMap(chapter => chapter.steps);
  assert.ok(steps.some(step => step.action === "click" && "name" in step.target && step.target.name === "EN"));
  assert.ok(steps.some(step => step.action === "select" && step.value === "25df82ae-f6ab-518b-98f2-dc72bcdf2fcf"));
  const curriculum = scenario.chapters.find(chapter => chapter.id === "curriculum");
  assert.deepEqual(curriculum?.recordedFocus, {
    fromStepId: "curriculum-open", toStepId: "curriculum-read",
    x: 296, y: 258, width: 688, height: 302, leadMs: 300,
  });
  assert.ok(scenario.chapters.every(chapter => chapter.id === "curriculum" || !chapter.recordedFocus),
    "Only the actual curriculum selection uses the documented close-up");
  const visibleLanguage = JSON.stringify(scenario.chapters);
  assert.doesNotMatch(visibleLanguage, /Hessen|Mathematik|Sekundarstufe|Jahrgangsstufe|Weitere Kompetenzen|Akzeptieren|Jetzt lernen/u);
  const feedback = scenario.chapters.find(chapter => chapter.id === "feedback");
  assert.equal(feedback?.title, "Ask questions");
  assert.doesNotMatch(feedback?.scriptedNarration ?? "", /feedback button/u);
});

test("English instruction cards fit the video frame without embedding German screenshots", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    for (const card of ["intro", "marketplace", "repository", "install", "connect", "feedback", "chat-start", "start", "mobile", "finish"]) {
      await page.goto(`${pathToFileURL(resolve("assets/quickstart/cards.en.html")).href}#${card}`);
      assert.equal(await page.locator("html").getAttribute("lang"), "en");
      assert.equal(await page.locator("img").count(), 0);
      const active = page.locator(".screen.active");
      assert.equal(await active.getAttribute("data-card"), card);
      const bounds = await active.boundingBox();
      assert.ok(bounds && bounds.y >= 0 && bounds.y + bounds.height < 678, `${card} must not overlap the footer`);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert.doesNotMatch(await page.locator("body").innerText(), /Anleitung|hinzufügen|Konnektor|Lernen|keine|Deutsch/u);
      if (!["intro", "finish"].includes(card)) assert.equal(await page.locator("#kind").innerText(), "Illustrated guide");
    }
  } finally { await browser.close(); }
});

test("both chat-start fallbacks are readable guidance, not fabricated Claude interfaces", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    for (const [language, filename, notice] of [
      ["de", "cards.html", "Anleitung · keine Claude-Bildschirmaufnahme"],
      ["en", "cards.en.html", "Illustrated guide"],
    ]) {
      await page.goto(`${pathToFileURL(resolve("assets/quickstart", filename!)).href}#chat-start`);
      assert.equal(await page.locator("html").getAttribute("lang"), language);
      const active = page.locator('.screen.active[data-card="chat-start"]');
      const bounds = await active.boundingBox();
      assert.ok(bounds && bounds.y >= 0 && bounds.y + bounds.height < 678);
      assert.equal(await active.locator("img,video,iframe").count(), 0);
      assert.equal(await page.locator("#kind").innerText(), notice);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
  } finally { await browser.close(); }
});
