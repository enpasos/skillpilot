import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, relative, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  loadDirectInstallBetaLane,
  prepareClaudeDirectInstallBetaPublication,
  validateClaudePluginPublicationIndex,
  validateDirectInstallBetaExactClientEvidence,
  validateDirectInstallBetaLane,
  validateDirectInstallBetaPrivacyEvidence,
  verifyClaudeDirectInstallBetaPublication,
  verifyPublicClaudeDirectInstallBetaPublication,
} from "./claude_direct_install_beta_release.mjs";

const scriptRoot = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptRoot, "..");
const laneRelativePath =
  "ai/claude/plugin/skillpilot-coach-v1/release/direct-install-beta.json";
const exactClientEvidenceRelativeRoot =
  "ai/claude/plugin/skillpilot-coach-v1/release/evidence/controlled-direct-install-beta";
const privacyEvidenceRelativeRoot = exactClientEvidenceRelativeRoot;
const privacyNoticeRelativePath =
  "backend/src/main/resources/claude-connector-v1/privacy.html";
const manifestRelativePath =
  "ai/claude/plugin/skillpilot-coach-v1/.claude-plugin/plugin.json";
const publicationRelativeRoot =
  "backend/src/main/resources/claude-plugin-publication";
const canonicalLane = JSON.parse(
  readFileSync(resolve(repositoryRoot, laneRelativePath), "utf8"),
);
const canonicalExactClientEvidence = JSON.parse(
  readFileSync(
    resolve(
      repositoryRoot,
      exactClientEvidenceRelativePath(canonicalLane.candidate.version),
    ),
    "utf8",
  ),
);
const canonicalPrivacyEvidence = JSON.parse(
  readFileSync(
    resolve(
      repositoryRoot,
      privacyEvidenceRelativePath(canonicalLane.candidate.version),
    ),
    "utf8",
  ),
);
const canonicalPrivacyNotice = readFileSync(
  resolve(repositoryRoot, privacyNoticeRelativePath),
);
const fixtureVersion = "1.2.3";
const preparedAt = "2026-08-25T12:34:56.000Z";
const deterministicBytes = Buffer.from("deterministic Claude plugin fixture\n");

test("production direct-install lane has the isolated, fail-closed beta semantics", () => {
  validateDirectInstallBetaLane(canonicalLane);
  validateDirectInstallBetaExactClientEvidence(
    canonicalExactClientEvidence,
    canonicalLane,
  );
  validateDirectInstallBetaPrivacyEvidence(
    canonicalPrivacyEvidence,
    canonicalLane,
    repositoryRoot,
  );
  loadDirectInstallBetaLane(repositoryRoot);
  assert.equal(canonicalLane.lane, "controlled_direct_install_beta");
  assert.deepEqual(canonicalLane.officialDistribution, {
    anthropicConsole: "deferred",
    connectorsDirectory: "deferred",
  });
  assert.deepEqual(canonicalLane.publication, {
    resourceRoot: publicationRelativeRoot,
    downloadBasePath: "/api/public/claude/plugins",
    accessModel: "first_party_guided_beta",
  });
  assert.deepEqual(canonicalLane.candidate, {
    version: "1.1.0",
    sha256: "ecb6e2d255699162a3221518d32eb4ee9de918cb5fce254f1cd67da0ac59f4ca",
  });
  assert.deepEqual(canonicalLane.planSemantics, {
    supportBaseline: "claude_pro",
    technicalRequirement: "paid_claude_plan",
  });
  assert.deepEqual(canonicalLane.requirements, {
    minimumAge: 18,
    plan: "claude-pro",
    installSurface: "claude-web",
    testedSurfaces: [],
    voiceMode: false,
  });
  assert.equal(canonicalLane.readiness.controlledBetaReady, false);
  assert.equal(canonicalLane.readiness.guidedFirstPartyBetaReady, false);
  assert.equal(canonicalLane.readiness.openPublicBetaReady, false);
  assert.ok(
    canonicalLane.readiness.controlledBetaEvidence
      .filter(({ status }) => status === "pending")
      .every(({ evidenceRef }) => evidenceRef === null),
  );
  const privacyBlocker = canonicalLane.readiness.openPublicBetaBlockers.find(
    ({ id }) => id === "privacy-approval",
  );
  assert.deepEqual(privacyBlocker, {
    id: "privacy-approval",
    status: "pending",
    evidenceRef: null,
  });
  assert.ok(
    canonicalLane.readiness.openPublicBetaBlockers.every(
      ({ status, evidenceRef }) => status === "pending" && evidenceRef === null,
    ),
  );
  assert.equal(canonicalExactClientEvidence.status, "pending");
  assert.deepEqual(
    canonicalExactClientEvidence.checks.map(({ id }) => id),
    [
      "web-single-plugin-bundled-connector-oauth",
      "first-party-fresh-session-handoff",
      "web-coaching-and-both-mcp-apps",
      "web-learning-plan-today-all-subjects",
      "web-learning-plan-automatic-resume",
      "web-learning-plan-subject-switch",
      "web-goal-visualization-after-goal-change",
      "web-active-goal-completion-persisted",
      "web-backend-selected-successor",
      "web-no-policy-instruction-or-internal-deliberation-narration",
      "web-no-lazy-schema-parameter-or-retry-narration",
      "web-clear-start-intent-saved-without-extra-confirmation",
      "web-no-durable-anchor-memory-claim",
      "android-context-and-both-mcp-apps",
      "android-voice-current-context",
      "android-voice-learning-plan-today-all-subjects",
      "android-voice-learning-plan-automatic-resume",
      "android-voice-learning-plan-subject-switch",
      "android-voice-active-goal-completion-persisted",
      "android-voice-backend-selected-successor",
      "android-voice-no-policy-instruction-or-internal-deliberation-narration",
      "android-voice-no-lazy-schema-parameter-or-retry-narration",
      "android-voice-clear-start-intent-saved-without-extra-confirmation",
      "android-voice-no-durable-anchor-memory-claim",
      "learning-plan-unavailable-count-safe-warning",
      "no-duplicate-or-protected-data-disclosure",
    ],
  );
  assert.ok(
    canonicalExactClientEvidence.checks.every(({ status }) => status === "pending"),
  );
  assert.equal(canonicalPrivacyEvidence.status, "pending");
  assert.deepEqual(
    canonicalPrivacyEvidence.checks.find(
      ({ id }) => id === "daily-plan-subject-counts-without-plan-identifiers",
    ),
    {
      id: "daily-plan-subject-counts-without-plan-identifiers",
      status: "pending",
    },
  );
  assert.ok(
    canonicalPrivacyEvidence.checks.every(({ status }) => status === "pending"),
  );
});

