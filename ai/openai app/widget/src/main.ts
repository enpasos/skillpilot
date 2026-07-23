import css from "./styles.css";
import { McpAppBridge, type CoachView, type ToolResult, type WidgetMetadata } from "./bridge";
import { widgetMetadataFromHost } from "./host-metadata";

declare const __SKILLPILOT_LOCALE__: "de" | "en";
declare const __TOOL_CHOOSE__: string;
declare const __TOOL_SUBMIT__: string;
declare const __SELECTED_CONTEXT__: string;
declare const __SUBMITTED_CONTEXT__: string;
declare const __PENDING_MESSAGE__: string;
declare const __EVALUATION_REQUEST_LABEL__: string;

declare global {
  interface Window {
    openai?: {
      toolOutput?: CoachView;
      toolResponseMetadata?: unknown;
    };
  }
}

const style = document.createElement("style");
style.textContent = css;
document.head.appendChild(style);
document.documentElement.lang = __SKILLPILOT_LOCALE__;

const rootElement = document.querySelector<HTMLElement>("#root");
if (!rootElement) throw new Error("Missing widget root");
const root: HTMLElement = rootElement;

const bridge = new McpAppBridge();
let view: CoachView | undefined = window.openai?.toolOutput;
let metadata: WidgetMetadata = widgetMetadataFromHost(window.openai?.toolResponseMetadata);
let busy = false;
let errorMessage = "";
let statusMessage = "";

bridge.onToolResult(applyToolResult);
if (view) render();
else renderLoading();

function applyToolResult(result: ToolResult): void {
  if (result.structuredContent) view = result.structuredContent;
  if (result._meta) metadata = result._meta;
  busy = false;
  errorMessage = result.isError ? visibleError(result) : "";
  statusMessage = "";
  render();
}

function visibleError(result: ToolResult): string {
  return result.content?.find((item) => item.type === "text")?.text ||
    (__SKILLPILOT_LOCALE__ === "de" ? "Die Aktion ist fehlgeschlagen." : "The action failed.");
}

function renderLoading(): void {
  root.innerHTML = `<article class="coach-card"><div class="accent"></div><div class="content"><p class="eyebrow">SkillPilot</p><p class="summary">${__SKILLPILOT_LOCALE__ === "de" ? "Lernweg wird geladen …" : "Loading learning path …"}</p></div></article>`;
}

function render(): void {
  if (!view) return renderLoading();
  root.replaceChildren(cardFor(view));
}

function cardFor(current: CoachView): HTMLElement {
  const article = element("article", "coach-card");
  article.appendChild(element("div", "accent"));
  const content = element("div", "content");
  content.appendChild(textElement("p", "eyebrow", "SkillPilot"));
  content.appendChild(textElement("h1", "", current.title));
  content.appendChild(textElement("p", "summary", current.summary));

  if (current.courseLabel) {
    content.appendChild(textElement("span", "course", current.courseLabel));
  }
  if (current.prompt) {
    content.appendChild(textElement("p", "prompt", current.prompt));
  }
  if (current.phase === "scope-choice") content.appendChild(choiceList(current));
  if (current.phase === "practice") content.appendChild(answerForm(current));
  if (current.phase === "awaiting-evaluation") content.appendChild(evaluationAction());
  if (current.phase === "feedback") content.appendChild(feedbackBlock(current));

  const status = textElement(
    "p",
    "status",
    busy ? busyText(current.phase) : errorMessage || statusMessage
  );
  status.dataset.error = String(Boolean(errorMessage));
  status.setAttribute("role", errorMessage ? "alert" : "status");
  content.appendChild(status);
  article.appendChild(content);
  return article;
}

function choiceList(current: CoachView): HTMLElement {
  const list = element("div", "choice-list");
  current.choices.forEach((choice, index) => {
    const button = element("button", "choice") as HTMLButtonElement;
    button.type = "button";
    button.disabled = busy;
    button.appendChild(textElement("strong", "", choice.label));
    button.appendChild(textElement("span", "", choice.detail));
    button.addEventListener("click", () => selectChoice(index, choice.label));
    list.appendChild(button);
  });
  return list;
}

function answerForm(current: CoachView): HTMLElement {
  const form = element("form", "answer-form") as HTMLFormElement;
  const inputId = "skillpilot-answer";
  const label = textElement("label", "", current.answerLabel || "Answer");
  label.setAttribute("for", inputId);
  const textarea = document.createElement("textarea");
  textarea.id = inputId;
  textarea.name = "answer";
  textarea.required = true;
  textarea.maxLength = 4_000;
  textarea.placeholder = current.answerPlaceholder || "";
  textarea.disabled = busy;
  const button = textElement("button", "primary", current.submitLabel || "Submit") as HTMLButtonElement;
  button.type = "submit";
  button.disabled = busy;
  form.append(label, textarea, button);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void submitAnswer(textarea.value);
  });
  return form;
}

