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
  };
};

type OpenAiSetGlobalsEvent = CustomEvent<{
  globals?: {
    toolOutput?: unknown;
    widgetState?: unknown;
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

const bridge = new GoalVisualizationBridge(applyToolResult);
const compatibilityWindow = window as OpenAiCompatibilityWindow;
let currentVisualization: GoalVisualization | undefined;
let currentImage: HTMLImageElement | undefined;

window.addEventListener(
  "openai:set_globals",
  (event) => {
    const globals = (event as OpenAiSetGlobalsEvent).detail?.globals;
    if (!globals || (globals.toolOutput === undefined && globals.widgetState === undefined)) {
      return;
    }

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

function applyToolResult(result: GoalVisualizationToolResult): void {
  renderStructuredContent(result.structuredContent);
}

function renderFirstStructuredContent(...candidates: unknown[]): void {
  renderVisualization(firstGoalVisualization(currentVisualization, candidates));
}

function renderStructuredContent(structuredContent: unknown): void {
  renderVisualization(retainGoalVisualization(currentVisualization, structuredContent));
}

function renderVisualization(visualization: GoalVisualization | undefined): void {
  if (!visualization || visualization === currentVisualization) return;

  currentVisualization = visualization;
  const card = cardFor(visualization);
  root.replaceChildren();
  root.hidden = false;
  root.appendChild(card);
  try {
    compatibilityWindow.openai?.setWidgetState?.({ goalVisualization: visualization });
  } catch {
    // Persistence is an optional ChatGPT compatibility enhancement. The
    // standards-first MCP Apps result remains authoritative and visible.
  }
}

function cardFor(visualization: GoalVisualization): HTMLElement {
  const article = element("article", "goal-card");
  article.dataset.goalId = visualization.goalId;
  article.setAttribute("aria-labelledby", "skillpilot-goal-title");

  const image = document.createElement("img");
  image.className = "goal-image";
  image.src = visualization.imageUrl;
  image.alt = visualization.altText;
  image.loading = "eager";
  image.decoding = "async";
  image.addEventListener("error", () => hideVisualization(image));
  currentImage = image;

  const content = element("div", "goal-content");
  content.appendChild(textElement("p", "eyebrow", "SkillPilot Lernziel"));

  const title = textElement("h2", "goal-title", visualization.title);
  title.id = "skillpilot-goal-title";
  content.appendChild(title);

  if (visualization.description) {
    content.appendChild(textElement("p", "goal-description", visualization.description));
  }

  const link = textElement("a", "cockpit-link", "Im SkillPilot-Cockpit öffnen");
  link.setAttribute("href", visualization.cockpitUrl);
  link.setAttribute("target", "_blank");
  link.setAttribute("rel", "noopener noreferrer");
  link.addEventListener("click", (event) => {
    event.preventDefault();
    void bridge.openLink(visualization.cockpitUrl).catch(() => {
      window.open(visualization.cockpitUrl, "_blank", "noopener,noreferrer");
    });
  });
  content.appendChild(link);

  article.append(image, content);
  return article;
}

function hideVisualization(image: HTMLImageElement): void {
  // Replacing a card can terminate the detached image request. Its late error
  // event must not clear the newer card delivered through the other host
  // channel.
  if (image !== currentImage || !root.contains(image)) return;
  root.replaceChildren();
  root.hidden = true;
  currentVisualization = undefined;
  currentImage = undefined;
}

function element(tag: string, className: string): HTMLElement {
  const node = document.createElement(tag);
  node.className = className;
  return node;
}

function textElement(tag: string, className: string, text: string): HTMLElement {
  const node = element(tag, className);
  node.textContent = text;
  return node;
}