test("public verification checks the SPA route, exact index, immutable headers and artifact bytes", async () => {
  await withPreparedFixtureAsync(async ({
    root,
    publicationRoot,
    buildPackage,
  }) => {
    const baseUrl = "http://127.0.0.1:43127";
    const indexBytes = readFileSync(resolve(publicationRoot, "index.json"));
    const index = JSON.parse(indexBytes.toString("utf8"));
    assert.equal(Object.hasOwn(index, "accessModel"), false);
    assert.equal(Object.hasOwn(index, "readiness"), false);
    const plugin = index.plugins[0];
    const artifactPath = resolve(
      publicationRoot,
      plugin.id,
      plugin.version,
      `sha256-${plugin.sha256}`,
      plugin.filename,
    );
    const artifactBytes = readFileSync(artifactPath);
    const requested = [];
    const fetchImpl = async (url, options) => {
      requested.push({ url: url.href, options });
      if (url.pathname === "/plugins") {
        return new Response('<!doctype html><div id="root"></div>', {
          status: 200,
          headers: { "content-type": "text/html; charset=UTF-8" },
        });
      }
      if (url.pathname === "/api/public/claude/plugins/index.json") {
        return new Response(indexBytes, {
          status: 200,
          headers: {
            "cache-control": "no-store",
            "content-length": String(indexBytes.length),
            "content-type": "application/json",
            "x-content-type-options": "nosniff",
          },
        });
      }
      if (url.pathname === plugin.downloadUrl) {
        return new Response(artifactBytes, {
          status: 200,
          headers: {
            "cache-control": "max-age=31536000, public, immutable",
            "content-disposition": `attachment; filename="${plugin.filename}"`,
            "content-length": String(artifactBytes.length),
            "content-type": "application/octet-stream",
            etag: `"sha256-${plugin.sha256}"`,
            "x-content-type-options": "nosniff",
          },
        });
      }
      return new Response("not found", { status: 404 });
    };

    const result = await verifyPublicClaudeDirectInstallBetaPublication({
      repositoryRoot: root,
      baseUrl,
      fetchImpl,
      buildPackage,
    });

    assert.equal(result.pageUrl, `${baseUrl}/plugins`);
    assert.equal(
      result.indexUrl,
      `${baseUrl}/api/public/claude/plugins/index.json`,
    );
    assert.equal(result.artifactUrl, `${baseUrl}${plugin.downloadUrl}`);
    assert.deepEqual(
      requested.map(({ url }) => url),
      [result.pageUrl, result.indexUrl, result.artifactUrl],
    );
    for (const { options } of requested) {
      assert.equal(options.method, "GET");
      assert.equal(options.redirect, "error");
      assert.equal(options.headers["accept-encoding"], "identity");
    }
  });
});

test("public verification rejects remote artifact bytes that differ from the prepared candidate", async () => {
  await withPreparedFixtureAsync(async ({
    root,
    publicationRoot,
    buildPackage,
  }) => {
    const baseUrl = "http://localhost:43128";
    const indexBytes = readFileSync(resolve(publicationRoot, "index.json"));
    const index = JSON.parse(indexBytes.toString("utf8"));
    const plugin = index.plugins[0];
    const tamperedBytes = Buffer.alloc(plugin.bytes, 0x78);
    const fetchImpl = async (url) => {
      if (url.pathname === "/plugins") {
        return new Response('<div id="root"></div>', {
          status: 200,
          headers: { "content-type": "text/html" },
        });
      }
      if (url.pathname === "/api/public/claude/plugins/index.json") {
        return new Response(indexBytes, {
          status: 200,
          headers: {
            "cache-control": "no-store",
            "content-length": String(indexBytes.length),
            "content-type": "application/json",
            "x-content-type-options": "nosniff",
          },
        });
      }
      return new Response(tamperedBytes, {
        status: 200,
        headers: {
          "cache-control": "immutable, public, max-age=31536000",
          "content-disposition": `attachment; filename="${plugin.filename}"`,
          "content-length": String(tamperedBytes.length),
          "content-type": "application/octet-stream",
          etag: `"sha256-${plugin.sha256}"`,
          "x-content-type-options": "nosniff",
        },
      });
    };

    await assert.rejects(
      verifyPublicClaudeDirectInstallBetaPublication({
        repositoryRoot: root,
        baseUrl,
        fetchImpl,
        buildPackage,
      }),
      /public Claude plugin artifact SHA-256 mismatch/u,
    );
  });
});

