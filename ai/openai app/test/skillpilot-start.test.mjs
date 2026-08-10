import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const capability = `spc_${"A".repeat(43)}`;
const learningSessionId = `sps_${"B".repeat(43)}`;
const skillpilotId = "1c90a010-170f-4d48-b624-b0002c591d31";
const requestId = "11111111-1111-4111-8111-111111111111";
const now = Date.parse("2026-08-09T12:00:00Z");

async function loadStartContract() {
  const result = await build({
    entryPoints: [join(root, "widget/src/skillpilot-start.ts")],
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node20",
    write: false
  });
  const source = result.outputFiles[0]?.text;
  assert.ok(source);
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
}

const contractLine = {
  contractMajor: 1,
  policyRevision: 2,
  displayName: "SkillPilot Coach v1",
  supportLifecycle: "CURRENT",
  publicationStatus: "DRAFT",
  newSessionPolicy: "ALLOW",
  successor: null
};

const openStructuredContent = {
  status: "ID_REQUIRED",
  supportedLocales: ["de", "en"],
  fallbackUrl: "https://skillpilot.com/"
};

function openToolResult(structuredOverrides = {}, metadataOverrides = {}) {
  return {
    structuredContent: {
      ...openStructuredContent,
      ...structuredOverrides
    },
    _meta: {
      skillpilotStart: {
        schemaVersion: 1,
        contractLine,
        ...metadataOverrides
      }
    }
  };
}

function capabilityResult(overrides = {}, metadataOverrides = {}) {
  return {
    structuredContent: {
      status: "CAPABILITY_ISSUED",
      contractMajor: 1,
      providerNoticeVersion: "openai-provider-eligibility-v2",
      ...overrides
    },
    _meta: {
      skillpilotStart: {
        schemaVersion: 1,
        setupCapability: capability,
        expiresAt: "2026-08-09T12:05:00Z",
        contractMajor: 1,
        policyRevision: 2,
        providerNoticeVersion: "openai-provider-eligibility-v2",
        sourceMajorDecision: "ALLOW_CURRENT_MAJOR",
        ...metadataOverrides
      }
    }
  };
}

test("public open result is closed, ID_REQUIRED, and contains no capability", async () => {
  const { skillPilotStartOpenFromToolResult } = await loadStartContract();

  assert.deepEqual(
    skillPilotStartOpenFromToolResult(openToolResult()),
    {
      ...openStructuredContent,
      contractLine,
      defaultLocale: "de"
    }
  );

  for (const result of [
    {
      structuredContent: { ...openStructuredContent, setupCapability: capability }
    },
    {
      ...openToolResult(),
      _meta: {
        skillpilotStart: {
          schemaVersion: 1,
          contractLine,
          setupCapability: capability
        }
      }
    },
    openToolResult({ fallbackUrl: "https://skillpilot.com/start" }),
    openToolResult({ supportedLocales: ["en", "de"] }),
    openToolResult({}, {
      contractLine: { ...contractLine, newSessionPolicy: "BLOCK" }
    }),
    openToolResult({}, { extra: true })
  ]) {
    assert.equal(skillPilotStartOpenFromToolResult(result), undefined);
  }
});

test("lifecycle projection allows only closed, allowlisted combinations and URLs", async () => {
  const { skillPilotStartOpenFromToolResult } = await loadStartContract();
  const successor = {
    contractMajor: 2,
    displayName: "SkillPilot Coach v2",
    handoffUrl: "https://skillpilot.com/openai/coach-v2"
  };

  assert.ok(skillPilotStartOpenFromToolResult(openToolResult({}, {
    contractLine: {
      ...contractLine,
      supportLifecycle: "DEPRECATED",
      publicationStatus: "PUBLISHED",
      newSessionPolicy: "WARN",
      successor
    }
  })));
  assert.ok(skillPilotStartOpenFromToolResult(openToolResult(
    { status: "MAJOR_UPGRADE_REQUIRED" },
    { contractLine: { ...contractLine, newSessionPolicy: "BLOCK", successor } }
  )));
  assert.ok(skillPilotStartOpenFromToolResult(openToolResult(
    { status: "TEMPORARILY_UNAVAILABLE" },
    { contractLine: { ...contractLine, newSessionPolicy: "BLOCK" } }
  )));

  for (const invalid of [
    { ...contractLine, extra: true },
    {
      ...contractLine,
      newSessionPolicy: "WARN",
      successor: { ...successor, handoffUrl: "https://evil.example/" }
    },
    {
      ...contractLine,
      newSessionPolicy: "WARN",
      successor: { ...successor, contractMajor: 3 }
    },
    {
      ...contractLine,
      newSessionPolicy: "WARN",
      successor: { ...successor, displayName: "Another Coach v2" }
    },
    {
      ...contractLine,
      supportLifecycle: "RETIRED",
      publicationStatus: "PUBLISHED",
      newSessionPolicy: "BLOCK"
    }
  ]) {
    assert.equal(skillPilotStartOpenFromToolResult(
      openToolResult({}, { contractLine: invalid })
    ), undefined);
  }
});

