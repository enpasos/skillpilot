import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const defaultRepositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const reviewFreezeRelativePath =
  "contracts/openai/skillpilot-coach-v1/review-freeze.json";

const expectedAuthorizedRuntimeExceptions = [
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
  {
    id: "2026-08-23-claude-web-start-remove-manual-fallback",
    approvedAt: "2026-08-23",
    approvedBy: "product-owner",
    reason:
      "Remove the redundant Claude-only clipboard and manual start-prompt fallback after the q-prefilled Web launch.",
    scope:
      "Within the explicitly query-gated Claude provider controls, require the click-time popup, " +
      "navigate it only to the validated q-prefilled Claude Web URL, fail closed otherwise, and " +
      "remove clipboard, raw-prompt, copy, Web-fallback and Desktop-fallback UI; preserve the " +
      "default ChatGPT and submitted OpenAI launch behaviour.",
    target: "current-production-web-frontend",
    frozenPluginVersion: "1.0.0",
    portalReviewAction:
      "none-required-query-gated-claude-only-no-submitted-openai-contract-or-review-flow-effect",
    protectedFile: {
      path: "app/src/components/SessionSetup.tsx",
      submittedSha256:
        "081a467439a7506d2334003912d7bc8784991d9b95cfd0783196bff3ec8aa506",
      priorAuthorizedSha256:
        "3834b8c813719e21dffb767b9e5fe60890845769e188b49a239da57f4577b9a4",
      authorizedSha256:
        "fbab3a4833b534059a8b9ad2c97a293cb670d848d92bd93caac25ed9d96787ad",
    },
    evidenceFile: {
      path:
        "contracts/openai/skillpilot-coach-v1/review-evidence/2026-08-23-testClaudeV1StartUi.tsx",
      sha256:
        "f02ab916f7e501cb7b50eee477c5237c054caf36f90bee1c5cf1da075a82e8bf",
    },
  },
  {
    id: "2026-08-24-standard-dual-provider-web-start",
    approvedAt: "2026-08-24",
    approvedBy: "product-owner",
    reason:
      "Offer the independently isolated Claude v1 coach beside the unchanged ChatGPT v1 choice in the standard shared learner start.",
    scope:
      "On the standard root, always present the separately branded Claude v1 setup and start controls " +
      "beside the unchanged ChatGPT v1 start control, remove hidden provider-query gating, and replace " +
      "the ChatGPT-only landing account note with provider-neutral guidance linked to /faq/coach-setup; " +
      "preserve the submitted ChatGPT handler, prepared-message and session semantics, OpenAI package, " +
      "MCP/OAuth/tool/schema/UI contract, review cases, portal values, fixtures and review artifacts.",
    target: "current-production-web-frontend",
    frozenPluginVersion: "1.0.0",
    portalReviewAction:
      "none-required-additive-provider-choice-no-submitted-openai-contract-or-review-flow-effect",
    protectedFile: {
      path: "app/src/components/SessionSetup.tsx",
      submittedSha256:
        "081a467439a7506d2334003912d7bc8784991d9b95cfd0783196bff3ec8aa506",
      priorAuthorizedSha256:
        "fbab3a4833b534059a8b9ad2c97a293cb670d848d92bd93caac25ed9d96787ad",
      authorizedSha256:
        "1919c46dfe9e1f70ecdf177f2dd48654400c9eb8debd47ddaf0576d9e4fdd61f",
    },
    evidenceFile: {
      path: "app/scripts/testClaudeV1StartUi.tsx",
      sha256:
        "60ac516f664da7a61c7ce2a53ad2736adc7ae7d67fb10391c549b073b331a5e4",
    },
    additionalFile: {
      path: "app/src/utils/claudeCoach.ts",
      priorSha256:
        "817c855aeca7406cd923dc7ce56538c2b8f67ec90b7750b064b873f1976a539d",
      authorizedSha256:
        "fc451b8780889e45fe7a848353e1415d52d4eb1b6a7f8ed35b266a4dd5d512f0",
    },
  },
];

