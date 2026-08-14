import { z } from "zod";
import { AI_VOICE_DISCLOSURE } from "./policy.js";

const nonEmpty = z.string().trim().min(1);

const locatorMatch = { match: z.enum(["first", "last"]).optional() };
const locatorSchema = z.union([
  z.object({ css: nonEmpty, ...locatorMatch }).strict(),
  z.object({ testId: nonEmpty, ...locatorMatch }).strict(),
  z.object({ label: nonEmpty, exact: z.boolean().optional(), ...locatorMatch }).strict(),
  z.object({ text: nonEmpty, exact: z.boolean().optional(), ...locatorMatch }).strict(),
  z.object({ placeholder: nonEmpty, exact: z.boolean().optional(), ...locatorMatch }).strict(),
  z.object({ role: nonEmpty, name: nonEmpty.optional(), exact: z.boolean().optional(), ...locatorMatch }).strict(),
]);

const stepBase = {
  id: nonEmpty,
  label: nonEmpty,
  frame: nonEmpty.optional(),
  capture: z.boolean().optional(),
  narrationHint: nonEmpty.optional(),
};

const stepSchema = z.discriminatedUnion("action", [
  z.object({ ...stepBase, action: z.literal("goto"), url: nonEmpty.optional(), urlFromEnv: nonEmpty.optional(), waitUntil: z.enum(["load", "domcontentloaded", "networkidle"]).optional() }).strict(),
  z.object({ ...stepBase, action: z.literal("follow"), target: locatorSchema, waitUntil: z.enum(["load", "domcontentloaded", "networkidle"]).optional() }).strict(),
  z.object({ ...stepBase, action: z.literal("click"), target: locatorSchema, button: z.enum(["left", "right", "middle"]).optional(), highlight: z.boolean().optional(), samePage: z.boolean().optional() }).strict(),
  z.object({ ...stepBase, action: z.literal("fill"), target: locatorSchema, value: z.string().optional(), valueFromEnv: nonEmpty.optional(), secret: z.boolean().optional() }).strict(),
  z.object({ ...stepBase, action: z.literal("press"), target: locatorSchema.optional(), key: nonEmpty }).strict(),
  z.object({ ...stepBase, action: z.literal("select"), target: locatorSchema, value: nonEmpty }).strict(),
  z.object({ ...stepBase, action: z.literal("check"), target: locatorSchema, checked: z.boolean().optional() }).strict(),
  z.object({ ...stepBase, action: z.literal("hover"), target: locatorSchema }).strict(),
  z.object({ ...stepBase, action: z.literal("waitFor"), target: locatorSchema, state: z.enum(["attached", "detached", "visible", "hidden"]).optional(), timeoutMs: z.number().int().positive().optional() }).strict(),
  z.object({ ...stepBase, action: z.literal("wait"), durationMs: z.number().int().nonnegative().max(120_000) }).strict(),
  z.object({ ...stepBase, action: z.literal("assert"), target: locatorSchema, state: z.enum(["attached", "visible", "hidden"]).optional(), text: z.string().optional(), textPattern: nonEmpty.optional(), timeoutMs: z.number().int().positive().optional() }).strict(),
  z.object({ ...stepBase, action: z.literal("screenshot"), name: nonEmpty.optional() }).strict(),
  z.object({ ...stepBase, action: z.literal("maskTarget"), target: locatorSchema }).strict(),
  z.object({ ...stepBase, action: z.literal("mask"), selector: nonEmpty }).strict(),
  z.object({ ...stepBase, action: z.literal("unmask"), selector: nonEmpty }).strict(),
]);

const chapterSchema = z.object({
  id: nonEmpty,
  title: nonEmpty,
  narrationHint: nonEmpty.optional(),
  scriptedNarration: nonEmpty.optional(),
  steps: z.array(stepSchema).min(1),
}).strict();

