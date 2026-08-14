import assert from "node:assert/strict";
import { test } from "node:test";

import { inspectFfmpegRenderCapabilities } from "../src/doctor.js";

test("detects the exact FFmpeg features required by the render pipeline", () => {
  const capabilities = inspectFfmpegRenderCapabilities(
    " V....D libx264              H.264 / AVC\n A..... aac                  AAC",
    " ... subtitles         V->V       Render text subtitles onto input video using the libass library.",
  );
  assert.deepEqual(capabilities, { libx264: true, aac: true, subtitles: true });
});

test("reports missing codecs and does not confuse similarly named components", () => {
  const capabilities = inspectFfmpegRenderCapabilities(
    " V..... h264_nvenc H.264 encoder\n A..... libfdk_aac AAC",
    " ... ass V->V Render ASS subtitles",
  );
  assert.deepEqual(capabilities, { libx264: false, aac: false, subtitles: false });
});