export function resolveAuthorizedRuntimeExceptionChains(
  protectedFiles,
  authorizedRuntimeExceptions,
) {
  assert.equal(Array.isArray(protectedFiles), true, "Protected files must be an array.");
  assert.equal(
    Array.isArray(authorizedRuntimeExceptions),
    true,
    "Authorized runtime exceptions must be an array.",
  );
  const protectedByPath = new Map(
    protectedFiles.map((entry) => [entry.path, entry]),
  );
  const latestByPath = new Map();
  const exceptionIds = new Set();

  for (const exception of authorizedRuntimeExceptions) {
    assert.equal(
      exceptionIds.has(exception.id),
      false,
      `Duplicate authorized runtime exception id: ${exception.id}`,
    );
    exceptionIds.add(exception.id);

    const protectedFile = exception.protectedFile;
    const submittedFile = protectedByPath.get(protectedFile?.path);
    assert.ok(
      submittedFile,
      `Authorized runtime exception targets an unprotected file: ${protectedFile?.path}`,
    );
    assert.equal(
      protectedFile.submittedSha256,
      submittedFile.sha256,
      `Authorized runtime exception changed the submitted baseline: ${protectedFile.path}`,
    );
    assert.match(
      protectedFile.authorizedSha256,
      /^[0-9a-f]{64}$/u,
      `Authorized runtime exception has an invalid digest: ${exception.id}`,
    );

    const priorException = latestByPath.get(protectedFile.path);
    if (priorException) {
      assert.equal(
        protectedFile.priorAuthorizedSha256,
        priorException.protectedFile.authorizedSha256,
        `Authorized runtime exception chain is discontinuous: ${exception.id}`,
      );
    } else {
      assert.equal(
        Object.hasOwn(protectedFile, "priorAuthorizedSha256"),
        false,
        `First authorized runtime exception must start at the submitted baseline: ${exception.id}`,
      );
    }
    latestByPath.set(protectedFile.path, exception);
  }

  return latestByPath;
}

export function loadOpenAiPluginReviewFreeze(
  repositoryRoot = defaultRepositoryRoot,
) {
  const freezePath = resolve(repositoryRoot, reviewFreezeRelativePath);
  assert.equal(
    existsSync(freezePath),
    true,
    `Missing OpenAI V1 review freeze record ${reviewFreezeRelativePath}.`,
  );
  return JSON.parse(readFileSync(freezePath, "utf8"));
}

export function assertOpenAiPluginReleaseMutationAllowed({
  repositoryRoot = defaultRepositoryRoot,
  pluginIdentity,
  pluginVersion,
  command,
}) {
  const freeze = loadOpenAiPluginReviewFreeze(repositoryRoot);
  throw new Error(
    `OpenAI review freeze is active for ${pluginIdentity} ${pluginVersion}. ` +
      `The release mutation ${command} is forbidden while the recorded ` +
      `submission ${freeze.pluginIdentity ?? "UNKNOWN"} ` +
      `${freeze.pluginVersion ?? "UNKNOWN"} has freeze state ` +
      `${freeze.portalReviewState ?? "UNKNOWN"}. Read ` +
      "docs/deploy/openai-plugin-v1-review-freeze.md and obtain an explicit, " +
      "scoped product-owner unfreeze before changing the review contract.",
  );
}

