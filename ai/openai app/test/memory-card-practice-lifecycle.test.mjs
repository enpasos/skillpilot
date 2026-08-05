import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const learningSessionId = `sps_${"A".repeat(43)}`;

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.listeners = new Map();
    this.attributes = new Map();
    this.className = "";
    this.textContent = "";
    this.style = {};
    this.disabled = false;
    this.isContentEditable = false;
    this.classList = {
      add: (...names) => {
        this.className = [this.className, ...names].filter(Boolean).join(" ");
      }
    };
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatch(type, event = {}) {
    if (type === "click" && this.disabled) return;
    for (const listener of this.listeners.get(type) ?? []) {
      listener({ type, target: this, ...event });
    }
  }

  append(...children) {
    this.children.push(...children);
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  replaceChildren(...children) {
    this.children = children;
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }
}

async function buildLifecycleSource() {
  const result = await build({
    entryPoints: [join(root, "widget/src/memory-card-practice-main.ts")],
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "es2022",
    write: false,
    loader: { ".css": "text" },
    define: {
      __TOOL_MEMORY_CARD_START__: JSON.stringify("start_skillpilot_memory_practice"),
      __TOOL_MEMORY_CARD_REVIEW__: JSON.stringify(
        "review_skillpilot_memory_practice_card"
      )
    },
    plugins: [
      {
        name: "memory-card-practice-test-bridge",
        setup(esbuild) {
          esbuild.onResolve(
            { filter: /memory-card-practice-bridge$/ },
            () => ({ path: "memory-card-practice-bridge", namespace: "test" })
          );
          esbuild.onLoad(
            { filter: /.*/, namespace: "test" },
            () => ({
              loader: "ts",
              contents: `
                export type MemoryCardPracticeToolResult = {
                  structuredContent?: unknown;
                  _meta?: Record<string, unknown>;
                  isError?: boolean;
                };
                export class MemoryCardPracticeBridge {
                  ready = Promise.resolve();
                  constructor(onToolResult: (result: MemoryCardPracticeToolResult) => void) {
                    globalThis.__deliverToolResult = onToolResult;
                  }
                  callTool(name: string, args: Record<string, unknown>) {
                    globalThis.__toolCalls.push({ name, args });
                    return globalThis.__toolHandler(name, args);
                  }
                  openLink(url: string) {
                    globalThis.__openedLinks.push(url);
                    return Promise.resolve(true);
                  }
                }
              `
            })
          );
        }
      }
    ]
  });
  const script = result.outputFiles.find((file) =>
    file.text.includes("Missing memory-card practice root")
  );
  assert.ok(script);
  return script.text;
}

const lifecycleSource = await buildLifecycleSource();

function card(id, front, back, capabilityCharacter = "B") {
  return {
    id,
    front,
    back,
    reviewCapability: capabilityCharacter.repeat(43)
  };
}

function practiceResult({
  cards = [
    card("card-1", "Front one", "Back one", "B"),
    card("card-2", "Front two", "Back two", "C")
  ],
  stateVersion = 7,
  due = 4,
  scheduled = 1,
  total = 5,
  hasMore = due > cards.length
} = {}) {
  return {
    structuredContent: { stateVersion },
    _meta: {
      skillpilotMemoryCard: {
        communicationLocale: "de",
        learningSessionId,
        goalId: "memory-goal",
        goalTitle: "Lernkarten – Funktionen und Gleichungen",
        progress: { total, due, scheduled },
        cockpitUrl: "https://skillpilot.com/?goal=memory-goal",
        completed: due === 0,
        cardBatch: {
          cards,
          initialIndex: 0,
          totalDueCards: due,
          hasMore
        }
      }
    }
  };
}

