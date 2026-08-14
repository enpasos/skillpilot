import { readFile } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import YAML from "yaml";
import { validateForbiddenPatterns } from "./privacy.js";
import { scenarioSchema } from "./schema.js";
import type { DemoScenario, DemoStep, LocatorSpec } from "./types.js";

const variablePattern = /\$\{([a-zA-Z][a-zA-Z0-9_]*)\}/g;

export function interpolateVariables(value: string, variables: Record<string, string>): string {
  return value.replace(variablePattern, (_match, name: string) => {
    const replacement = variables[name];
    if (replacement === undefined) {
      throw new Error(`Unknown scenario variable: ${name}`);
    }
    return replacement;
  });
}

function resolveMaybeRelative(baseDir: string, path: string): string {
  return isAbsolute(path) ? path : resolve(baseDir, path);
}

export async function loadScenario(path: string): Promise<DemoScenario> {
  const scenarioPath = resolve(path);
  const source = await readFile(scenarioPath, "utf8");
  const parsedYaml: unknown = YAML.parse(source);
  const parsed = scenarioSchema.parse(parsedYaml) as DemoScenario;
  const baseDir = dirname(scenarioPath);
  const variables = parsed.variables;
  validateForbiddenPatterns(parsed.privacy.forbiddenPatterns);

  const chapters = parsed.chapters.map((chapter) => ({
    ...chapter,
    steps: chapter.steps.map((step) => resolveStep(step, variables, baseDir, parsed.browser.baseUrl)),
  }));

  return {
    ...parsed,
    outputDir: resolveMaybeRelative(baseDir, interpolateVariables(parsed.outputDir, variables)),
    cacheDir: resolveMaybeRelative(baseDir, interpolateVariables(parsed.cacheDir, variables)),
    browser: {
      ...parsed.browser,
      ...(parsed.browser.baseUrl ? { baseUrl: interpolateVariables(parsed.browser.baseUrl, variables) } : {}),
      ...(parsed.browser.storageState
        ? { storageState: resolveMaybeRelative(baseDir, interpolateVariables(parsed.browser.storageState, variables)) }
        : {}),
    },
    privacy: {
      ...parsed.privacy,
      maskSelectors: parsed.privacy.maskSelectors.map((selector) => interpolateVariables(selector, variables)),
      maskTextSelectors: parsed.privacy.maskTextSelectors.map((selector) => interpolateVariables(selector, variables)),
      evidenceSelectors: parsed.privacy.evidenceSelectors.map((selector) => interpolateVariables(selector, variables)),
    },
    chapters,
  };
}

function resolveStep(
  step: DemoStep,
  variables: Record<string, string>,
  baseDir: string,
  baseUrl?: string,
): DemoStep {
  const resolvedFrame = step.frame ? interpolateVariables(step.frame, variables) : undefined;
  const withFrame = <T extends DemoStep>(resolved: T): T => ({
    ...resolved,
    ...(resolvedFrame ? { frame: resolvedFrame } : {}),
  });
  if (step.action === "goto") {
    if (step.urlFromEnv) return withFrame({ ...step, urlFromEnv: step.urlFromEnv });
    if (!step.url) throw new Error(`Goto step ${step.id} has no URL`);
    const url = interpolateVariables(step.url, variables);
    return withFrame({
      ...step,
      url: !baseUrl && !/^[a-z][a-z0-9+.-]*:/i.test(url)
        ? pathToFileURL(resolve(baseDir, url)).toString()
        : url,
    });
  }
  if (step.action === "follow") {
    return withFrame({ ...step, target: resolveLocatorVariables(step.target, variables) });
  }
  if (step.action === "fill" && step.value !== undefined) {
    return withFrame({
      ...step,
      target: resolveLocatorVariables(step.target, variables),
      value: interpolateVariables(step.value, variables),
    });
  }
  if (step.action === "select") {
    return withFrame({
      ...step,
      target: resolveLocatorVariables(step.target, variables),
      value: interpolateVariables(step.value, variables),
    });
  }
  if ("target" in step && step.target) {
    return withFrame({ ...step, target: resolveLocatorVariables(step.target, variables) } as DemoStep);
  }
  if ((step.action === "mask" || step.action === "unmask")) {
    return withFrame({ ...step, selector: interpolateVariables(step.selector, variables) });
  }
  return withFrame(step);
}

function resolveLocatorVariables(spec: LocatorSpec, variables: Record<string, string>): LocatorSpec {
  return Object.fromEntries(Object.entries(spec).map(([key, value]) => [
    key,
    typeof value === "string" ? interpolateVariables(value, variables) : value,
  ])) as LocatorSpec;
}

export function redactedScenario(scenario: DemoScenario): unknown {
  const sanitized = {
    ...scenario,
    outputDir: "[PRIVATE_OUTPUT_DIRECTORY]",
    cacheDir: "[PRIVATE_CACHE_DIRECTORY]",
    variables: Object.fromEntries(
      Object.keys(scenario.variables).map((name) => [name, "[CONFIGURED_VARIABLE]"]),
    ),
    browser: {
      ...scenario.browser,
      ...(scenario.browser.baseUrl ? { baseUrl: "[CONFIGURED_URL]" } : {}),
      ...(scenario.browser.storageState ? { storageState: "[PROTECTED_STORAGE_STATE_PATH]" } : {}),
    },
    chapters: scenario.chapters.map((chapter) => ({
      ...chapter,
      steps: chapter.steps.map((step) => {
        if (step.action === "fill" && step.valueFromEnv) {
          return { ...step, valueFromEnv: `[ENV:${step.valueFromEnv}]`, secret: true };
        }
        if (step.action === "fill" && step.secret) {
          return { ...step, value: "[REDACTED]", secret: true };
        }
        if (step.action === "goto" && step.urlFromEnv) {
          return { ...step, urlFromEnv: `[ENV:${step.urlFromEnv}]` };
        }
        if (step.action === "goto" && step.url) {
          return { ...step, url: "[CONFIGURED_URL]" };
        }
        return step;
      }),
    })),
  };
  const patterns = validateForbiddenPatterns(scenario.privacy.forbiddenPatterns);
  const redacted = redactStringValues(sanitized, patterns) as DemoScenario;
  // The patterns are policy, not captured data. Redacting a regex with itself
  // corrupts the manifest and can make later privacy checks ineffective.
  redacted.privacy.forbiddenPatterns = [...scenario.privacy.forbiddenPatterns];
  return redacted;
}

function redactStringValues(value: unknown, patterns: RegExp[]): unknown {
  if (typeof value === "string") {
    return patterns.reduce((current, pattern) => current.replace(pattern, "[REDACTED]"), value);
  }
  if (Array.isArray(value)) return value.map((entry) => redactStringValues(entry, patterns));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      redactStringValues(entry, patterns),
    ]));
  }
  return value;
}
