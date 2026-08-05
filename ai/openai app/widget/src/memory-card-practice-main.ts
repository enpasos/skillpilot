import css from "./memory-card-practice.css";
import { renderMemoryCardContent } from "./memory-card-content";
import {
  MemoryCardPracticeBridge,
  type MemoryCardPracticeToolResult
} from "./memory-card-practice-bridge";
import {
  MEMORY_CARD_PRACTICE_TOOLS,
  type MemoryCardRating
} from "./memory-card-practice-contract";
import {
  MemoryCardSubmissionGate,
  createMemoryCardStartArguments,
  createMemoryCardReviewArguments,
  memoryCardPracticeFromToolResult,
  memoryCardReviewReceiptFromToolResult,
  type MemoryCardPractice,
  type MemoryCardReviewArguments,
  type MemoryCardStartArguments
} from "./memory-card-practice";

type OpenAiCompatibilityWindow = Window & {
  openai?: {
    toolResponseMetadata?: unknown;
    toolOutput?: unknown;
    widgetState?: unknown;
    setWidgetState?: (state: unknown) => void;
  };
};

type OpenAiSetGlobalsEvent = CustomEvent<{
  globals?: {
    toolResponseMetadata?: unknown;
    toolOutput?: unknown;
    widgetState?: unknown;
  };
}>;

type Copy = {
  appTitle: string;
  goalLabel: string;
  progress: (due: number, total: number) => string;
  front: string;
  back: string;
  reveal: string;
  showFront: string;
  notKnown: string;
  known: string;
  ratedNotKnown: string;
  ratedKnown: string;
  previous: string;
  next: string;
  batchComplete: string;
  nextBatch: string;
  cardPosition: (current: number, loaded: number, totalDue: number, hasMore: boolean) => string;
  loading: string;
  saving: string;
  completeTitle: string;
  completeBody: string;
  errorTitle: string;
  errorBody: string;
  retry: string;
  cockpit: string;
};

type MemoryCardPracticeWidgetState = {
  version: 1;
  goalId: string;
  batchStartStateVersion: number;
  expectedStateVersion: number;
  activeCardIndex: number;
  answerRevealed: boolean;
  ratings: Array<MemoryCardRating | null>;
  progress: {
    due: number;
    scheduled: number;
    total: number;
  };
};

const COPY: Record<"de" | "en", Copy> = {
  de: {
    appTitle: "Karteikarten lernen",
    goalLabel: "Lernziel",
    progress: (due, total) => `Heute noch: ${due} von ${total}`,
    front: "Vorderseite",
    back: "Antwort",
    reveal: "Antwort zeigen",
    showFront: "Vorderseite zeigen",
    notKnown: "Noch nicht gewusst",
    known: "Gewusst",
    ratedNotKnown: "Bewertet: Noch nicht gewusst",
    ratedKnown: "Bewertet: Gewusst",
    previous: "Zurück",
    next: "Weiter",
    batchComplete: "Dieser Stapel ist bewertet.",
    nextBatch: "Nächsten Stapel öffnen",
    cardPosition: (current, loaded, totalDue, hasMore) =>
      hasMore
        ? `Karte ${current} von ${loaded} geladen · ${totalDue} heute fällig`
        : `Karte ${current} von ${loaded}`,
    loading: "Karteikarten werden geladen …",
    saving: "Bewertung wird gespeichert …",
    completeTitle: "Für heute geschafft",
    completeBody: "Heute sind keine weiteren Karteikarten fällig.",
    errorTitle: "Karteikartenlernen nicht verfügbar",
    errorBody:
      "Die Übung konnte nicht zuverlässig fortgesetzt werden. Du kannst denselben Versuch wiederholen oder im Cockpit weiterlernen.",
    retry: "Erneut versuchen",
    cockpit: "Im Cockpit öffnen"
  },
  en: {
    appTitle: "Learn with flashcards",
    goalLabel: "Learning goal",
    progress: (due, total) => `Due today: ${due} of ${total}`,
    front: "Front",
    back: "Answer",
    reveal: "Show answer",
    showFront: "Show front",
    notKnown: "Not yet",
    known: "Got it",
    ratedNotKnown: "Rated: Not yet",
    ratedKnown: "Rated: Got it",
    previous: "Previous",
    next: "Next",
    batchComplete: "This batch is rated.",
    nextBatch: "Open next batch",
    cardPosition: (current, loaded, totalDue, hasMore) =>
      hasMore
        ? `Card ${current} of ${loaded} loaded · ${totalDue} due today`
        : `Card ${current} of ${loaded}`,
    loading: "Loading flashcards …",
    saving: "Saving rating …",
    completeTitle: "Done for today",
    completeBody: "No more flashcards are due today.",
    errorTitle: "Flashcard practice unavailable",
    errorBody:
      "Practice could not continue reliably. You can retry the same request or continue in the cockpit.",
    retry: "Try again",
    cockpit: "Open cockpit"
  }
};