export function verifyOpenAiPluginReviewFreeze({
  repositoryRoot = defaultRepositoryRoot,
} = {}) {
  const freeze = loadOpenAiPluginReviewFreeze(repositoryRoot);
  assert.equal(freeze.schemaVersion, 1, "Unsupported review-freeze schemaVersion.");
  assert.equal(freeze.pluginIdentity, "skillpilot-coach-v1");
  assert.equal(freeze.pluginVersion, "1.0.0");
  assert.equal(
    freeze.portalReviewState,
    "IN_REVIEW",
    "The V1 review freeze may change state only through the documented product-owner procedure.",
  );
  assert.match(freeze.enteredAt, /^\d{4}-\d{2}-\d{2}$/u);
  assert.match(freeze.submittedSourceCommit, /^[0-9a-f]{40}$/u);
  assert.match(freeze.frozenSnapshotManifestSha256, /^[0-9a-f]{64}$/u);
  assert.match(freeze.pluginArchiveSha256, /^[0-9a-f]{64}$/u);
  assert.match(freeze.exportedContractSha256, /^[0-9a-f]{64}$/u);
  assert.match(freeze.reviewVideoSha256, /^[0-9a-f]{64}$/u);
  assert.equal(
    freeze.publicMcpEndpoint,
    "https://mcp-coach-v1.skillpilot.com/mcp",
  );
  assert.equal(
    freeze.reviewVideoUrl,
    "https://skillpilot.com/api/public/openai/review/skillpilot-coach-v1/" +
      "1.0.0/sha256-20f5327535513df8b1c088b553195baf6ae339d57fc417b303488ae597644deb.mp4",
  );
  assert.equal(
    freeze.unfreezeRequires,
    "explicit-product-owner-approval-with-reason-scope-and-target-version",
  );
  assert.deepEqual(
    freeze.authorizedRuntimeExceptions,
    expectedAuthorizedRuntimeExceptions,
    "Review-time runtime exceptions must match the explicitly approved, hash-pinned scope.",
  );
  assert.equal(Array.isArray(freeze.protectedTrees), true);
  assert.equal(Array.isArray(freeze.protectedFiles), true);

  const latestAuthorizedExceptionByPath = resolveAuthorizedRuntimeExceptionChains(
    freeze.protectedFiles,
    expectedAuthorizedRuntimeExceptions,
  );

  for (const exception of expectedAuthorizedRuntimeExceptions) {
    let supplementalFileCount = 0;
    const evidenceFile = exception.evidenceFile;
    if (evidenceFile) {
      supplementalFileCount += 1;
      assertFileSha256(
        safeRepositoryPath(repositoryRoot, evidenceFile.path),
        evidenceFile.sha256,
        `Authorized review evidence changed: ${evidenceFile.path}`,
      );
    }
    const additionalFile = exception.additionalFile;
    if (additionalFile) {
      supplementalFileCount += 1;
      assertFileSha256(
        safeRepositoryPath(repositoryRoot, additionalFile.path),
        additionalFile.authorizedSha256,
        `Authorized review exception changed: ${additionalFile.path}`,
      );
    }
    assert.equal(
      supplementalFileCount > 0,
      true,
      `Authorized review exception lacks pinned supplemental evidence: ${exception.id}`,
    );
  }

  const expectedDraftPath =
    "contracts/drafts/openai/skillpilot-coach-v1/1.0.0-SNAPSHOT";
  assert.equal(freeze.frozenDraftPath, expectedDraftPath);
  const draftRoot = safeRepositoryPath(repositoryRoot, freeze.frozenDraftPath);
  const snapshotPath = resolve(draftRoot, "snapshot-manifest.json");
  assertFileSha256(snapshotPath, freeze.frozenSnapshotManifestSha256);

  const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8"));
  assert.equal(snapshot.schemaVersion, 1);
  assert.equal(snapshot.pluginIdentity, freeze.pluginIdentity);
  assert.equal(snapshot.pluginVersion, freeze.pluginVersion);
  assert.equal(snapshot.archiveRole, "plugin-install-bundle");
  assertSnapshotInventory(draftRoot, snapshot);

  const archiveEntries = snapshot.files.filter((entry) =>
    entry.path.endsWith(".tar"),
  );
  assert.equal(
    archiveEntries.length,
    1,
    "Frozen draft must contain one plugin archive.",
  );
  assert.equal(archiveEntries[0].sha256, freeze.pluginArchiveSha256);

  const contract = JSON.parse(
    readFileSync(resolve(draftRoot, "contract/contract.json"), "utf8"),
  );
  assert.equal(contract.contractSha256, freeze.exportedContractSha256);
  assert.equal(contract.pluginIdentity, freeze.pluginIdentity);

  const line = JSON.parse(readFileSync(resolve(draftRoot, "line.json"), "utf8"));
  assert.equal(line.publicMcpEndpoint, freeze.publicMcpEndpoint);
  assert.equal(line.oauthResource, freeze.publicMcpEndpoint);

  const lifecycle = JSON.parse(
    readFileSync(resolve(draftRoot, "lifecycle.json"), "utf8"),
  );
  assert.equal(
    lifecycle.contractLine?.publicationStatus,
    "DRAFT",
    "Portal review is not publication; the submitted snapshot must remain DRAFT.",
  );

  const releaseIndex = JSON.parse(
    readFileSync(
      safeRepositoryPath(
        repositoryRoot,
        "contracts/openai/skillpilot-coach-v1/release-index.json",
      ),
      "utf8",
    ),
  );
  assert.equal(releaseIndex.latestPublishedVersion, null);
  assert.deepEqual(releaseIndex.publishedVersions, []);
  assert.equal(releaseIndex.baselinePath, null);

  const reviewVideoPath = safeRepositoryPath(
    repositoryRoot,
    freeze.reviewVideoPath,
  );
  assertFileSha256(reviewVideoPath, freeze.reviewVideoSha256);

  for (const protectedTree of freeze.protectedTrees) {
    assert.match(protectedTree.sha256, /^[0-9a-f]{64}$/u);
    const treeRoot = safeRepositoryPath(repositoryRoot, protectedTree.path);
    assert.equal(
      sha256Tree(treeRoot),
      protectedTree.sha256,
      `Protected V1 tree changed: ${protectedTree.path}`,
    );
  }
  for (const protectedFile of freeze.protectedFiles) {
    assert.match(protectedFile.sha256, /^[0-9a-f]{64}$/u);
    const authorizedException = latestAuthorizedExceptionByPath.get(protectedFile.path);
    if (authorizedException) {
      assert.equal(
        protectedFile.sha256,
        authorizedException.protectedFile.submittedSha256,
        `Submitted V1 baseline changed: ${protectedFile.path}`,
      );
      assertFileSha256(
        safeRepositoryPath(repositoryRoot, protectedFile.path),
        authorizedException.protectedFile.authorizedSha256,
        `Authorized review exception changed: ${protectedFile.path}`,
      );
      continue;
    }
    assertFileSha256(
      safeRepositoryPath(repositoryRoot, protectedFile.path),
      protectedFile.sha256,
      `Protected V1 file changed: ${protectedFile.path}`,
    );
  }

  return {
    pluginIdentity: freeze.pluginIdentity,
    pluginVersion: freeze.pluginVersion,
    portalReviewState: freeze.portalReviewState,
    protectedFileCount: freeze.protectedFiles.length,
    protectedTreeCount: freeze.protectedTrees.length,
  };
}