function reviewReceipt({ stateVersion, due, scheduled, completed = due === 0 }) {
  return {
    structuredContent: {
      contractMajor: 1,
      stateVersion,
      status: completed ? "complete" : "ready",
      goalId: "memory-goal",
      goalTitle: "Lernkarten – Funktionen und Gleichungen",
      progress: { totalCards: 5, dueCards: due, scheduledCards: scheduled },
      completed
    }
  };
}

function createHarness({ initialPayload = true, widgetState } = {}) {
  const rootElement = new FakeElement("main");
  const timers = new Map();
  const widgetStates = [];
  const windowListeners = new Map();
  let nextTimerId = 1;
  let nextRequestId = 1;
  let toolHandler = () => new Promise(() => undefined);

  const context = {
    URL,
    Promise,
    console,
    Date,
    Math,
    __toolCalls: [],
    __openedLinks: [],
    __toolHandler(name, args) {
      return toolHandler(name, args);
    },
    crypto: {
      randomUUID() {
        return `request-${nextRequestId++}`;
      }
    },
    document: {
      head: new FakeElement("head"),
      documentElement: new FakeElement("html"),
      compatMode: "CSS1Compat",
      createElement(tagName) {
        return new FakeElement(tagName);
      },
      createTextNode(text) {
        const node = new FakeElement("#text");
        node.textContent = String(text);
        return node;
      },
      querySelector(selector) {
        return selector === "#root" ? rootElement : null;
      }
    },
    setTimeout(callback) {
      const id = nextTimerId++;
      timers.set(id, callback);
      return id;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
    addEventListener(type, listener) {
      const listeners = windowListeners.get(type) ?? [];
      listeners.push(listener);
      windowListeners.set(type, listeners);
    },
    open() {}
  };
  context.window = context;
  context.globalThis = context;
  context.parent = context;
  const initial = initialPayload ? practiceResult() : undefined;
  context.openai = {
    ...(initial
      ? {
          toolResponseMetadata: { _meta: initial._meta },
          toolOutput: initial.structuredContent
        }
      : {}),
    ...(widgetState === undefined ? {} : { widgetState }),
    setWidgetState(state) {
      widgetStates.push(state);
    }
  };

  vm.runInNewContext(lifecycleSource, context, {
    filename: "memory-card-practice-main.test-bundle.js"
  });

  return {
    context,
    rootElement,
    timers,
    widgetStates,
    dispatchWindow(type, event = {}) {
      let defaultPrevented = false;
      const completeEvent = {
        type,
        target: null,
        defaultPrevented: false,
        repeat: false,
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        preventDefault() {
          defaultPrevented = true;
          this.defaultPrevented = true;
        },
        ...event
      };
      for (const listener of windowListeners.get(type) ?? []) listener(completeEvent);
      return defaultPrevented;
    },
    setToolHandler(handler) {
      toolHandler = handler;
    }
  };
}

function findByText(rootElement, text) {
  const queue = [rootElement];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current?.textContent === text) return current;
    queue.push(...(current?.children ?? []));
  }
  return undefined;
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

test("local browsing and keyboard shortcuts never rate or write", () => {
  const harness = createHarness();
  assert.ok(findByText(harness.rootElement, "Front one"));
  assert.equal(findByText(harness.rootElement, "Zurück").disabled, true);
  assert.equal(findByText(harness.rootElement, "Weiter").disabled, false);

  assert.equal(harness.dispatchWindow("keydown", { key: "ArrowRight", code: "ArrowRight" }), true);
  assert.ok(findByText(harness.rootElement, "Front two"));
  assert.equal(findByText(harness.rootElement, "Weiter").disabled, true);
  assert.deepEqual(harness.context.__toolCalls, []);

  harness.dispatchWindow("keydown", { key: "ArrowLeft", code: "ArrowLeft" });
  assert.ok(findByText(harness.rootElement, "Front one"));
  harness.dispatchWindow("keydown", { key: " ", code: "Space" });
  assert.ok(findByText(harness.rootElement, "Back one"));
  assert.deepEqual(harness.context.__toolCalls, []);

  const gotIt = findByText(harness.rootElement, "Gewusst");
  harness.dispatchWindow("keydown", {
    key: "ArrowRight",
    code: "ArrowRight",
    target: gotIt
  });
  assert.ok(findByText(harness.rootElement, "Back one"), "button-focused keys are ignored");
});

