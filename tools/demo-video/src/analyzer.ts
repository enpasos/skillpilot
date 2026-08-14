import { writePrivateFile } from "./private-fs.js";
import { relative, sep } from "node:path";
import type { DemoScenario, RecordingResult, TimelineEvent } from "./types.js";

export interface ChapterAnalysis {
  id: string;
  title: string;
  startedAtMs: number;
  endedAtMs: number;
  narrationHint?: string;
  events: Array<{
    stepId: string;
    label: string;
    action: TimelineEvent["action"];
    startedAtMs: number;
    endedAtMs: number;
    narrationHint?: string;
    evidence: string[];
    screenshot?: string;
  }>;
}

export interface RecordingAnalysis {
  scenarioId: string;
  title: string;
  durationMs: number;
  platform: string;
  chapters: ChapterAnalysis[];
}

export function analyzeRecording(scenario: DemoScenario, recording: RecordingResult): RecordingAnalysis {
  return {
    scenarioId: scenario.id,
    title: scenario.title,
    durationMs: recording.durationMs,
    platform: scenario.platform,
    chapters: scenario.chapters.map((chapter) => {
      const events = recording.timeline.filter((event) => event.chapterId === chapter.id);
      return {
        id: chapter.id,
        title: chapter.title,
        startedAtMs: events[0]?.startedAtMs ?? 0,
        endedAtMs: events.at(-1)?.endedAtMs ?? 0,
        ...(chapter.narrationHint ? { narrationHint: chapter.narrationHint } : {}),
        events: events.map((event) => ({
          stepId: event.stepId,
          label: event.label,
          action: event.action,
          startedAtMs: event.startedAtMs,
          endedAtMs: event.endedAtMs,
          ...(event.narrationHint ? { narrationHint: event.narrationHint } : {}),
          evidence: event.evidence.map((entry) => `${entry.selector}: ${entry.text}`),
          ...(event.screenshot ? { screenshot: event.screenshot } : {}),
        })),
      };
    }),
  };
}

export function portableAnalysis(root: string, analysis: RecordingAnalysis): RecordingAnalysis {
  return {
    ...analysis,
    chapters: analysis.chapters.map((chapter) => ({
      ...chapter,
      events: chapter.events.map((event) => {
        if (!event.screenshot) return event;
        const portablePath = relative(root, event.screenshot);
        if (!portablePath || portablePath === ".." || portablePath.startsWith(`..${sep}`)) {
          throw new Error(`Analysis screenshot is outside the recording directory: ${event.screenshot}`);
        }
        return { ...event, screenshot: portablePath.split(sep).join("/") };
      }),
    })),
  };
}

export async function writeAnalysis(path: string, root: string, analysis: RecordingAnalysis): Promise<void> {
  await writePrivateFile(path, `${JSON.stringify(portableAnalysis(root, analysis), null, 2)}\n`, { encoding: "utf8" });
}
