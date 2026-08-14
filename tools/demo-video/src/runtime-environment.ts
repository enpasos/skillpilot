import type { DemoScenario } from "./types.js";

export type RuntimeEnvironment = Readonly<Record<string, string>>;

export function referencedEnvironmentNames(scenario: DemoScenario): string[] {
  const names = new Set<string>();
  if (scenario.browser.persistentProfilePathFromEnv) {
    names.add(scenario.browser.persistentProfilePathFromEnv);
  }
  for (const chapter of scenario.chapters) {
    for (const step of chapter.steps) {
      if (step.action === "fill" && step.valueFromEnv) names.add(step.valueFromEnv);
      if (step.action === "goto" && step.urlFromEnv) names.add(step.urlFromEnv);
    }
  }
  for (const clip of scenario.platformClips) {
    if (clip.pathFromEnv) names.add(clip.pathFromEnv);
    if (clip.expectedSha256FromEnv) names.add(clip.expectedSha256FromEnv);
    if (clip.sourceRevisionFromEnv) names.add(clip.sourceRevisionFromEnv);
    if (clip.privacyReviewedFromEnv) names.add(clip.privacyReviewedFromEnv);
  }
  return [...names].sort();
}

function sensitiveEnvironmentNames(scenario: DemoScenario): string[] {
  const names = new Set<string>();
  if (scenario.browser.persistentProfilePathFromEnv) {
    names.add(scenario.browser.persistentProfilePathFromEnv);
  }
  for (const chapter of scenario.chapters) {
    for (const step of chapter.steps) {
      if (step.action === "fill" && step.valueFromEnv) names.add(step.valueFromEnv);
      if (step.action === "goto" && step.urlFromEnv) names.add(step.urlFromEnv);
    }
  }
  for (const clip of scenario.platformClips) {
    if (clip.pathFromEnv) names.add(clip.pathFromEnv);
  }
  return [...names].sort();
}

/**
 * Copy scenario-bound values into an in-memory map and remove them from the
 * process environment. Consumers pass this map explicitly; child processes
 * never need these capabilities or reviewed native-clip paths.
 */
export function takeScenarioEnvironment(
  scenario: DemoScenario,
  source: NodeJS.ProcessEnv = process.env,
): Record<string, string> {
  const captured: Record<string, string> = {};
  for (const name of referencedEnvironmentNames(scenario)) {
    const value = source[name];
    if (value !== undefined) captured[name] = value;
    delete source[name];
  }
  return captured;
}

export function runtimeEnvironmentValue(
  environment: RuntimeEnvironment | undefined,
  name: string,
): string | undefined {
  return environment?.[name] ?? process.env[name];
}

export function runtimeEnvironmentSecrets(
  scenario: DemoScenario,
  environment?: RuntimeEnvironment,
): string[] {
  return sensitiveEnvironmentNames(scenario)
    .map((name) => runtimeEnvironmentValue(environment, name))
    .filter((value): value is string => Boolean(value));
}