export function sha256Tree(root) {
  const rootStat = lstatSync(root);
  assert.equal(
    rootStat.isSymbolicLink(),
    false,
    `Protected path is a symlink: ${root}`,
  );
  assert.equal(
    rootStat.isDirectory(),
    true,
    `Protected tree is not a directory: ${root}`,
  );
  const records = [];
  visitTree(root, root, records);
  return sha256(Buffer.from(records.join(""), "utf8"));
}

function visitTree(root, current, records) {
  const entries = readdirSync(current, { withFileTypes: true }).sort(
    (left, right) => left.name.localeCompare(right.name),
  );
  for (const entry of entries) {
    const absolute = resolve(current, entry.name);
    const path = relative(root, absolute).replaceAll(sep, "/");
    assert.equal(
      entry.isSymbolicLink(),
      false,
      `Protected tree contains symlink: ${path}`,
    );
    if (entry.isDirectory()) {
      visitTree(root, absolute, records);
    } else {
      assert.equal(
        entry.isFile(),
        true,
        `Protected tree contains non-file: ${path}`,
      );
      const bytes = statSync(absolute).size;
      records.push(`${path}\0${bytes}\0${sha256(readFileSync(absolute))}\n`);
    }
  }
}

function assertSnapshotInventory(draftRoot, snapshot) {
  assert.equal(Array.isArray(snapshot.files), true);
  const expectedPaths = snapshot.files.map((entry) => entry.path).sort();
  assert.deepEqual(
    expectedPaths,
    [...new Set(expectedPaths)],
    "Snapshot inventory paths must be unique.",
  );
  const actualPaths = listRegularFiles(draftRoot)
    .filter((path) => path !== "snapshot-manifest.json")
    .sort();
  assert.deepEqual(actualPaths, expectedPaths, "Frozen draft file inventory changed.");
  for (const entry of snapshot.files) {
    assert.match(entry.path, /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$)).+$/u);
    assert.match(entry.sha256, /^[0-9a-f]{64}$/u);
    const file = resolve(draftRoot, entry.path);
    assert.equal(
      statSync(file).size,
      entry.bytes,
      `Frozen draft size changed: ${entry.path}`,
    );
    assertFileSha256(file, entry.sha256, `Frozen draft bytes changed: ${entry.path}`);
  }
}

function listRegularFiles(root) {
  const files = [];
  const visit = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const absolute = resolve(current, entry.name);
      assert.equal(
        entry.isSymbolicLink(),
        false,
        `Frozen draft contains symlink: ${absolute}`,
      );
      if (entry.isDirectory()) {
        visit(absolute);
      } else {
        assert.equal(
          entry.isFile(),
          true,
          `Frozen draft contains non-file: ${absolute}`,
        );
        files.push(relative(root, absolute).replaceAll(sep, "/"));
      }
    }
  };
  visit(root);
  return files;
}

function safeRepositoryPath(repositoryRoot, path) {
  assert.equal(typeof path, "string");
  assert.equal(
    isAbsolute(path),
    false,
    `Review-freeze path must be relative: ${path}`,
  );
  assert.equal(path.includes("\0"), false, "Review-freeze path contains NUL.");
  const resolved = resolve(repositoryRoot, path);
  assert.equal(
    resolved.startsWith(`${resolve(repositoryRoot)}${sep}`),
    true,
    `Review-freeze path escapes repository: ${path}`,
  );
  return resolved;
}

function assertFileSha256(path, expected, message = `SHA-256 mismatch: ${path}`) {
  const fileStat = lstatSync(path);
  assert.equal(fileStat.isSymbolicLink(), false, `Protected file is a symlink: ${path}`);
  assert.equal(fileStat.isFile(), true, `Protected path is not a file: ${path}`);
  assert.equal(sha256(readFileSync(path)), expected, message);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (invokedPath === import.meta.url) {
  const result = verifyOpenAiPluginReviewFreeze();
  console.log(
    `CHECK openai_plugin_review_freeze PASS ${result.pluginIdentity} ` +
      `${result.pluginVersion} state=${result.portalReviewState} ` +
      `trees=${result.protectedTreeCount} files=${result.protectedFileCount}`,
  );
}
