#!/usr/bin/env node
import { resolve } from "node:path";
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
import { verifyPublishedRecording } from "./recording-verifier.js";

const commands = new Set(["validate", "doctor", "record", "verify-recording", "narrate", "tts", "render", "build", "help"]);

interface Arguments {
  command: string;
  scenarioPath?: string;
  force: boolean;
  reuseRecording: boolean;
  refreshAi: boolean;
}

function usage(): string {
  return `browser-demo-video

Usage:
  demo-video <validate|doctor|record|verify-recording|narrate|tts|render|build> --scenario <file.yaml> [options]

Options:
  --force       Regenerate the recording, narration, and TTS (no cache reuse)
  --reuse-recording  Explicitly reuse a complete, hash-verified browser recording
  --refresh-ai  Regenerate narration and TTS instead of reusing content-addressed output
  --help        Show this help

Environment:
  OPENAI_API_KEY is required for AI narration and TTS.
  Protected fill and goto steps may reference environment variables with
  valueFromEnv and urlFromEnv.

One-command build:
  demo-video build --scenario scenarios/example.yaml
`;
}

function parseArguments(argv: string[]): Arguments {
  const command = argv[0] ?? "help";
  if (!commands.has(command)) throw new Error(`Unknown command: ${command}`);
  let scenarioPath: string | undefined;
  let force = false;
  let reuseRecording = false;
  let refreshAi = false;
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
    } else if (argument === "--help" || argument === "-h") {
      return { command: "help", force: false, reuseRecording: false, refreshAi: false };
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return { command, ...(scenarioPath ? { scenarioPath } : {}), force, reuseRecording, refreshAi };
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
  const scenario = await loadScenario(args.scenarioPath);
  const pipelineOptions = {
    scenario,
    scenarioPath: args.scenarioPath,
    force: args.force,
    reuseRecording: args.reuseRecording,
    refreshAi: args.refreshAi || args.force,
  };

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
    const result = await verifyPublishedRecording(scenario);
    process.stdout.write(`CHECK recording_privacy PASS screenshots=${result.screenshots} mask_pixels=${result.matchingMaskPixels}\n`);
    return;
  }

  if (args.command === "build") {
    const artifacts = await buildPipeline(pipelineOptions);
    process.stdout.write(`CHECK demo_video PASS ${artifacts.outputVideoPath}\n`);
    process.stdout.write(`CHECK demo_manifest PASS ${artifacts.manifestPath}\n`);
    return;
  }

  const recorded = await recordStage(pipelineOptions);
  if (args.command === "record") {
    process.stdout.write(`CHECK recording PASS ${recorded.recording.videoPath}\n`);
    return;
  }
  const narrated = await narrationStage(pipelineOptions, recorded);
  if (args.command === "narrate") {
    process.stdout.write(`CHECK narration PASS ${narrated.narrationPath}\n`);
    return;
  }
  const speech = await speechStage(pipelineOptions, narrated.narration, recorded.recording);
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
    pipelineOptions,
    recorded,
    speech.narration,
    speech.scheduled,
    speech.videoHolds,
  );
  process.stdout.write(`CHECK demo_video PASS ${rendered.outputVideoPath}\n`);
  process.stdout.write(`CHECK subtitles PASS ${rendered.subtitlesPath}\n`);
}

main().catch((error) => {
  process.stderr.write(`demo-video: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