const BOOTSTRAP_TIMEOUT_MS = 10_000;
const REVIEW_TIMEOUT_MS = 15_000;

const style = document.createElement("style");
style.textContent = css;
document.head.appendChild(style);

const rootElement = document.querySelector<HTMLElement>("#root");
if (!rootElement) throw new Error("Missing memory-card practice root");
const root: HTMLElement = rootElement;
const compatibilityWindow = window as OpenAiCompatibilityWindow;
const gate = new MemoryCardSubmissionGate();
const bridge = new MemoryCardPracticeBridge(applyToolResult);

let practice: MemoryCardPractice | undefined;
let activeCardIndex = 0;
let answerRevealed = false;
let pendingReview: MemoryCardReviewArguments | undefined;
let pendingBatchRequest: MemoryCardStartArguments | undefined;
let keyboardEnabled = false;
let cardRatings = new Map<string, MemoryCardRating>();
let batchStartStateVersion = 0;
let bootstrapTimer: number | undefined = window.setTimeout(
  () => renderError(undefined, COPY.en),
  BOOTSTRAP_TIMEOUT_MS
);

window.addEventListener(
  "openai:set_globals",
  (event) => {
    const globals = (event as OpenAiSetGlobalsEvent).detail?.globals;
    if (!globals) return;
    if (
      globals.toolResponseMetadata === undefined &&
      globals.toolOutput === undefined
    ) {
      if (
        globals.widgetState !== undefined &&
        practice &&
        restoreSafeWidgetState(globals.widgetState, practice)
      ) {
        renderPractice(practice);
      }
      return;
    }
    acceptToolResult(
      globals.toolResponseMetadata,
      globals.toolOutput ?? compatibilityWindow.openai?.toolOutput,
      globals.widgetState ?? compatibilityWindow.openai?.widgetState
    );
  },
  { passive: true }
);
window.addEventListener("keydown", handleKeyboard);

renderLoading(COPY.en);
acceptToolResult(
  compatibilityWindow.openai?.toolResponseMetadata,
  compatibilityWindow.openai?.toolOutput,
  compatibilityWindow.openai?.widgetState
);
void bridge.ready.catch(() => undefined);

function applyToolResult(result: MemoryCardPracticeToolResult): void {
  // A callServerTool response is applied by submitReview. Some hosts also
  // emit it as a notification; accepting that duplicate here would replace
  // the locally browsable batch and make a rating look like navigation.
  if (pendingReview || pendingBatchRequest) return;
  acceptToolResult(result);
}

function acceptToolResult(
  result: unknown,
  stateVersionSource?: unknown,
  widgetStateSource?: unknown
): void {
  if (pendingReview || pendingBatchRequest) return;
  const next = memoryCardPracticeFromToolResult(result, {
    stateVersionSource,
    allowMetadataStateVersion: practice === undefined
  });
  if (!next) return;
  if (practice && next.expectedStateVersion <= practice.expectedStateVersion) return;
  adoptPractice(next, widgetStateSource);
}

function adoptPractice(next: MemoryCardPractice, widgetStateSource?: unknown): void {
  clearBootstrapTimer();
  practice = next;
  batchStartStateVersion = next.expectedStateVersion;
  activeCardIndex = next.cardBatch.initialIndex;
  answerRevealed = false;
  pendingReview = undefined;
  pendingBatchRequest = undefined;
  cardRatings = new Map();
  restoreSafeWidgetState(widgetStateSource, next);
  document.documentElement.lang = next.communicationLocale;
  persistSafeWidgetState();
  renderPractice(practice);
}

