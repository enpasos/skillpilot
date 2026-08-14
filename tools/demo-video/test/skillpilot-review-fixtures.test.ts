import assert from "node:assert/strict";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import {
  cleanupPendingSkillPilotReviewFixtures,
  prepareSkillPilotReviewFixtures,
  SKILLPILOT_REVIEW_ENVIRONMENT,
} from "../src/skillpilot-review-fixtures.js";

const ROOT_CURRICULUM_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
const MATHEMATICS_CURRICULUM_ID = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
const ORIENTATION_GOAL_ID = "71cec9fb-3751-4d61-8b34-c5adbbf6e5f2";
const MEMORY_GOAL_ID = "77259806-add7-5fcb-b89c-376e1b0c88d6";

interface RequestRecord {
  method: string;
  pathname: string;
  body: unknown;
}

interface MockReviewApiOptions {
  failRequest?: (request: RequestRecord) => boolean;
}

const jsonResponse = (value: unknown, status = 200): Response => new Response(
  status === 204 ? null : JSON.stringify(value),
  {
    status,
    ...(status === 204 ? {} : { headers: { "content-type": "application/json" } }),
  },
);

const requestBody = (body: BodyInit | null | undefined): unknown => {
  if (typeof body !== "string" || body.length === 0) return undefined;
  return JSON.parse(body) as unknown;
};

const personalizationPlan = (step: number): Record<string, unknown> => {
  const optionsByStep: Record<string, unknown>[][] = [
    [{
      optionId: "jurisdiction-hessen",
      kind: "VALUE",
      landscapeId: ROOT_CURRICULUM_ID,
      filterId: "DE-HE",
    }],
    [{
      optionId: "duration-g9",
      kind: "SCOPE_VALUE",
      scopeKey: "durationModel",
      scopeValue: "G9",
    }],
    [{
      optionId: "stage-sekii",
      kind: "SCOPE_VALUE",
      scopeKey: "stage",
      scopeValue: "SekII",
    }],
    [{
      optionId: "subject-mathematics",
      kind: "VALUE",
      landscapeId: MATHEMATICS_CURRICULUM_ID,
      filterId: null,
    }],
    [{ optionId: "finish-subjects", kind: "COMPLETE_GROUP" }],
    [
      {
        optionId: "mathematics-gk",
        kind: "VALUE",
        landscapeId: MATHEMATICS_CURRICULUM_ID,
        filterId: "GK",
      },
      {
        optionId: "mathematics-lk",
        kind: "VALUE",
        landscapeId: MATHEMATICS_CURRICULUM_ID,
        filterId: "LK",
      },
    ],
  ];
  return step >= optionsByStep.length
    ? { stage: "COMPLETE", options: [] }
    : { stage: "SELECTION", options: optionsByStep[step] };
};

const createMockReviewApi = (options: MockReviewApiOptions = {}) => {
  const requests: RequestRecord[] = [];
  const createdIds: string[] = [];
  const deletedIds: string[] = [];
  const personalizationSteps = new Map<string, number>();
  let launchCount = 0;

  const fetchImpl = (async (
    input: string | URL | Request,
    init?: RequestInit,
  ): Promise<Response> => {
    const url = new URL(input instanceof Request ? input.url : input.toString());
    const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
    const body = requestBody(init?.body);
    const request = { method, pathname: url.pathname, body };
    requests.push(request);
    if (options.failRequest?.(request)) return jsonResponse({ error: "planned failure" }, 503);

    if (method === "POST" && url.pathname === "/api/ui/learners") {
      const id = `sps_review_${String(createdIds.length + 1).padStart(8, "0")}`;
      createdIds.push(id);
      personalizationSteps.set(id, 0);
      return jsonResponse({ state: { skillpilotId: id } });
    }

    const learnerMatch = /^\/api\/ui\/learners\/([^/]+)(\/.*)?$/u.exec(url.pathname);
    if (!learnerMatch) return jsonResponse({ error: "unexpected route" }, 404);
    const id = decodeURIComponent(learnerMatch[1]!);
    const suffix = learnerMatch[2] ?? "";

    if (method === "PUT" && suffix === "/curriculum") return jsonResponse(undefined, 204);
    if (method === "GET" && suffix === "/personalization-plan") {
      return jsonResponse(personalizationPlan(personalizationSteps.get(id) ?? 0));
    }
    if (method === "POST" && suffix === "/personalization-options") {
      const nextStep = (personalizationSteps.get(id) ?? 0) + 1;
      personalizationSteps.set(id, nextStep);
      return jsonResponse(personalizationPlan(nextStep));
    }
    if (method === "POST" && suffix === "/scope") {
      return jsonResponse({ stateMachine: { goalOptions: [{ id: "first-frontier-goal" }] } });
    }
    if (method === "POST" && suffix === "/active-goal") {
      const requestedGoalId = (body as { goalId?: unknown } | undefined)?.goalId;
      return jsonResponse({ activeGoal: { id: requestedGoalId } });
    }
    if (method === "POST" && suffix === "/openai/v1/launch") {
      launchCount += 1;
      const learningSessionId = `sps_${String(launchCount).padStart(43, "a")}`;
      return jsonResponse({
        prompt: `learningSessionId: ${learningSessionId}`,
        webUrl: "https://chatgpt.com/",
        learningSessionId,
        expiresAt: "2099-01-01T00:00:00Z",
      });
    }
    if (method === "DELETE" && suffix === "") {
      deletedIds.push(id);
      return jsonResponse(undefined, 204);
    }
    return jsonResponse({ error: "unexpected request" }, 404);
  }) as typeof fetch;

  return { fetchImpl, requests, createdIds, deletedIds };
};

