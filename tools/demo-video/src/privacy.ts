import type { Locator, Page } from "playwright";
import type { DemoScenario, MaskRegion, PrivacyConfig, StepEvidence } from "./types.js";

const redactorApiName = "__DEMO_VIDEO_REDACTOR__";

interface RedactorApi {
  add(selector: string): void;
  remove(selector: string): void;
}

export function validateForbiddenPatterns(patterns: string[]): RegExp[] {
  return patterns.map((pattern) => {
    try {
      return new RegExp(pattern, "gu");
    } catch (error) {
      throw new Error(`Invalid privacy.forbiddenPatterns entry ${JSON.stringify(pattern)}: ${String(error)}`);
    }
  });
}

export function redactForbiddenText(text: string, patterns: RegExp[]): string {
  return patterns.reduce((redacted, pattern) => redacted.replace(pattern, "[REDACTED]"), text);
}

export function configuredEnvironmentSecrets(scenario: DemoScenario): string[] {
  const environmentNames = new Set<string>();
  for (const chapter of scenario.chapters) {
    for (const step of chapter.steps) {
      if (step.action === "fill" && step.valueFromEnv) environmentNames.add(step.valueFromEnv);
      if (step.action === "goto" && step.urlFromEnv) environmentNames.add(step.urlFromEnv);
    }
  }
  return [...environmentNames]
    .map((name) => process.env[name])
    .filter((value): value is string => Boolean(value));
}

export function redactSensitiveText(
  text: string,
  config: PrivacyConfig,
  exactValues: readonly string[] = [],
): string {
  const exactRedacted = exactValues.reduce(
    (current, value) => value ? current.split(value).join("[REDACTED]") : current,
    text,
  );
  return redactForbiddenText(exactRedacted, validateForbiddenPatterns(config.forbiddenPatterns));
}

export function assertTextIsPrivate(
  text: string,
  config: PrivacyConfig,
  exactValues: readonly string[] = [],
  label = "artifact",
): void {
  const exactMatch = exactValues.some((value) => value && text.includes(value));
  const patternMatches = findForbiddenText(text, validateForbiddenPatterns(config.forbiddenPatterns));
  if (exactMatch || patternMatches.length > 0) {
    throw new Error(`Privacy check failed for ${label}: sensitive content detected`);
  }
}

export function findForbiddenText(text: string, patterns: RegExp[]): string[] {
  const matches = new Set<string>();
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      if (match[0]) {
        matches.add(match[0]);
      }
    }
  }
  return [...matches];
}

