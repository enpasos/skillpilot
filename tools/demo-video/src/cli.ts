#!/usr/bin/env node
import { resolve } from "node:path";
import OpenAI from "openai";
import { loadScenario } from "./config.js";
import { runDoctor } from "./doctor.js";
import {
  buildPipeline,
  narrationStage,
  recordStage,
  renderStage,
  speechStage,
} from "./pipeline.js";
import { writePrivateFile } from "./private-fs.js";
import { loadReviewSecrets } from "./review-secrets.js";
import { verifyPublishedRecording } from "./recording-verifier.js";
import { referencedEnvironmentNames, takeScenarioEnvironment } from "./runtime-environment.js";
import {
  preflightSkillPilotReviewBuild,
  runSkillPilotReviewBuild,
} from "./skillpilot-review-build.js";

const commands = new Set(["validate", "doctor", "record", "verify-recording", "narrate", "tts", "render", "build", "review-preflight", "review-build", "help"]);

interface Arguments {
  command: string;
  scenarioPath?: string;
  force: boolean;
  reuseRecording: boolean;
  refreshAi: boolean;
  sourceRevision?: string;
  reviewSecretsPath?: string;
}

let cliSensitiveValues: string[] = [];

function usage(): string {
  return `browser-demo-video

Usage:
  demo-video <validate|doctor|record|verify-recording|narrate|tts|render|build|review-preflight|review-build> --scenario <file.yaml> [options]

Options:
  --force       Regenerate the recording, narration, and TTS (no cache reuse)
  --reuse-recording  Explicitly reuse a complete, hash-verified browser recording
  --refresh-ai  Regenerate narration and TTS instead of reusing content-addressed output
  --source-revision <sha>  Exact deployed 40-character Git SHA (required for review commands)
  --review-secrets <json>  Private 0600 review credentials and native evidence (review commands)
  --help        Show this help

Environment:
  OPENAI_API_KEY is required for AI narration and TTS.
  Protected fill and goto steps may reference environment variables with
  valueFromEnv and urlFromEnv.

One-command build:
  demo-video build --scenario scenarios/example.yaml

SkillPilot review build:
  demo-video review-build --scenario scenarios/skillpilot-openai-review.template.yaml \\
    --source-revision <deployed-git-sha> --review-secrets <private-review.json>
`;
}