function renderPractice(current: MemoryCardPractice): void {
  const copy = COPY[current.communicationLocale];
  const currentCard = current.cardBatch.cards[activeCardIndex];
  if (current.completed || !currentCard) {
    renderStatus(current, copy, copy.completeTitle, copy.completeBody, false);
    return;
  }

  keyboardEnabled = true;
  const shell = practiceShell(current, copy);
  const stage = element("div", "card-stage");
  const previous = navigationButton(
    copy.previous,
    "previous",
    "ArrowLeft",
    activeCardIndex === 0,
    () => navigateCard(-1)
  );
  const flashcard = element("section", "flashcard");
  flashcard.setAttribute("aria-label", copy.appTitle);
  flashcard.setAttribute("aria-live", "polite");
  flashcard.append(
    cardSide(
      answerRevealed ? copy.back : copy.front,
      answerRevealed ? currentCard.back : currentCard.front
    )
  );
  const next = navigationButton(
    copy.next,
    "next",
    "ArrowRight",
    activeCardIndex >= current.cardBatch.cards.length - 1,
    () => navigateCard(1)
  );
  stage.append(previous, flashcard, next);
  shell.append(stage);

  const position = element("p", "card-position");
  position.setAttribute("aria-live", "polite");
  position.textContent = copy.cardPosition(
    activeCardIndex + 1,
    current.cardBatch.cards.length,
    current.cardBatch.totalDueCards,
    current.cardBatch.hasMore
  );
  shell.append(position);

  const actions = element("div", "actions");
  const flip = button(
    answerRevealed ? copy.showFront : copy.reveal,
    `button${answerRevealed ? "" : " button-primary"}`
  );
  flip.setAttribute("aria-keyshortcuts", "Space");
  flip.addEventListener("click", flipCard);
  actions.append(flip);
  shell.append(actions);

  const rating = cardRatings.get(currentCard.id);
  if (rating) {
    shell.append(ratedCardStatus(rating, copy));
  } else if (answerRevealed) {
    shell.append(ratingButtons(current, currentCard, copy));
  }
  if (allActiveCardsRated(current)) shell.append(batchCompletion(current, copy));

  root.replaceChildren(shell);
}

function ratingButtons(
  current: MemoryCardPractice,
  card: MemoryCardPractice["cardBatch"]["cards"][number],
  copy: Copy
): HTMLElement {
  const actions = element("div", "rating-actions");
  actions.setAttribute("aria-label", current.communicationLocale === "de" ? "Antwort bewerten" : "Rate answer");
  const ratings: Array<[MemoryCardRating, string, string]> = [
    ["not_known", copy.notKnown, "rating-not-known"],
    ["known", copy.known, "rating-known"]
  ];
  for (const [rating, label, modifier] of ratings) {
    const ratingButton = button(label, `button rating-button ${modifier}`);
    ratingButton.addEventListener("click", () => beginReview(current, card, rating, copy));
    actions.append(ratingButton);
  }
  return actions;
}

function ratedCardStatus(rating: MemoryCardRating, copy: Copy): HTMLElement {
  const status = element(
    "p",
    `rated-card-status ${rating === "known" ? "rated-known" : "rated-not-known"}`
  );
  status.setAttribute("role", "status");
  status.textContent = rating === "known" ? copy.ratedKnown : copy.ratedNotKnown;
  return status;
}

function batchCompletion(current: MemoryCardPractice, copy: Copy): HTMLElement {
  const panel = element("div", "batch-complete");
  const text = element("p", "status-copy");
  text.textContent = current.progress.due === 0
    ? copy.completeBody
    : copy.batchComplete;
  panel.append(text);
  if (current.progress.due > 0) {
    const nextBatch = button(copy.nextBatch, "button button-primary");
    nextBatch.addEventListener("click", () => beginNextBatch(current, copy));
    panel.append(nextBatch);
  }
  return panel;
}

function beginNextBatch(current: MemoryCardPractice, copy: Copy): void {
  if (!allActiveCardsRated(current) || current.progress.due === 0) return;
  void loadNextBatch(createMemoryCardStartArguments(current), copy);
}

