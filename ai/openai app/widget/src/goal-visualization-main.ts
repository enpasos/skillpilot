import css from "./goal-visualization.css";
import {
  GoalVisualizationBridge,
  type GoalVisualizationToolResult
} from "./goal-visualization-bridge";
import {
  goalVisualizationFromStructuredContent,
  type GoalVisualization
} from "./goal-visualization";

type OpenAiCompatibilityWindow = Window & {
  openai?: {
    toolOutput?: unknown;
  };
};

type OpenAiSetGlobalsEvent = CustomEvent<{
  globals?: {
    toolOutput?: unknown;
  };
}>;

const style = document.createElement("style");
style.textContent = css;
document.head.appendChild(style);
document.documentElement.lang = "de";

const rootElement = document.querySelector<HTMLElement>("#root");
if (!rootElement) throw new Error("Missing goal visualization root");
const root: HTMLElement = rootElement;

const bridge = new GoalVisualizationBridge(applyToolResult);
const compatibilityWindow = window as OpenAiCompatibilityWindow;

window.addEventListener(
  "openai:set_globals",
  (event) => {
    const toolOutput = (event as OpenAiSetGlobalsEvent).detail?.globals?.toolOutput;
    if (toolOutput !== undefined) renderStructuredContent(toolOutput);
  },
  { passive: true }
);
renderStructuredContent(compatibilityWindow.openai?.toolOutput);

function applyToolResult(result: GoalVisualizationToolResult): void {
  renderStructuredContent(result.structuredContent);
}

function renderStructuredContent(structuredContent: unknown): void {
  const visualization = goalVisualizationFromStructuredContent(structuredContent);
  root.replaceChildren();
  root.hidden = !visualization;
  if (visualization) root.appendChild(cardFor(visualization));
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
  image.addEventListener("error", hideVisualization);

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

function hideVisualization(): void {
  root.replaceChildren();
  root.hidden = true;
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
