import { readFile } from "node:fs/promises";
import path from "node:path";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { AI_VOICE_DISCLOSURE } from "./policy.js";

export const DEFAULT_NARRATION_MODEL = "gpt-5.6";
export const DEFAULT_AI_VOICE_DISCLOSURE = AI_VOICE_DISCLOSURE;

export interface NarrationTimelineEvent {
  id: string;
  chapterId: string;
  atMs: number;
  endMs?: number;
  action: string;
  label?: string;
  outcome?: string;
  visibleText?: string;
  metadata?: Record<string, unknown>;
}

export interface NarrationEvidence {
  id: string;
  chapterId?: string;
  atMs?: number;
  summary?: string;
  imagePath?: string;
  imageDataUrl?: string;
  imageDetail?: "low" | "high" | "auto";
}

export interface NarrationChapterBrief {
  id: string;
  title: string;
  purpose?: string;
  narrationHint?: string;
}

export interface NarrationInput {
  title: string;
  objective: string;
  audience?: string;
  chapters?: NarrationChapterBrief[];
  timeline: NarrationTimelineEvent[];
  evidence?: NarrationEvidence[];
  constraints?: string[];
}

export interface NarrationSegment {
  id: string;
  chapterId: string;
  anchorEventId: string;
  anchorMs: number;
  title: string;
  narration: string;
  subtitle: string;
}

export interface NarrationPlan {
  summary: string;
  editorialNotes: string[];
  disclosure: string;
  segments: NarrationSegment[];
}

export type NarrationOpenAIClient = Pick<OpenAI, "responses">;

export interface GenerateNarrationOptions {
  client?: NarrationOpenAIClient;
  model?: string;
  disclosure?: string;
  maxWordsPerSegment?: number;
  maxSegments?: number;
  maxImageEvidence?: number;
  sensitiveValues?: string[];
}

const NarrationModelOutputSchema = z.object({
  summary: z.string(),
  editorialNotes: z.array(z.string()),
  segments: z.array(
    z.object({
      id: z.string(),
      chapterId: z.string(),
      anchorEventId: z.string(),
      title: z.string(),
      narration: z.string(),
      subtitle: z.string(),
    }),
  ),
});

type NarrationModelOutput = z.infer<typeof NarrationModelOutputSchema>;

const SYSTEM_PROMPT = `You are an expert English demo-video editor and voice-over writer.
Create a concise, professional, factual narration plan from the supplied browser-run timeline and evidence.

Rules:
- Write natural international English for a product reviewer.
- Describe only behavior supported by the supplied evidence. Never invent a result, platform, tool call, or policy claim.
- Explain user value while the relevant action is visible; avoid hype and vague marketing language.
- Anchor every segment to exactly one supplied timeline event ID and use its chapter ID.
- Include at least one narration segment for every supplied chapter.
- Keep segments short enough to fit between nearby actions and avoid repeating visible UI text verbatim.
- Treat strings marked [REDACTED] as confidential and never reconstruct or describe them.
- The first spoken segment must clearly disclose that the voice is AI-generated.
- Subtitle text should carry the same meaning as narration and remain readable on screen.
- Return only the requested structured output.`;

export async function generateNarration(
  input: NarrationInput,
  options: GenerateNarrationOptions = {},
): Promise<NarrationPlan> {
  validateNarrationInput(input);

  const disclosure = normalizeNonEmpty(
    options.disclosure ?? DEFAULT_AI_VOICE_DISCLOSURE,
    "AI voice disclosure",
  );
  const maxWordsPerSegment = options.maxWordsPerSegment ?? 80;
  if (!Number.isInteger(maxWordsPerSegment) || maxWordsPerSegment < 10) {
    throw new Error("maxWordsPerSegment must be an integer of at least 10");
  }
  const maxSegments = options.maxSegments ?? 30;
  if (!Number.isInteger(maxSegments) || maxSegments < 1 || maxSegments > 100) {
    throw new Error("maxSegments must be an integer between 1 and 100");
  }

  const client = options.client ?? new OpenAI();
  const model = options.model ?? DEFAULT_NARRATION_MODEL;
  const sanitizedInput = redactSensitiveValues(
    inputForModel(input),
    options.sensitiveValues ?? [],
  );
  const userText = [
    `Required AI voice disclosure: ${disclosure}`,
    `Maximum words per narration segment: ${maxWordsPerSegment}`,
    `Maximum narration segments: ${maxSegments}`,
    "Browser-run material:",
    JSON.stringify(sanitizedInput, null, 2),
  ].join("\n\n");

  const imageContent = await loadImageEvidence(
    input.evidence ?? [],
    options.maxImageEvidence ?? 8,
  );
  const response = await client.responses.parse({
    model,
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "input_text", text: userText },
          ...imageContent,
        ],
      },
    ],
    text: {
      format: zodTextFormat(
        NarrationModelOutputSchema,
        "demo_video_narration",
      ),
    },
  });

  if (response.output_parsed == null) {
    throw new Error(
      "OpenAI returned no parsed narration. The response may have been refused or incomplete.",
    );
  }

  const parsed = NarrationModelOutputSchema.parse(response.output_parsed);
  const plan = materializeNarrationPlan(
    parsed,
    input.timeline,
    disclosure,
    maxWordsPerSegment,
    maxSegments,
    input.chapters?.map((chapter) => chapter.id) ?? [],
  );
  assertNoSensitiveOutput(plan, options.sensitiveValues ?? []);
  return plan;
}