test("prepare writes only the closed index and immutable versioned artifact, then verify rebuilds byte-identically", () => {
  withFixture(({ root, packageRoot, publicationRoot }) => {
    const calls = [];
    const builder = fixtureBuilder(deterministicBytes, calls);
    const prepared = prepareClaudeDirectInstallBetaPublication({
      repositoryRoot: root,
      preparedAt,
      buildPackage: builder,
    });

    const digest = sha256(deterministicBytes);
    const filename = `skillpilot-coach-v1-${fixtureVersion}.plugin`;
    const artifactRelativePath =
      `skillpilot-coach-v1/${fixtureVersion}/sha256-${digest}/${filename}`;
    assert.equal(prepared.filename, filename);
    assert.equal(prepared.version, fixtureVersion);
    assert.equal(prepared.bytes, deterministicBytes.length);
    assert.equal(prepared.sha256, digest);
    assert.equal(
      relative(publicationRoot, prepared.artifactPath),
      artifactRelativePath,
    );
    assert.deepEqual(readFileSync(prepared.artifactPath), deterministicBytes);

    const index = readJson(resolve(publicationRoot, "index.json"));
    assert.deepEqual(Object.keys(index), [
      "schemaVersion",
      "channel",
      "preparedAt",
      "plugins",
    ]);
    assert.equal(index.schemaVersion, 1);
    assert.equal(index.channel, "beta");
    assert.equal(index.preparedAt, preparedAt);
    assert.equal(index.plugins.length, 1);
    assert.deepEqual(Object.keys(index.plugins[0]), [
      "id",
      "name",
      "version",
      "status",
      "filename",
      "bytes",
      "sha256",
      "downloadUrl",
      "sourceUrl",
      "privacyUrl",
      "termsUrl",
      "supportEmail",
      "requirements",
    ]);
    assert.equal(index.plugins[0].filename, filename);
    assert.equal(index.plugins[0].bytes, deterministicBytes.length);
    assert.equal(index.plugins[0].sha256, digest);
    assert.equal(
      index.plugins[0].downloadUrl,
      `/api/public/claude/plugins/${artifactRelativePath}`,
    );
    assert.deepEqual(index.plugins[0].requirements, canonicalLane.requirements);
    assert.equal(index.plugins[0].requirements.voiceMode, false);
    assert.deepEqual(
      readdirSync(publicationRoot).sort(),
      ["index.json", "skillpilot-coach-v1"],
    );

    const verified = verifyClaudeDirectInstallBetaPublication({
      repositoryRoot: root,
      buildPackage: builder,
    });
    assert.equal(verified.artifactPath, prepared.artifactPath);
    assert.equal(verified.sha256, digest);
    assert.equal(calls.length, 2);
    for (const call of calls) {
      assert.equal(call.root, packageRoot);
      assert.equal(call.outputPath.startsWith(root), false);
      assert.match(call.outputPath, /skillpilot-claude-direct-install-beta-/u);
    }
    assert.deepEqual(listFixtureFiles(root), [
      manifestRelativePath,
      laneRelativePath,
      exactClientEvidenceRelativePath(fixtureVersion),
      privacyEvidenceRelativePath(fixtureVersion),
      privacyNoticeRelativePath,
      `${publicationRelativeRoot}/index.json`,
      `${publicationRelativeRoot}/${artifactRelativePath}`,
    ]);
  });
});

test("verify rejects source bytes that no longer reproduce the published artifact", () => {
  const publishedBytes = Buffer.from("AAAA");
  withFixture(({ root }) => {
    prepareClaudeDirectInstallBetaPublication({
      repositoryRoot: root,
      preparedAt,
      buildPackage: fixtureBuilder(publishedBytes),
    });
    assert.throws(
      () => verifyClaudeDirectInstallBetaPublication({
        repositoryRoot: root,
        buildPackage: fixtureBuilder(Buffer.from("BBBB")),
      }),
      /rebuilt plugin SHA-256 mismatch/u,
    );
  }, publishedBytes);
});

test("verify rejects a stored artifact whose bytes no longer match its index", () => {
  withFixture(({ root }) => {
    const prepared = prepareClaudeDirectInstallBetaPublication({
      repositoryRoot: root,
      preparedAt,
      buildPackage: fixtureBuilder(deterministicBytes),
    });
    writeFileSync(prepared.artifactPath, Buffer.from("tampered"));
    assert.throws(
      () => verifyClaudeDirectInstallBetaPublication({
        repositoryRoot: root,
        buildPackage: fixtureBuilder(deterministicBytes),
      }),
      /published artifact .* SHA-256 mismatch/u,
    );
  });
});