test("app-only capability arguments are ID-free and encode the explicit policy decision", async () => {
  const {
    createSkillPilotCapabilityArguments,
    skillPilotStartOpenFromToolResult
  } = await loadStartContract();
  const start = skillPilotStartOpenFromToolResult(openToolResult());
  assert.ok(start);

  const arguments_ = createSkillPilotCapabilityArguments(start, true);
  assert.deepEqual(arguments_, {
    providerNoticeVersion: "openai-provider-eligibility-v2",
    providerEligibilityConfirmed: true
  });
  assert.doesNotMatch(JSON.stringify(arguments_), /skillpilot.?id|learner|session/i);
  assert.equal(createSkillPilotCapabilityArguments(start, false), undefined);

  const warnStart = skillPilotStartOpenFromToolResult(openToolResult({}, {
    contractLine: {
      ...contractLine,
      newSessionPolicy: "WARN",
      successor: {
        contractMajor: 2,
        displayName: "SkillPilot Coach v2",
        handoffUrl: "https://skillpilot.com/openai/coach-v2"
      }
    }
  }));
  assert.ok(warnStart);
  assert.deepEqual(createSkillPilotCapabilityArguments(warnStart, true), {
    providerNoticeVersion: "openai-provider-eligibility-v2",
    providerEligibilityConfirmed: true,
    sourceMajorDecision: "START_CURRENT_MAJOR"
  });
});

test("private capability metadata is strictly closed, bounded, and never read from structuredContent", async () => {
  const { skillPilotCapabilityFromToolResult } = await loadStartContract();

  assert.deepEqual(skillPilotCapabilityFromToolResult(capabilityResult(), undefined, now), {
    setupCapability: capability,
    expiresAt: "2026-08-09T12:05:00Z",
    contractMajor: 1,
    policyRevision: 2,
    sourceMajorDecision: "ALLOW_CURRENT_MAJOR",
    providerNoticeVersion: "openai-provider-eligibility-v2"
  });

  for (const invalid of [
    capabilityResult({}, { setupCapability: `spc_${"A".repeat(42)}` }),
    capabilityResult({}, { setupCapability: `spc_${"!".repeat(43)}` }),
    capabilityResult({}, { expiresAt: "2026-08-09T12:20:00Z" }),
    capabilityResult({}, { contractMajor: 2 }),
    capabilityResult({}, { policyRevision: 0 }),
    capabilityResult({}, { policyRevision: "1" }),
    capabilityResult({}, { sourceMajorDecision: "UNKNOWN" }),
    capabilityResult({}, { providerNoticeVersion: "old" }),
    capabilityResult({}, { extra: true }),
    {
      structuredContent: {
        status: "CAPABILITY_ISSUED",
        contractMajor: 1,
        providerNoticeVersion: "openai-provider-eligibility-v2",
        setupCapability: capability
      }
    }
  ]) {
    assert.equal(skillPilotCapabilityFromToolResult(invalid, undefined, now), undefined);
  }
});

