import { launchScenarioBrowserSession } from "./browser-session.js";
import type { RuntimeEnvironment } from "./runtime-environment.js";
import type { DemoScenario } from "./types.js";

export interface ChatGptReviewBrowserPreflightResult {
  origin: "https://chatgpt.com";
  composerVisible: true;
}

/**
 * Confirms the exact authenticated browser surface used by the recording
 * before production fixture creation. It sends no message and invokes no tool.
 */
export async function validateChatGptReviewBrowser(
  scenario: DemoScenario,
  environment?: RuntimeEnvironment,
): Promise<ChatGptReviewBrowserPreflightResult> {
  if (scenario.browser.storageState
      || !scenario.browser.persistentProfilePathFromEnv
      || !scenario.browser.persistentProfileRequiresSnapshot) {
    throw new Error("ChatGPT review browser preflight requires a run-owned persistent-profile snapshot");
  }
  const configuredUrl = scenario.variables.chatgptUrl;
  const composerSelector = scenario.variables.chatgptComposerSelector;
  if (configuredUrl !== "https://chatgpt.com/" || !composerSelector) {
    throw new Error("ChatGPT review browser preflight requires the reviewed URL and composer selector");
  }
  const session = await launchScenarioBrowserSession(scenario, environment);
  try {
    const page = session.page;
    page.setDefaultTimeout(scenario.browser.defaultTimeoutMs);
    await page.goto(configuredUrl, { waitUntil: "domcontentloaded" });
    if (new URL(page.url()).origin !== "https://chatgpt.com") {
      throw new Error("ChatGPT review browser did not remain on the trusted provider origin");
    }
    const composer = page.locator(composerSelector).first();
    await composer.waitFor({ state: "visible" });
    return {
      origin: "https://chatgpt.com",
      composerVisible: true,
    };
  } catch (cause) {
    throw new Error(
      "ChatGPT Developer Mode state is not ready: the authenticated new-chat composer must be visible",
      { cause },
    );
  } finally {
    await session.close();
  }
}