export const scenarioSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  title: nonEmpty,
  description: nonEmpty.optional(),
  sourceRevision: nonEmpty,
  platform: z.enum(["web", "mobile-web"]).default("web"),
  outputDir: nonEmpty.default("output"),
  cacheDir: nonEmpty.default(".cache"),
  variables: z.record(z.string(), z.string()).default({}),
  browser: z.object({
    baseUrl: nonEmpty.optional(),
    headless: z.boolean().default(true),
    viewport: z.object({ width: z.number().int().min(320), height: z.number().int().min(240) }).default({ width: 1440, height: 900 }),
    video: z.object({ width: z.number().int().min(320), height: z.number().int().min(240) }).default({ width: 1440, height: 900 }),
    locale: nonEmpty.default("en-US"),
    timezoneId: nonEmpty.default("UTC"),
    colorScheme: z.enum(["light", "dark", "no-preference"]).default("light"),
    reducedMotion: z.enum(["reduce", "no-preference"]).default("reduce"),
    storageState: nonEmpty.optional(),
    userAgent: nonEmpty.optional(),
    deviceScaleFactor: z.number().positive().max(4).default(1),
    defaultTimeoutMs: z.number().int().positive().default(15_000),
    postActionDelayMs: z.number().int().nonnegative().max(10_000).default(500),
    dialogPolicy: z.enum(["accept", "dismiss"]).default("dismiss"),
  }).strict().prefault({}),
  privacy: z.object({
    maskSelectors: z.array(nonEmpty).default([]),
    maskTextSelectors: z.array(nonEmpty).default([]),
    maskLabel: z.string().default("REDACTED"),
    maskColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#111111"),
    forbiddenPatterns: z.array(nonEmpty).default([]),
    evidenceSelectors: z.array(nonEmpty).default([]),
    failOnForbiddenText: z.boolean().default(true),
  }).strict().prefault({}),
  narration: z.object({
    mode: z.enum(["ai", "scripted"]).default("ai"),
    model: nonEmpty.default("gpt-5.6"),
    ttsModel: nonEmpty.default("gpt-4o-mini-tts"),
    voice: nonEmpty.default("cedar"),
    instructions: nonEmpty.default("Speak in clear, calm, professional English for a software review demonstration."),
    disclosure: z.literal(AI_VOICE_DISCLOSURE).default(AI_VOICE_DISCLOSURE),
    segmentGapMs: z.number().int().nonnegative().max(10_000).default(350),
    maxSegments: z.number().int().positive().max(100).default(30),
  }).strict().prefault({}),
  render: z.object({
    width: z.number().int().min(640).default(1920),
    height: z.number().int().min(360).default(1080),
    fps: z.number().int().min(15).max(60).default(30),
    crf: z.number().int().min(0).max(51).default(18),
    preset: nonEmpty.default("medium"),
    subtitleFontSize: z.number().int().min(16).max(72).default(34),
    subtitleBottomMargin: z.number().int().min(0).max(400).default(64),
    burnSubtitles: z.boolean().default(true),
    autoZoom: z.object({
      enabled: z.boolean().default(false),
      factor: z.number().min(1).max(2).default(1.14),
      durationMs: z.number().int().min(250).max(10_000).default(1_800),
    }).strict().prefault({}),
  }).strict().prefault({}),
  binaries: z.object({
    ffmpeg: nonEmpty.default("ffmpeg"),
    ffprobe: nonEmpty.default("ffprobe"),
  }).strict().prefault({}),
  chapters: z.array(chapterSchema).min(1),
}).strict().superRefine((scenario, context) => {
  const chapterIds = new Set<string>();
  const stepIds = new Set<string>();

  for (const chapter of scenario.chapters) {
    if (chapterIds.has(chapter.id)) {
      context.addIssue({ code: "custom", message: `Duplicate chapter id: ${chapter.id}`, path: ["chapters"] });
    }
    chapterIds.add(chapter.id);

    if (scenario.narration.mode === "scripted" && !chapter.scriptedNarration) {
      context.addIssue({ code: "custom", message: `Chapter ${chapter.id} needs scriptedNarration in scripted mode`, path: ["chapters"] });
    }

    for (const step of chapter.steps) {
      if (stepIds.has(step.id)) {
        context.addIssue({ code: "custom", message: `Duplicate step id: ${step.id}`, path: ["chapters"] });
      }
      stepIds.add(step.id);
      if (step.action === "fill" && Number(step.value !== undefined) + Number(step.valueFromEnv !== undefined) !== 1) {
        context.addIssue({ code: "custom", message: `Fill step ${step.id} needs exactly one of value or valueFromEnv`, path: ["chapters"] });
      }
      if (step.action === "goto" && Number(step.url !== undefined) + Number(step.urlFromEnv !== undefined) !== 1) {
        context.addIssue({ code: "custom", message: `Goto step ${step.id} needs exactly one of url or urlFromEnv`, path: ["chapters"] });
      }
      if (step.action === "fill" && step.valueFromEnv && step.secret === false) {
        context.addIssue({ code: "custom", message: `Environment-backed fill step ${step.id} cannot set secret=false`, path: ["chapters"] });
      }
      if (step.action === "fill" && step.secret === true && step.value !== undefined) {
        context.addIssue({
          code: "custom",
          message: `Secret fill step ${step.id} must use valueFromEnv instead of a literal value`,
          path: ["chapters"],
        });
      }
      if (step.action === "assert" && step.textPattern) {
        try {
          new RegExp(step.textPattern, "iu");
        } catch {
          context.addIssue({
            code: "custom",
            message: `Assert step ${step.id} has an invalid textPattern`,
            path: ["chapters"],
          });
        }
      }
    }
  }
});

export type RawScenario = z.input<typeof scenarioSchema>;
