import css from "./goal-visualization.css";
import {
  GoalVisualizationBridge,
  type GoalVisualizationHostContext,
  type GoalVisualizationToolResult
} from "./goal-visualization-bridge";
import {
  firstGoalVisualization,
  isMobileGoalVisualizationHost,
  retainGoalVisualization,
  type GoalVisualization
} from "./goal-visualization";

type OpenAiCompatibilityWindow = Window & {
  openai?: {
    toolOutput?: unknown;
    widgetState?: unknown;
    userAgent?: string;
    setWidgetState?: (state: unknown) => void;
    requestClose?: () => void | Promise<void>;
  };
};

type OpenAiSetGlobalsEvent = CustomEvent<{
  globals?: {
    toolOutput?: unknown;
    widgetState?: unknown;
    userAgent?: string;
  };
}>;

const style = document.createElement("style");
style.textContent = css;
document.head.appendChild(style);
document.documentElement.lang = "de";

const rootElement = document.querySelector<HTMLElement>("#root");
if (!rootElement) throw new Error("Missing goal visualization root");
const root: HTMLElement = rootElement;
root.hidden = true;

const bridge = new GoalVisualizationBridge(applyToolResult, handleHostContextChanged);
const compatibilityWindow = window as OpenAiCompatibilityWindow;
let bridgeInitialized = false;
let hostInitialized = false;
let suppressUi = false;
let currentVisualization: GoalVisualization | undefined;
let pendingVisualization: GoalVisualization | undefined;
let currentImage: HTMLImageElement | undefined;

window.addEventListener(
  "openai:set_globals",
  (event) => {
    const globals = (event as OpenAiSetGlobalsEvent).detail?.globals;
    if (!globals) {
      return;
    }

    if (
      isMobileGoalVisualizationHost(
        bridgeInitialized ? bridge.hostContext()?.platform : undefined,
        globals.userAgent,
        compatibilityWindow.openai?.userAgent,
        navigator.userAgent
      )
    ) {
      suppressMobileUi();
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
void bridge.ready.then(handleHostInitialization, handleHostInitializationFailure);

function applyToolResult(result: GoalVisualizationToolResult): void {
  renderStructuredContent(result.structuredContent);
}

function renderFirstStructuredContent(...candidates: unknown[]): void {
  acceptVisualization(firstGoalVisualization(activeVisualization(), candidates));
}

function renderStructuredContent(structuredContent: unknown): void {
  acceptVisualization(retainGoalVisualization(activeVisualization(), structuredContent));
}

function activeVisualization(): GoalVisualization | undefined {
  return pendingVisualization ?? currentVisualization;
}

function acceptVisualization(visualization: GoalVisualization | undefined): void {
  if (!visualization || suppressUi) return;
  if (!hostInitialized) {
    pendingVisualization = visualization;
    return;
  }
  renderVisualization(visualization);
}

function handleHostInitialization(): void {
  bridgeInitialized = true;
  const hostContext = bridge.hostContext();
  if (
    isMobileGoalVisualizationHost(
      hostContext?.platform,
      hostContext?.userAgent,
      compatibilityWindow.openai?.userAgent,
      navigator.userAgent
    )
  ) {
    suppressMobileUi();
    return;
  }

  enableRendering();
}

function handleHostContextChanged(hostContext: GoalVisualizationHostContext): void {
  if (
    isMobileGoalVisualizationHost(
      hostContext.platform,
      hostContext.userAgent,
      compatibilityWindow.openai?.userAgent,
      navigator.userAgent
    )
  ) {
    suppressMobileUi();
    return;
  }

  if (!bridgeInitialized || suppressUi) return;
  enableRendering();
}

function handleHostInitializationFailure(): void {
  if (
    isMobileGoalVisualizationHost(
      undefined,
      compatibilityWindow.openai?.userAgent,
      navigator.userAgent
    )
  ) {
    suppressMobileUi();
    return;
  }

  // Keep the existing ChatGPT compatibility bridge usable for web hosts that
  // do not complete the standards-first handshake.
  enableRendering();
}

function suppressMobileUi(): void {
  if (suppressUi) return;
  suppressUi = true;
  pendingVisualization = undefined;
  hideVisualization();

  const openai = compatibilityWindow.openai;
  const requestClose = openai?.requestClose;
  const compatibilityClose =
    typeof requestClose === "function"
      ? Promise.resolve().then(() => requestClose.call(openai))
      : Promise.resolve();

  // The standard teardown request is the primary signal. requestClose is a
  // feature-detected ChatGPT compatibility enhancement. Either host may
  // decline or ignore its signal, so the DOM stays collapsed independently.
  void Promise.allSettled([bridge.requestTeardown(), compatibilityClose]);
}

function enableRendering(): void {
  hostInitialized = true;
  const visualization = pendingVisualization;
  pendingVisualization = undefined;
  renderVisualization(visualization);
}

function renderVisualization(visualization: GoalVisualization | undefined): void {
  if (!visualization || visualization === currentVisualization) return;

  currentVisualization = visualization;
  const image = document.createElement("img");
  image.className = "goal-image";
  image.alt = visualization.altText;
  image.loading = "eager";
  image.decoding = "async";
  image.addEventListener("load", () => showVisualization(image, visualization));
  image.addEventListener("error", () => hideVisualization(image));
  currentImage = image;
  root.replaceChildren(image);
  image.src = visualization.imageUrl;
}

function showVisualization(
  image: HTMLImageElement,
  visualization: GoalVisualization
): void {
  if (
    suppressUi ||
    image !== currentImage ||
    !root.contains(image) ||
    visualization !== currentVisualization
  ) {
    return;
  }
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
  root.replaceChildren();
  root.hidden = true;
  currentVisualization = undefined;
  currentImage = undefined;
}
