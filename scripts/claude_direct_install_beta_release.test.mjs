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
  validateDirectInstallBetaLane,
  verifyClaudeDirectInstallBetaPublication,
  verifyPublicClaudeDirectInstallBetaPublication,
} from "./claude_direct_install_beta_release.mjs";

const scriptRoot = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptRoot, "..");
const laneRelativePath =
  "ai/claude/plugin/skillpilot-coach-v1/release/direct-install-beta.json";
const manifestRelativePath =
  "ai/claude/plugin/skillpilot-coach-v1/.claude-plugin/plugin.json";
const publicationRelativeRoot =
  "backend/src/main/resources/claude-plugin-publication";
const canonicalLane = JSON.parse(
  readFileSync(resolve(repositoryRoot, laneRelativePath), "utf8"),
);
const fixtureVersion = "1.2.3";
const preparedAt = "2026-08-25T12:34:56.000Z";
const deterministicBytes = Buffer.from("deterministic Claude plugin fixture\n");

test("production direct-install lane has the isolated, fail-closed beta semantics", () => {
  validateDirectInstallBetaLane(canonicalLane);
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
    version: "1.0.2",
    sha256: "9c38746fff5ec51778bd922286bc1c142c6f03488894652ed295ab6ad230a09d",
  });
  assert.deepEqual(canonicalLane.planSemantics, {
    supportBaseline: "claude_pro",
    technicalRequirement: "paid_claude_plan",
  });
  assert.deepEqual(canonicalLane.requirements, {
    minimumAge: 18,
    plan: "claude-pro",
    installSurface: "claude-web",
    testedSurfaces: ["claude-web", "claude-android"],
    voiceMode: true,
  });
  assert.equal(canonicalLane.readiness.controlledBetaReady, true);
  assert.equal(canonicalLane.readiness.guidedFirstPartyBetaReady, true);
  assert.equal(canonicalLane.readiness.openPublicBetaReady, false);
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
    assert.equal(index.plugins[0].requirements.voiceMode, true);
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
  withFixture(({ root, lanePath }) => {
    const first = prepareClaudeDirectInstallBetaPublication({
      repositoryRoot: root,
      preparedAt,
      buildPackage: fixtureBuilder(firstBytes),
    });
    const before = readFileSync(first.artifactPath);
    const lane = readJson(lanePath);
    lane.candidate.sha256 = sha256(secondBytes);
    writeJson(lanePath, lane);
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
  assert.throws(
    () => validateDirectInstallBetaLane(controlledPending),
    /controlledBetaReady must be derived/u,
  );
  controlledPending.readiness.controlledBetaReady = false;
  controlledPending.readiness.guidedFirstPartyBetaReady = false;
  validateDirectInstallBetaLane(controlledPending);

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
});

test("lane requirements keep backend contract types fail-closed", () => {
  const cases = [
    ["Boolean voice mode", (lane) => { lane.requirements.voiceMode = "beta-tested"; }],
    ["integer minimum age", (lane) => { lane.requirements.minimumAge = "18"; }],
    ["non-empty tested surfaces", (lane) => { lane.requirements.testedSurfaces = []; }],
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
    writeJson(lanePath, fixtureLane);
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
    writeJson(lanePath, fixtureLane);
    callback({ root, packageRoot, manifestPath, lanePath, publicationRoot });
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