function beginReview(
  current: MemoryCardPractice,
  card: MemoryCardPractice["cardBatch"]["cards"][number],
  rating: MemoryCardRating,
  copy: Copy
): void {
  if (cardRatings.has(card.id)) return;
  const args = createMemoryCardReviewArguments(current, card, rating, requestId());
  if (!args) return;
  void submitReview(args, copy);
}

async function submitReview(args: MemoryCardReviewArguments, copy: Copy): Promise<void> {
  const generation = gate.begin();
  if (generation === undefined) return;
  // Set this only after acquiring the single-flight gate. A stale second click
  // must not replace the idempotency key used by a possible retry.
  pendingReview = args;
  renderBusy(practice, copy);

  try {
    const result = await withTimeout(
      bridge.callTool(MEMORY_CARD_PRACTICE_TOOLS.review, args),
      REVIEW_TIMEOUT_MS
    );
    if (!gate.isCurrent(generation)) return;
    if (result.isError === true) throw new Error("tool-error");
    const receipt = memoryCardReviewReceiptFromToolResult(result);
    const current = practice;
    if (!receipt) throw new Error("missing-review-receipt");
    if (!current || receipt.goalId !== current.goalId) {
      throw new Error("review-goal-mismatch");
    }
    practice = {
      ...current,
      goalTitle: receipt.goalTitle,
      expectedStateVersion: receipt.expectedStateVersion,
      progress: receipt.progress,
      // Even after the final review, keep the rated card visibly mounted.
      // Completion is communicated in the separate batch status below.
      completed: false,
    };
    cardRatings.set(args.cardId, args.rating);
    answerRevealed = true;
    pendingReview = undefined;
    persistSafeWidgetState();
    renderPractice(practice);
  } catch {
    if (gate.isCurrent(generation)) renderError(practice, copy, true);
  } finally {
    gate.finish(generation);
  }
}

async function loadNextBatch(
  args: MemoryCardStartArguments,
  copy: Copy
): Promise<void> {
  const generation = gate.begin();
  if (generation === undefined) return;
  pendingBatchRequest = args;
  renderBusy(practice, copy, copy.loading);

  try {
    const result = await withTimeout(
      bridge.callTool(MEMORY_CARD_PRACTICE_TOOLS.start, args),
      REVIEW_TIMEOUT_MS
    );
    if (!gate.isCurrent(generation)) return;
    if (result.isError === true) throw new Error("tool-error");
    const next = memoryCardPracticeFromToolResult(result, {
      allowMetadataStateVersion: false
    });
    if (!next) throw new Error("missing-private-card-batch");
    if (next.goalId !== args.goalId) throw new Error("batch-goal-mismatch");
    adoptPractice(next);
  } catch {
    if (gate.isCurrent(generation)) renderError(practice, copy, true);
  } finally {
    gate.finish(generation);
  }
}

function renderLoading(copy: Copy): void {
  keyboardEnabled = false;
  const panel = element("section", "practice-shell status-panel");
  panel.setAttribute("role", "status");
  panel.setAttribute("aria-live", "polite");
  const row = element("div", "loading-row");
  const spinner = element("span", "spinner");
  spinner.setAttribute("aria-hidden", "true");
  const text = element("p", "status-copy");
  text.textContent = copy.loading;
  row.append(spinner, text);
  panel.append(row);
  root.replaceChildren(panel);
}

function renderBusy(
  current: MemoryCardPractice | undefined,
  copy: Copy,
  message = copy.saving
): void {
  keyboardEnabled = false;
  if (!current) {
    renderLoading(copy);
    return;
  }
  const shell = practiceShell(current, copy);
  const panel = element("section", "status-panel");
  panel.setAttribute("role", "status");
  panel.setAttribute("aria-live", "polite");
  const row = element("div", "loading-row");
  const spinner = element("span", "spinner");
  spinner.setAttribute("aria-hidden", "true");
  const text = element("p", "status-copy");
  text.textContent = message;
  row.append(spinner, text);
  panel.append(row);
  shell.append(panel);
  root.replaceChildren(shell);
}