test("rating locks the visible card, never auto-advances, and next batch is explicit", async () => {
  const harness = createHarness();
  harness.setToolHandler((name, args) => {
    if (name === "review_skillpilot_memory_practice_card") {
      return Promise.resolve(
        args.cardId === "card-1"
          ? reviewReceipt({ stateVersion: 8, due: 3, scheduled: 2 })
          : reviewReceipt({ stateVersion: 9, due: 2, scheduled: 3 })
      );
    }
    if (name === "start_skillpilot_memory_practice") {
      return Promise.resolve(practiceResult({
        cards: [
          card("card-3", "Front three", "Back three", "D"),
          card("card-4", "Front four", "Back four", "E")
        ],
        stateVersion: 9,
        due: 2,
        scheduled: 3,
        hasMore: false
      }));
    }
    throw new Error(`unexpected tool ${name}`);
  });

  findByText(harness.rootElement, "Antwort zeigen").dispatch("click");
  const known = findByText(harness.rootElement, "Gewusst");
  known.dispatch("click");
  known.dispatch("click");
  await flushPromises();

  assert.equal(harness.context.__toolCalls.length, 1, "double click stays single-flight");
  assert.deepEqual(JSON.parse(JSON.stringify(harness.context.__toolCalls[0])), {
    name: "review_skillpilot_memory_practice_card",
    args: {
      learningSessionId,
      goalId: "memory-goal",
      cardId: "card-1",
      reviewCapability: "B".repeat(43),
      rating: "known",
      expectedStateVersion: 7,
      clientRequestId: "request-1"
    }
  });
  assert.ok(findByText(harness.rootElement, "Back one"), "rating must not advance");
  assert.ok(findByText(harness.rootElement, "Bewertet: Gewusst"));
  assert.equal(findByText(harness.rootElement, "Noch nicht gewusst"), undefined);

  findByText(harness.rootElement, "Weiter").dispatch("click");
  assert.ok(findByText(harness.rootElement, "Front two"));
  assert.equal(harness.context.__toolCalls.length, 1, "navigation is local");
  findByText(harness.rootElement, "Antwort zeigen").dispatch("click");
  findByText(harness.rootElement, "Noch nicht gewusst").dispatch("click");
  await flushPromises();

  assert.ok(findByText(harness.rootElement, "Back two"));
  assert.ok(findByText(harness.rootElement, "Bewertet: Noch nicht gewusst"));
  const nextBatch = findByText(harness.rootElement, "Nächsten Stapel öffnen");
  assert.ok(nextBatch, "all locally loaded cards expose an explicit reload");
  assert.equal(harness.context.__toolCalls.length, 2);

  nextBatch.dispatch("click");
  await flushPromises();
  assert.equal(harness.context.__toolCalls.length, 3);
  assert.deepEqual(JSON.parse(JSON.stringify(harness.context.__toolCalls[2])), {
    name: "start_skillpilot_memory_practice",
    args: { learningSessionId, goalId: "memory-goal", expectedStateVersion: 9 }
  });
  assert.ok(findByText(harness.rootElement, "Front three"));
  assert.ok(
    harness.widgetStates.every((state) => {
      const serialized = JSON.stringify(state);
      return !/(cardId|front|back|learningSessionId|reviewCapability)/.test(serialized);
    }),
    "widget persistence must not copy private card, session, or capability data"
  );
});

