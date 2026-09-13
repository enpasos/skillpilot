import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { access, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";
import type { Response as BrowserResponse } from "playwright";
import YAML from "yaml";
import { loadScenario } from "../src/config.js";
import {
  instructionAssetHashes, loadQuickstartApiKey, parseQuickstartArguments, QuickstartLearnerCleanup,
  resolveQuickstartCards, runQuickstart, verifyQuickstartCaptureCleanup,
} from "../src/quickstart-build.js";

const ID_ONE = "11111111-1111-4111-8111-111111111111";
const ID_TWO = "22222222-2222-4222-8222-222222222222";
const ORIGIN = "https://skillpilot.example";

function response(id: unknown, options: { method?: string; path?: string; origin?: string; ok?: boolean } = {}) {
  return {
    url: () => `${options.origin ?? ORIGIN}${options.path ?? "/api/ui/learners"}`,
    request: () => ({ method: () => options.method ?? "POST" }),
    ok: () => options.ok ?? true,
    json: async () => ({ state: { skillpilotId: id } }),
  } as unknown as BrowserResponse;
}

test("cleanup owns only fresh successful CREATE IDs and confirms exact DELETE targets", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "quickstart-cleanup-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const ledger = join(directory, "cleanup.json");
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  const cleanup = new QuickstartLearnerCleanup(ORIGIN, ledger, (async (url, init) => {
    requests.push({ url: String(url), ...(init ? { init } : {}) });
    return new Response(null, { status: requests.length === 1 ? 204 : 404 });
  }) as typeof fetch);
  cleanup.observe(response("existing-profile", { method: "GET" }));
  cleanup.observe(response("existing-profile", { path: "/api/ui/learners/import" }));
  cleanup.observe(response("foreign-profile", { origin: "https://other.example" }));
  cleanup.observe(response("failed-profile", { ok: false }));
  cleanup.observe(response(ID_ONE));
  cleanup.observe(response(ID_ONE));
  cleanup.observe(response(ID_TWO));
  await cleanup.flush();
  assert.deepEqual(JSON.parse(await readFile(ledger, "utf8")), {
    schemaVersion: 1, origin: ORIGIN, skillpilotIds: [ID_ONE, ID_TWO],
  });
  if (process.platform !== "win32") assert.equal((await stat(ledger)).mode & 0o777, 0o600);
  assert.equal(await cleanup.cleanup(), 2);
  assert.equal(requests.length, 2);
  for (const [index, id] of [ID_ONE, ID_TWO].entries()) {
    assert.equal(requests[index]?.url, `${ORIGIN}/api/ui/learners/${id}`);
    assert.equal(requests[index]?.init?.method, "DELETE");
    assert.equal(requests[index]?.init?.redirect, "error");
    assert.deepEqual(JSON.parse(String(requests[index]?.init?.body)), { confirmationSkillpilotId: id });
  }
  await assert.rejects(access(ledger), /ENOENT/u);
});

test("failed deletion preserves recovery evidence without exposing the bearer ID", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "quickstart-recovery-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const ledger = join(directory, "cleanup.json");
  let attempts = 0;
  const first = new QuickstartLearnerCleanup(ORIGIN, ledger, (async () => {
    attempts += 1;
    throw new Error(`Network error containing ${ID_ONE}`);
  }) as typeof fetch);
  first.observe(response(ID_ONE));
  await first.flush();
  await assert.rejects(first.cleanup(), (error: Error) => {
    assert.doesNotMatch(error.message, new RegExp(ID_ONE));
    assert.match(error.message, /1 disposable learner/u);
    return true;
  });
  assert.equal(attempts, 3);
  const second = new QuickstartLearnerCleanup(ORIGIN, ledger, (async () => new Response(null, { status: 204 })) as typeof fetch);
  await second.recover();
  assert.equal(await second.cleanup(), 1);
});