function renderError(
  current: MemoryCardPractice | undefined,
  copy: Copy,
  allowRetry = false
): void {
  keyboardEnabled = false;
  clearBootstrapTimer();
  const shell = current ? practiceShell(current, copy) : element("section", "practice-shell");
  const panel = element("section", "status-panel status-error");
  panel.setAttribute("role", "alert");
  const title = document.createElement("h2");
  title.textContent = copy.errorTitle;
  const body = element("p", "status-copy");
  body.textContent = copy.errorBody;
  const actions = element("div", "error-actions");

  if (allowRetry && (pendingReview || pendingBatchRequest)) {
    const retry = button(copy.retry, "button button-primary");
    retry.addEventListener("click", () => {
      const unchangedReview = pendingReview;
      const unchangedBatchRequest = pendingBatchRequest;
      if (unchangedReview) {
        void submitReview(unchangedReview, copy);
      } else if (unchangedBatchRequest) {
        void loadNextBatch(unchangedBatchRequest, copy);
      }
    });
    actions.append(retry);
  }

  const cockpitUrl = current?.cockpitUrl;
  if (cockpitUrl) {
    const cockpit = button(copy.cockpit, "button");
    cockpit.addEventListener("click", () => {
      void openCockpit(cockpitUrl);
    });
    actions.append(cockpit);
  }
  panel.append(title, body, actions);
  shell.append(panel);
  root.replaceChildren(shell);
}

function renderStatus(
  current: MemoryCardPractice,
  copy: Copy,
  titleText: string,
  bodyText: string,
  isError: boolean
): void {
  keyboardEnabled = false;
  const shell = practiceShell(current, copy);
  const panel = element("section", `status-panel${isError ? " status-error" : ""}`);
  panel.setAttribute("role", isError ? "alert" : "status");
  const title = document.createElement("h2");
  title.textContent = titleText;
  const body = element("p", "status-copy");
  body.textContent = bodyText;
  panel.append(title, body);
  shell.append(panel);
  root.replaceChildren(shell);
}

function practiceShell(current: MemoryCardPractice, copy: Copy): HTMLElement {
  const shell = element("article", "practice-shell");
  const header = element("header", "practice-header");
  const eyebrow = element("p", "eyebrow");
  eyebrow.textContent = `${copy.appTitle} · ${copy.goalLabel}`;
  const title = document.createElement("h1");
  title.textContent = current.goalTitle;
  const progressCopy = element("p", "progress-copy");
  progressCopy.textContent = copy.progress(current.progress.due, current.progress.total);
  const track = element("div", "progress-track");
  track.setAttribute("role", "progressbar");
  track.setAttribute("aria-valuemin", "0");
  track.setAttribute("aria-valuemax", String(current.progress.total));
  track.setAttribute("aria-valuenow", String(current.progress.scheduled));
  const value = element("div", "progress-value");
  const percent = current.progress.total === 0
    ? 100
    : Math.min(100, (current.progress.scheduled / current.progress.total) * 100);
  value.style.width = `${percent}%`;
  track.append(value);
  header.append(eyebrow, title, progressCopy, track);
  shell.append(header);
  return shell;
}

function cardSide(labelText: string, textContent: string): HTMLElement {
  const side = element("div", "card-side");
  const label = element("p", "card-label");
  label.textContent = labelText;
  const text = element("div", "card-text");
  renderMemoryCardContent(text, textContent);
  side.append(label, text);
  return side;
}

function button(label: string, className: string): HTMLButtonElement {
  const result = document.createElement("button");
  result.type = "button";
  result.className = className;
  result.textContent = label;
  return result;
}

function navigationButton(
  label: string,
  direction: "previous" | "next",
  shortcut: "ArrowLeft" | "ArrowRight",
  disabled: boolean,
  onClick: () => void
): HTMLButtonElement {
  const result = button(label, `navigation-button navigation-${direction}`);
  result.disabled = disabled;
  result.setAttribute("aria-keyshortcuts", shortcut);
  result.addEventListener("click", onClick);
  return result;
}

function flipCard(): void {
  const current = practice;
  if (!keyboardEnabled || !current?.cardBatch.cards[activeCardIndex]) return;
  answerRevealed = !answerRevealed;
  persistSafeWidgetState();
  renderPractice(current);
}

function navigateCard(offset: -1 | 1): void {
  const current = practice;
  if (!keyboardEnabled || !current) return;
  const nextIndex = activeCardIndex + offset;
  if (nextIndex < 0 || nextIndex >= current.cardBatch.cards.length) return;
  activeCardIndex = nextIndex;
  answerRevealed = false;
  persistSafeWidgetState();
  renderPractice(current);
}