test("prepare never rebinds an existing version to different bytes", () => {
  const firstBytes = Buffer.from("first immutable bytes");
  const secondBytes = Buffer.from("different immutable bytes");
  withFixture(({
    root,
    lanePath,
    exactClientEvidencePath,
    privacyEvidencePath,
  }) => {
    const first = prepareClaudeDirectInstallBetaPublication({
      repositoryRoot: root,
      preparedAt,
      buildPackage: fixtureBuilder(firstBytes),
    });
    const before = readFileSync(first.artifactPath);
    const lane = readJson(lanePath);
    lane.candidate.sha256 = sha256(secondBytes);
    writeJson(lanePath, lane);
    writeJson(exactClientEvidencePath, fixtureExactClientEvidence(lane));
    writeJson(privacyEvidencePath, fixturePrivacyEvidence(lane));
    assert.throws(
      () => prepareClaudeDirectInstallBetaPublication({
        repositoryRoot: root,
        preparedAt: "2026-08-25T12:35:56.000Z",
        buildPackage: fixtureBuilder(secondBytes),
      }),
      /Refusing to rebind an existing Claude plugin version/u,
    );
    assert.deepEqual(readFileSync(first.artifactPath), before);
    assert.equal(readJson(first.indexPath).preparedAt, preparedAt);
  }, firstBytes);
});

test("prepare rejects package bytes without exact candidate evidence", () => {
  withFixture(({ root }) => {
    assert.throws(
      () => prepareClaudeDirectInstallBetaPublication({
        repositoryRoot: root,
        preparedAt,
        buildPackage: fixtureBuilder(Buffer.from("untested candidate bytes")),
      }),
      /rebuilt candidate SHA-256 mismatch/u,
    );
  });
});

test("prepare is idempotent for identical version bytes", () => {
  withFixture(({ root, publicationRoot }) => {
    const builder = fixtureBuilder(deterministicBytes);
    const first = prepareClaudeDirectInstallBetaPublication({
      repositoryRoot: root,
      preparedAt,
      buildPackage: builder,
    });
    const secondPreparedAt = "2026-08-25T12:35:56.000Z";
    const second = prepareClaudeDirectInstallBetaPublication({
      repositoryRoot: root,
      preparedAt: secondPreparedAt,
      buildPackage: builder,
    });
    assert.equal(second.artifactPath, first.artifactPath);
    assert.equal(readJson(resolve(publicationRoot, "index.json")).preparedAt, secondPreparedAt);
  });
});

test("index validation rejects unsafe, non-canonical download URLs", () => {
  withPreparedFixture(({ index, lane, manifest }) => {
    for (const unsafeUrl of [
      "https://skillpilot.com/api/public/claude/plugins/file.plugin",
      "//evil.example/file.plugin",
      "/api/public/claude/plugins/../file.plugin",
      "/api/public/claude/plugins/file.plugin?download=1",
      "/api/public/claude/plugins/file.plugin#fragment",
      "/api/public/claude/plugins/%2e%2e/file.plugin",
      "/api\\public\\claude\\plugins\\file.plugin",
    ]) {
      const mutated = clone(index);
      mutated.plugins[0].downloadUrl = unsafeUrl;
      assert.throws(
        () => validateClaudePluginPublicationIndex(mutated, lane, manifest),
        /downloadUrl/u,
        unsafeUrl,
      );
    }
  });
});

test("index validation enforces the exact schema and exactly one plugin", () => {
  withPreparedFixture(({ index, lane, manifest }) => {
    const cases = [
      ["top-level extension", (value) => { value.extra = true; }],
      ["plugin extension", (value) => { value.plugins[0].extra = true; }],
      ["requirements extension", (value) => {
        value.plugins[0].requirements.extra = true;
      }],
      ["second plugin", (value) => { value.plugins.push(clone(value.plugins[0])); }],
      ["empty plugin registry", (value) => { value.plugins = []; }],
    ];
    for (const [name, mutate] of cases) {
      const mutated = clone(index);
      mutate(mutated);
      assert.throws(
        () => validateClaudePluginPublicationIndex(mutated, lane, manifest),
        undefined,
        name,
      );
    }
  });
});

test("verify rejects physical entries outside the closed one-plugin registry", () => {
  withFixture(({ root, publicationRoot }) => {
    prepareClaudeDirectInstallBetaPublication({
      repositoryRoot: root,
      preparedAt,
      buildPackage: fixtureBuilder(deterministicBytes),
    });
    mkdirSync(resolve(publicationRoot, "another-plugin"));
    assert.throws(
      () => verifyClaudeDirectInstallBetaPublication({
        repositoryRoot: root,
        buildPackage: fixtureBuilder(deterministicBytes),
      }),
      /closed Claude plugin registry top-level entries mismatch/u,
    );
  });
});

