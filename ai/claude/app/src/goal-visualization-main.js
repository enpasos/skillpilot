import css from "./goal-visualization.css";
import { SkillPilotMcpAppBridge } from "./mcp-app-bridge.js";
import { retainGoalVisualization } from "./goal-visualization.js";

const style = document.createElement("style");
style.textContent = css;
document.head.append(style);

const root = document.querySelector("#root");
if (!(root instanceof HTMLElement)) throw new Error("Missing app root");

let visualization;
let image;
let teardownRequested = false;
// The host can mount the app before the tool finishes. Keep it collapsed
// while waiting: a local deadline must not tear down a still-pending result
// or image request, because the host may then discard its eventual result.
const bridge = new SkillPilotMcpAppBridge(
  "skillpilot-claude-goal-visualization",
  (result) => accept(result?.structuredContent)
);
void bridge.ready.catch(() => dismiss());

function accept(structuredContent) {
  const next = retainGoalVisualization(visualization, structuredContent);
  if (!next) {
    dismiss();
    return;
  }
  if (next === visualization) return;
  visualization = next;
  teardownRequested = false;
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
  nextImage.src = next.imageUrl;
}

function show(candidate) {
  if (candidate !== image || !root.contains(candidate)) return;
  root.hidden = false;
}

function dismiss(candidate) {
  if (candidate && (candidate !== image || !root.contains(candidate))) return;
  root.replaceChildren();
  root.hidden = true;
  visualization = undefined;
  image = undefined;
  if (teardownRequested) return;
  teardownRequested = true;
  void bridge.requestTeardown().catch(() => undefined);
}