export function createRedactorScript(
  selectors: string[],
  textSelectors: string[],
  forbiddenPatterns: string[],
  color: string,
  label: string,
): string {
  return `(() => {
    const apiName = ${JSON.stringify(redactorApiName)};
    if (globalThis[apiName]) return;
    const selectors = new Set(${JSON.stringify(selectors)});
    const textSelectors = ${JSON.stringify(textSelectors)};
    const forbiddenPatterns = ${JSON.stringify(forbiddenPatterns)}.map((source) => new RegExp(source, 'u'));
    const overlays = new Map();
    const style = document.createElement('style');
    style.dataset.demoVideoRedactor = 'true';
    const refreshStyle = () => {
      style.textContent = [...selectors].map((selector) => {
        try { document.querySelector(selector); } catch { return ''; }
        return selector + ', ' + selector + ' * { color: transparent !important; text-shadow: none !important; caret-color: transparent !important; }';
      }).join('\\n');
    };
    const mountStyle = () => {
      if (!style.isConnected && document.documentElement) {
        refreshStyle();
        document.documentElement.appendChild(style);
      }
    };
    const update = () => {
      mountStyle();
      const seen = new Set();
      for (const selector of selectors) {
        let elements = [];
        try { elements = [...document.querySelectorAll(selector)]; } catch { continue; }
        for (const element of elements) {
          if (!(element instanceof HTMLElement) && !(element instanceof SVGElement)) continue;
          seen.add(element);
          let overlay = overlays.get(element);
          if (!overlay) {
            overlay = document.createElement('div');
            overlay.dataset.demoVideoOverlay = 'true';
            Object.assign(overlay.style, {
              position: 'fixed', zIndex: '2147483647', pointerEvents: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', boxSizing: 'border-box', borderRadius: '3px',
              background: ${JSON.stringify(color)}, color: '#fff', font: '600 11px/1 sans-serif',
              letterSpacing: '0.08em'
            });
            overlay.textContent = ${JSON.stringify(label)};
            document.documentElement.appendChild(overlay);
            overlays.set(element, overlay);
          }
          if (selector.includes('data-demo-video-secret')) overlay.dataset.demoVideoSecretMask = 'true';
          overlay.dataset.demoVideoMaskSelector = selector;
          if (!selector.includes('data-demo-video-secret')) overlay.dataset.demoVideoConfiguredMask = 'true';
          const rect = element.getBoundingClientRect();
          Object.assign(overlay.style, {
            left: rect.left + 'px', top: rect.top + 'px', width: rect.width + 'px', height: rect.height + 'px',
            display: rect.width > 0 && rect.height > 0 ? 'flex' : 'none'
          });
        }
      }
      for (const selector of textSelectors) {
        let elements = [];
        try { elements = [...document.querySelectorAll(selector)]; } catch { continue; }
        for (const element of elements) {
          if (!(element instanceof HTMLElement) && !(element instanceof SVGElement)) continue;
          const text = element.textContent || '';
          if (!forbiddenPatterns.some((pattern) => {
            pattern.lastIndex = 0;
            return pattern.test(text);
          })) continue;
          seen.add(element);
          let overlay = overlays.get(element);
          if (!overlay) {
            overlay = document.createElement('div');
            overlay.dataset.demoVideoOverlay = 'true';
            Object.assign(overlay.style, {
              position: 'fixed', zIndex: '2147483647', pointerEvents: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', boxSizing: 'border-box', borderRadius: '3px',
              background: ${JSON.stringify(color)}, color: '#fff', font: '600 11px/1 sans-serif',
              letterSpacing: '0.08em'
            });
            overlay.textContent = ${JSON.stringify(label)};
            document.documentElement.appendChild(overlay);
            overlays.set(element, overlay);
          }
          overlay.dataset.demoVideoMaskSelector = selector;
          overlay.dataset.demoVideoSecretMask = 'true';
          overlay.dataset.demoVideoConfiguredMask = 'true';
          const rect = element.getBoundingClientRect();
          Object.assign(overlay.style, {
            left: rect.left + 'px', top: rect.top + 'px', width: rect.width + 'px', height: rect.height + 'px',
            display: rect.width > 0 && rect.height > 0 ? 'flex' : 'none'
          });
        }
      }
      for (const [element, overlay] of overlays) {
        if (!seen.has(element) || !element.isConnected) {
          overlay.remove();
          overlays.delete(element);
        }
      }
    };
    globalThis[apiName] = {
      add(selector) { selectors.add(selector); refreshStyle(); update(); },
      remove(selector) { selectors.delete(selector); refreshStyle(); update(); }
    };
    mountStyle();
    // Attribute mutations include our own overlay positioning and would create
    // a self-sustaining MutationObserver loop. Child changes are sufficient;
    // scrolling, layout motion, and attribute-only visibility changes are
    // covered by the fixed 33 ms refresh below.
    new MutationObserver(update).observe(document, { subtree: true, childList: true });
    addEventListener('scroll', update, true);
    addEventListener('resize', update);
    setInterval(update, 33);
    update();
  })();`;
}