test("lane readiness distinguishes the guided first-party beta from open-public readiness", () => {
  const controlledPending = clone(canonicalLane);
  controlledPending.readiness.controlledBetaEvidence[0].status = "pending";
  controlledPending.readiness.controlledBetaEvidence[0].evidenceRef = null;
  controlledPending.readiness.controlledBetaReady = true;
  assert.throws(
    () => validateDirectInstallBetaLane(controlledPending),
    /controlledBetaReady must be derived/u,
  );
  controlledPending.readiness.controlledBetaReady = false;
  controlledPending.readiness.guidedFirstPartyBetaReady = false;
  validateDirectInstallBetaLane(controlledPending);

  const pendingControlledWithEvidence = clone(controlledPending);
  pendingControlledWithEvidence.readiness.controlledBetaEvidence[0].evidenceRef =
    "external-evidence:premature";
  assert.throws(
    () => validateDirectInstallBetaLane(pendingControlledWithEvidence),
    /pending controlled evidence local-package-structural-and-unit-validation\.evidenceRef/u,
  );

  const dishonestGuidedClaim = clone(controlledPending);
  dishonestGuidedClaim.readiness.guidedFirstPartyBetaReady = true;
  assert.throws(
    () => validateDirectInstallBetaLane(dishonestGuidedClaim),
    /guidedFirstPartyBetaReady must require/u,
  );

  const publicClaimWithoutEvidence = clone(canonicalLane);
  publicClaimWithoutEvidence.readiness.openPublicBetaReady = true;
  assert.throws(
    () => validateDirectInstallBetaLane(publicClaimWithoutEvidence),
    /openPublicBetaReady must be derived/u,
  );

  const missingRealClientEvidence = clone(canonicalLane);
  missingRealClientEvidence.readiness.controlledBetaEvidence.pop();
  assert.throws(
    () => validateDirectInstallBetaLane(missingRealClientEvidence),
    /controlledBetaEvidence IDs mismatch/u,
  );

  const pendingBlockerWithEvidence = clone(canonicalLane);
  const pendingLegalBlocker = pendingBlockerWithEvidence.readiness
    .openPublicBetaBlockers.find(({ id }) => id === "legal-approval");
  pendingLegalBlocker.evidenceRef =
    "external-evidence:premature";
  assert.throws(
    () => validateDirectInstallBetaLane(pendingBlockerWithEvidence),
    /pending open-public blocker legal-approval\.evidenceRef/u,
  );

  const passingBlockerWithoutEvidence = clone(canonicalLane);
  const passingPrivacyBlocker = passingBlockerWithoutEvidence.readiness
    .openPublicBetaBlockers.find(({ id }) => id === "privacy-approval");
  passingPrivacyBlocker.status = "pass";
  passingPrivacyBlocker.evidenceRef = null;
  assert.throws(
    () => validateDirectInstallBetaLane(passingBlockerWithoutEvidence),
    /passing open-public blocker privacy-approval\.evidenceRef/u,
  );
  passingPrivacyBlocker.evidenceRef =
    "external-evidence:privacy-approval";
  assert.throws(
    () => validateDirectInstallBetaLane(passingBlockerWithoutEvidence),
    /passing open-public blocker privacy-approval\.evidenceRef mismatch/u,
  );
  passingPrivacyBlocker.evidenceRef =
    privacyEvidenceRelativePath(canonicalLane.candidate.version);
  validateDirectInstallBetaLane(passingBlockerWithoutEvidence);
});

test("exact-client evidence is closed, candidate-bound and derived from every client check", () => {
  const cases = [
    ["version drift", (evidence) => { evidence.candidate.version = "1.0.5"; }, /candidate version mismatch/u],
    ["digest drift", (evidence) => { evidence.candidate.sha256 = "0".repeat(64); }, /candidate SHA-256 mismatch/u],
    ["download drift", (evidence) => { evidence.candidate.downloadUrl += "?download=1"; }, /candidate download URL mismatch/u],
    ["unknown check", (evidence) => { evidence.checks[0].id = "different-check"; }, /check identifiers mismatch/u],
    ["unearned pass", (evidence) => { evidence.status = "pass"; }, /status must be derived/u],
    ["premature evidence reference", (evidence) => { evidence.externalEvidenceId = "external:premature"; }, /pending exact-client evidence.externalEvidenceId/u],
  ];
  for (const [name, mutate, pattern] of cases) {
    const evidence = clone(canonicalExactClientEvidence);
    mutate(evidence);
    assert.throws(
      () => validateDirectInstallBetaExactClientEvidence(evidence, canonicalLane),
      pattern,
      name,
    );
  }
});

test("privacy evidence is closed, candidate-bound and byte-bound to the bilingual notice", () => {
  const cases = [
    [
      "version drift",
      (evidence) => { evidence.candidate.version = "1.0.5"; },
      /candidate version mismatch/u,
    ],
    [
      "candidate digest drift",
      (evidence) => { evidence.candidate.sha256 = "0".repeat(64); },
      /candidate SHA-256 mismatch/u,
    ],
    [
      "notice path drift",
      (evidence) => { evidence.notice.sourcePath = "privacy.html"; },
      /notice source path mismatch/u,
    ],
    [
      "notice digest drift",
      (evidence) => { evidence.notice.sourceSha256 = "0".repeat(64); },
      /notice source SHA-256 mismatch/u,
    ],
    [
      "public URL drift",
      (evidence) => { evidence.notice.publicUrl += "?language=en"; },
      /notice public URL mismatch/u,
    ],
    [
      "language order drift",
      (evidence) => { evidence.notice.languages.reverse(); },
      /notice languages mismatch/u,
    ],
    [
      "unknown check",
      (evidence) => { evidence.checks[0].id = "different-check"; },
      /check identifiers mismatch/u,
    ],
    [
      "unearned pass",
      (evidence) => { evidence.status = "pass"; },
      /status must be derived/u,
    ],
    [
      "premature approval",
      (evidence) => {
        evidence.approvedBy = "premature-approver";
      },
      /pending privacy evidence.approvedBy/u,
    ],
  ];
  for (const [name, mutate, pattern] of cases) {
    const evidence = clone(canonicalPrivacyEvidence);
    mutate(evidence);
    assert.throws(
      () => validateDirectInstallBetaPrivacyEvidence(
        evidence,
        canonicalLane,
        repositoryRoot,
      ),
      pattern,
      name,
    );
  }
});