export function ensureAiVoiceDisclosure(
  segments: NarrationSegment[],
  disclosure = DEFAULT_AI_VOICE_DISCLOSURE,
): NarrationSegment[] {
  const normalizedDisclosure = normalizeNonEmpty(disclosure, "AI voice disclosure");
  if (segments.length === 0) {
    throw new Error("Cannot add an AI voice disclosure to an empty narration");
  }

  const first = segments[0];
  if (!first) {
    throw new Error("Cannot add an AI voice disclosure to an empty narration");
  }
  const hasDisclosure = first.narration.toLocaleLowerCase("en-US")
    .includes(normalizedDisclosure.toLocaleLowerCase("en-US"));
  if (hasDisclosure) {
    return segments.map((segment) => ({ ...segment }));
  }

  return [
    {
      ...first,
      narration: `${normalizedDisclosure} ${first.narration}`.trim(),
      subtitle: `${normalizedDisclosure} ${first.subtitle}`.trim(),
    },
    ...segments.slice(1).map((segment) => ({ ...segment })),
  ];
}

function validateNarrationInput(input: NarrationInput): void {
  normalizeNonEmpty(input.title, "Narration title");
  normalizeNonEmpty(input.objective, "Narration objective");
  if (input.timeline.length === 0) {
    throw new Error("Narration requires at least one timeline event");
  }

  const ids = new Set<string>();
  let previousAtMs = -1;
  for (const event of input.timeline) {
    normalizeNonEmpty(event.id, "Timeline event ID");
    normalizeNonEmpty(event.chapterId, `Chapter ID for event ${event.id}`);
    if (ids.has(event.id)) {
      throw new Error(`Duplicate timeline event ID: ${event.id}`);
    }
    ids.add(event.id);
    if (!Number.isFinite(event.atMs) || event.atMs < 0) {
      throw new Error(`Timeline event ${event.id} has an invalid atMs value`);
    }
    if (event.atMs < previousAtMs) {
      throw new Error("Timeline events must be ordered by atMs");
    }
    previousAtMs = event.atMs;
  }
}

function materializeNarrationPlan(
  output: NarrationModelOutput,
  timeline: NarrationTimelineEvent[],
  disclosure: string,
  maxWordsPerSegment: number,
  maxSegments: number,
  requiredChapterIds: string[],
): NarrationPlan {
  if (output.segments.length === 0) {
    throw new Error("OpenAI returned an empty narration plan");
  }
  if (output.segments.length > maxSegments) {
    throw new Error(`OpenAI returned more than ${maxSegments} narration segments`);
  }

  const events = new Map(timeline.map((event) => [event.id, event]));
  const segmentIds = new Set<string>();
  const materialized = output.segments.map((segment) => {
    const event = events.get(segment.anchorEventId);
    if (!event) {
      throw new Error(
        `Narration segment ${segment.id} references unknown event ${segment.anchorEventId}`,
      );
    }
    if (segment.chapterId !== event.chapterId) {
      throw new Error(
        `Narration segment ${segment.id} uses chapter ${segment.chapterId}, but event ${event.id} belongs to ${event.chapterId}`,
      );
    }
    if (segmentIds.has(segment.id)) {
      throw new Error(`Duplicate narration segment ID: ${segment.id}`);
    }
    segmentIds.add(segment.id);
    for (const [field, value] of [
      ["title", segment.title],
      ["narration", segment.narration],
      ["subtitle", segment.subtitle],
    ] as const) {
      normalizeNonEmpty(value, `${field} for narration segment ${segment.id}`);
    }
    if (wordCount(segment.narration) > maxWordsPerSegment) {
      throw new Error(
        `Narration segment ${segment.id} exceeds ${maxWordsPerSegment} words`,
      );
    }
    return {
      ...segment,
      anchorMs: event.atMs,
    };
  });

  materialized.sort((left, right) => left.anchorMs - right.anchorMs);
  const coveredChapterIds = new Set(materialized.map((segment) => segment.chapterId));
  const missingChapterIds = requiredChapterIds.filter((chapterId) => !coveredChapterIds.has(chapterId));
  if (missingChapterIds.length > 0) {
    throw new Error(`Narration omits required chapters: ${missingChapterIds.join(", ")}`);
  }
  return {
    summary: normalizeNonEmpty(output.summary, "Narration summary"),
    editorialNotes: output.editorialNotes,
    disclosure,
    segments: ensureAiVoiceDisclosure(materialized, disclosure),
  };
}

