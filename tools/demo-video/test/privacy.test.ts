import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertTextIsPrivate,
  createRedactorScript,
  findForbiddenText,
  installRedactor,
  maskLocator,
  redactForbiddenText,
  redactSensitiveText,
  validateForbiddenPatterns,
} from "../src/privacy.js";
import { chromium, type Locator } from "playwright";

test("redacts every configured sensitive pattern without exposing it in output", () => {
  const patterns = validateForbiddenPatterns([
    "sps_[A-Za-z0-9_-]{43}",
    "Bearer\\s+[A-Za-z0-9._-]+",
  ]);
  const session = `sps_${"A".repeat(43)}`;
  const input = `Continue ${session} with Bearer secret.token`;
  const redacted = redactForbiddenText(input, patterns);
  assert.equal(findForbiddenText(input, patterns).length, 2);
  assert.equal(findForbiddenText(redacted, patterns).length, 0);
  assert.equal(redacted, "Continue [REDACTED] with [REDACTED]");
});

test("fails early for an invalid privacy regular expression", () => {
  assert.throws(() => validateForbiddenPatterns(["["]), /Invalid privacy\.forbiddenPatterns/);
});

test("redacts exact runtime secrets and fails closed before artifact publication", () => {
  const config = {
    maskSelectors: [], requiredMaskSelectors: [], maskTextSelectors: [], maskLabel: "REDACTED", maskColor: "#111111",
    forbiddenPatterns: ["sps_[A-Za-z0-9_-]+"], evidenceSelectors: [], failOnForbiddenText: true,
  };
  assert.equal(redactSensitiveText("URL=private-url", config, ["private-url"]), "URL=[REDACTED]");
  assert.throws(() => assertTextIsPrivate("sps_secret", config, [], "narration"), /narration/);
});

test("maskLocator installs the persistent selector in the locator owning frame", async () => {
  const installed: string[] = [];
  const attributes = new Map<string, string>();
  const locator = {
    evaluate: async (callback: Function, argument: unknown) => {
      const apiName = "__DEMO_VIDEO_REDACTOR__";
      (globalThis as Record<string, unknown>)[apiName] = {
        add: (selector: string) => installed.push(selector),
        remove: () => undefined,
      };
      try {
        return callback({ setAttribute: (name: string, value: string) => attributes.set(name, value) }, argument);
      } finally {
        delete (globalThis as Record<string, unknown>)[apiName];
      }
    },
  } as unknown as Locator;

  await maskLocator(locator, "iframe-secret");
  assert.equal(attributes.get("data-demo-video-secret"), "iframe-secret");
  assert.deepEqual(installed, ['[data-demo-video-secret="iframe-secret"]']);
});

test("text-selective masks inspect candidate text against privacy patterns", () => {
  const script = createRedactorScript(
    [],
    ["[data-message-author-role='user']"],
    ["sps_[A-Za-z0-9_-]{43}"],
    "#111111",
    "REDACTED",
  );
  assert.match(script, /textContent/);
  assert.match(script, /forbiddenPatterns\.some/);
  assert.match(script, /data-message-author-role/);
});

test("native modal dialogs keep selector and text masks visibly above the browser top layer", async (t) => {
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
  await page.setContent(`<input id="outside" value="LOCAL_TEST_SECRET">
    <dialog id="modal" style="padding:40px;width:440px;background:white;">
      <label>Demo password <input id="secret" type="text" style="width:320px;height:40px"></label>
      <p id="context" style="height:40px">LOCAL_TEST_SECRET</p>
    </dialog>`);
  await installRedactor(page, {
    maskSelectors: ["#secret", "#outside"], requiredMaskSelectors: [], maskTextSelectors: ["#context"],
    maskLabel: "PRIVAT", maskColor: "#112233", forbiddenPatterns: ["LOCAL_TEST_SECRET"],
    evidenceSelectors: [], failOnForbiddenText: true,
  });
  await page.locator("#modal").evaluate((element) => (element as HTMLDialogElement).showModal());
  await maskLocator(page.locator("#secret"), "native-dialog-password");
  await page.locator("#secret").fill("LOCAL_TEST_SECRET");
  await page.waitForTimeout(100);
  const rects = await Promise.all(["#secret", "#context"].map(async (selector) => {
    const rect = await page.locator(selector).boundingBox();
    assert.ok(rect);
    return rect;
  }));
  const screenshot = await page.screenshot();
  const inspector = await browser.newPage();
  const ratios = await inspector.evaluate(async ({ data, boxes }) => {
    const image = new Image();
    image.src = data;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d")!;
    context.drawImage(image, 0, 0);
    return boxes.map((box) => {
      const pixels = context.getImageData(Math.ceil(box.x), Math.ceil(box.y), Math.floor(box.width), Math.floor(box.height)).data;
      let opaque = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] === 17 && pixels[i + 1] === 34 && pixels[i + 2] === 51) opaque += 1;
      }
      return opaque / (pixels.length / 4);
    });
  }, { data: `data:image/png;base64,${screenshot.toString("base64")}`, boxes: rects });
  for (const ratio of ratios) assert.ok(ratio > 0.8, `Expected opaque mask pixels above dialog, got ${ratio}`);
  assert.equal(await page.locator("#modal > [data-demo-video-overlay='true']").count(), 2);
  assert.equal(await page.locator("html > [data-demo-video-mask-selector='#outside']").count(), 1);
});