function parseArguments(argv: string[]): Arguments {
  const command = argv[0] === "--help" || argv[0] === "-h"
    ? "help"
    : argv[0] ?? "help";
  if (!commands.has(command)) throw new Error(`Unknown command: ${command}`);
  let scenarioPath: string | undefined;
  let force = false;
  let reuseRecording = false;
  let refreshAi = false;
  let sourceRevision: string | undefined;
  let reviewSecretsPath: string | undefined;
  for (let index = 1; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--scenario") {
      const value = argv[index + 1];
      if (!value) throw new Error("--scenario needs a YAML file path");
      scenarioPath = resolve(value);
      index += 1;
    } else if (argument === "--force") {
      force = true;
    } else if (argument === "--reuse-recording") {
      reuseRecording = true;
    } else if (argument === "--refresh-ai") {
      refreshAi = true;
    } else if (argument === "--source-revision") {
      const value = argv[index + 1];
      if (!value) throw new Error("--source-revision needs an exact deployed Git SHA");
      sourceRevision = value;
      index += 1;
    } else if (argument === "--review-secrets") {
      const value = argv[index + 1];
      if (!value) throw new Error("--review-secrets needs a private JSON file path");
      reviewSecretsPath = resolve(value);
      index += 1;
    } else if (argument === "--help" || argument === "-h") {
      return { command: "help", force: false, reuseRecording: false, refreshAi: false };
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return {
    command,
    ...(scenarioPath ? { scenarioPath } : {}),
    force,
    reuseRecording,
    refreshAi,
    ...(sourceRevision ? { sourceRevision } : {}),
    ...(reviewSecretsPath ? { reviewSecretsPath } : {}),
  };
}

function reviewSourceRevision(value: string | undefined): string {
  if (!value || !/^[0-9a-f]{40}$/u.test(value)) {
    throw new Error("review commands require --source-revision with the exact lowercase 40-character deployed Git SHA");
  }
  return value;
}

async function main(): Promise<void> {
  const args = parseArguments(process.argv.slice(2));
  if (args.command === "help") {
    process.stdout.write(usage());
    return;
  }
  if (!args.scenarioPath) throw new Error("--scenario is required");
  if (args.force && args.reuseRecording) {
    throw new Error("--force and --reuse-recording cannot be combined");
  }
  const loadedScenario = await loadScenario(args.scenarioPath);
  const isReviewCommand = args.command === "review-build" || args.command === "review-preflight";
  const scenario = isReviewCommand
    ? { ...loadedScenario, sourceRevision: reviewSourceRevision(args.sourceRevision) }
    : loadedScenario;
  if (args.command === "validate") {
    process.stdout.write(`CHECK scenario PASS id=${scenario.id} chapters=${scenario.chapters.length}\n`);
    return;
  }
  if (args.command === "doctor") {
    const checks = await runDoctor(scenario);
    for (const check of checks) {
      process.stdout.write(`CHECK ${check.name} ${check.ok ? "PASS" : "FAIL"} ${check.detail}\n`);
    }
    if (checks.some((check) => !check.ok)) process.exitCode = 1;
    return;
  }
  if (args.command === "verify-recording") {
    const environment = takeScenarioEnvironment(scenario);
    const result = await verifyPublishedRecording(scenario, environment);
    process.stdout.write(`CHECK recording_privacy PASS screenshots=${result.screenshots} mask_pixels=${result.matchingMaskPixels}\n`);
    return;
  }

  if (isReviewCommand) {
    if (scenario.id !== "skillpilot-openai-review-v1") {
      throw new Error(`${args.command} accepts only the reviewed SkillPilot OpenAI v1 scenario`);
    }
    if (args.reuseRecording) {
      throw new Error(`${args.command} cannot use --reuse-recording`);
    }
    if (!args.reviewSecretsPath) {
      throw new Error(`${args.command} requires --review-secrets with a private 0600 JSON file`);
    }
    if (process.env.OPENAI_API_KEY !== undefined) {
      throw new Error(`${args.command} refuses OPENAI_API_KEY from the inherited environment; use --review-secrets`);
    }
    const inheritedScenarioInputs = referencedEnvironmentNames(scenario)
      .filter((name) => process.env[name] !== undefined);
    if (inheritedScenarioInputs.length > 0) {
      throw new Error(
        `${args.command} refuses protected scenario inputs from the inherited environment: ${inheritedScenarioInputs.join(", ")}`,
      );
    }
    cliSensitiveValues.push(args.reviewSecretsPath);
    const reviewSecrets = await loadReviewSecrets(args.reviewSecretsPath, scenario);
    cliSensitiveValues.push(...reviewSecrets.sensitiveValues);
    const openAiClient = new OpenAI({ apiKey: reviewSecrets.openAiApiKey });
    const reviewOptions = {
      scenario,
      scenarioPath: args.scenarioPath,
      force: true,
      reuseRecording: false,
      refreshAi: true,
      environment: reviewSecrets.environment,
      narrationClient: openAiClient,
      ttsClient: openAiClient,
    };
    if (args.command === "review-preflight") {
      const result = await preflightSkillPilotReviewBuild(reviewOptions);
      process.stdout.write(`CHECK review_preflight PASS doctor=${result.doctorChecks} browser_auth=${result.browserAuthentication} storage_cookies=${result.storageCookies} storage_origins=${result.storageOrigins} native_clips=${result.platformClips}\n`);
      return;
    }
    const result = await runSkillPilotReviewBuild(reviewOptions);
    process.stdout.write(`CHECK review_fixtures PASS created=${result.learnerCount} deleted=${result.learnerCount}\n`);
    process.stdout.write(`CHECK demo_video PASS ${result.artifacts.outputVideoPath}\n`);
    process.stdout.write(`CHECK demo_manifest PASS ${result.artifacts.manifestPath}\n`);
    return;
  }

  // Scenario-bound capabilities and reviewed native-file paths are copied into
  // an explicit in-memory map and removed from process.env before Chromium,
  // FFmpeg, or any other child process can be started.
  const environment = takeScenarioEnvironment(scenario);
  const pipelineOptions = {
    scenario,
    scenarioPath: args.scenarioPath,
    force: args.force,
    reuseRecording: args.reuseRecording,
    refreshAi: args.refreshAi || args.force,
    environment,
  };

  // Keep the API key in this process only. Chromium and FFmpeg receive a
  // minimal allowlisted environment, and the OpenAI clients retain the key in
  // memory after it is removed from process.env.
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey !== undefined) delete process.env.OPENAI_API_KEY;
  const openAiClient = apiKey ? new OpenAI({ apiKey }) : undefined;
  const executionOptions = {
    ...pipelineOptions,
    ...(openAiClient ? {
      narrationClient: openAiClient,
      ttsClient: openAiClient,
    } : {}),
  };

  if (args.command === "build") {
    const artifacts = await buildPipeline(executionOptions);
    process.stdout.write(`CHECK demo_video PASS ${artifacts.outputVideoPath}\n`);
    process.stdout.write(`CHECK demo_manifest PASS ${artifacts.manifestPath}\n`);
    return;
  }

  const recorded = await recordStage(executionOptions);
  if (args.command === "record") {
    process.stdout.write(`CHECK recording PASS ${recorded.recording.videoPath}\n`);
    return;
  }
  const narrated = await narrationStage(executionOptions, recorded);
  if (args.command === "narrate") {
    process.stdout.write(`CHECK narration PASS ${narrated.narrationPath}\n`);
    return;
  }
  const speech = await speechStage(executionOptions, narrated.narration, recorded.recording);
  await writePrivateFile(
    narrated.narrationPath,
    `${JSON.stringify({
      ...speech.narration,
      segments: speech.narration.segments.map((segment) => segment.audioPath
        ? { ...segment, audioPath: "[CONTENT_ADDRESSED_AUDIO_CACHE]" }
        : segment),
    }, null, 2)}\n`,
    { encoding: "utf8" },
  );
  if (args.command === "tts") {
    process.stdout.write(`CHECK tts PASS segments=${speech.scheduled.length}\n`);
    return;
  }
  const rendered = await renderStage(
    executionOptions,
    recorded,
    speech.narration,
    speech.scheduled,
    speech.videoHolds,
  );
  process.stdout.write(`CHECK demo_video PASS ${rendered.outputVideoPath}\n`);
  process.stdout.write(`CHECK subtitles PASS ${rendered.subtitlesPath}\n`);
}

main().catch((error) => {
  let message = error instanceof Error ? error.message : String(error);
  for (const sensitive of cliSensitiveValues.filter(Boolean).sort((a, b) => b.length - a.length)) {
    message = message.split(sensitive).join("[REDACTED]");
  }
  process.stderr.write(`demo-video: ${message}\n`);
  process.exitCode = 1;
});