test("a REVIEW replay without _meta is accepted as success", async () => {
  const harness = createHarness();
  harness.setToolHandler(() => Promise.resolve(
    reviewReceipt({ stateVersion: 8, due: 3, scheduled: 2 })
  ));
  findByText(harness.rootElement, "Antwort zeigen").dispatch("click");
  findByText(harness.rootElement, "Gewusst").dispatch("click");
  await flushPromises();

  assert.ok(findByText(harness.rootElement, "Bewertet: Gewusst"));
  assert.equal(findByText(harness.rootElement, "Karteikartenlernen nicht verfügbar"), undefined);
});

test("safe widget state restores position and ratings without persisting private batch data", async () => {
  const first = createHarness();
  first.setToolHandler(() => Promise.resolve(
    reviewReceipt({ stateVersion: 8, due: 3, scheduled: 2 })
  ));
  findByText(first.rootElement, "Antwort zeigen").dispatch("click");
  findByText(first.rootElement, "Gewusst").dispatch("click");
  await flushPromises();

  const persisted = first.widgetStates.at(-1);
  assert.ok(persisted);
  assert.deepEqual(JSON.parse(JSON.stringify(persisted)), {
    version: 1,
    goalId: "memory-goal",
    batchStartStateVersion: 7,
    expectedStateVersion: 8,
    activeCardIndex: 0,
    answerRevealed: true,
    ratings: ["known", null],
    progress: { due: 3, scheduled: 2, total: 5 }
  });
  assert.doesNotMatch(
    JSON.stringify(persisted),
    /(cardId|front|back|learningSessionId|reviewCapability)/
  );

  const restored = createHarness({ widgetState: persisted });
  assert.ok(findByText(restored.rootElement, "Back one"));
  assert.ok(findByText(restored.rootElement, "Bewertet: Gewusst"));
  restored.setToolHandler(() => Promise.resolve(
    reviewReceipt({ stateVersion: 9, due: 2, scheduled: 3 })
  ));
  findByText(restored.rootElement, "Weiter").dispatch("click");
  findByText(restored.rootElement, "Antwort zeigen").dispatch("click");
  findByText(restored.rootElement, "Noch nicht gewusst").dispatch("click");
  await flushPromises();

  assert.deepEqual(
    JSON.parse(JSON.stringify(restored.context.__toolCalls[0].args)),
    {
      learningSessionId,
      goalId: "memory-goal",
      cardId: "card-2",
      reviewCapability: "C".repeat(43),
      rating: "not_known",
      expectedStateVersion: 8,
      clientRequestId: "request-1"
    }
  );
});

test("review timeout ends visibly and retries the identical idempotent request", async () => {
  const harness = createHarness();
  findByText(harness.rootElement, "Antwort zeigen").dispatch("click");
  findByText(harness.rootElement, "Noch nicht gewusst").dispatch("click");

  assert.equal(harness.timers.size, 1);
  [...harness.timers.values()][0]();
  await flushPromises();

  assert.ok(findByText(harness.rootElement, "Karteikartenlernen nicht verfügbar"));
  assert.ok(findByText(harness.rootElement, "Im Cockpit öffnen"));
  const retry = findByText(harness.rootElement, "Erneut versuchen");
  assert.ok(retry);
  retry.dispatch("click");

  assert.equal(harness.context.__toolCalls.length, 2);
  assert.deepEqual(
    harness.context.__toolCalls[1].args,
    harness.context.__toolCalls[0].args,
    "retry reuses card, rating, version, and clientRequestId"
  );
  assert.equal(harness.context.__toolCalls[0].args.rating, "not_known");
});

test("bootstrap failure terminates without inventing a generic cockpit URL", async () => {
  const harness = createHarness({ initialPayload: false });
  assert.equal(harness.timers.size, 1);
  [...harness.timers.values()][0]();
  await flushPromises();

  assert.ok(findByText(harness.rootElement, "Flashcard practice unavailable"));
  assert.equal(findByText(harness.rootElement, "Open cockpit"), undefined);
  assert.deepEqual(harness.context.__openedLinks, []);
});