test("direct bootstrap uses the one fixed endpoint and the exact privacy boundary", async () => {
  const {
    createSkillPilotBootstrapRequest,
    skillPilotBootstrapFetchInit
  } = await loadStartContract();
  const request = createSkillPilotBootstrapRequest(
    {
      setupCapability: capability,
      expiresAt: "2026-08-09T12:05:00Z",
      contractMajor: 1,
      policyRevision: 2,
      sourceMajorDecision: "ALLOW_CURRENT_MAJOR",
      providerNoticeVersion: "openai-provider-eligibility-v2"
    },
    "EXISTING",
    ` ${skillpilotId.slice(0, 8)} ${skillpilotId.slice(8)} `,
    "de",
    requestId,
    now
  );
  assert.ok(request);
  assert.equal(
    request.endpoint,
    "https://mcp-coach-v1.skillpilot.com/bootstrap/v1/launch"
  );
  assert.deepEqual(request.body, {
    schemaVersion: 1,
    identityMode: "EXISTING",
    skillpilotId,
    communicationLocale: "de",
    launchIntent: { type: "CURRENT_UNIT" },
    providerNoticeVersion: "openai-provider-eligibility-v2",
    clientRequestId: requestId
  });
  assert.equal(request.capabilityExpiresAtMs, Date.parse("2026-08-09T12:05:00Z"));

  const init = skillPilotBootstrapFetchInit(request);
  assert.equal(init.method, "POST");
  assert.equal(init.credentials, "omit");
  assert.equal(init.redirect, "error");
  assert.equal(init.cache, "no-store");
  assert.equal(init.referrerPolicy, "no-referrer");
  assert.deepEqual(init.headers, {
    Authorization: `SkillPilotSetup ${capability}`,
    "Content-Type": "application/json"
  });
  assert.deepEqual(JSON.parse(init.body), request.body);
  assert.doesNotMatch(JSON.stringify(init), /oauth|client.?secret|refresh.?token/i);
});

test("CREATE bootstrap omits the permanent ID and accepts it only from the private HTTPS response", async () => {
  const {
    createSkillPilotBootstrapRequest,
    sendSkillPilotBootstrap
  } = await loadStartContract();
  const request = createSkillPilotBootstrapRequest(
    {
      setupCapability: capability,
      expiresAt: new Date(Date.now() + 5 * 60 * 1_000).toISOString(),
      contractMajor: 1,
      policyRevision: 2,
      sourceMajorDecision: "ALLOW_CURRENT_MAJOR",
      providerNoticeVersion: "openai-provider-eligibility-v2"
    },
    "CREATE",
    undefined,
    "de",
    requestId
  );
  assert.ok(request);
  assert.deepEqual(request.body, {
    schemaVersion: 1,
    identityMode: "CREATE",
    communicationLocale: "de",
    launchIntent: { type: "CURRENT_UNIT" },
    providerNoticeVersion: "openai-provider-eligibility-v2",
    clientRequestId: requestId
  });
  assert.equal(Object.hasOwn(request.body, "skillpilotId"), false);
  assert.equal(createSkillPilotBootstrapRequest(
    {
      setupCapability: capability,
      expiresAt: new Date(Date.now() + 5 * 60 * 1_000).toISOString(),
      contractMajor: 1,
      policyRevision: 2,
      sourceMajorDecision: "ALLOW_CURRENT_MAJOR",
      providerNoticeVersion: "openai-provider-eligibility-v2"
    },
    "CREATE",
    skillpilotId,
    "de",
    requestId
  ), undefined);

  const responseBody = {
    schemaVersion: 1,
    status: "SESSION_CREATED",
    communicationLocale: "de",
    expiresAt: new Date(Date.now() + 60 * 60 * 1_000).toISOString(),
    startMessage: `Verwende SkillPilot Coach v1 und fahre fort.\nlearningSessionId: ${learningSessionId}`,
    createdSkillpilotId: skillpilotId
  };
  assert.deepEqual(
    await sendSkillPilotBootstrap(request, undefined, async (url) => ({
      ok: true,
      redirected: false,
      url,
      headers: { get: () => "application/json" },
      text: async () => JSON.stringify(responseBody)
    })),
    responseBody
  );
  await assert.rejects(
    sendSkillPilotBootstrap(request, undefined, async (url) => ({
      ok: true,
      redirected: false,
      url,
      headers: { get: () => "application/json" },
      text: async () => JSON.stringify({
        ...responseBody,
        createdSkillpilotId: undefined
      }, (_key, value) => value === undefined ? undefined : value)
    })),
    /invalid-bootstrap-identity-result/
  );
});

