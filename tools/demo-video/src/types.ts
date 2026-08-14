import type { Page } from "playwright";

export type DemoPlatform = "web" | "mobile-web";

type LocatorMatch = { match?: "first" | "last" };

export type LocatorSpec = LocatorMatch & (
  | { css: string }
  | { testId: string }
  | { label: string; exact?: boolean }
  | { text: string; exact?: boolean }
  | { placeholder: string; exact?: boolean }
  | { role: string; name?: string; exact?: boolean }
);

export interface StepBase {
  id: string;
  label: string;
  frame?: string;
  capture?: boolean;
  narrationHint?: string;
}

export type DemoStep =
  | (StepBase & { action: "goto"; url?: string; urlFromEnv?: string; waitUntil?: "load" | "domcontentloaded" | "networkidle" })
  | (StepBase & { action: "follow"; target: LocatorSpec; waitUntil?: "load" | "domcontentloaded" | "networkidle" })
  | (StepBase & { action: "click"; target: LocatorSpec; button?: "left" | "right" | "middle"; highlight?: boolean; samePage?: boolean })
  | (StepBase & { action: "fill"; target: LocatorSpec; value?: string; valueFromEnv?: string; secret?: boolean })
  | (StepBase & { action: "press"; target?: LocatorSpec; key: string })
  | (StepBase & { action: "select"; target: LocatorSpec; value: string })
  | (StepBase & { action: "check"; target: LocatorSpec; checked?: boolean })
  | (StepBase & { action: "hover"; target: LocatorSpec })
  | (StepBase & { action: "waitFor"; target: LocatorSpec; state?: "attached" | "detached" | "visible" | "hidden"; timeoutMs?: number })
  | (StepBase & { action: "wait"; durationMs: number })
  | (StepBase & { action: "assert"; target: LocatorSpec; state?: "attached" | "visible" | "hidden"; text?: string; textPattern?: string; timeoutMs?: number })
  | (StepBase & { action: "screenshot"; name?: string })
  | (StepBase & { action: "maskTarget"; target: LocatorSpec })
  | (StepBase & { action: "mask"; selector: string })
  | (StepBase & { action: "unmask"; selector: string });

export interface DemoChapter {
  id: string;
  title: string;
  narrationHint?: string;
  scriptedNarration?: string;
  steps: DemoStep[];
}

export interface BrowserConfig {
  baseUrl?: string;
  headless: boolean;
  viewport: { width: number; height: number };
  video: { width: number; height: number };
  locale: string;
  timezoneId: string;
  colorScheme: "light" | "dark" | "no-preference";
  reducedMotion: "reduce" | "no-preference";
  storageState?: string;
  userAgent?: string;
  deviceScaleFactor: number;
  defaultTimeoutMs: number;
  postActionDelayMs: number;
  dialogPolicy: "accept" | "dismiss";
}

export interface PrivacyConfig {
  maskSelectors: string[];
  maskTextSelectors: string[];
  maskLabel: string;
  maskColor: string;
  forbiddenPatterns: string[];
  evidenceSelectors: string[];
  failOnForbiddenText: boolean;
}

export interface NarrationConfig {
  mode: "ai" | "scripted";
  model: string;
  ttsModel: string;
  voice: string;
  instructions: string;
  disclosure: string;
  segmentGapMs: number;
  maxSegments: number;
}

export interface RenderConfig {
  width: number;
  height: number;
  fps: number;
  crf: number;
  preset: string;
  subtitleFontSize: number;
  subtitleBottomMargin: number;
  burnSubtitles: boolean;
  autoZoom: {
    enabled: boolean;
    factor: number;
    durationMs: number;
  };
}

export interface BinaryConfig {
  ffmpeg: string;
  ffprobe: string;
}

export interface DemoScenario {
  schemaVersion: 1;
  id: string;
  title: string;
  description?: string;
  /** Public deployment or source revision represented by this recording. */
  sourceRevision: string;
  platform: DemoPlatform;
  outputDir: string;
  cacheDir: string;
  variables: Record<string, string>;
  browser: BrowserConfig;
  privacy: PrivacyConfig;
  narration: NarrationConfig;
  render: RenderConfig;
  binaries: BinaryConfig;
  chapters: DemoChapter[];
}

export interface RecordingAdapter {
  readonly kind: string;
  record(context: RecordingContext): Promise<RecordingResult>;
}

export interface RecordingContext {
  scenario: DemoScenario;
  scenarioPath: string;
  workDir: string;
  force: boolean;
}

export interface StepEvidence {
  selector: string;
  text: string;
}

export interface MaskRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  secret: boolean;
  configured: boolean;
}

export interface TimelineEvent {
  chapterId: string;
  chapterTitle: string;
  stepId: string;
  action: DemoStep["action"];
  label: string;
  startedAtMs: number;
  endedAtMs: number;
  narrationHint?: string;
  screenshot?: string;
  masks?: MaskRegion[];
  evidence: StepEvidence[];
  click?: { x: number; y: number };
  secretInput: boolean;
}

export interface RecordingResult {
  videoPath: string;
  timelinePath: string;
  timeline: TimelineEvent[];
  durationMs: number;
  browserVersion: string;
}

export interface NarrationSegment {
  id: string;
  chapterId: string;
  title: string;
  text: string;
  subtitle?: string;
  startAfterStepId: string;
  desiredStartMs: number;
  audioPath?: string;
  audioDurationMs?: number;
  startMs?: number;
  endMs?: number;
}

export interface NarrationPlan {
  title: string;
  overview: string;
  disclosure: string;
  segments: NarrationSegment[];
}

export interface BrowserPageHook {
  (page: Page): Promise<void>;
}

export interface BuildArtifacts {
  workDir: string;
  recording: RecordingResult;
  narrationPath: string;
  narration: NarrationPlan;
  subtitlesPath: string;
  outputVideoPath: string;
  manifestPath: string;
}
