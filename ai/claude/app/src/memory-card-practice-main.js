import css from "./memory-card-practice.css";
import { renderMemoryCardContent } from "./memory-card-content.js";
import { MEMORY_CARD_COPY } from "./memory-card-copy.js";
import { MEMORY_CARD_PRACTICE_TOOLS } from "./memory-card-practice-contract.js";
import {
  MemoryCardSubmissionGate,
  createMemoryCardReviewArguments,
  createMemoryCardStartArguments,
  memoryCardPracticeFromToolResult,
  memoryCardReviewReceiptFromToolResult
} from "./memory-card-practice.js";
import { SkillPilotMcpAppBridge } from "./mcp-app-bridge.js";

const BOOTSTRAP_TIMEOUT_MS = 10_000;
const TOOL_TIMEOUT_MS = 15_000;

const style = document.createElement("style");
style.textContent = css;
document.head.append(style);

const root = document.querySelector("#root");
if (!(root instanceof HTMLElement)) throw new Error("Missing app root");

const gate = new MemoryCardSubmissionGate();
let practice;
let activeCardIndex = 0;
let answerRevealed = false;
let cardRatings = new Map();
let pendingReview;
let pendingBatchRequest;
let keyboardEnabled = false;
let bootstrapTimer = window.setTimeout(
  () => renderError(undefined, MEMORY_CARD_COPY.en, false),
  BOOTSTRAP_TIMEOUT_MS
);

const bridge = new SkillPilotMcpAppBridge(
  "skillpilot-claude-memory-card-practice",
  applyToolResult
);
void bridge.ready.catch(() => renderError(practice, copyFor(practice), false));
window.addEventListener("keydown", handleKeyboard);
renderLoading(MEMORY_CARD_COPY.en);

function applyToolResult(result) {
  if (pendingReview || pendingBatchRequest) return;
  const next = memoryCardPracticeFromToolResult(result, {
    allowMetadataStateVersion: practice === undefined
  });
  if (!next) return;
  if (practice && next.expectedStateVersion <= practice.expectedStateVersion) return;
  adoptPractice(next);
}

function adoptPractice(next) {
  window.clearTimeout(bootstrapTimer);
  practice = next;
  activeCardIndex = 0;
  answerRevealed = false;
  cardRatings = new Map();
  pendingReview = undefined;
  pendingBatchRequest = undefined;
  document.documentElement.lang = next.communicationLocale;
  renderPractice(next);
}

function renderPractice(current) {
  const copy = copyFor(current);
  const card = current.cardBatch.cards[activeCardIndex];
  if (current.completed || !card) {
    renderStatus(current, copy, copy.completeTitle, copy.completeBody);
    return;
  }

  keyboardEnabled = true;
  const shell = practiceShell(current, copy);
  const stage = element("section", "card-stage");
  stage.setAttribute("aria-live", "polite");

  const side = element("div", "card-side");
  const label = element("p", "card-label");
  label.textContent = answerRevealed ? copy.back : copy.front;
  const text = element("div", "card-text");
  renderMemoryCardContent(text, answerRevealed ? card.back : card.front);
  side.append(label, text);
  stage.append(side);
  shell.append(stage);

  const position = element("p", "card-position");
  position.textContent = copy.position(
    activeCardIndex + 1,
    current.cardBatch.cards.length
  );
  shell.append(position);

  const navigation = element("div", "navigation-actions");
  navigation.append(
    actionButton(copy.previous, "button button-subtle", () => navigate(-1), {
      disabled: activeCardIndex === 0
    }),
    actionButton(copy.next, "button button-subtle", () => navigate(1), {
      disabled: activeCardIndex >= current.cardBatch.cards.length - 1
    })
  );
  shell.append(navigation);

  const rating = cardRatings.get(card.id);
  if (rating) {
    const status = element(
      "p",
      `rated-status ${rating === "known" ? "rated-known" : "rated-not-known"}`
    );
    status.setAttribute("role", "status");
    status.textContent = rating === "known" ? copy.ratedKnown : copy.ratedNotKnown;
    shell.append(status);
  } else if (answerRevealed) {
    const actions = element("div", "rating-actions");
    actions.append(
      actionButton(copy.notKnown, "button rating-not-known", () => {
        beginReview(current, card, "not_known", copy);
      }),
      actionButton(copy.known, "button rating-known", () => {
        beginReview(current, card, "known", copy);
      })
    );
    shell.append(actions);
  } else {
    const actions = element("div", "primary-actions");
    actions.append(
      actionButton(copy.reveal, "button button-primary", flipCard)
    );
    shell.append(actions);
  }

  if (allCardsRated(current)) shell.append(batchCompletion(current, copy));
  show(shell);
}