test("recovery merges a newer temporary ledger and rejects another origin", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "quickstart-ledger-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const ledger = join(directory, "cleanup.json");
  await writeFile(ledger, JSON.stringify({ schemaVersion: 1, origin: ORIGIN, skillpilotIds: [ID_ONE] }), { mode: 0o600 });
  await writeFile(`${ledger}.tmp`, JSON.stringify({ schemaVersion: 1, origin: ORIGIN, skillpilotIds: [ID_ONE, ID_TWO] }), { mode: 0o600 });
  const cleanup = new QuickstartLearnerCleanup(ORIGIN, ledger, (async () => new Response(null, { status: 204 })) as typeof fetch);
  await cleanup.recover();
  assert.deepEqual(cleanup.sensitiveValues, [ID_ONE, ID_TWO]);
  assert.equal(await cleanup.cleanup(), 2);
  await writeFile(ledger, JSON.stringify({ schemaVersion: 1, origin: "https://foreign.example", skillpilotIds: [ID_ONE] }), { mode: 0o600 });
  await assert.rejects(new QuickstartLearnerCleanup(ORIGIN, ledger).recover(), /invalid scope/u);
});

test("malformed CREATE responses fail capture without authorizing a deletion", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "quickstart-invalid-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const cleanup = new QuickstartLearnerCleanup(ORIGIN, join(directory, "cleanup.json"), (async () => {
    assert.fail("Unexpected DELETE");
  }) as typeof fetch);
  cleanup.observe(response("../../existing-user"));
  await assert.rejects(cleanup.flush(), /could not be safely recorded/u);
  assert.equal(await cleanup.cleanup(), 0);
});

test("TTS reads a private key without using review browser or native-clip fields", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "quickstart-key-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const path = join(directory, "test-secrets.json");
  await writeFile(path, JSON.stringify({
    schemaVersion: 1, openAiApiKey: " test-key ", browserProfilePath: "/must/not/be/opened", platformClips: ["ignored"],
  }), { mode: 0o600 });
  assert.equal(await loadQuickstartApiKey(path), "test-key");
  await writeFile(path, JSON.stringify({ schemaVersion: 1, openAiApiKey: "" }));
  await assert.rejects(loadQuickstartApiKey(path), /nonempty openAiApiKey/u);
});

test("card references resolve only the known local guidance pages", async () => {
  const scenario = await loadScenario(resolve("scenarios/example.yaml"));
  scenario.browser.locale = "de-DE";
  scenario.chapters[0]!.steps = [{ id: "card", label: "Instruction", action: "goto", url: "quickstart-card:intro" }];
  assert.match(resolveQuickstartCards(scenario), /assets[/\\]quickstart[/\\]cards\.html$/u);
  const step = scenario.chapters[0]!.steps[0]!;
  assert.ok(step.action === "goto" && step.url?.startsWith("file:") && step.url.endsWith("cards.html#intro"));
  for (const card of ["marketplace", "repository", "chat-start"]) {
    scenario.chapters[0]!.steps = [{ id: "card", label: "Instruction", action: "goto", url: `quickstart-card:${card}` }];
    resolveQuickstartCards(scenario);
    const resolvedStep = scenario.chapters[0]!.steps[0]!;
    assert.ok(resolvedStep.action === "goto" && resolvedStep.url?.endsWith(`cards.html#${card}`));
  }
  scenario.chapters[0]!.steps = [{ id: "card", label: "Instruction", action: "goto", url: "quickstart-card:../../secrets" }];
  assert.throws(() => resolveQuickstartCards(scenario), /Unknown Quickstart/u);
});

test("English card references use English assets and unsupported languages fail closed", async () => {
  const scenario = await loadScenario(resolve("scenarios/example.yaml"));
  scenario.browser.locale = "en-US";
  scenario.chapters[0]!.steps = [{ id: "card", label: "Instruction", action: "goto", url: "quickstart-card:intro" }];
  assert.match(resolveQuickstartCards(scenario), /cards\.en\.html$/u);
  const step = scenario.chapters[0]!.steps[0]!;
  assert.ok(step.action === "goto" && step.url?.endsWith("cards.en.html#intro"));
  scenario.browser.locale = "fr-FR";
  assert.throws(() => resolveQuickstartCards(scenario), /only German or English/u);
});