function allActiveCardsRated(current: MemoryCardPractice): boolean {
  return current.cardBatch.cards.length > 0 &&
    current.cardBatch.cards.every((card) => cardRatings.has(card.id));
}

function handleKeyboard(event: KeyboardEvent): void {
  if (
    !keyboardEnabled ||
    event.defaultPrevented ||
    event.repeat ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    isInteractiveTarget(event.target)
  ) {
    return;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    navigateCard(-1);
    return;
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    navigateCard(1);
    return;
  }
  if (event.key === " " || event.code === "Space") {
    event.preventDefault();
    flipCard();
  }
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  const candidate = target as HTMLElement | null;
  const tagName = candidate?.tagName?.toLowerCase();
  return candidate?.isContentEditable === true ||
    tagName === "button" ||
    tagName === "a" ||
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select";
}

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string
): HTMLElementTagNameMap[K] {
  const result = document.createElement(tag);
  result.className = className;
  return result;
}

async function openCockpit(url: string): Promise<void> {
  try {
    const opened = await withTimeout(bridge.openLink(url), 5_000);
    if (opened) return;
  } catch {
    // Fall through to the browser-compatible link attempt.
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

function persistSafeWidgetState(): void {
  const current = practice;
  if (!current) return;
  try {
    const state: MemoryCardPracticeWidgetState = {
      version: 1,
      goalId: current.goalId,
      batchStartStateVersion,
      expectedStateVersion: current.expectedStateVersion,
      activeCardIndex,
      answerRevealed,
      ratings: current.cardBatch.cards.map(
        (card) => cardRatings.get(card.id) ?? null
      ),
      progress: { ...current.progress }
    };
    compatibilityWindow.openai?.setWidgetState?.(state);
  } catch {
    // Host persistence is optional. Private cards, session data, and review
    // capabilities remain exclusively in the current result _meta.
  }
}

function restoreSafeWidgetState(
  value: unknown,
  current: MemoryCardPractice
): boolean {
  const candidate = objectRecord(value);
  const progress = objectRecord(candidate?.progress);
  if (
    candidate?.version !== 1 ||
    candidate.goalId !== current.goalId ||
    candidate.batchStartStateVersion !== batchStartStateVersion ||
    !isNonNegativeInteger(candidate.expectedStateVersion) ||
    candidate.expectedStateVersion < current.expectedStateVersion ||
    !isNonNegativeInteger(candidate.activeCardIndex) ||
    candidate.activeCardIndex >= current.cardBatch.cards.length ||
    typeof candidate.answerRevealed !== "boolean" ||
    !Array.isArray(candidate.ratings) ||
    candidate.ratings.length !== current.cardBatch.cards.length ||
    !isNonNegativeInteger(progress?.due) ||
    !isNonNegativeInteger(progress?.scheduled) ||
    !isNonNegativeInteger(progress?.total) ||
    progress.total !== current.progress.total ||
    progress.due > current.progress.due ||
    progress.scheduled < current.progress.scheduled ||
    progress.due > progress.total ||
    progress.scheduled > progress.total
  ) {
    return false;
  }

  const restoredRatings = new Map<string, MemoryCardRating>();
  for (let index = 0; index < candidate.ratings.length; index += 1) {
    const rating = candidate.ratings[index];
    if (rating === null) continue;
    if (rating !== "known" && rating !== "not_known") return false;
    const card = current.cardBatch.cards[index];
    if (!card) return false;
    restoredRatings.set(card.id, rating);
  }

  practice = {
    ...current,
    expectedStateVersion: candidate.expectedStateVersion,
    progress: {
      due: progress.due,
      scheduled: progress.scheduled,
      total: progress.total
    }
  };
  activeCardIndex = candidate.activeCardIndex;
  answerRevealed = candidate.answerRevealed;
  cardRatings = restoredRatings;
  return true;
}

function objectRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function requestId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `memory-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("timeout")), timeoutMs);
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

function clearBootstrapTimer(): void {
  if (bootstrapTimer === undefined) return;
  window.clearTimeout(bootstrapTimer);
  bootstrapTimer = undefined;
}
