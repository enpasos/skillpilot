import { chromium } from "playwright";
import { runProcess } from "./process.js";
import type { DemoScenario } from "./types.js";

export interface DoctorCheck {
  name: string;
  ok: boolean;
  detail: string;
}

export interface FfmpegRenderCapabilities {
  libx264: boolean;
  aac: boolean;
  subtitles: boolean;
}

export function inspectFfmpegRenderCapabilities(
  encodersOutput: string,
  filtersOutput: string,
): FfmpegRenderCapabilities {
  return {
    libx264: /^\s*V\S*\s+libx264(?:\s|$)/mu.test(encodersOutput),
    aac: /^\s*A\S*\s+aac(?:\s|$)/mu.test(encodersOutput),
    // The FFmpeg subtitles filter is the render-time surface backed by libass.
    subtitles: /^\s*[TSC.]{3}\s+subtitles(?:\s|$)/mu.test(filtersOutput),
  };
}

export async function runDoctor(scenario: DemoScenario): Promise<DoctorCheck[]> {
  const checks: DoctorCheck[] = [];
  for (const [name, executable] of [
    ["ffmpeg", scenario.binaries.ffmpeg],
    ["ffprobe", scenario.binaries.ffprobe],
  ] as const) {
    try {
      const result = await runProcess(executable, ["-version"], { timeoutMs: 10_000 });
      checks.push({ name, ok: true, detail: result.stdout.split(/\r?\n/, 1)[0] ?? executable });
    } catch (error) {
      checks.push({ name, ok: false, detail: String(error) });
    }
  }
  try {
    const [encoders, filters] = await Promise.all([
      runProcess(scenario.binaries.ffmpeg, ["-hide_banner", "-encoders"], { timeoutMs: 10_000 }),
      runProcess(scenario.binaries.ffmpeg, ["-hide_banner", "-filters"], { timeoutMs: 10_000 }),
    ]);
    const capabilities = inspectFfmpegRenderCapabilities(
      `${encoders.stdout}\n${encoders.stderr}`,
      `${filters.stdout}\n${filters.stderr}`,
    );
    const missing = Object.entries(capabilities)
      .filter(([, available]) => !available)
      .map(([name]) => name === "subtitles" ? "subtitles/libass" : name);
    checks.push({
      name: "ffmpeg-render-features",
      ok: missing.length === 0,
      detail: missing.length === 0
        ? "libx264, AAC, and subtitles/libass available"
        : `missing ${missing.join(", ")}`,
    });
  } catch (error) {
    checks.push({ name: "ffmpeg-render-features", ok: false, detail: String(error) });
  }
  try {
    const browser = await chromium.launch({ headless: true });
    checks.push({ name: "playwright-chromium", ok: true, detail: browser.version() });
    await browser.close();
  } catch (error) {
    checks.push({
      name: "playwright-chromium",
      ok: false,
      detail: `${String(error)} Run: npx playwright install chromium`,
    });
  }
  checks.push({
    name: "openai-api-key",
    ok: Boolean(process.env.OPENAI_API_KEY),
    detail: process.env.OPENAI_API_KEY
      ? "configured"
      : "OPENAI_API_KEY is missing; recording alone still works, but TTS and a complete build do not",
  });
  return checks;
}
