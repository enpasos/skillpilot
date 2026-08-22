import css from "./goal-visualization.css";
import { SkillPilotMcpAppBridge } from "./mcp-app-bridge.js";
import { retainGoalVisualization } from "./goal-visualization.js";

const BOOTSTRAP_TIMEOUT_MS = 10_000;
const IMAGE_TIMEOUT_MS = 15_000;

const style = document.createElement("style");
style.textContent = css;
document.head.append(style);

const root = document.querySelector("#root");
if (!(root instanceof HTMLElement)) throw new Error("Missing app root");

let visualization;
let image;
let teardownRequested = false;
let imageTimer;
const bootstrapTimer = window.setTimeout(dismiss, BOOTSTRAP_TIMEOUT_MS);
const bridge = new SkillPilotMcpAppBridge(
  "skillpilot-claude-goal-visualization",
  (result) => accept(result?.structuredContent)
);
void bridge.ready.catch(() => dismiss());

function accept(structuredContent) {
  const next = retainGoalVisualization(visualization, structuredContent);
  if (!next || next === visualization) return;
  visualization = next;
  teardownRequested = false;
  window.clearTimeout(bootstrapTimer);
  window.clearTimeout(imageTimer);
  root.hidden = true;

  const nextImage = document.createElement("img");
  nextImage.className = "goal-image";
  nextImage.alt = next.altText;
  nextImage.loading = "eager";
  nextImage.decoding = "async";
  nextImage.addEventListener("load", () => show(nextImage));
  nextImage.addEventListener("error", () => dismiss(nextImage));
  image = nextImage;
  root.replaceChildren(nextImage);
  imageTimer = window.setTimeout(() => dismiss(nextImage), IMAGE_TIMEOUT_MS);
  nextImage.src = next.imageUrl;
}

function show(candidate) {
  if (candidate !== image || !root.contains(candidate)) return;
  window.clearTimeout(imageTimer);
  root.hidden = false;
}

function dismiss(candidate) {
  if (candidate && (candidate !== image || !root.contains(candidate))) return;
  window.clearTimeout(imageTimer);
  root.replaceChildren();
  root.hidden = true;
  visualization = undefined;
  image = undefined;
  if (teardownRequested) return;
  teardownRequested = true;
  void bridge.requestTeardown().catch(() => undefined);
}