function inputForModel(input: NarrationInput): NarrationInput {
  return {
    ...input,
    ...(input.evidence
      ? {
          evidence: input.evidence.map(
            ({ imagePath, imageDataUrl, ...item }) => ({
              ...item,
              ...(imagePathOrDataWasPresent(imagePath, imageDataUrl)
                ? {
                    summary:
                      item.summary ?? "Attached redacted screenshot evidence.",
                  }
                : {}),
            }),
          ),
        }
      : {}),
  };
}

function imagePathOrDataWasPresent(
  imagePath: string | undefined,
  imageDataUrl: string | undefined,
): boolean {
  return Boolean(imagePath || imageDataUrl);
}

async function loadImageEvidence(
  evidence: NarrationEvidence[],
  limit: number,
): Promise<
  Array<{
    type: "input_image";
    image_url: string;
    detail: "low" | "high" | "auto";
  }>
> {
  if (!Number.isInteger(limit) || limit < 0) {
    throw new Error("maxImageEvidence must be a non-negative integer");
  }

  const images = selectImageEvidence(evidence, limit);
  return Promise.all(
    images.map(async (item) => ({
      type: "input_image" as const,
      image_url:
        item.imageDataUrl ??
        (await imageFileToDataUrl(
          item.imagePath as string,
        )),
      detail: item.imageDetail ?? "low",
    })),
  );
}

export function selectImageEvidence(
  evidence: NarrationEvidence[],
  limit: number,
): NarrationEvidence[] {
  const candidates = evidence.filter((item) => item.imageDataUrl || item.imagePath);
  if (limit === 0) return [];
  const selected: NarrationEvidence[] = [];
  const selectedIds = new Set<string>();
  const chapterIds = [...new Set(candidates.map((item) => item.chapterId).filter(Boolean))];
  for (const chapterId of chapterIds) {
    const item = [...candidates].reverse().find((candidate) => candidate.chapterId === chapterId);
    if (!item) continue;
    selected.push(item);
    selectedIds.add(item.id);
    if (selected.length === limit) return selected;
  }
  for (const item of [...candidates].reverse()) {
    if (selectedIds.has(item.id)) continue;
    selected.push(item);
    if (selected.length === limit) break;
  }
  return selected;
}

async function imageFileToDataUrl(filePath: string): Promise<string> {
  const extension = path.extname(filePath).toLowerCase();
  const mimeType =
    extension === ".jpg" || extension === ".jpeg"
      ? "image/jpeg"
      : extension === ".webp"
        ? "image/webp"
        : extension === ".gif"
          ? "image/gif"
          : "image/png";
  const bytes = await readFile(filePath);
  return `data:${mimeType};base64,${bytes.toString("base64")}`;
}

function redactSensitiveValues<T>(value: T, sensitiveValues: string[]): T {
  const serialized = JSON.stringify(value);
  const redacted = sensitiveValues.reduce((current, secret) => {
    if (!secret) return current;
    return current.split(secret).join("[REDACTED]");
  }, serialized);
  return JSON.parse(redacted) as T;
}

function assertNoSensitiveOutput(
  plan: NarrationPlan,
  sensitiveValues: string[],
): void {
  const output = JSON.stringify(plan);
  for (const secret of sensitiveValues) {
    if (secret && output.includes(secret)) {
      throw new Error("Generated narration contains a configured sensitive value");
    }
  }
}

function normalizeNonEmpty(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`${label} must not be empty`);
  }
  return normalized;
}

function wordCount(value: string): number {
  return value.trim().split(/\s+/u).filter(Boolean).length;
}