function practiceShell(current, copy) {
  const shell = element("article", "practice-shell");
  const header = element("header", "practice-header");
  const eyebrow = element("p", "eyebrow");
  eyebrow.textContent = copy.appTitle;
  const title = element("h1", "goal-title");
  title.textContent = current.goalTitle;
  const progress = element("p", "progress-copy");
  progress.textContent = copy.progress(current.progress.due, current.progress.total);
  const track = element("div", "progress-track");
  track.setAttribute("role", "progressbar");
  track.setAttribute("aria-label", progress.textContent);
  track.setAttribute("aria-valuemin", "0");
  track.setAttribute("aria-valuemax", String(current.progress.total));
  track.setAttribute(
    "aria-valuenow",
    String(Math.max(0, current.progress.total - current.progress.due))
  );
  const fill = element("div", "progress-value");
  const percent = current.progress.total === 0
    ? 100
    : Math.max(0, Math.min(100,
      ((current.progress.total - current.progress.due) / current.progress.total) * 100));
  fill.style.width = `${percent}%`;
  track.append(fill);
  header.append(eyebrow, title, progress, track);
  shell.append(header);
  return shell;
}

function batchCompletion(current, copy) {
  const panel = element("section", "batch-complete");
  const message = element("p", "status-copy");
  message.textContent = current.progress.due === 0
    ? copy.completeBody
    : copy.batchComplete;
  panel.append(message);
  if (current.progress.due > 0) {
    panel.append(actionButton(copy.nextBatch, "button button-primary", () => {
      beginNextBatch(current, copy);
    }));
  }
  return panel;
}

function beginReview(current, card, rating, copy) {
  if (!answerRevealed || cardRatings.has(card.id)) return;
  const args = createMemoryCardReviewArguments(
    current,
    card,
    rating,
    crypto.randomUUID()
  );
  if (args) void submitReview(args, copy);
}

async function submitReview(args, copy) {
  const generation = gate.begin();
  if (generation === undefined) return;
  pendingReview = args;
  renderBusy(practice, copy, copy.saving);

  try {
    const result = await withTimeout(
      bridge.callTool(MEMORY_CARD_PRACTICE_TOOLS.review, args),
      TOOL_TIMEOUT_MS
    );
    if (!gate.isCurrent(generation)) return;
    if (result.isError === true) throw new Error("review-failed");
    const receipt = memoryCardReviewReceiptFromToolResult(result);
    const current = practice;
    if (
      !receipt
      || !current
      || receipt.goalId !== current.goalId
      || receipt.expectedStateVersion <= current.expectedStateVersion
    ) {
      throw new Error("invalid-review-receipt");
    }
    practice = {
      ...current,
      goalTitle: receipt.goalTitle,
      expectedStateVersion: receipt.expectedStateVersion,
      progress: receipt.progress,
      completed: false
    };
    cardRatings.set(args.cardId, args.rating);
    pendingReview = undefined;
    renderPractice(practice);
  } catch {
    if (gate.isCurrent(generation)) renderError(practice, copy, true);
  } finally {
    gate.finish(generation);
  }
}

function beginNextBatch(current, copy) {
  if (!allCardsRated(current) || current.progress.due === 0) return;
  void loadNextBatch(createMemoryCardStartArguments(current), copy);
}