export async function collectVisibleMaskRegions(page: Page): Promise<MaskRegion[]> {
  const regions: MaskRegion[] = [];
  for (const frame of page.frames()) {
    const overlays = frame.locator("[data-demo-video-overlay='true']");
    for (let index = 0; index < await overlays.count(); index += 1) {
      const overlay = overlays.nth(index);
      const box = await overlay.boundingBox();
      if (!box || box.width <= 0 || box.height <= 0) continue;
      regions.push({
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        secret: await overlay.getAttribute("data-demo-video-secret-mask") === "true",
        configured: await overlay.getAttribute("data-demo-video-configured-mask") === "true",
      });
    }
  }
  return regions;
}

export async function installRedactor(page: Page, config: PrivacyConfig): Promise<void> {
  const script = createRedactorScript(
    config.maskSelectors,
    config.maskTextSelectors,
    config.forbiddenPatterns,
    config.maskColor,
    config.maskLabel,
  );
  await page.addInitScript({ content: script });
  await page.evaluate(script).catch(() => undefined);
}

export async function addMaskSelector(page: Page, selector: string): Promise<void> {
  await page.evaluate(
    ({ apiName, selectorValue }) => {
      const api = (globalThis as unknown as Record<string, RedactorApi | undefined>)[apiName];
      if (!api) throw new Error("Demo-video redactor is not installed");
      api.add(selectorValue);
    },
    { apiName: redactorApiName, selectorValue: selector },
  );
}

export async function removeMaskSelector(page: Page, selector: string): Promise<void> {
  await page.evaluate(
    ({ apiName, selectorValue }) => {
      const api = (globalThis as unknown as Record<string, RedactorApi | undefined>)[apiName];
      if (!api) throw new Error("Demo-video redactor is not installed");
      api.remove(selectorValue);
    },
    { apiName: redactorApiName, selectorValue: selector },
  );
}

export async function maskLocator(locator: Locator, token: string): Promise<void> {
  await locator.evaluate(
    (element, { apiName, maskToken }) => {
      element.setAttribute("data-demo-video-secret", maskToken);
      const api = (globalThis as unknown as Record<string, RedactorApi | undefined>)[apiName];
      if (!api) throw new Error("Demo-video redactor is not installed in the target frame");
      api.add(`[data-demo-video-secret=${JSON.stringify(maskToken)}]`);
    },
    { apiName: redactorApiName, maskToken: token },
  );
}

export async function pulseClick(page: Page, x: number, y: number, durationMs = 650): Promise<void> {
  await page.evaluate(
    ({ clickX, clickY, duration }) => {
      const pulse = document.createElement("div");
      pulse.dataset.demoVideoClick = "true";
      Object.assign(pulse.style, {
        position: "fixed",
        left: `${clickX - 22}px`,
        top: `${clickY - 22}px`,
        width: "44px",
        height: "44px",
        border: "4px solid #f59e0b",
        borderRadius: "999px",
        boxShadow: "0 0 0 7px rgba(245,158,11,0.24)",
        zIndex: "2147483646",
        pointerEvents: "none",
      });
      document.documentElement.appendChild(pulse);
      setTimeout(() => pulse.remove(), duration);
    },
    { clickX: x, clickY: y, duration: durationMs },
  );
}

export async function collectEvidence(
  page: Page,
  config: PrivacyConfig,
  exactValues: readonly string[] = [],
): Promise<StepEvidence[]> {
  const patterns = validateForbiddenPatterns(config.forbiddenPatterns);
  const evidence: StepEvidence[] = [];
  for (const selector of config.evidenceSelectors) {
    const texts = await page.locator(selector).allTextContents().catch(() => []);
    const joined = texts.map((text) => text.replace(/\s+/g, " ").trim()).filter(Boolean).join("\n").slice(0, 8_000);
    if (!joined) continue;
    const exactMatch = exactValues.some((value) => value && joined.includes(value));
    const forbidden = findForbiddenText(joined, patterns);
    if ((exactMatch || forbidden.length > 0) && config.failOnForbiddenText) {
      throw new Error(`Privacy check failed for evidence selector ${selector}: sensitive content detected`);
    }
    evidence.push({ selector, text: redactSensitiveText(joined, config, exactValues) });
  }
  return evidence;
}