function feedbackBlock(current: CoachView): HTMLElement {
  const container = element("div", "feedback-block");
  const score = element("div", "score");
  score.appendChild(textElement("strong", "", String(current.score ?? "–")));
  score.appendChild(textElement("span", "", `/ ${current.maxScore ?? "–"}`));
  container.appendChild(score);
  if (current.feedback) container.appendChild(textElement("p", "feedback", current.feedback));
  return container;
}

function evaluationAction(): HTMLElement {
  const button = textElement(
    "button",
    "primary",
    __EVALUATION_REQUEST_LABEL__
  ) as HTMLButtonElement;
  button.type = "button";
  button.disabled = busy;
  button.addEventListener("click", () => {
    void requestEvaluation();
  });
  return button;
}

async function selectChoice(index: number, label: string): Promise<void> {
  const sessionRef = metadata.skillpilotApp?.sessionRef;
  const choiceRef = metadata.skillpilotApp?.choiceRefs?.[index];
  if (!sessionRef || !choiceRef) return fail(staleText());
  setBusy(true);
  try {
    const result = await bridge.callTool(__TOOL_CHOOSE__, { sessionRef, choiceRef });
    await applyAfterModelContext(
      result,
      __SELECTED_CONTEXT__.replace("{choice}", label)
    );
  } catch (error) {
    fail(readError(error));
  }
}

async function submitAnswer(answer: string): Promise<void> {
  const sessionRef = metadata.skillpilotApp?.sessionRef;
  if (!sessionRef) return fail(staleText());
  if (!answer.trim()) return;
  setBusy(true);
  try {
    const result = await bridge.callTool(__TOOL_SUBMIT__, {
      sessionRef,
      answer: answer.trim(),
      idempotencyKey: `widget_${crypto.randomUUID()}`
    });
    await applyAfterModelContext(result, __SUBMITTED_CONTEXT__);
  } catch (error) {
    fail(readError(error));
  }
}

async function requestEvaluation(): Promise<void> {
  setBusy(true);
  try {
    const delivery = await bridge.sendFollowUpMessage(__PENDING_MESSAGE__);
    if (delivery.rejected) {
      return fail(
        __SKILLPILOT_LOCALE__ === "de"
          ? "ChatGPT hat die Bewertungsanfrage abgelehnt."
          : "ChatGPT rejected the evaluation request."
      );
    }
    busy = false;
    errorMessage = "";
    statusMessage = delivery.hostAdvertisedTextMessages
      ? __SKILLPILOT_LOCALE__ === "de"
        ? "ChatGPT hat die Bewertungsanfrage über die MCP-Bridge angenommen."
        : "ChatGPT accepted the evaluation request through the MCP bridge."
      : __SKILLPILOT_LOCALE__ === "de"
        ? "ChatGPT hat die Anfrage angenommen, die Nachrichtenfunktion aber nicht angekündigt."
        : "ChatGPT accepted the request without advertising message support.";
    render();
  } catch (error) {
    fail(readError(error));
  }
}

async function applyAfterModelContext(result: ToolResult, context: string): Promise<void> {
  try {
    await bridge.updateModelContext(context);
    applyToolResult(result);
  } catch (error) {
    applyToolResult(result);
    fail(readError(error));
  }
}

function setBusy(value: boolean): void {
  busy = value;
  errorMessage = "";
  statusMessage = "";
  render();
}

function fail(message: string): void {
  busy = false;
  errorMessage = message;
  statusMessage = "";
  render();
}

function readError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) return String(error.message);
  return __SKILLPILOT_LOCALE__ === "de" ? "Die Aktion ist fehlgeschlagen." : "The action failed.";
}

function staleText(): string {
  return __SKILLPILOT_LOCALE__ === "de"
    ? "Diese Ansicht ist nicht mehr aktuell. Bitte öffne den Lerncoach erneut."
    : "This view is no longer current. Please open the learning coach again.";
}

function busyText(phase: CoachView["phase"]): string {
  if (__SKILLPILOT_LOCALE__ === "de") {
    if (phase === "scope-choice") return "Auswahl wird übernommen …";
    if (phase === "awaiting-evaluation") return "Bewertung wird angefordert …";
    return "Lösung wird gespeichert …";
  }
  if (phase === "scope-choice") return "Applying selection …";
  if (phase === "awaiting-evaluation") return "Requesting evaluation …";
  return "Saving answer …";
}

function element(tag: string, className: string): HTMLElement {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function textElement(tag: string, className: string, text: string): HTMLElement {
  const node = element(tag, className);
  node.textContent = text;
  return node;
}