test("CLI validates mutually exclusive calibration and recovery modes", () => {
  assert.equal(parseQuickstartArguments(["--scenario", "test.yaml", "--record-only"]).recordOnly, true);
  assert.equal(parseQuickstartArguments(["--scenario", "test.yaml", "--reuse-recording"]).reuseRecording, true);
  assert.throws(() => parseQuickstartArguments(["--scenario", "test.yaml", "--record-only", "--cleanup-only"]));
  assert.throws(() => parseQuickstartArguments(["--secrets", "--scenario"]));
});

test("private marketplace screenshot is required only by marketplace/repository cards", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "quickstart-private-image-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const cardsPath = join(directory, "cards.html");
  await writeFile(cardsPath, "Fixture instruction cards");
  const scenario = await loadScenario(resolve("scenarios/example.yaml"));
  scenario.chapters[0]!.steps = [{ id: "intro", label: "Intro", action: "goto", url: "quickstart-card:intro" }];
  scenario.browser.locale = "de-DE";
  assert.equal((await instructionAssetHashes(cardsPath, scenario)).instructionScreenshotSha256, null);
  scenario.chapters[0]!.steps = [{ id: "marketplace", label: "Marketplace", action: "goto", url: "quickstart-card:marketplace" }];
  await assert.rejects(instructionAssetHashes(cardsPath, scenario), /approved private claude-marketplace.png/u);
  await writeFile(join(directory, "claude-marketplace.png"), "Private test fixture");
  assert.match((await instructionAssetHashes(cardsPath, scenario)).instructionScreenshotSha256!, /^[0-9a-f]{64}$/u);
  scenario.chapters[0]!.steps = [{ id: "repository", label: "Repository", action: "goto", url: `${pathToFileURL(cardsPath).href}#repository` }];
  assert.match((await instructionAssetHashes(cardsPath, scenario)).instructionScreenshotSha256!, /^[0-9a-f]{64}$/u);
});