test("privacy evidence rejects semantically incomplete or executable notice bytes even with a matching digest", () => {
  withFixture(({ root, privacyEvidencePath, privacyNoticePath }) => {
    const evidence = readJson(privacyEvidencePath);
    const withoutEnglishLifetime = Buffer.from(
      canonicalPrivacyNotice
        .toString("utf8")
        .replace("exactly 24 hours", "for about one day"),
    );
    writeFileSync(privacyNoticePath, withoutEnglishLifetime);
    evidence.notice.sourceSha256 = sha256(withoutEnglishLifetime);
    writeJson(privacyEvidencePath, evidence);
    assert.throws(
      () => loadDirectInstallBetaLane(root),
      /missing required bilingual content: exactly 24 hours/u,
    );

    const withoutDailyPlanIdentifierBoundary = Buffer.from(
      canonicalPrivacyNotice
        .toString("utf8")
        .replace(
          "plan and landscape identifiers are not transmitted to Claude",
          "identifiers may be transmitted to Claude",
        ),
    );
    writeFileSync(privacyNoticePath, withoutDailyPlanIdentifierBoundary);
    evidence.notice.sourceSha256 = sha256(withoutDailyPlanIdentifierBoundary);
    writeJson(privacyEvidencePath, evidence);
    assert.throws(
      () => loadDirectInstallBetaLane(root),
      /missing required bilingual content: plan and landscape identifiers are not transmitted to Claude/u,
    );

    const relaxedContentSecurityPolicy = Buffer.from(
      canonicalPrivacyNotice
        .toString("utf8")
        .replace("base-uri 'none';", "base-uri 'none'; connect-src *;"),
    );
    writeFileSync(privacyNoticePath, relaxedContentSecurityPolicy);
    evidence.notice.sourceSha256 = sha256(relaxedContentSecurityPolicy);
    writeJson(privacyEvidencePath, evidence);
    assert.throws(
      () => loadDirectInstallBetaLane(root),
      /Content Security Policy mismatch/u,
    );

    const unexpectedEmailDisclosure = Buffer.from(
      canonicalPrivacyNotice
        .toString("utf8")
        .replace(
          "Privacy requests:",
          "Unexpected contact: unexpected-contact@example.invalid; Privacy requests:",
        ),
    );
    writeFileSync(privacyNoticePath, unexpectedEmailDisclosure);
    evidence.notice.sourceSha256 = sha256(unexpectedEmailDisclosure);
    writeJson(privacyEvidencePath, evidence);
    assert.throws(
      () => loadDirectInstallBetaLane(root),
      /must not publish another email address/u,
    );

    const executable = Buffer.from(
      canonicalPrivacyNotice
        .toString("utf8")
        .replace("</body>", "<script>location.reload()</script></body>"),
    );
    writeFileSync(privacyNoticePath, executable);
    evidence.notice.sourceSha256 = sha256(executable);
    writeJson(privacyEvidencePath, evidence);
    assert.throws(
      () => loadDirectInstallBetaLane(root),
      /must not contain script/u,
    );
  });
});

test("lane loading requires privacy evidence and accepts only the exact approved binding", () => {
  withFixture(({
    root,
    lanePath,
    privacyEvidencePath,
    privacyEvidenceRelativePath: evidenceRef,
  }) => {
    const pendingEvidence = readJson(privacyEvidencePath);
    rmSync(privacyEvidencePath);
    assert.throws(
      () => loadDirectInstallBetaLane(root),
      /Direct-install privacy evidence is missing/u,
    );
    writeJson(privacyEvidencePath, pendingEvidence);

    const mismatched = readJson(privacyEvidencePath);
    mismatched.notice.sourceSha256 = "0".repeat(64);
    writeJson(privacyEvidencePath, mismatched);
    assert.throws(
      () => loadDirectInstallBetaLane(root),
      /notice source SHA-256 mismatch/u,
    );

    const pending = pendingPrivacyEvidence(
      fixturePrivacyEvidence(readJson(lanePath)),
    );
    writeJson(privacyEvidencePath, pending);
    const pendingLane = readJson(lanePath);
    const pendingBlocker = pendingLane.readiness.openPublicBetaBlockers.find(
      ({ id }) => id === "privacy-approval",
    );
    pendingBlocker.status = "pending";
    pendingBlocker.evidenceRef = null;
    writeJson(lanePath, pendingLane);
    assert.equal(loadDirectInstallBetaLane(root).readiness.openPublicBetaReady, false);

    const approved = fixturePrivacyEvidence(readJson(lanePath));
    approved.status = "pass";
    for (const check of approved.checks) {
      check.status = "pass";
    }
    approved.approvedBy = "product-owner";
    approved.approvedRole = "product-owner";
    approved.approvedAt = "2026-09-01T10:05:00.000Z";
    writeJson(privacyEvidencePath, approved);
    assert.throws(
      () => loadDirectInstallBetaLane(root),
      /privacy blocker and candidate evidence status mismatch/u,
    );

    const approvedLane = readJson(lanePath);
    const blocker = approvedLane.readiness.openPublicBetaBlockers.find(
      ({ id }) => id === "privacy-approval",
    );
    blocker.status = "pass";
    blocker.evidenceRef = evidenceRef;
    writeJson(lanePath, approvedLane);
    const loaded = loadDirectInstallBetaLane(root);
    assert.equal(loaded.readiness.openPublicBetaReady, false);
  });
});

