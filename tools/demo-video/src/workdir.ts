import { join } from "node:path";

import { redactedScenario } from "./config.js";
import { sha256Text, stableJson } from "./hash.js";
import type { DemoScenario } from "./types.js";

export function scenarioWorkDir(scenario: DemoScenario): string {
  const digest = sha256Text(stableJson(redactedScenario(scenario))).slice(0, 12);
  return join(scenario.outputDir, `${scenario.id}-${digest}`);
}
