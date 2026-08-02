import css from "./goal-visualization.css";
import {
  GoalVisualizationBridge,
  type GoalVisualizationToolResult
} from "./goal-visualization-bridge";
import {
  firstGoalVisualization,
  retainGoalVisualization,
  type GoalVisualization
} from "./goal-visualization";

type OpenAiCompatibilityWindow = Window & {
  openai?: {
    toolOutput?: unknown;
    widgetState?: unknown;
    setWidgetState?: (state: unknown) => void;
    requestClose?: () => void | Promise<void>;
  };
};

type OpenAiSetGlobalsEvent = CustomEvent<{
  globals?: {
    toolOutput?: unknown;
    widgetState?: unknown;
  };
}>;

const IMAGE_LOAD_TIMEOUT_MS = 15_000;

const style = document.createElement("style");
style.textContent = css;
document.head.appendChild(style);
document.documentElement.lang = "de";

const rootElement = document.querySelector<HTMLElement>("#root");
if (!rootElement) throw new Error("Missing goal visualization root");
const root: HTMLElement = rootElement;
root.hidden = true;

const bridge = new GoalVisualizationBridge(applyToolResult);
const compatibilityWindow = window as OpenAiCompatibilityWindow;
let teardownRequested = false;
let currentVisualization: GoalVisualization | undefined;
let currentImage: HTMLImageElement | undefined;
let imageLoadTimeout: number | undefined;

window.addEventListener(
  "openai:set_globals",
  (event) => {
    const globals = (event as OpenAiSetGlobalsEvent).detail?.globals;
    if (!globals) {
      return;
    }

    if (globals.toolOutput === undefined && globals.widgetState === undefined) return;

    // The event values are the current change. Retain the window.openai
    // snapshots only as fallbacks for hosts that omit one of those values.
    renderFirstStructuredContent(
      globals.toolOutput,
      globals.widgetState,
      compatibilityWindow.openai?.toolOutput,
      compatibilityWindow.openai?.widgetState
    );
  },
  { passive: true }
);
renderFirstStructuredContent(
  compatibilityWindow.openai?.toolOutput,
  compatibilityWindow.openai?.widgetState
);
// Keep the standards-first connection active, but do not make the ChatGPT
// compatibility snapshot wait for a handshake that some hosts complete late.
void bridge.ready.catch(() => undefined);

function applyToolResult(result: GoalVisualizationToolResult): void {
  renderStructuredContent(result.structuredContent);
}

function renderFirstStructuredContent(...candidates: unknown[]): void {
  acceptVisualization(firstGoalVisualization(currentVisualization, candidates));
}

function renderStructuredContent(structuredContent: unknown): void {
  acceptVisualization(retainGoalVisualization(currentVisualization, structuredContent));
}

function acceptVisualization(visualization: GoalVisualization | undefined): void {
  if (!visualization) return;
  renderVisualization(visualization);
}

function dismissUnavailableUi(image: HTMLImageElement): void {
  if (image !== currentImage || !root.contains(image)) return;
  hideVisualization(image);
  requestUiTeardown();
}

function requestUiTeardown(): void {
  if (teardownRequested) return;
  teardownRequested = true;

  const openai = compatibilityWindow.openai;
  const requestClose = openai?.requestClose;
  const compatibilityClose =
    typeof requestClose === "function"
      ? Promise.resolve().then(() => requestClose.call(openai))
      : Promise.resolve();

  // The standard teardown request is the primary signal. requestClose remains
  // a feature-detected ChatGPT compatibility enhancement. Either host may
  // decline or ignore its signal, so the DOM stays collapsed independently.
  void Promise.allSettled([bridge.requestTeardown(), compatibilityClose]);
}

function renderVisualization(visualization: GoalVisualization | undefined): void {
  if (!visualization || visualization === currentVisualization) return;

  clearImageLoadTimeout();
  root.hidden = true;
  currentVisualization = visualization;
  const image = document.createElement("img");
  image.className = "goal-image";
  image.alt = visualization.altText;
  image.loading = "eager";
  image.decoding = "async";
  image.addEventListener("load", () => showVisualization(image, visualization));
  image.addEventListener("error", () => dismissUnavailableUi(image));
  currentImage = image;
  root.replaceChildren(image);
  imageLoadTimeout = window.setTimeout(
    () => dismissUnavailableUi(image),
    IMAGE_LOAD_TIMEOUT_MS
  );
  image.src = visualization.imageUrl;
}

function showVisualization(
  image: HTMLImageElement,
  visualization: GoalVisualization
): void {
  if (
    image !== currentImage ||
    !root.contains(image) ||
    visualization !== currentVisualization
  ) {
    return;
  }
  clearImageLoadTimeout();
  root.hidden = false;
  try {
    compatibilityWindow.openai?.setWidgetState?.({ goalVisualization: visualization });
  } catch {
    // Persistence is an optional ChatGPT compatibility enhancement. The
    // standards-first MCP Apps result remains authoritative and visible.
  }
}

function hideVisualization(image?: HTMLImageElement): void {
  // Replacing an image can terminate the detached request. Its late error
  // event must not clear the newer image delivered through the other host
  // channel.
  if (image && (image !== currentImage || !root.contains(image))) return;
  clearImageLoadTimeout();
  root.replaceChildren();
  root.hidden = true;
  currentVisualization = undefined;
  currentImage = undefined;
}

function clearImageLoadTimeout(): void {
  if (imageLoadTimeout === undefined) return;
  window.clearTimeout(imageLoadTimeout);
  imageLoadTimeout = undefined;
}