test("lane loading requires exact-client evidence and accepts a fully approved candidate binding", () => {
  withFixture(({ root, lanePath, exactClientEvidencePath, exactClientEvidenceRelativePath: evidenceRef }) => {
    const pendingEvidence = readJson(exactClientEvidencePath);
    rmSync(exactClientEvidencePath);
    assert.throws(
      () => loadDirectInstallBetaLane(root),
      /Direct-install exact-client evidence is missing/u,
    );
    writeJson(exactClientEvidencePath, pendingEvidence);

    const pendingLane = loadDirectInstallBetaLane(root);
    assert.equal(
      pendingLane.readiness.openPublicBetaBlockers.find(
        ({ id }) => id === "exact-client-acceptance",
      ).status,
      "pending",
    );

    const mismatched = readJson(exactClientEvidencePath);
    mismatched.candidate.sha256 = "0".repeat(64);
    writeJson(exactClientEvidencePath, mismatched);
    assert.throws(
      () => loadDirectInstallBetaLane(root),
      /candidate SHA-256 mismatch/u,
    );

    const approved = fixtureExactClientEvidence(readJson(lanePath));
    approved.status = "pass";
    approved.observedAt = "2026-09-01T10:00:00.000Z";
    approved.clients.web.browserVersion = "Example Browser 1.0";
    approved.clients.web.claudeModel = "Example Claude Model";
    approved.clients.android.appVersion = "1.2.3";
    approved.clients.android.androidVersion = "Android 16";
    approved.clients.android.claudeModel = "Example Claude Model";
    for (const check of approved.checks) {
      check.status = "pass";
    }
    approved.externalEvidenceId = "external-evidence:exact-client-1.2.3";
    approved.externalEvidenceSha256 = "a".repeat(64);
    approved.redactionConfirmed = true;
    approved.approvedBy = "product-owner";
    approved.approvedAt = "2026-09-01T10:05:00.000Z";
    writeJson(exactClientEvidencePath, approved);

    assert.throws(
      () => loadDirectInstallBetaLane(root),
      /blocker and candidate evidence status mismatch/u,
    );

    const approvedLane = readJson(lanePath);
    const blocker = approvedLane.readiness.openPublicBetaBlockers.find(
      ({ id }) => id === "exact-client-acceptance",
    );
    blocker.status = "pass";
    blocker.evidenceRef = evidenceRef;
    writeJson(lanePath, approvedLane);
    const loaded = loadDirectInstallBetaLane(root);
    assert.equal(loaded.readiness.openPublicBetaReady, false);
  });
});

test("lane requirements keep backend contract types fail-closed", () => {
  const cases = [
    ["Boolean voice mode", (lane) => { lane.requirements.voiceMode = "beta-tested"; }],
    ["integer minimum age", (lane) => { lane.requirements.minimumAge = "18"; }],
    ["tested surfaces list", (lane) => { lane.requirements.testedSurfaces = "claude-web"; }],
  ];
  for (const [name, mutate] of cases) {
    const lane = clone(canonicalLane);
    mutate(lane);
    assert.throws(() => validateDirectInstallBetaLane(lane), undefined, name);
  }
});

test("verify rejects manifest, approved candidate and index version drift", () => {
  withFixture(({ root, manifestPath }) => {
    prepareClaudeDirectInstallBetaPublication({
      repositoryRoot: root,
      preparedAt,
      buildPackage: fixtureBuilder(deterministicBytes),
    });
    writeJson(manifestPath, {
      name: "skillpilot-coach-v1",
      version: "1.2.4",
    });
    assert.throws(
      () => verifyClaudeDirectInstallBetaPublication({
        repositoryRoot: root,
        buildPackage: fixtureBuilder(deterministicBytes),
      }),
      /Claude plugin candidate version mismatch/u,
    );
  });
});

test("prepare rejects a dishonest package-builder result", () => {
  withFixture(({ root }) => {
    const builder = ({ outputPath }) => {
      mkdirSync(dirname(outputPath), { recursive: true });
      writeFileSync(outputPath, deterministicBytes);
      return {
        outputPath,
        bytes: deterministicBytes.length + 1,
        sha256: sha256(deterministicBytes),
      };
    };
    assert.throws(
      () => prepareClaudeDirectInstallBetaPublication({
        repositoryRoot: root,
        preparedAt,
        buildPackage: builder,
      }),
      /buildClaudePluginPackage result.bytes mismatch/u,
    );
  });
});

function withPreparedFixture(callback) {
  withFixture(({ root, manifestPath, ...fixture }) => {
    prepareClaudeDirectInstallBetaPublication({
      repositoryRoot: root,
      preparedAt,
      buildPackage: fixtureBuilder(deterministicBytes),
    });
    callback({
      root,
      ...fixture,
      lane: loadDirectInstallBetaLane(root),
      manifest: readJson(manifestPath),
      index: readJson(resolve(fixture.publicationRoot, "index.json")),
    });
  });
}