test("bootstrap response is closed and the start message is accepted only from HTTPS JSON", async () => {
  const {
    createSkillPilotBootstrapRequest,
    sendSkillPilotBootstrap,
    skillPilotLaunchFromHttpResponse
  } = await loadStartContract();
  const responseBody = {
    schemaVersion: 1,
    status: "SESSION_CREATED",
    communicationLocale: "en",
    expiresAt: "2026-08-10T11:00:00Z",
    startMessage: `Use SkillPilot Coach v1 and continue.\nlearningSessionId: ${learningSessionId}`
  };

  assert.deepEqual(
    skillPilotLaunchFromHttpResponse(responseBody, now),
    responseBody
  );
  for (const invalid of [
    { ...responseBody, extra: true },
    { ...responseBody, startMessage: `learningSessionId: ${learningSessionId}` },
    { ...responseBody, startMessage: `Use SkillPilot Coach v1 and continue.\nlearningSessionId: invalid` },
    { ...responseBody, communicationLocale: "de" },
    { ...responseBody, expiresAt: "not-an-instant" }
  ]) {
    assert.equal(skillPilotLaunchFromHttpResponse(invalid, now), undefined);
  }

  const liveResponseBody = {
    ...responseBody,
    expiresAt: new Date(Date.now() + 60 * 60 * 1_000).toISOString()
  };
  const request = createSkillPilotBootstrapRequest(
    {
      setupCapability: capability,
      expiresAt: new Date(Date.now() + 5 * 60 * 1_000).toISOString(),
      contractMajor: 1,
      policyRevision: 2,
      sourceMajorDecision: "ALLOW_CURRENT_MAJOR",
      providerNoticeVersion: "openai-provider-eligibility-v2"
    },
    "EXISTING",
    skillpilotId,
    "en",
    requestId
  );
  assert.ok(request);
  const calls = [];
  const fakeFetch = async (url, init) => {
    calls.push({ url, init });
    return {
      ok: true,
      redirected: false,
      url,
      headers: { get: () => "application/json; charset=utf-8" },
      text: async () => JSON.stringify(liveResponseBody)
    };
  };
  assert.deepEqual(
    await sendSkillPilotBootstrap(request, undefined, fakeFetch),
    liveResponseBody
  );
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, request.endpoint);
});

test("bootstrap error envelopes are closed and distinguish terminal from retryable failures", async () => {
  const {
    SkillPilotBootstrapHttpError,
    createSkillPilotBootstrapRequest,
    sendSkillPilotBootstrap,
    skillPilotBootstrapErrorFromHttpResponse
  } = await loadStartContract();
  const terminal = {
    schemaVersion: 1,
    status: "PROFILE_UNAVAILABLE",
    fallbackUrl: "https://skillpilot.com/"
  };
  assert.equal(skillPilotBootstrapErrorFromHttpResponse(terminal), "PROFILE_UNAVAILABLE");
  assert.equal(skillPilotBootstrapErrorFromHttpResponse({ ...terminal, extra: true }), undefined);
  assert.equal(skillPilotBootstrapErrorFromHttpResponse({
    ...terminal,
    fallbackUrl: "https://evil.example/"
  }), undefined);

  const request = createSkillPilotBootstrapRequest(
    {
      setupCapability: capability,
      expiresAt: new Date(Date.now() + 5 * 60 * 1_000).toISOString(),
      contractMajor: 1,
      policyRevision: 2,
      sourceMajorDecision: "ALLOW_CURRENT_MAJOR",
      providerNoticeVersion: "openai-provider-eligibility-v2"
    },
    "EXISTING",
    skillpilotId,
    "de",
    requestId
  );
  assert.ok(request);

  for (const [status, retryable] of [
    ["PROFILE_UNAVAILABLE", false],
    ["TEMPORARILY_UNAVAILABLE", true]
  ]) {
    await assert.rejects(
      sendSkillPilotBootstrap(request, undefined, async (url) => ({
        ok: false,
        redirected: false,
        url,
        headers: { get: () => "application/json" },
        text: async () => JSON.stringify({ ...terminal, status })
      })),
      (error) => error instanceof SkillPilotBootstrapHttpError
        && error.status === status
        && error.retryable === retryable
    );
  }
});

