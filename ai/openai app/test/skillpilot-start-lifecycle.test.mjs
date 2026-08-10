import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const learningSessionId = `sps_${"A".repeat(43)}`;
const setupCapability = `spc_${"B".repeat(43)}`;
const skillpilotId = "1c90a010-170f-4d48-b624-b0002c591d31";
const requestId = "11111111-1111-4111-8111-111111111111";
const secondRequestId = "22222222-2222-4222-8222-222222222222";
const handoffRetentionMs = 15 * 60 * 1_000;

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.listeners = new Map();
    this.attributes = new Map();
    this.className = "";
    this.textContent = "";
    this.type = "";
    this.name = "";
    this.value = "";
    this.checked = false;
    this.disabled = false;
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
    entryPoints: [join(root, "widget/src/skillpilot-start-main.ts")],
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "es2022",
    write: false,
    loader: { ".css": "text" },
    plugins: [
      {
        name: "skillpilot-start-test-bridge",
        setup(esbuild) {
          esbuild.onResolve(
            { filter: /skillpilot-start-bridge$/ },
            () => ({ path: "skillpilot-start-bridge", namespace: "test" })
          );
          esbuild.onLoad(
            { filter: /.*/, namespace: "test" },
            () => ({
              loader: "ts",
              contents: `
                import type { SkillPilotCapabilityArguments } from "./skillpilot-start";
                export type SkillPilotStartToolResult = {
                  structuredContent?: unknown;
                  _meta?: Record<string, unknown>;
                  isError?: boolean;
                };
                export type SkillPilotStartHostSupport = {
                  serverTools: boolean;
                  textMessages: boolean;
                  openLinks: boolean;
                };
                export class SkillPilotStartBridge {
                  ready = Promise.resolve();
                  constructor(onToolResult: (result: SkillPilotStartToolResult) => void) {
                    globalThis.__deliverToolResult = onToolResult;
                  }
                  hostSupport(): Promise<SkillPilotStartHostSupport> {
                    return Promise.resolve(globalThis.__hostSupport);
                  }
                  beginAttempt() {}
                  issueCapability(args: SkillPilotCapabilityArguments) {
                    globalThis.__toolCalls.push({
                      name: "issue_skillpilot_start_capability",
                      arguments: args
                    });
                    return globalThis.__issueHandler(args);
                  }
                  sendStartMessage(text: string) {
                    globalThis.__messages.push(text);
                    return globalThis.__messageHandler(text);
                  }
                  openLink(url: string) {
                    globalThis.__openedLinks.push(url);
                    return Promise.resolve(globalThis.__openLinkResult);
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
    file.text.includes("Missing SkillPilot start root")
  );
  assert.ok(script);
  return script.text;
}

const lifecycleSource = await buildLifecycleSource();

async function buildChatGptCompatibilityLifecycleSource() {
  const result = await build({
    entryPoints: [join(root, "widget/src/skillpilot-start-main.ts")],
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "es2022",
    write: false,
    loader: { ".css": "text" },
    plugins: [
      {
        name: "skillpilot-start-compatibility-sdk",
        setup(esbuild) {
          esbuild.onResolve(
            { filter: /^@modelcontextprotocol\/ext-apps$/ },
            () => ({ path: "ext-apps", namespace: "test" })
          );
          esbuild.onLoad(
            { filter: /.*/, namespace: "test" },
            () => ({
              loader: "js",
              contents: `
                export class App {
                  connect() {
                    globalThis.__standardConnects += 1;
                    return Promise.resolve();
                  }
                  getHostCapabilities() {
                    return {};
                  }
                  callServerTool(params) {
                    globalThis.__standardToolCalls.push(params);
                    return Promise.reject(new Error("unexpected-standard-tool-call"));
                  }
                  sendMessage(params) {
                    globalThis.__standardMessages.push(params);
                    return Promise.reject(new Error("unexpected-standard-message"));
                  }
                  openLink(params) {
                    globalThis.__standardOpenedLinks.push(params);
                    return Promise.reject(new Error("unexpected-standard-link"));
                  }
                }
                export class PostMessageTransport {
                  constructor() {}
                }
              `
            })
          );
        }
      }
    ]
  });
  const script = result.outputFiles.find((file) =>
    file.text.includes("Missing SkillPilot start root")
  );
  assert.ok(script);
  return script.text;
}

const chatGptCompatibilityLifecycleSource =
  await buildChatGptCompatibilityLifecycleSource();

function openResult({
  status = "ID_REQUIRED",
  newSessionPolicy = "ALLOW",
  successor = null
} = {}) {
  return {
    structuredContent: {
      status,
      supportedLocales: ["de", "en"],
      fallbackUrl: "https://skillpilot.com/"
    },
    _meta: {
      skillpilotStart: {
        schemaVersion: 1,
        contractLine: {
          contractMajor: 1,
          policyRevision: 1,
          displayName: "SkillPilot Coach v1",
          supportLifecycle: "CURRENT",
          publicationStatus: "DRAFT",
          newSessionPolicy,
          successor
        }
      }
    }
  };
}

function capabilityResult(expiresInMs = 5 * 60 * 1_000) {
  return {
    structuredContent: {
      status: "CAPABILITY_ISSUED",
      contractMajor: 1,
      providerNoticeVersion: "openai-provider-eligibility-v1"
    },
    _meta: {
      skillpilotStart: {
        schemaVersion: 1,
        setupCapability,
        expiresAt: new Date(Date.now() + expiresInMs).toISOString(),
        contractMajor: 1,
        policyRevision: 1,
        providerNoticeVersion: "openai-provider-eligibility-v1",
        sourceMajorDecision: "ALLOW_CURRENT_MAJOR"
      }
    }
  };
}

function launchResult(locale = "de", expiresInMs = 60 * 60 * 1_000) {
  const firstLine = locale === "de"
    ? "Verwende SkillPilot Coach v1 und fahre fort."
    : "Use SkillPilot Coach v1 and continue.";
  return {
    schemaVersion: 1,
    status: "SESSION_CREATED",
    communicationLocale: locale,
    expiresAt: new Date(Date.now() + expiresInMs).toISOString(),
    startMessage: `${firstLine}\nlearningSessionId: ${learningSessionId}`
  };
}

function jsonResponse(
  body,
  url = "https://mcp-coach-v1.skillpilot.com/bootstrap/v1/launch",
  ok = true
) {
  return {
    ok,
    redirected: false,
    url,
    headers: { get: () => "application/json; charset=utf-8" },
    text: () => Promise.resolve(JSON.stringify(body))
  };
}

function createHarness({
  initial = openResult(),
  hostSupport = { serverTools: true, textMessages: true, openLinks: true },
  chatGptCompatibility = false
} = {}) {
  const rootElement = new FakeElement("main");
  const windowListeners = new Map();
  const timers = new Map();
  let nextTimer = 1;
  let issueHandler = () => Promise.resolve(capabilityResult());
  let fetchHandler = (url) => Promise.resolve(jsonResponse(launchResult(), url));
  let messageHandler = () => Promise.resolve({ supported: true, hostAccepted: true });
  let randomUuidCalls = 0;
  let nowMs = Date.now();

  class HarnessDate extends Date {
    static now() {
      return nowMs;
    }
  }

  const context = {
    URL,
    Promise,
    Error,
    Date: HarnessDate,
    TextEncoder,
    AbortController,
    console,
    __hostSupport: hostSupport,
    __toolCalls: [],
    __fetchCalls: [],
    __messages: [],
    __openedLinks: [],
    __browserOpenCalls: [],
    __openLinkResult: true,
    __standardConnects: 0,
    __standardToolCalls: [],
    __standardMessages: [],
    __standardOpenedLinks: [],
    __issueHandler(args) {
      return issueHandler(args);
    },
    __messageHandler(text) {
      return messageHandler(text);
    },
    crypto: {
      randomUUID() {
        randomUuidCalls += 1;
        return randomUuidCalls === 1 ? requestId : secondRequestId;
      }
    },
    fetch(url, init) {
      context.__fetchCalls.push({ url, init });
      return fetchHandler(url, init);
    },
    document: {
      head: new FakeElement("head"),
      documentElement: new FakeElement("html"),
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
    setTimeout(callback, delay = 0) {
      const id = nextTimer++;
      timers.set(id, { callback, delay });
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
    open(url, target, features) {
      context.__browserOpenCalls.push({ url, target, features });
    }
  };
  context.window = context;
  context.globalThis = context;
  context.parent = context;
  context.openai = {
    toolOutput: initial?.structuredContent,
    toolResponseMetadata: initial?._meta
  };
  if (chatGptCompatibility) {
    context.openai.callTool = (name, arguments_) => {
      context.__toolCalls.push({ name, arguments: arguments_ });
      return issueHandler(arguments_);
    };
    context.openai.sendFollowUpMessage = ({ prompt }) => {
      context.__messages.push(prompt);
      return messageHandler(prompt).then((result) =>
        result?.supported === true && result?.hostAccepted === false
          ? { isError: true }
          : undefined
      );
    };
    context.openai.openExternal = ({ href }) => {
      context.__openedLinks.push(href);
      return Promise.resolve();
    };
  }

  vm.runInNewContext(
    chatGptCompatibility ? chatGptCompatibilityLifecycleSource : lifecycleSource,
    context,
    {
    filename: "skillpilot-start-main.test-bundle.js"
    }
  );

  return {
    context,
    rootElement,
    timers,
    setIssueHandler(handler) {
      issueHandler = handler;
    },
    setFetchHandler(handler) {
      fetchHandler = handler;
    },
    setMessageHandler(handler) {
      messageHandler = handler;
    },
    dispatchWindow(type) {
      for (const listener of windowListeners.get(type) ?? []) listener({ type });
    },
    advanceClock(durationMs) {
      nowMs += durationMs;
    },
    runTimerWithDelay(delay) {
      const entry = [...timers.entries()].find(([, timer]) => timer.delay === delay);
      assert.ok(entry, `missing timer with delay ${delay}`);
      const [id, timer] = entry;
      timers.delete(id);
      timer.callback();
    },
    runTimerMatching(predicate) {
      const entry = [...timers.entries()].find(([, timer]) => predicate(timer.delay));
      assert.ok(entry, "missing matching timer");
      const [id, timer] = entry;
      timers.delete(id);
      timer.callback();
    }
  };
}

function allElements(rootElement) {
  const result = [];
  const queue = [rootElement];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    result.push(current);
    queue.push(...(current.children ?? []));
  }
  return result;
}

function findByText(rootElement, text) {
  return allElements(rootElement).find((element) => element.textContent === text);
}

function findInput(rootElement, type, value) {
  return allElements(rootElement).find((element) =>
    element.tagName === "input"
      && element.type === type
      && (value === undefined || element.value === value)
  );
}

function enterIdAndConfirm(rootElement, locale = "de") {
  const idInput = findInput(rootElement, "text");
  assert.ok(idInput);
  idInput.value = skillpilotId;
  idInput.dispatch("input");
  if (locale === "en") {
    const english = findInput(rootElement, "radio", "en");
    english.checked = true;
    english.dispatch("change");
  }
  const eligibility = findInput(rootElement, "checkbox");
  assert.ok(eligibility);
  eligibility.checked = true;
  eligibility.dispatch("change");
}

async function flushPromises() {
  for (let index = 0; index < 30; index += 1) await Promise.resolve();
}

test("explicit confirmation issues an ID-free capability, posts the ID directly, and retries only ui/message", async () => {
  const harness = createHarness();
  let messageAttempt = 0;
  harness.setMessageHandler(() => {
    messageAttempt += 1;
    return Promise.resolve({
      supported: true,
      hostAccepted: messageAttempt > 1
    });
  });
  await flushPromises();

  const disabledStart = findByText(harness.rootElement, "Lernen starten");
  assert.ok(disabledStart);
  assert.equal(disabledStart.disabled, true);
  const privacyCopy = allElements(harness.rootElement)
    .map((element) => element.textContent)
    .join(" ");
  assert.match(privacyCopy, /Host vermittelt diese Oberfläche und den App-only-Aufruf/);
  assert.match(privacyCopy, /private App-Metadaten/);
  assert.match(privacyCopy, /zur Aufnahme in Chat und Modellkontext/);
  enterIdAndConfirm(harness.rootElement);
  findByText(harness.rootElement, "Lernen starten").dispatch("click");
  await flushPromises();

  assert.equal(harness.context.__toolCalls.length, 1);
  assert.equal(
    harness.context.__toolCalls[0].name,
    "issue_skillpilot_start_capability"
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(harness.context.__toolCalls[0].arguments)),
    {
      providerNoticeVersion: "openai-provider-eligibility-v1",
      providerEligibilityConfirmed: true
    }
  );
  assert.doesNotMatch(
    JSON.stringify(harness.context.__toolCalls[0].arguments),
    /skillpilot.?id|learner|session/i
  );

  assert.equal(harness.context.__fetchCalls.length, 1);
  const firstFetch = harness.context.__fetchCalls[0];
  assert.equal(
    firstFetch.url,
    "https://mcp-coach-v1.skillpilot.com/bootstrap/v1/launch"
  );
  assert.equal(firstFetch.init.credentials, "omit");
  assert.equal(firstFetch.init.redirect, "error");
  assert.equal(
    firstFetch.init.headers.Authorization,
    `SkillPilotSetup ${setupCapability}`
  );
  assert.deepEqual(JSON.parse(firstFetch.init.body), {
    schemaVersion: 1,
    skillpilotId,
    communicationLocale: "de",
    launchIntent: { type: "CURRENT_UNIT" },
    providerNoticeVersion: "openai-provider-eligibility-v1",
    clientRequestId: requestId
  });
  assert.equal(
    Object.hasOwn(JSON.parse(firstFetch.init.body), "providerEligibilityConfirmed"),
    false
  );

  assert.equal(harness.context.__messages.length, 1);
  assert.ok(findByText(harness.rootElement, "Dieselbe Nachricht erneut anbieten"));
  findByText(harness.rootElement, "Dieselbe Nachricht erneut anbieten").dispatch("click");
  await flushPromises();

  assert.equal(harness.context.__toolCalls.length, 1, "message retry must not issue another capability");
  assert.equal(harness.context.__fetchCalls.length, 1, "message retry must not launch again");
  assert.equal(harness.context.__messages.length, 2);
  assert.equal(harness.context.__messages[0], harness.context.__messages[1]);
  assert.ok(findByText(harness.rootElement, "Startnachricht angenommen"));
  assert.ok(findByText(
    harness.rootElement,
    "Der Host hat die Nachrichtenanfrage angenommen. Dies bestätigt noch keine Antwort des Lerncoachs."
  ));

  findByText(harness.rootElement, "Neuen Startversuch beginnen").dispatch("click");
  enterIdAndConfirm(harness.rootElement);
  findByText(harness.rootElement, "Lernen starten").dispatch("click");
  await flushPromises();

  assert.equal(harness.context.__toolCalls.length, 2, "a new explicit attempt may issue a new capability");
  assert.equal(harness.context.__fetchCalls.length, 2, "a new explicit attempt may start one new session");
  assert.equal(harness.context.__messages.length, 3);
  assert.equal(JSON.parse(harness.context.__fetchCalls[1].init.body).clientRequestId, secondRequestId);
});

test("ChatGPT Web aliases show the ID form and complete one direct-start handoff", async () => {
  const harness = createHarness({ chatGptCompatibility: true });
  await flushPromises();

  assert.equal(
    findByText(harness.rootElement, "Direkter Start nicht verfügbar"),
    undefined
  );
  assert.ok(findInput(harness.rootElement, "text"));
  enterIdAndConfirm(harness.rootElement);
  findByText(harness.rootElement, "Lernen starten").dispatch("click");
  await flushPromises();

  assert.equal(harness.context.__standardConnects, 1);
  assert.deepEqual(harness.context.__standardToolCalls, []);
  assert.deepEqual(harness.context.__standardMessages, []);
  assert.equal(harness.context.__toolCalls.length, 1);
  assert.equal(
    harness.context.__toolCalls[0].name,
    "issue_skillpilot_start_capability"
  );
  assert.doesNotMatch(
    JSON.stringify(harness.context.__toolCalls[0].arguments),
    new RegExp(skillpilotId)
  );
  assert.equal(harness.context.__fetchCalls.length, 1);
  assert.equal(JSON.parse(harness.context.__fetchCalls[0].init.body).skillpilotId, skillpilotId);
  assert.equal(harness.context.__messages.length, 1);
  assert.doesNotMatch(harness.context.__messages[0], new RegExp(skillpilotId));
  assert.equal(
    harness.context.__messages[0],
    `Verwende SkillPilot Coach v1 und fahre fort.\nlearningSessionId: ${learningSessionId}`
  );
  assert.ok(findByText(harness.rootElement, "Startnachricht angenommen"));
});

test("an unclear ui/message outcome is retryable but may duplicate only the same chat message", async () => {
  const harness = createHarness();
  harness.setMessageHandler(() => new Promise(() => {}));
  await flushPromises();
  enterIdAndConfirm(harness.rootElement);
  findByText(harness.rootElement, "Lernen starten").dispatch("click");
  await flushPromises();

  assert.equal(harness.context.__toolCalls.length, 1);
  assert.equal(harness.context.__fetchCalls.length, 1);
  assert.equal(harness.context.__messages.length, 1);
  harness.runTimerWithDelay(15_000);
  await flushPromises();

  assert.ok(findByText(
    harness.rootElement,
    "Es ist unklar, ob der Host die Startnachricht bereits aufgenommen hat. Erneutes Anbieten kann dieselbe Nachricht doppelt in den Chat einfügen, erstellt aber keine zweite Lernsession."
  ));
  assert.ok(findByText(harness.rootElement, "Dieselbe Nachricht erneut anbieten"));

  harness.setMessageHandler(() => Promise.resolve({ supported: true, hostAccepted: true }));
  findByText(harness.rootElement, "Dieselbe Nachricht erneut anbieten").dispatch("click");
  await flushPromises();

  assert.equal(harness.context.__toolCalls.length, 1);
  assert.equal(harness.context.__fetchCalls.length, 1);
  assert.equal(harness.context.__messages.length, 2);
  assert.equal(harness.context.__messages[0], harness.context.__messages[1]);
  assert.ok(findByText(harness.rootElement, "Startnachricht angenommen"));
});

test("an uncertain HTTPS result retries the byte-identical request without reissuing capability", async () => {
  const harness = createHarness();
  let fetchAttempt = 0;
  harness.setFetchHandler((url) => {
    fetchAttempt += 1;
    return fetchAttempt === 1
      ? Promise.reject(new Error("transport"))
      : Promise.resolve(jsonResponse(launchResult("de"), url));
  });
  await flushPromises();
  enterIdAndConfirm(harness.rootElement);
  findByText(harness.rootElement, "Lernen starten").dispatch("click");
  await flushPromises();

  assert.ok(findByText(harness.rootElement, "Denselben Startversuch wiederholen"));
  findByText(harness.rootElement, "Denselben Startversuch wiederholen").dispatch("click");
  await flushPromises();

  assert.equal(harness.context.__toolCalls.length, 1);
  assert.equal(harness.context.__fetchCalls.length, 2);
  const [first, second] = harness.context.__fetchCalls;
  assert.equal(first.url, second.url);
  assert.equal(first.init.body, second.init.body);
  assert.deepEqual(first.init.headers, second.init.headers);
  assert.equal(JSON.parse(first.init.body).clientRequestId, requestId);
  assert.equal(harness.context.__messages.length, 1);
});

test("a definitive profile rejection clears the bound request and requires a new explicit attempt", async () => {
  const harness = createHarness();
  harness.setFetchHandler((url) => Promise.resolve(jsonResponse({
    schemaVersion: 1,
    status: "PROFILE_UNAVAILABLE",
    fallbackUrl: "https://skillpilot.com/"
  }, url, false)));
  await flushPromises();
  enterIdAndConfirm(harness.rootElement);
  findByText(harness.rootElement, "Lernen starten").dispatch("click");
  await flushPromises();

  assert.equal(harness.context.__toolCalls.length, 1);
  assert.equal(harness.context.__fetchCalls.length, 1);
  assert.deepEqual(harness.context.__messages, []);
  assert.equal(findByText(harness.rootElement, "Denselben Startversuch wiederholen"), undefined);
  assert.ok(findByText(harness.rootElement, "SkillPilot-ID erneut eingeben"));
  assert.ok(findByText(
    harness.rootElement,
    "Dieser Startversuch wurde endgültig abgelehnt. Prüfe deine SkillPilot-ID und beginne ausdrücklich einen neuen Versuch oder öffne SkillPilot."
  ));

  findByText(harness.rootElement, "SkillPilot-ID erneut eingeben").dispatch("click");
  enterIdAndConfirm(harness.rootElement);
  findByText(harness.rootElement, "Lernen starten").dispatch("click");
  await flushPromises();
  assert.equal(harness.context.__toolCalls.length, 2);
  assert.equal(harness.context.__fetchCalls.length, 2);
});

test("a rejected capability never sends the ID through tools/call and never starts HTTPS", async () => {
  const harness = createHarness();
  harness.setIssueHandler(() => Promise.resolve({ isError: true }));
  await flushPromises();
  enterIdAndConfirm(harness.rootElement);
  findByText(harness.rootElement, "Lernen starten").dispatch("click");
  await flushPromises();

  assert.equal(harness.context.__toolCalls.length, 1);
  assert.doesNotMatch(JSON.stringify(harness.context.__toolCalls), new RegExp(skillpilotId));
  assert.deepEqual(harness.context.__fetchCalls, []);
  assert.deepEqual(harness.context.__messages, []);
  assert.ok(findByText(harness.rootElement, "SkillPilot-ID erneut eingeben"));
  assert.doesNotMatch(
    allElements(harness.rootElement).map((element) => element.textContent).join(" "),
    new RegExp(skillpilotId)
  );
});

test("issuer decision metadata must match the explicit major-policy decision", async () => {
  const harness = createHarness();
  const mismatched = capabilityResult();
  mismatched._meta.skillpilotStart.sourceMajorDecision = "START_CURRENT_MAJOR";
  harness.setIssueHandler(() => Promise.resolve(mismatched));
  await flushPromises();
  enterIdAndConfirm(harness.rootElement);
  findByText(harness.rootElement, "Lernen starten").dispatch("click");
  await flushPromises();

  assert.equal(harness.context.__toolCalls.length, 1);
  assert.deepEqual(harness.context.__fetchCalls, []);
  assert.deepEqual(harness.context.__messages, []);
  assert.ok(findByText(harness.rootElement, "SkillPilot-ID erneut eingeben"));
});

test("missing serverTools or message.text falls back before capability issuance", async () => {
  for (const hostSupport of [
    { serverTools: false, textMessages: true, openLinks: true },
    { serverTools: true, textMessages: false, openLinks: true }
  ]) {
    const harness = createHarness({ hostSupport });
    await flushPromises();

    assert.ok(findByText(harness.rootElement, "Direkter Start nicht verfügbar"));
    findByText(harness.rootElement, "SkillPilot öffnen").dispatch("click");
    await flushPromises();

    assert.deepEqual(harness.context.__toolCalls, []);
    assert.deepEqual(harness.context.__fetchCalls, []);
    assert.deepEqual(harness.context.__messages, []);
    assert.deepEqual(harness.context.__openedLinks, ["https://skillpilot.com/"]);
  }
});

test("handoff timeout clears the retained message and prevents another ui/message retry", async () => {
  const harness = createHarness();
  harness.setMessageHandler(() => Promise.resolve({ supported: true, hostAccepted: false }));
  await flushPromises();
  enterIdAndConfirm(harness.rootElement);
  findByText(harness.rootElement, "Lernen starten").dispatch("click");
  await flushPromises();

  assert.equal(harness.context.__messages.length, 1);
  assert.ok(findByText(harness.rootElement, "Dieselbe Nachricht erneut anbieten"));
  harness.runTimerWithDelay(handoffRetentionMs);

  assert.ok(findByText(harness.rootElement, "Sicherer Start abgelaufen"));
  assert.equal(findByText(harness.rootElement, "Dieselbe Nachricht erneut anbieten"), undefined);
  assert.equal(findByText(harness.rootElement, "Denselben Startversuch wiederholen"), undefined);
  assert.equal(harness.context.__messages.length, 1);
});

test("session expiry releases the start message and permanently blocks its resend", async () => {
  const harness = createHarness();
  harness.setFetchHandler((url) => Promise.resolve(
    jsonResponse(launchResult("de", 1_000), url)
  ));
  harness.setMessageHandler(() => Promise.resolve({ supported: true, hostAccepted: false }));
  await flushPromises();
  enterIdAndConfirm(harness.rootElement);
  findByText(harness.rootElement, "Lernen starten").dispatch("click");
  await flushPromises();

  assert.equal(harness.context.__messages.length, 1);
  assert.ok(findByText(harness.rootElement, "Dieselbe Nachricht erneut anbieten"));
  harness.runTimerMatching((delay) => delay > 0 && delay <= 2_000);

  assert.ok(findByText(harness.rootElement, "Sicherer Start abgelaufen"));
  assert.equal(findByText(harness.rootElement, "Dieselbe Nachricht erneut anbieten"), undefined);
  assert.equal(harness.context.__messages.length, 1);
  assert.ok(findByText(harness.rootElement, "Neuen Startversuch beginnen"));
});

test("a delayed launch response cannot extend the original handoff-retention deadline", async () => {
  const harness = createHarness();
  let resolveFetch;
  harness.setFetchHandler(() => new Promise((resolve) => {
    resolveFetch = resolve;
  }));
  harness.setMessageHandler(() => Promise.resolve({ supported: true, hostAccepted: false }));
  await flushPromises();
  enterIdAndConfirm(harness.rootElement);
  findByText(harness.rootElement, "Lernen starten").dispatch("click");
  await flushPromises();

  harness.advanceClock(10_000);
  resolveFetch(jsonResponse(launchResult("de", 60 * 60 * 1_000)));
  await flushPromises();

  assert.equal(harness.context.__messages.length, 1);
  assert.ok(findByText(harness.rootElement, "Dieselbe Nachricht erneut anbieten"));
  harness.runTimerMatching((delay) =>
    delay > handoffRetentionMs - 11_000
      && delay <= handoffRetentionMs - 10_000
  );
  assert.ok(findByText(harness.rootElement, "Sicherer Start abgelaufen"));
  assert.equal(findByText(harness.rootElement, "Dieselbe Nachricht erneut anbieten"), undefined);
});

test("WARN offers an explicit v1-or-v2 choice and BLOCK opens only the allowlisted successor", async () => {
  const successor = {
    contractMajor: 2,
    displayName: "SkillPilot Coach v2",
    handoffUrl: "https://skillpilot.com/openai/coach-v2"
  };
  const warn = createHarness({
    initial: openResult({ newSessionPolicy: "WARN", successor })
  });
  await flushPromises();
  assert.ok(findByText(warn.rootElement, "Bei v1 bleiben und starten"));
  assert.ok(findByText(warn.rootElement, "SkillPilot Coach v2 öffnen"));
  findByText(warn.rootElement, "SkillPilot Coach v2 öffnen").dispatch("click");
  await flushPromises();
  assert.deepEqual(warn.context.__openedLinks, [successor.handoffUrl]);
  assert.deepEqual(warn.context.__toolCalls, []);
  assert.deepEqual(warn.context.__fetchCalls, []);
  assert.deepEqual(warn.context.__messages, []);

  const blocked = createHarness({
    initial: openResult({
      status: "MAJOR_UPGRADE_REQUIRED",
      newSessionPolicy: "BLOCK",
      successor
    })
  });
  await flushPromises();
  assert.equal(findInput(blocked.rootElement, "text"), undefined);
  assert.equal(findByText(blocked.rootElement, "SkillPilot öffnen"), undefined);
  assert.ok(findByText(blocked.rootElement, "SkillPilot Coach v2 öffnen"));
  findByText(blocked.rootElement, "SkillPilot Coach v2 öffnen").dispatch("click");
  await flushPromises();
  assert.deepEqual(blocked.context.__openedLinks, [successor.handoffUrl]);
  assert.deepEqual(blocked.context.__toolCalls, []);
  assert.deepEqual(blocked.context.__fetchCalls, []);
});

test("a dispatched request remains replayable past capability expiry until its handoff deadline", async () => {
  const harness = createHarness();
  harness.setIssueHandler(() => Promise.resolve(capabilityResult(1_000)));
  let fetchAttempt = 0;
  harness.setFetchHandler((url) => {
    fetchAttempt += 1;
    return fetchAttempt === 1
      ? Promise.reject(new Error("transport"))
      : Promise.resolve(jsonResponse(launchResult(), url));
  });
  await flushPromises();
  enterIdAndConfirm(harness.rootElement);
  findByText(harness.rootElement, "Lernen starten").dispatch("click");
  await flushPromises();

  assert.equal(harness.context.__toolCalls.length, 1);
  assert.equal(harness.context.__fetchCalls.length, 1);
  assert.ok(findByText(harness.rootElement, "Denselben Startversuch wiederholen"));
  harness.advanceClock(2_000);
  findByText(harness.rootElement, "Denselben Startversuch wiederholen").dispatch("click");
  await flushPromises();

  assert.equal(harness.context.__toolCalls.length, 1);
  assert.equal(harness.context.__fetchCalls.length, 2);
  assert.equal(
    harness.context.__fetchCalls[0].init.body,
    harness.context.__fetchCalls[1].init.body
  );
  assert.equal(harness.context.__messages.length, 1);
});

test("the selected locale controls only the direct body and canonical host message", async () => {
  const harness = createHarness();
  harness.setFetchHandler((url) => Promise.resolve(jsonResponse(launchResult("en"), url)));
  await flushPromises();
  enterIdAndConfirm(harness.rootElement, "en");
  findByText(harness.rootElement, "Start learning").dispatch("click");
  await flushPromises();

  assert.equal(
    JSON.parse(harness.context.__fetchCalls[0].init.body).communicationLocale,
    "en"
  );
  assert.equal(
    harness.context.__messages[0],
    `Use SkillPilot Coach v1 and continue.\nlearningSessionId: ${learningSessionId}`
  );
});

test("pagehide and fallback remove pending secrets and use only the exact allowlisted URL", async () => {
  const harness = createHarness();
  harness.setFetchHandler(() => Promise.reject(new Error("offline")));
  await flushPromises();
  enterIdAndConfirm(harness.rootElement);
  findByText(harness.rootElement, "Lernen starten").dispatch("click");
  await flushPromises();
  assert.ok(findByText(harness.rootElement, "Denselben Startversuch wiederholen"));

  harness.dispatchWindow("pagehide");
  harness.dispatchWindow("pageshow");
  assert.ok(findByText(harness.rootElement, "Sicherer Start abgelaufen"));
  assert.equal(findByText(harness.rootElement, "Denselben Startversuch wiederholen"), undefined);
  findByText(harness.rootElement, "SkillPilot öffnen").dispatch("click");
  await flushPromises();
  assert.deepEqual(harness.context.__openedLinks, ["https://skillpilot.com/"]);
  assert.equal(harness.context.__fetchCalls.length, 1);
});