test("prepares six disposable review learners only through normal public learner routes", async () => {
  const mock = createMockReviewApi();
  const fixtures = await prepareSkillPilotReviewFixtures({
    baseUrl: "https://skillpilot.example",
    fetchImpl: mock.fetchImpl,
  });

  assert.equal(fixtures.learnerCount, 6);
  assert.deepEqual(mock.createdIds, [
    "sps_review_00000001",
    "sps_review_00000002",
    "sps_review_00000003",
    "sps_review_00000004",
    "sps_review_00000005",
    "sps_review_00000006",
  ]);
  assert.equal(
    fixtures.environment[SKILLPILOT_REVIEW_ENVIRONMENT.p2SkillpilotId],
    mock.createdIds[0],
  );
  for (const name of [
    SKILLPILOT_REVIEW_ENVIRONMENT.p3StartUrl,
    SKILLPILOT_REVIEW_ENVIRONMENT.p4StartUrl,
    SKILLPILOT_REVIEW_ENVIRONMENT.p5StartUrl,
    SKILLPILOT_REVIEW_ENVIRONMENT.n2StartUrl,
    SKILLPILOT_REVIEW_ENVIRONMENT.n3StartUrl,
  ]) {
    const value = fixtures.environment[name];
    assert.ok(value, `missing protected fixture environment value ${name}`);
    const url = new URL(value);
    assert.equal(url.origin, "https://chatgpt.com");
    assert.match(url.searchParams.get("prompt") ?? "", /^learningSessionId: sps_[A-Za-z0-9_-]{43}$/u);
  }
  assert.equal(
    mock.requests.filter((request) => request.method === "POST" && request.pathname === "/api/ui/learners").length,
    6,
  );
  assert.equal(
    mock.requests.filter((request) => request.method === "POST" && request.pathname.endsWith("/openai/v1/launch")).length,
    5,
  );
  const activeGoalRequests = mock.requests.filter((request) => (
    request.method === "POST" && request.pathname.endsWith("/active-goal")
  ));
  assert.deepEqual(
    activeGoalRequests.slice(0, 2).map((request) => request.body),
    [
      { goalId: ORIENTATION_GOAL_ID },
      { goalId: ORIENTATION_GOAL_ID },
    ],
    "P2 and P3 must both begin at the required orientation goal",
  );
  assert.ok(
    activeGoalRequests.every((request) => (
      (request.body as { goalId?: unknown } | undefined)?.goalId !== MEMORY_GOAL_ID
    )),
    "fixture preparation must not bypass the memory goal's orientation prerequisite",
  );
  assert.ok(mock.requests.every((request) => request.pathname.startsWith("/api/ui/learners")));
  assert.ok(mock.requests.every((request) => !/(?:admin|fixture|reset)/iu.test(request.pathname)));

  await fixtures.cleanup();
  assert.deepEqual(mock.deletedIds, [...mock.createdIds].reverse());
});

test("cleans every already-created learner when fixture preparation fails partway", async () => {
  const mock = createMockReviewApi({
    failRequest: (request) => (
      request.method === "PUT"
      && request.pathname === "/api/ui/learners/sps_review_00000002/curriculum"
    ),
  });

  await assert.rejects(
    prepareSkillPilotReviewFixtures({
      baseUrl: "https://skillpilot.example",
      fetchImpl: mock.fetchImpl,
    }),
    /Select review curriculum failed \(HTTP 503\)/u,
  );
  assert.deepEqual(mock.createdIds, ["sps_review_00000001", "sps_review_00000002"]);
  assert.deepEqual(mock.deletedIds, ["sps_review_00000002", "sps_review_00000001"]);
});