test("only the one exact first-party fallback is accepted", async () => {
  const { isExactSkillPilotFallbackUrl } = await loadStartContract();
  assert.equal(isExactSkillPilotFallbackUrl("https://skillpilot.com/"), true);
  for (const value of [
    "https://skillpilot.com/start",
    "https://mcp-coach-v1.skillpilot.com/",
    "http://skillpilot.com/",
    "https://skillpilot.com.evil.example/",
    "/"
  ]) {
    assert.equal(isExactSkillPilotFallbackUrl(value), false);
  }
});

test("setup parser and call builders expose only the bounded session-scoped setup contract", async () => {
  const {
    createSkillPilotGetContextCall,
    createSkillPilotSetupMutationCall,
    learningSessionIdFromStartMessage,
    skillPilotSetupStateFromToolResult
  } = await loadStartContract();
  assert.equal(
    learningSessionIdFromStartMessage(
      `Verwende SkillPilot Coach v1 und fahre fort.\nlearningSessionId: ${learningSessionId}`,
      "de"
    ),
    learningSessionId
  );
  assert.deepEqual(createSkillPilotGetContextCall(learningSessionId), {
    name: "get_skillpilot_context",
    arguments: { learningSessionId }
  });

  const curriculumState = {
    stateVersion: 3,
    communicationLocale: "de",
    requiredAction: "setCurriculum",
    options: [{
      kind: "curriculum",
      id: "DE_GYMNASIUM",
      label: "Gymnasium (DE)",
      description: "Schulische Lernumgebung"
    }],
    decision: null,
    learningState: "setup"
  };
  assert.deepEqual(skillPilotSetupStateFromToolResult({
    structuredContent: curriculumState,
    isError: false
  }, "de"), {
    stateVersion: 3,
    communicationLocale: "de",
    requiredAction: "setCurriculum",
    options: [{
      id: "DE_GYMNASIUM",
      label: "Gymnasium (DE)",
      description: "Schulische Lernumgebung"
    }]
  });
  assert.deepEqual(createSkillPilotSetupMutationCall(
    "setCurriculum",
    learningSessionId,
    3,
    "DE_GYMNASIUM",
    requestId
  ), {
    name: "set_skillpilot_curriculum",
    arguments: {
      learningSessionId,
      curriculumId: "DE_GYMNASIUM",
      expectedStateVersion: 3,
      clientRequestId: requestId
    }
  });
  assert.deepEqual(createSkillPilotSetupMutationCall(
    "setPersonalization",
    learningSessionId,
    4,
    "opaque-option",
    requestId
  ), {
    name: "set_skillpilot_personalization",
    arguments: {
      learningSessionId,
      optionId: "opaque-option",
      expectedStateVersion: 4,
      clientRequestId: requestId
    }
  });
  for (const invalid of [
    { ...curriculumState, communicationLocale: "en" },
    { ...curriculumState, stateVersion: -1 },
    { ...curriculumState, options: [] },
    { ...curriculumState, options: [{ ...curriculumState.options[0], extra: true }] },
    { ...curriculumState, options: [{ ...curriculumState.options[0], kind: "personalization" }] },
    { ...curriculumState, requiredAction: "unknownAction" }
  ]) {
    assert.equal(skillPilotSetupStateFromToolResult({
      structuredContent: invalid,
      isError: false
    }, "de"), undefined);
  }
  assert.deepEqual(skillPilotSetupStateFromToolResult({
    structuredContent: {
      ...curriculumState,
      stateVersion: 5,
      requiredAction: "setScope",
      options: [{ kind: "scope", id: "never-forwarded", label: "Scope" }]
    },
    isError: false
  }, "de"), {
    stateVersion: 5,
    communicationLocale: "de",
    requiredAction: null,
    options: []
  });
});