async function withPreparedFixtureAsync(callback) {
  const root = mkdtempSync(resolve(tmpdir(), "skillpilot-claude-beta-public-test-"));
  const manifestPath = resolve(root, manifestRelativePath);
  const lanePath = resolve(root, laneRelativePath);
  const publicationRoot = resolve(root, publicationRelativeRoot);
  const buildPackage = fixtureBuilder(deterministicBytes);
  try {
    writeJson(manifestPath, {
      name: "skillpilot-coach-v1",
      version: fixtureVersion,
    });
    const fixtureLane = clone(canonicalLane);
    fixtureLane.candidate = {
      version: fixtureVersion,
      sha256: sha256(deterministicBytes),
    };
    rebindFixtureLaneEvidenceRefs(fixtureLane);
    writeJson(lanePath, fixtureLane);
    writeJson(
      resolve(root, exactClientEvidenceRelativePath(fixtureVersion)),
      fixtureExactClientEvidence(fixtureLane),
    );
    const privacyNoticePath = resolve(root, privacyNoticeRelativePath);
    mkdirSync(dirname(privacyNoticePath), { recursive: true });
    writeFileSync(privacyNoticePath, canonicalPrivacyNotice);
    writeJson(
      resolve(root, privacyEvidenceRelativePath(fixtureVersion)),
      fixturePrivacyEvidence(fixtureLane),
    );
    prepareClaudeDirectInstallBetaPublication({
      repositoryRoot: root,
      preparedAt,
      buildPackage,
    });
    await callback({ root, publicationRoot, buildPackage });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function withFixture(callback, candidateBytes = deterministicBytes) {
  const root = mkdtempSync(resolve(tmpdir(), "skillpilot-claude-beta-release-test-"));
  const packageRoot = resolve(root, "ai/claude/plugin/skillpilot-coach-v1");
  const manifestPath = resolve(root, manifestRelativePath);
  const lanePath = resolve(root, laneRelativePath);
  const evidenceRelativePath = exactClientEvidenceRelativePath(fixtureVersion);
  const exactClientEvidencePath = resolve(root, evidenceRelativePath);
  const privacyEvidenceRef = privacyEvidenceRelativePath(fixtureVersion);
  const privacyEvidencePath = resolve(root, privacyEvidenceRef);
  const privacyNoticePath = resolve(root, privacyNoticeRelativePath);
  const publicationRoot = resolve(root, publicationRelativeRoot);
  try {
    writeJson(manifestPath, {
      name: "skillpilot-coach-v1",
      version: fixtureVersion,
    });
    const fixtureLane = clone(canonicalLane);
    fixtureLane.candidate = {
      version: fixtureVersion,
      sha256: sha256(candidateBytes),
    };
    rebindFixtureLaneEvidenceRefs(fixtureLane);
    writeJson(lanePath, fixtureLane);
    writeJson(exactClientEvidencePath, fixtureExactClientEvidence(fixtureLane));
    mkdirSync(dirname(privacyNoticePath), { recursive: true });
    writeFileSync(privacyNoticePath, canonicalPrivacyNotice);
    writeJson(privacyEvidencePath, fixturePrivacyEvidence(fixtureLane));
    callback({
      root,
      packageRoot,
      manifestPath,
      lanePath,
      publicationRoot,
      exactClientEvidencePath,
      exactClientEvidenceRelativePath: evidenceRelativePath,
      privacyEvidencePath,
      privacyEvidenceRelativePath: privacyEvidenceRef,
      privacyNoticePath,
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function fixtureBuilder(bytes, calls = []) {
  return ({ root, outputPath }) => {
    calls.push({ root, outputPath });
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, bytes);
    return {
      outputPath,
      bytes: bytes.length,
      sha256: sha256(bytes),
      entries: [],
    };
  };
}

function fixtureExactClientEvidence(lane) {
  const evidence = clone(canonicalExactClientEvidence);
  evidence.id = `direct-install-exact-client-${lane.candidate.version}`;
  evidence.candidate = {
    version: lane.candidate.version,
    sha256: lane.candidate.sha256,
    downloadUrl:
      `https://skillpilot.com${lane.publication.downloadBasePath}/` +
      `${lane.plugin.id}/${lane.candidate.version}/` +
      `sha256-${lane.candidate.sha256}/` +
      `${lane.plugin.id}-${lane.candidate.version}.plugin`,
  };
  return evidence;
}

function fixturePrivacyEvidence(lane) {
  const evidence = clone(canonicalPrivacyEvidence);
  evidence.id = `direct-install-privacy-approval-${lane.candidate.version}`;
  evidence.candidate = {
    version: lane.candidate.version,
    sha256: lane.candidate.sha256,
  };
  evidence.notice.sourceSha256 = sha256(canonicalPrivacyNotice);
  return evidence;
}

function pendingPrivacyEvidence(evidence) {
  const pending = clone(evidence);
  pending.status = "pending";
  for (const check of pending.checks) {
    check.status = "pending";
  }
  pending.approvedBy = null;
  pending.approvedRole = null;
  pending.approvedAt = null;
  return pending;
}

function rebindFixtureLaneEvidenceRefs(lane) {
  const privacyBlocker = lane.readiness.openPublicBetaBlockers.find(
    ({ id }) => id === "privacy-approval",
  );
  if (privacyBlocker.status === "pass") {
    privacyBlocker.evidenceRef = privacyEvidenceRelativePath(
      lane.candidate.version,
    );
  }
}

function exactClientEvidenceRelativePath(version) {
  return `${exactClientEvidenceRelativeRoot}/${version}-exact-client.json`;
}

function privacyEvidenceRelativePath(version) {
  return `${privacyEvidenceRelativeRoot}/${version}-privacy-approval.json`;
}

function listFixtureFiles(root) {
  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        visit(path);
      } else {
        files.push(relative(root, path));
      }
    }
  };
  visit(root);
  return files.sort();
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function clone(value) {
  return structuredClone(value);
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
