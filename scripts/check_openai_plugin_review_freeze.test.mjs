import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  assertOpenAiPluginReleaseMutationAllowed,
  loadOpenAiPluginReviewFreeze,
  loadRejectedOpenAiReviewRecord,
  rejectedReviewRecordRelativePath,
  reviewFreezeRelativePath,
  resolveAuthorizedRuntimeExceptionChains,
  resolveAuthorizedProtectedTreeExceptionChains,
  resolveAuthorizedSupplementalFileChains,
  verifyOpenAiPluginReviewFreeze,
} from "./check_openai_plugin_review_freeze.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const historical = loadRejectedOpenAiReviewRecord(repositoryRoot);

function fixture(action) {
  const root = mkdtempSync(resolve(tmpdir(), "skillpilot-review-retirement-"));
  try {
    for (const path of [
      reviewFreezeRelativePath, rejectedReviewRecordRelativePath,
      historical.frozenDraftPath, historical.reviewVideoPath,
      "contracts/openai/skillpilot-coach-v1/release-index.json",
    ]) {
      const target = resolve(root, path);
      mkdirSync(dirname(target), { recursive: true });
      cpSync(resolve(repositoryRoot, path), target, { recursive: true });
    }
    return action(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function writeRecord(root, update) {
  const record = loadOpenAiPluginReviewFreeze(root);
  update(record);
  writeFileSync(resolve(root, reviewFreezeRelativePath), JSON.stringify(record, null, 2) + "\n");
}

function prepare(root, version = "1.1.0") {
  return assertOpenAiPluginReleaseMutationAllowed({
    repositoryRoot: root, pluginIdentity: "skillpilot-coach-v1", pluginVersion: version, command: "prepare",
  });
}

test("the rejected review is retired and all live development pins are inactive", () => {
  const result = verifyOpenAiPluginReviewFreeze({ repositoryRoot });
  assert.equal(result.portalReviewState, "REJECTED");
  assert.equal(result.developmentFreezeActive, false);
  assert.equal(result.targetVersion, "1.1.0");
  assert.equal(result.historicalSnapshotVerified, true);
  assert.equal(result.protectedTreeCount, 0);
  assert.equal(result.protectedFileCount, 0);
  const record = loadOpenAiPluginReviewFreeze(repositoryRoot);
  assert.equal(record.rejectionEvidence.rawExportCommitted, false);
  assert.equal(Object.hasOwn(record, "authorizedRuntimeExceptions"), false);
});

test("verification needs only historical evidence, never current app, MCP or plugin bytes", () => {
  fixture((root) => {
    assert.equal(existsSync(resolve(root, "app")), false);
    assert.equal(existsSync(resolve(root, "ai")), false);
    verifyOpenAiPluginReviewFreeze({ repositoryRoot: root });
    const live = resolve(root, "ai/openai plugin/skillpilot-coach-v1");
    mkdirSync(live, { recursive: true });
    writeFileSync(resolve(live, "development.txt"), "new mutable successor content");
    verifyOpenAiPluginReviewFreeze({ repositoryRoot: root });
  });
});

test("new unpublished minor and patch candidates can prepare without a new hash exception", () => {
  for (const version of ["1.1.0", "1.1.1", "1.2.0"]) prepare(repositoryRoot, version);
});

test("rejected, old-minor, prerelease, malformed and other-major versions cannot overwrite history", () => {
  for (const version of ["1.0.0", "1.0.1", "1.1.0-beta.1", "1.01.0", "2.0.0", "../1.1.0"]) {
    assert.throws(() => prepare(repositoryRoot, version), /successor|stable/u);
  }
  assert.throws(() => assertOpenAiPluginReleaseMutationAllowed({
    repositoryRoot, pluginIdentity: "skillpilot-other", pluginVersion: "1.1.0", command: "prepare",
  }), /identity/u);
});

test("development approval never constitutes actual publication authorization", () => {
  assert.throws(() => assertOpenAiPluginReleaseMutationAllowed({
    repositoryRoot, pluginIdentity: "skillpilot-coach-v1", pluginVersion: "1.1.0", command: "record-published",
  }), /Actual OpenAI publication.*separate publication-recording authorization/u);
});

test("actually published successor versions stay immutable", () => {
  fixture((root) => {
    const path = resolve(root, "contracts/openai/skillpilot-coach-v1/release-index.json");
    const index = JSON.parse(readFileSync(path, "utf8"));
    index.publishedVersions = ["1.1.0"];
    writeFileSync(path, JSON.stringify(index));
    assert.throws(() => prepare(root), /published version remains immutable/u);
  });
});

test("retirement without exact explicit approval and rejection evidence fails closed", () => {
  const changes = [
    (r) => { delete r.productOwnerDecision; },
    (r) => { r.portalReviewState = "IN_REVIEW"; },
    (r) => { r.portalReviewState = "PUBLISHED"; },
    (r) => { r.developmentFreezeActive = true; },
    (r) => { r.productOwnerDecision.approvedBy = "inferred"; },
    (r) => { r.productOwnerDecision.prepareAllowed = false; },
    (r) => { r.productOwnerDecision.publicationRecordingAllowed = true; },
    (r) => { r.productOwnerDecision.externalDeploymentAllowed = true; },
    (r) => { r.productOwnerDecision.portalMutationAllowed = true; },
    (r) => { r.rejectionEvidence.sourceSha256 = "0".repeat(64); },
    (r) => { r.historicalRecord.path = "../elsewhere"; },
    (r) => { r.authorizedRuntimeExceptions = []; },
  ];
  fixture((root) => {
    const original = readFileSync(resolve(root, reviewFreezeRelativePath));
    for (const update of changes) {
      writeFileSync(resolve(root, reviewFreezeRelativePath), original);
      writeRecord(root, update);
      assert.throws(() => prepare(root), /explicit Product Owner decision/u);
    }
  });
});

test("missing or symbolic-link retirement records cannot silently disable checks", () => {
  fixture((root) => {
    const path = resolve(root, reviewFreezeRelativePath);
    const original = readFileSync(path);
    rmSync(path);
    assert.throws(() => prepare(root), /Missing explicit/u);
    const replacement = resolve(root, "record.json");
    writeFileSync(replacement, original);
    symlinkSync(replacement, path);
    assert.throws(() => prepare(root), /symlink/u);
  });
});

test("the entire former record including every old exception remains immutable audit history", () => {
  fixture((root) => {
    const path = resolve(root, rejectedReviewRecordRelativePath);
    const original = readFileSync(path, "utf8");
    writeFileSync(path, original.replace('"IN_REVIEW"', '"REJECTED"'));
    assert.throws(() => prepare(root), /audit record changed/u);
  });
  assert.equal(historical.portalReviewState, "IN_REVIEW");
  assert.equal(historical.authorizedRuntimeExceptions.at(-1).id, "2026-09-09-claude-marketplace-and-upload-guide");
  assert.equal(historical.protectedTrees.length, 6);
  assert.equal(historical.protectedFiles.length, 22);
});

test("rejected snapshot contents, inventory and manifest remain exact", () => {
  fixture((root) => {
    const snapshotRoot = resolve(root, historical.frozenDraftPath);
    const plugin = resolve(snapshotRoot, "plugin.json");
    const original = readFileSync(plugin);
    writeFileSync(plugin, "{}");
    assert.throws(() => prepare(root), /Frozen draft size changed|Frozen draft bytes changed/u);
    writeFileSync(plugin, original);
    const added = resolve(snapshotRoot, "unreviewed.json");
    writeFileSync(added, "{}");
    assert.throws(() => prepare(root), /inventory changed/u);
    rmSync(added);
    const manifest = resolve(snapshotRoot, "snapshot-manifest.json");
    writeFileSync(manifest, "{}");
    assert.throws(() => prepare(root), /SHA-256 mismatch/u);
  });
});

test("historical review-video bytes cannot be repurposed under the old content URL", () => {
  fixture((root) => {
    writeFileSync(resolve(root, historical.reviewVideoPath), "replacement");
    assert.throws(() => prepare(root), /review video changed/u);
  });
});

test("archival resolvers retain valid chains and reject discontinuous history", () => {
  resolveAuthorizedRuntimeExceptionChains(historical.protectedFiles, historical.authorizedRuntimeExceptions);
  resolveAuthorizedProtectedTreeExceptionChains(historical.protectedTrees, historical.authorizedRuntimeExceptions);
  resolveAuthorizedSupplementalFileChains(historical.authorizedRuntimeExceptions, historical.authorizedCopyClarifications);
  const modified = structuredClone(historical.authorizedRuntimeExceptions);
  modified.at(-1).additionalFiles[0].priorAuthorizedSha256 = "0".repeat(64);
  assert.throws(() => resolveAuthorizedSupplementalFileChains(modified, historical.authorizedCopyClarifications), /discontinuous|wrong prior/u);
});
