import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  assertOpenAiPluginReleaseMutationAllowed,
  loadOpenAiPluginReviewFreeze,
  sha256Tree,
  verifyOpenAiPluginReviewFreeze,
} from "./check_openai_plugin_review_freeze.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

test("review record keeps the submitted V1 baseline constants", () => {
  const freeze = loadOpenAiPluginReviewFreeze(repositoryRoot);
  assert.deepEqual(
    {
      pluginIdentity: freeze.pluginIdentity,
      pluginVersion: freeze.pluginVersion,
      portalReviewState: freeze.portalReviewState,
      enteredAt: freeze.enteredAt,
      submittedSourceCommit: freeze.submittedSourceCommit,
      frozenSnapshotManifestSha256: freeze.frozenSnapshotManifestSha256,
      pluginArchiveSha256: freeze.pluginArchiveSha256,
      exportedContractSha256: freeze.exportedContractSha256,
      reviewVideoSha256: freeze.reviewVideoSha256,
      reviewVideoUrl: freeze.reviewVideoUrl,
    },
    {
      pluginIdentity: "skillpilot-coach-v1",
      pluginVersion: "1.0.0",
      portalReviewState: "IN_REVIEW",
      enteredAt: "2026-08-15",
      submittedSourceCommit: "ff3a16b0d6e3c8a564176ab4743e777cddf3e79c",
      frozenSnapshotManifestSha256:
        "e6408e7054d53ab4a52f32f541b07201f1a8f6e183ff5772bc2d8164162b0f32",
      pluginArchiveSha256:
        "f6f69b7b42b6904ad6ff1796190cf687af72c2e4af62edcac0bd04d6603ae697",
      exportedContractSha256:
        "d2f08a66efa3488e5f87758de41688a18ce47ba2951bb2d3147e522d1fd30b38",
      reviewVideoSha256:
        "20f5327535513df8b1c088b553195baf6ae339d57fc417b303488ae597644deb",
      reviewVideoUrl:
        "https://skillpilot.com/api/public/openai/review/skillpilot-coach-v1/" +
        "1.0.0/sha256-20f5327535513df8b1c088b553195baf6ae339d57fc417b303488ae597644deb.mp4",
    },
  );
});

test("submitted OpenAI V1 review baseline remains exact", () => {
  const result = verifyOpenAiPluginReviewFreeze({ repositoryRoot });
  assert.deepEqual(result, {
    pluginIdentity: "skillpilot-coach-v1",
    pluginVersion: "1.0.0",
    portalReviewState: "IN_REVIEW",
    protectedFileCount: 22,
    protectedTreeCount: 6,
  });
});

test("review exception keeps the submitted hash and pins the Workbench-only runtime", () => {
  const freeze = loadOpenAiPluginReviewFreeze(repositoryRoot);
  assert.deepEqual(freeze.authorizedRuntimeExceptions, [
    {
      id: "2026-08-15-goal-book-public-promotion-off",
      approvedAt: "2026-08-15",
      approvedBy: "product-owner",
      reason:
        "Keep the incomplete learning-goal book discoverable only from the local Workbench.",
      scope:
        "Disable the public start-page link and remove the public sitemap entry; " +
        "retain the read-only route, assets, and local Workbench links for later reactivation.",
      target: "current-production-web-frontend",
      frozenPluginVersion: "1.0.0",
      portalReviewAction:
        "none-required-no-submitted-plugin-contract-or-review-flow-effect",
      protectedFile: {
        path: "app/src/components/SessionSetup.tsx",
        submittedSha256:
          "081a467439a7506d2334003912d7bc8784991d9b95cfd0783196bff3ec8aa506",
        authorizedSha256:
          "3834b8c813719e21dffb767b9e5fe60890845769e188b49a239da57f4577b9a4",
      },
      additionalFile: {
        path: "app/public/sitemap.xml",
        submittedSha256:
          "bbe29194631db31a643773035aef2ee734f76e6f1188f669a5decdeaa2a140f0",
        authorizedSha256:
          "b1f26f19e72a5bf698c88289b502ffab669c0a330356e1549049d38437c60869",
      },
    },
  ]);
});

test("protected tree digest changes for changed, added, or removed files", () => {
  const root = mkdtempSync(resolve(tmpdir(), "skillpilot-v1-review-freeze-"));
  try {
    mkdirSync(resolve(root, "nested"));
    writeFileSync(resolve(root, "a.txt"), "alpha\n");
    writeFileSync(resolve(root, "nested/b.txt"), "beta\n");
    const baseline = sha256Tree(root);

    writeFileSync(resolve(root, "a.txt"), "changed\n");
    assert.notEqual(sha256Tree(root), baseline);
    writeFileSync(resolve(root, "a.txt"), "alpha\n");
    assert.equal(sha256Tree(root), baseline);

    writeFileSync(resolve(root, "extra.txt"), "extra\n");
    assert.notEqual(sha256Tree(root), baseline);
    rmSync(resolve(root, "extra.txt"));
    rmSync(resolve(root, "nested/b.txt"));
    assert.notEqual(sha256Tree(root), baseline);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("release mutation remains fail closed for unexpected freeze metadata", () => {
  const root = mkdtempSync(resolve(tmpdir(), "skillpilot-v1-freeze-state-"));
  try {
    const recordDirectory = resolve(
      root,
      "contracts/openai/skillpilot-coach-v1",
    );
    mkdirSync(recordDirectory, { recursive: true });
    writeFileSync(
      resolve(recordDirectory, "review-freeze.json"),
      JSON.stringify({
        pluginIdentity: "unexpected-plugin",
        pluginVersion: "9.9.9",
        portalReviewState: "UNEXPECTED_STATE",
      }),
    );
    assert.throws(
      () =>
        assertOpenAiPluginReleaseMutationAllowed({
          repositoryRoot: root,
          pluginIdentity: "skillpilot-coach-v1",
          pluginVersion: "1.0.0",
          command: "prepare",
        }),
      /submission unexpected-plugin 9\.9\.9 has freeze state UNEXPECTED_STATE/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