test("times out a stalled fixture request without logging its URL or learner data", async () => {
  const fetchImpl = (async (
    _input: string | URL | Request,
    init?: RequestInit,
  ): Promise<Response> => await new Promise<Response>((_resolve, reject) => {
    const signal = init?.signal;
    assert.ok(signal, "fixture requests must carry an abort signal");
    const rejectAbort = () => {
      const error = new Error("aborted");
      error.name = "AbortError";
      reject(error);
    };
    if (signal.aborted) rejectAbort();
    else signal.addEventListener("abort", rejectAbort, { once: true });
  })) as typeof fetch;

  await assert.rejects(
    prepareSkillPilotReviewFixtures({
      baseUrl: "https://skillpilot.example",
      fetchImpl,
      requestTimeoutMs: 20,
    }),
    (error: Error) => {
      assert.match(error.message, /Create disposable learner timed out after 20 ms/u);
      assert.doesNotMatch(error.message, /skillpilot\.example|api\/ui\/learners/u);
      return true;
    },
  );
});

test("retries failed deletes and retains only pending learner IDs for a later cleanup", async () => {
  const pendingId = "sps_review_00000003";
  let rejectPendingDelete = true;
  const mock = createMockReviewApi({
    failRequest: (request) => (
      rejectPendingDelete
      && request.method === "DELETE"
      && request.pathname === `/api/ui/learners/${pendingId}`
    ),
  });
  const fixtures = await prepareSkillPilotReviewFixtures({
    baseUrl: "https://skillpilot.example",
    fetchImpl: mock.fetchImpl,
    cleanupMaxAttempts: 2,
  });

  await assert.rejects(
    fixtures.cleanup(),
    /Failed to delete 1 disposable review learner\(s\); 1 cleanup operation\(s\) remain pending/u,
  );
  assert.equal(mock.deletedIds.length, 5);
  assert.ok(!mock.deletedIds.includes(pendingId));
  assert.equal(
    mock.requests.filter((request) => (
      request.method === "DELETE"
      && request.pathname === `/api/ui/learners/${pendingId}`
    )).length,
    2,
    "the first cleanup must exhaust the configured retry budget",
  );

  rejectPendingDelete = false;
  await fixtures.cleanup();
  assert.equal(mock.deletedIds.length, 6);
  assert.equal(mock.deletedIds.filter((id) => id === pendingId).length, 1);
  const deleteRequestsAfterRecovery = mock.requests.filter((request) => request.method === "DELETE").length;

  await fixtures.cleanup();
  assert.equal(
    mock.requests.filter((request) => request.method === "DELETE").length,
    deleteRequestsAfterRecovery,
    "a completed cleanup must be safely repeatable without deleting again",
  );
});

test("recovers a private cleanup ledger before creating a new review generation", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-fixture-ledger-"));
  const ledgerPath = join(directory, "pending.json");
  const previousId = "sps_review_interrupted_000001";
  try {
    await writeFile(
      ledgerPath,
      `${JSON.stringify({ schemaVersion: 1, skillpilotIds: [previousId] })}\n`,
      { mode: 0o600 },
    );
    const mock = createMockReviewApi();
    const fixtures = await prepareSkillPilotReviewFixtures({
      baseUrl: "https://skillpilot.example",
      fetchImpl: mock.fetchImpl,
      cleanupLedgerPath: ledgerPath,
    });

    const previousDelete = mock.requests.findIndex((request) => (
      request.method === "DELETE"
      && request.pathname === `/api/ui/learners/${previousId}`
    ));
    const firstCreate = mock.requests.findIndex((request) => (
      request.method === "POST" && request.pathname === "/api/ui/learners"
    ));
    assert.ok(previousDelete >= 0 && previousDelete < firstCreate);
    const activeLedger = JSON.parse(await readFile(ledgerPath, "utf8")) as {
      skillpilotIds: string[];
    };
    assert.equal(activeLedger.skillpilotIds.length, 6);
    assert.ok(!activeLedger.skillpilotIds.includes(previousId));

    await fixtures.cleanup();
    await assert.rejects(
      access(ledgerPath),
      (error: NodeJS.ErrnoException) => error.code === "ENOENT",
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("cleanup-only recovery promotes an interrupted private ledger and never creates a learner", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-fixture-ledger-"));
  const ledgerPath = join(directory, "pending.json");
  const temporaryPath = `${ledgerPath}.tmp`;
  const previousId = "sps_review_interrupted_000002";
  try {
    await writeFile(
      temporaryPath,
      `${JSON.stringify({ schemaVersion: 1, skillpilotIds: [previousId] })}\n`,
      { mode: 0o600 },
    );
    const mock = createMockReviewApi();
    const result = await cleanupPendingSkillPilotReviewFixtures({
      baseUrl: "https://skillpilot.example",
      fetchImpl: mock.fetchImpl,
      cleanupLedgerPath: ledgerPath,
    });

    assert.deepEqual(result, { deletedLearnerCount: 1, pendingLearnerCount: 0 });
    assert.deepEqual(mock.deletedIds, [previousId]);
    assert.equal(mock.createdIds.length, 0);
    await assert.rejects(
      access(ledgerPath),
      (error: NodeJS.ErrnoException) => error.code === "ENOENT",
    );
    await assert.rejects(
      access(temporaryPath),
      (error: NodeJS.ErrnoException) => error.code === "ENOENT",
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