async function loadNextBatch(args, copy) {
  const generation = gate.begin();
  if (generation === undefined) return;
  pendingBatchRequest = args;
  renderBusy(practice, copy, copy.loading);
  try {
    const result = await withTimeout(
      bridge.callTool(MEMORY_CARD_PRACTICE_TOOLS.start, args),
      TOOL_TIMEOUT_MS
    );
    if (!gate.isCurrent(generation)) return;
    if (result.isError === true) throw new Error("batch-failed");
    const next = memoryCardPracticeFromToolResult(result, {
      allowMetadataStateVersion: false
    });
    if (!next || next.goalId !== args.goalId) throw new Error("invalid-batch");
    adoptPractice(next);
  } catch {
    if (gate.isCurrent(generation)) renderError(practice, copy, true);
  } finally {
    gate.finish(generation);
  }
}

function renderLoading(copy) {
  keyboardEnabled = false;
  const panel = statusPanel(copy.loading);
  panel.setAttribute("aria-busy", "true");
  show(panel);
}

function renderBusy(current, copy, message) {
  keyboardEnabled = false;
  const shell = current ? practiceShell(current, copy) : element("article", "practice-shell");
  const panel = statusPanel(message);
  panel.setAttribute("aria-busy", "true");
  shell.append(panel);
  show(shell);
}

function renderStatus(current, copy, titleText, bodyText) {
  keyboardEnabled = false;
  const shell = current ? practiceShell(current, copy) : element("article", "practice-shell");
  const panel = element("section", "status-panel");
  const title = element("h2", "status-title");
  title.textContent = titleText;
  const body = element("p", "status-copy");
  body.textContent = bodyText;
  panel.append(title, body);
  show(shell, panel);
}

function renderError(current, copy, retryable) {
  keyboardEnabled = false;
  const shell = current ? practiceShell(current, copy) : element("article", "practice-shell");
  const panel = element("section", "status-panel error-panel");
  panel.setAttribute("role", "alert");
  const title = element("h2", "status-title");
  title.textContent = copy.errorTitle;
  const body = element("p", "status-copy");
  body.textContent = copy.errorBody;
  const actions = element("div", "error-actions");
  if (retryable && (pendingReview || pendingBatchRequest)) {
    actions.append(actionButton(copy.retry, "button button-primary", () => {
      if (pendingReview) void submitReview(pendingReview, copy);
      else if (pendingBatchRequest) void loadNextBatch(pendingBatchRequest, copy);
    }));
  }
  panel.append(title, body, actions);
  show(shell, panel);
}

function statusPanel(message) {
  const panel = element("section", "status-panel");
  panel.setAttribute("role", "status");
  panel.setAttribute("aria-live", "polite");
  const body = element("p", "status-copy");
  body.textContent = message;
  panel.append(body);
  return panel;
}

function show(shell, child) {
  if (child) shell.append(child);
  root.replaceChildren(shell);
  root.hidden = false;
}

function flipCard() {
  if (!practice) return;
  answerRevealed = !answerRevealed;
  renderPractice(practice);
}

function navigate(delta) {
  if (!practice) return;
  const target = activeCardIndex + delta;
  if (target < 0 || target >= practice.cardBatch.cards.length) return;
  activeCardIndex = target;
  answerRevealed = false;
  renderPractice(practice);
}

function handleKeyboard(event) {
  if (!keyboardEnabled || !practice || isEditable(event.target)) return;
  if (event.key === "ArrowLeft") navigate(-1);
  else if (event.key === "ArrowRight") navigate(1);
  else if (event.key === " " || event.key === "Enter") flipCard();
  else return;
  event.preventDefault();
}

function isEditable(target) {
  return target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement
    || (target instanceof HTMLElement && target.isContentEditable);
}

function allCardsRated(current) {
  return current.cardBatch.cards.length > 0
    && current.cardBatch.cards.every((card) => cardRatings.has(card.id));
}

function copyFor(current) {
  return MEMORY_CARD_COPY[current?.communicationLocale ?? "en"];
}

function element(tagName, className) {
  const node = document.createElement(tagName);
  node.className = className;
  return node;
}

function actionButton(label, className, onClick, { disabled = false } = {}) {
  const control = document.createElement("button");
  control.type = "button";
  control.className = className;
  control.textContent = label;
  control.disabled = disabled;
  control.addEventListener("click", onClick);
  return control;
}

function withTimeout(promise, milliseconds) {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("timeout")), milliseconds);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      }
    );
  });
}
