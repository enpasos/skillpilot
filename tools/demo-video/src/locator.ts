import type { FrameLocator, Locator, Page } from "playwright";
import type { LocatorSpec } from "./types.js";

export function resolveLocator(page: Page, spec: LocatorSpec, frameSelector?: string): Locator {
  const root: Page | FrameLocator = frameSelector ? page.frameLocator(frameSelector) : page;
  let locator: Locator;
  if ("css" in spec) {
    locator = root.locator(spec.css);
  } else if ("testId" in spec) {
    locator = root.getByTestId(spec.testId);
  } else if ("label" in spec) {
    locator = root.getByLabel(spec.label, { exact: spec.exact ?? true });
  } else if ("text" in spec) {
    locator = root.getByText(spec.text, { exact: spec.exact ?? true });
  } else if ("placeholder" in spec) {
    locator = root.getByPlaceholder(spec.placeholder, { exact: spec.exact ?? true });
  } else {
    type PlaywrightRole = Parameters<Page["getByRole"]>[0];
    locator = root.getByRole(spec.role as PlaywrightRole, {
      ...(spec.name ? { name: spec.name } : {}),
      exact: spec.exact ?? true,
    });
  }
  if (spec.match === "first") return locator.first();
  if (spec.match === "last") return locator.last();
  return locator;
}