test("record-only cleans browser-created learners after success and after a failed step", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "quickstart-browser-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const operations: string[] = [];
  const server = createServer(async (request, response) => {
    if (request.method === "POST" && request.url === "/api/ui/learners") {
      operations.push("CREATE");
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ state: { skillpilotId: ID_ONE } }));
    } else if (request.method === "DELETE") {
      const chunks: Buffer[] = [];
      for await (const chunk of request) chunks.push(Buffer.from(chunk));
      assert.equal(request.url, `/api/ui/learners/${ID_ONE}`);
      assert.deepEqual(JSON.parse(Buffer.concat(chunks).toString()), { confirmationSkillpilotId: ID_ONE });
      operations.push("DELETE");
      response.writeHead(204).end();
    } else {
      response.writeHead(200, { "content-type": "text/html" });
      response.end(`<h1>Fixture</h1><div id="private">MASK ME</div><button id="create">Create fixture</button><p id="done"></p><script>
        document.querySelector('#create').onclick = async () => {
          await (await fetch('/api/ui/learners', {method:'POST'})).json();
          document.querySelector('#done').textContent = 'Created';
        };
      </script>`);
    }
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise<void>((resolveClose) => server.close(() => resolveClose())));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const scenarioPath = join(directory, "scenario.yaml");
  const definition = {
    schemaVersion: 1, id: "quickstart-test", title: "Browser fixture", sourceRevision: "local-test",
    outputDir: "./output", cacheDir: "./cache",
    browser: { baseUrl: `http://127.0.0.1:${address.port}`, defaultTimeoutMs: 300, postActionDelayMs: 50 },
    privacy: { maskSelectors: ["#private"], evidenceSelectors: ["h1"] },
    narration: { mode: "scripted", ttsModel: "gemini-3.1-flash-tts-preview", voice: "Sulafat" },
    chapters: [{ id: "start", title: "Start", scriptedNarration: "Browser fixture.", steps: [
      { id: "open", action: "goto", label: "Open", url: "/", capture: true },
      { id: "create", action: "click", label: "Create", target: { css: "#create" } },
      { id: "assert", action: "assert", label: "Verify", target: { css: "#done" }, text: "Created", capture: true },
    ] }],
  };
  const yaml = YAML.stringify(definition);
  await writeFile(scenarioPath, yaml);
  const result = await runQuickstart({ scenarioPath, recordOnly: true });
  assert.equal(result.deletedLearners, 1);
  assert.equal(result.captureLearnersDeleted, 1);
  assert.deepEqual(operations, ["CREATE", "DELETE"]);
  await access(join(result.workDir, "recording.webm"));
  const recordedScenario = await loadScenario(scenarioPath);
  const cardsPath = resolveQuickstartCards(recordedScenario);
  const captureProof = await verifyQuickstartCaptureCleanup(recordedScenario, result.workDir, cardsPath);
  assert.equal(captureProof.disposableLearnersDeleted, 1);
  assert.match(captureProof.instructionCardsSha256, /^[0-9a-f]{64}$/u);
  assert.equal(captureProof.instructionScreenshotSha256, null);
  const reused = await runQuickstart({ scenarioPath, recordOnly: true, reuseRecording: true });
  assert.equal(reused.deletedLearners, 0);
  assert.equal(reused.captureLearnersDeleted, 1);
  assert.deepEqual(operations, ["CREATE", "DELETE"]);
  const secrets = join(directory, "gemini-test-secrets.json");
  await writeFile(secrets, JSON.stringify({ schemaVersion: 1, geminiApiKey: "fixture-only-key" }), { mode: 0o600 });
  const originalFetch = globalThis.fetch;
  let speechRequests = 0;
  try {
    globalThis.fetch = (async (url, init) => {
      if (String(url).startsWith("https://generativelanguage.googleapis.com/")) {
        speechRequests += 1;
        assert.equal(new Headers(init?.headers).get("x-goog-api-key"), "fixture-only-key");
        return Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [{ inlineData: {
          mimeType: "audio/l16; rate=24000; channels=1", data: Buffer.alloc(48_000).toString("base64"),
        } }] } }] });
      }
      return originalFetch(url, init);
    }) as typeof fetch;
    const completed = await runQuickstart({ scenarioPath, reuseRecording: true, secretsPath: secrets });
    assert.equal(completed.deletedLearners, 0);
    assert.equal(completed.captureLearnersDeleted, 1);
    assert.equal(speechRequests, 1);
    const manifest = JSON.parse(await readFile(join(completed.workDir, "manifest.json"), "utf8"));
    assert.equal(manifest.quickstartCapture.disposableLearnersDeleted, 1);
    assert.equal(manifest.quickstartCapture.cleanupPerformedThisRun, 0);
    assert.match(manifest.quickstartCapture.recordingCleanupEvidenceSha256, /^[0-9a-f]{64}$/u);
    assert.deepEqual(operations, ["CREATE", "DELETE"]);
  } finally { globalThis.fetch = originalFetch; }
  const changedCards = join(directory, "changed-cards.html");
  await writeFile(changedCards, "Changed instructions");
  await assert.rejects(verifyQuickstartCaptureCleanup(recordedScenario, result.workDir, changedCards), /does not match/u);
  const evidencePath = join(result.workDir, "capture-cleanup.json");
  const validEvidence = await readFile(evidencePath, "utf8");
  await writeFile(evidencePath, JSON.stringify({ ...captureProof, recordingSha256: "0".repeat(64) }));
  await assert.rejects(runQuickstart({ scenarioPath, recordOnly: true, reuseRecording: true }), /does not match/u);
  await writeFile(evidencePath, validEvidence);
  await rm(evidencePath);
  await assert.rejects(runQuickstart({ scenarioPath, recordOnly: true, reuseRecording: true }), /no capture-bound cleanup evidence/u);
  assert.deepEqual(operations, ["CREATE", "DELETE"]);
  await assert.rejects(access(join(directory, "output", ".quickstart-learner-cleanup.json")), /ENOENT/u);
  await writeFile(scenarioPath, yaml.replace("text: Created", "text: Never appears"));
  await assert.rejects(runQuickstart({ scenarioPath, recordOnly: true }), /Scenario failed at start\/assert/u);
  assert.deepEqual(operations, ["CREATE", "DELETE", "CREATE", "DELETE"]);
  await assert.rejects(access(join(directory, "output", ".quickstart-build.lock")), /ENOENT/u);
});
