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

// Explicit retirement, not a new review freeze or runtime byte baseline.
const expectedRetirementRecord = {
  "schemaVersion": 2,
  "pluginIdentity": "skillpilot-coach-v1",
  "pluginVersion": "1.0.0",
  "portalReviewState": "REJECTED",
  "developmentFreezeActive": false,
  "retiredAt": "2026-09-09",
  "historicalRecord": {
    "path": "contracts/openai/skillpilot-coach-v1/review-history/1.0.0-rejected/review-freeze.json",
    "sha256": "76c23d1464c5d8798ce06830b1cf34bc44e9c9b4aaff1c85e2b207d5f6982cc9"
  },
  "rejectionEvidence": {
    "source": "product-owner-provided-portal-export",
    "observedAt": "2026-09-09",
    "pluginVersion": "1.0.0",
    "status": "REJECTED",
    "sourceSha256": "f5556e5ba8bbd9423f0d5342a49bc0c8aebd4de362012a0cdbf3d747ec70795b",
    "rawExportCommitted": false
  },
  "productOwnerDecision": {
    "approvedAt": "2026-09-09",
    "approvedBy": "product-owner",
    "reason": "The submitted OpenAI 1.0.0 candidate was rejected; the Product Owner explicitly lifts all ChatGPT/OpenAI review development freezes and authorizes updating the plugin, current submission and tests.",
    "scope": "All current ChatGPT/OpenAI development, package, MCP, UI, instructions, review preparation and tests; no further review-time live-file hash exception chain.",
    "targetVersion": "1.1.0",
    "developmentAllowed": true,
    "prepareAllowed": true,
    "externalDeploymentAllowed": false,
    "portalMutationAllowed": false,
    "publicationRecordingAllowed": false
  },
  "preservedIntegrity": [
    "rejected-1.0.0-snapshot-and-audit-record",
    "previously-advertised-content-addressed-resources",
    "actually-published-release-artifacts",
    "independent-claude-release-and-acceptance-gates",
    "authentication-authorization-privacy-state-and-security-contracts"
  ]
};

export const rejectedReviewRecordRelativePath = "contracts/openai/skillpilot-coach-v1/review-history/1.0.0-rejected/review-freeze.json";
export const rejectedReviewRecordSha256 = "76c23d1464c5d8798ce06830b1cf34bc44e9c9b4aaff1c85e2b207d5f6982cc9";

export function loadOpenAiPluginReviewFreeze(repositoryRoot = defaultRepositoryRoot) {
  const path = safeRepositoryPath(repositoryRoot, reviewFreezeRelativePath);
  assert.equal(existsSync(path), true, "Missing explicit OpenAI review retirement record.");
  assert.equal(lstatSync(path).isSymbolicLink(), false, "Review retirement record must not be a symlink.");
  return JSON.parse(readFileSync(path, "utf8"));
}

export function loadRejectedOpenAiReviewRecord(repositoryRoot = defaultRepositoryRoot) {
  const path = safeRepositoryPath(repositoryRoot, rejectedReviewRecordRelativePath);
  assertFileSha256(path, rejectedReviewRecordSha256, "Rejected review audit record changed.");
  return JSON.parse(readFileSync(path, "utf8"));
}

export function verifyOpenAiPluginReviewFreeze({ repositoryRoot = defaultRepositoryRoot } = {}) {
  const record = loadOpenAiPluginReviewFreeze(repositoryRoot);
  assert.deepEqual(record, expectedRetirementRecord,
    "OpenAI review retirement must match the explicit Product Owner decision, without implied external approval.");
  const historical = loadRejectedOpenAiReviewRecord(repositoryRoot);
  assert.equal(historical.schemaVersion, 1);
  assert.equal(historical.pluginIdentity, record.pluginIdentity);
  assert.equal(historical.pluginVersion, "1.0.0");
  assert.equal(historical.portalReviewState, "IN_REVIEW");
  // Closed historical chains are metadata, not active live-file pins.
  resolveAuthorizedRuntimeExceptionChains(historical.protectedFiles, historical.authorizedRuntimeExceptions);
  resolveAuthorizedProtectedTreeExceptionChains(historical.protectedTrees, historical.authorizedRuntimeExceptions);
  resolveAuthorizedSupplementalFileChains(historical.authorizedRuntimeExceptions, historical.authorizedCopyClarifications);
  const draftRoot = safeRepositoryPath(repositoryRoot, historical.frozenDraftPath);
  assert.equal(historical.frozenDraftPath, "contracts/drafts/openai/skillpilot-coach-v1/1.0.0-SNAPSHOT");
  assert.equal(lstatSync(draftRoot).isSymbolicLink(), false, "Rejected snapshot root must not be a symlink.");
  assertFileSha256(resolve(draftRoot, "snapshot-manifest.json"), historical.frozenSnapshotManifestSha256);
  const snapshot = JSON.parse(readFileSync(resolve(draftRoot, "snapshot-manifest.json"), "utf8"));
  assert.equal(snapshot.schemaVersion, 1);
  assert.equal(snapshot.pluginIdentity, historical.pluginIdentity);
  assert.equal(snapshot.pluginVersion, historical.pluginVersion);
  assert.equal(snapshot.archiveRole, "plugin-install-bundle");
  assertSnapshotInventory(draftRoot, snapshot);
  const archives = snapshot.files.filter((entry) => entry.path.endsWith(".tar"));
  assert.equal(archives.length, 1);
  assert.equal(archives[0].sha256, historical.pluginArchiveSha256);
  const contract = JSON.parse(readFileSync(resolve(draftRoot, "contract/contract.json"), "utf8"));
  assert.equal(contract.contractSha256, historical.exportedContractSha256);
  const lifecycle = JSON.parse(readFileSync(resolve(draftRoot, "lifecycle.json"), "utf8"));
  assert.equal(lifecycle.contractLine.publicationStatus, "DRAFT",
    "The rejected submission must never be relabelled as published.");
  assertFileSha256(safeRepositoryPath(repositoryRoot, historical.reviewVideoPath),
    historical.reviewVideoSha256, "Historical content-addressed review video changed.");
  return {
    pluginIdentity: record.pluginIdentity, pluginVersion: record.pluginVersion,
    portalReviewState: record.portalReviewState, developmentFreezeActive: false,
    targetVersion: record.productOwnerDecision.targetVersion, historicalSnapshotVerified: true,
    protectedFileCount: 0, protectedTreeCount: 0,
  };
}

export function assertOpenAiPluginReleaseMutationAllowed({
  repositoryRoot = defaultRepositoryRoot, pluginIdentity, pluginVersion, command,
}) {
  verifyOpenAiPluginReviewFreeze({ repositoryRoot });
  assert.equal(pluginIdentity, expectedRetirementRecord.pluginIdentity,
    "Release identity must match the authorized OpenAI line.");
  assert.equal(command, "prepare",
    "Actual OpenAI publication and separate publication-recording authorization are still required; development approval does not authorize record-published.");
  assert.match(pluginVersion, /^1\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/u,
    "Only stable successor candidates in OpenAI contract major 1 are authorized.");
  const [, minor] = pluginVersion.split(".").map(Number);
  assert.ok(minor >= 1,
    "Rejected 1.0.0 and its old minor line cannot be rewritten; prepare a new successor from 1.1.0.");
  const indexPath = safeRepositoryPath(repositoryRoot, "contracts/openai/skillpilot-coach-v1/release-index.json");
  const index = JSON.parse(readFileSync(indexPath, "utf8"));
  assert.equal(index.pluginIdentity, pluginIdentity);
  assert.equal(index.contractMajor, 1);
  assert.ok(Array.isArray(index.publishedVersions), "Published release inventory is required.");
  assert.equal(index.publishedVersions.includes(pluginVersion), false,
    "An actually published version remains immutable.");
}

// Pure historical helpers below do not activate current development constraints.
const extractStaticImportSources = (source) => {
  const imports = [];
  const pattern = /\bimport\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/gu;
  for (const match of source.matchAll(pattern)) imports.push(match[1]);
  return imports;
};

const extractInterfacePropertyNames = (source, interfaceName) => {
  const marker = `interface ${interfaceName}`;
  const markerIndex = source.indexOf(marker);
  assert.notEqual(markerIndex, -1, `Missing presentation props interface ${interfaceName}.`);
  const openBraceIndex = source.indexOf("{", markerIndex + marker.length);
  assert.notEqual(openBraceIndex, -1, `Missing opening brace for ${interfaceName}.`);
  let depth = 0;
  let closeBraceIndex = -1;
  for (let index = openBraceIndex; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") {
      depth -= 1;
      if (depth === 0) {
        closeBraceIndex = index;
        break;
      }
    }
  }
  assert.notEqual(closeBraceIndex, -1, `Missing closing brace for ${interfaceName}.`);
  const body = source.slice(openBraceIndex + 1, closeBraceIndex);
  return [...body.matchAll(/^\s*([A-Za-z_$][\w$]*)\??\s*:/gmu)]
    .map((match) => match[1]);
};

export function assertEvolvablePresentationIslands({
  repositoryRoot = defaultRepositoryRoot,
  islands,
} = {}) {
  assert.equal(Array.isArray(islands), true, "Evolvable presentation islands must be an array.");
  const islandIds = new Set();
  const presentationPaths = new Set();

  for (const island of islands) {
    assert.equal(islandIds.has(island.id), false, `Duplicate presentation island id: ${island.id}`);
    islandIds.add(island.id);
    assert.equal(Array.isArray(island.files), true, `Presentation island lacks files: ${island.id}`);
    assert.equal(
      Array.isArray(island.forbiddenSourcePatterns),
      true,
      `Presentation island lacks forbidden effects: ${island.id}`,
    );

    const compositionPath = safeRepositoryPath(repositoryRoot, island.compositionFile);
    const compositionSource = readFileSync(compositionPath, "utf8");
    for (const snippet of island.compositionRequirements ?? []) {
      assert.equal(
        compositionSource.includes(snippet),
        true,
        `Protected landing composition changed or lost capability binding: ${snippet}`,
      );
    }

    for (const file of island.files) {
      assert.equal(
        presentationPaths.has(file.path),
        false,
        `Presentation file belongs to multiple islands: ${file.path}`,
      );
      presentationPaths.add(file.path);
      const absolutePath = safeRepositoryPath(repositoryRoot, file.path);
      const fileStat = lstatSync(absolutePath);
      assert.equal(fileStat.isSymbolicLink(), false, `Presentation island file is a symlink: ${file.path}`);
      assert.equal(fileStat.isFile(), true, `Presentation island entry is not a file: ${file.path}`);
      const source = readFileSync(absolutePath, "utf8");
      const imports = extractStaticImportSources(source);
      const allowedImports = new Set(file.allowedImports ?? []);
      for (const importSource of imports) {
        assert.equal(
          allowedImports.has(importSource),
          true,
          `Presentation island imports a non-presentational capability: ${file.path} -> ${importSource}`,
        );
        const normalizedImport = importSource.toLowerCase().replace(/[^a-z0-9]/gu, "");
        for (const fragment of island.forbiddenImportFragments ?? []) {
          assert.equal(
            normalizedImport.includes(fragment),
            false,
            `Presentation island imports protected ${fragment} code: ${file.path} -> ${importSource}`,
          );
        }
      }
      for (const forbidden of island.forbiddenSourcePatterns) {
        assert.equal(
          new RegExp(forbidden.pattern, "u").test(source),
          false,
          `Presentation island contains forbidden ${forbidden.label}: ${file.path}`,
        );
      }
      if (file.propsInterface) {
        const actualProps = extractInterfacePropertyNames(source, file.propsInterface).sort();
        assert.deepEqual(
          actualProps,
          [...file.allowedProps].sort(),
          `Presentation island capability surface changed: ${file.path} ${file.propsInterface}`,
        );
        const capabilityProps = new Set(file.capabilityProps ?? []);
        for (const prop of actualProps) {
          const functionPropPattern = new RegExp(`^\\s*${prop}\\??\\s*:\\s*\\([^)]*\\)\\s*=>`, "mu");
          assert.equal(
            functionPropPattern.test(source),
            capabilityProps.has(prop),
            `Presentation island function capability changed: ${file.path} ${prop}`,
          );
        }
      }
    }
  }
}

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
    if (!protectedFile) {
      assert.equal(
        exception.supplementalOnly,
        true,
        `Authorized runtime exception lacks a protected file without an explicit supplemental-only boundary: ${exception.id}`,
      );
      assert.equal(
        Boolean(exception.additionalFile) || (exception.additionalFiles?.length ?? 0) > 0,
        true,
        `Supplemental-only runtime exception lacks pinned files: ${exception.id}`,
      );
      continue;
    }
    assert.notEqual(
      exception.supplementalOnly,
      true,
      `Authorized runtime exception with a protected file cannot be supplemental-only: ${exception.id}`,
    );
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

export function resolveAuthorizedProtectedTreeExceptionChains(
  protectedTrees,
  authorizedRuntimeExceptions,
) {
  assert.equal(Array.isArray(protectedTrees), true, "Protected trees must be an array.");
  assert.equal(
    Array.isArray(authorizedRuntimeExceptions),
    true,
    "Authorized runtime exceptions must be an array.",
  );
  const protectedByPath = new Map(
    protectedTrees.map((entry) => [entry.path, entry]),
  );
  const latestByPath = new Map();

  for (const exception of authorizedRuntimeExceptions) {
    const protectedTree = exception.protectedTree;
    if (!protectedTree) {
      continue;
    }
    const submittedTree = protectedByPath.get(protectedTree.path);
    assert.ok(
      submittedTree,
      `Authorized runtime exception targets an unprotected tree: ${protectedTree.path}`,
    );
    assert.equal(
      protectedTree.submittedSha256,
      submittedTree.sha256,
      `Authorized runtime exception changed the submitted tree baseline: ${protectedTree.path}`,
    );
    assert.match(
      protectedTree.authorizedSha256,
      /^[0-9a-f]{64}$/u,
      `Authorized runtime exception has an invalid tree digest: ${exception.id}`,
    );

    const priorException = latestByPath.get(protectedTree.path);
    if (priorException) {
      assert.equal(
        protectedTree.priorAuthorizedSha256,
        priorException.protectedTree.authorizedSha256,
        `Authorized runtime tree exception chain is discontinuous: ${exception.id}`,
      );
    } else {
      assert.equal(
        Object.hasOwn(protectedTree, "priorAuthorizedSha256"),
        false,
        `First authorized runtime tree exception must start at the submitted baseline: ${exception.id}`,
      );
    }
    latestByPath.set(protectedTree.path, exception);
  }

  return latestByPath;
}

export function resolveAuthorizedSupplementalFileChains(
  authorizedRuntimeExceptions,
  authorizedCopyClarifications = [],
) {
  assert.equal(
    Array.isArray(authorizedRuntimeExceptions),
    true,
    "Authorized runtime exceptions must be an array.",
  );
  assert.equal(
    Array.isArray(authorizedCopyClarifications),
    true,
    "Authorized copy clarifications must be an array.",
  );
  const latestByPath = new Map();

  for (const clarification of authorizedCopyClarifications) {
    assert.equal(
      Array.isArray(clarification.files),
      true,
      `Authorized copy clarification lacks pinned files: ${clarification.id}`,
    );
    for (const file of clarification.files) {
      assert.equal(
        typeof file.path,
        "string",
        `Authorized copy clarification file lacks a path: ${clarification.id}`,
      );
      assert.match(
        file.sha256,
        /^[0-9a-f]{64}$/u,
        `Authorized copy clarification file has an invalid digest: ${file.path}`,
      );
      const prior = latestByPath.get(file.path);
      if (prior && prior.authorizedSha256 !== file.sha256) {
        assert.equal(
          file.priorSha256,
          prior.authorizedSha256,
          `Authorized copy clarification file chain is discontinuous: ${file.path}`,
        );
      }
      latestByPath.set(file.path, {
        path: file.path,
        authorizedSha256: file.sha256,
      });
    }
  }

  for (const exception of authorizedRuntimeExceptions) {
    const files = [
      ...(exception.evidenceFile
        ? [{
            ...exception.evidenceFile,
            authorizedSha256: exception.evidenceFile.sha256,
          }]
        : []),
      ...(exception.additionalFile ? [exception.additionalFile] : []),
      ...(exception.additionalFiles ?? []),
    ];
    for (const file of files) {
      assert.equal(
        typeof file.path,
        "string",
        `Authorized supplemental file lacks a path: ${exception.id}`,
      );
      const isDeleted = file.deleted === true;
      assert.equal(
        isDeleted || typeof file.authorizedSha256 === "string",
        true,
        `Authorized supplemental file lacks a digest or deletion marker: ${file.path}`,
      );
      assert.equal(
        isDeleted && Object.hasOwn(file, "authorizedSha256"),
        false,
        `Deleted supplemental file must not claim an authorized digest: ${file.path}`,
      );
      if (!isDeleted) {
        assert.match(
          file.authorizedSha256,
          /^[0-9a-f]{64}$/u,
          `Authorized supplemental file has an invalid digest: ${file.path}`,
        );
      }
      const prior = latestByPath.get(file.path);
      const claimedPriorSha256 =
        file.priorAuthorizedSha256 ?? (prior ? file.priorSha256 : undefined);
      assert.equal(
        prior?.deleted === true,
        false,
        `A deleted supplemental file cannot be reintroduced in the frozen V1 line: ${file.path}`,
      );
      if (prior && (isDeleted || prior.authorizedSha256 !== file.authorizedSha256)) {
        assert.equal(
          claimedPriorSha256,
          prior.authorizedSha256,
          `Authorized supplemental file chain is discontinuous: ${file.path}`,
        );
      } else if (
        prior &&
        Object.hasOwn(file, "priorAuthorizedSha256")
      ) {
        assert.equal(
          claimedPriorSha256,
          prior.authorizedSha256,
          `Authorized supplemental file repeats the wrong prior digest: ${file.path}`,
        );
      } else if (!prior) {
        assert.equal(
          Object.hasOwn(file, "priorAuthorizedSha256"),
          false,
          `First authorized supplemental file entry must not claim a prior digest: ${file.path}`,
        );
      }
      latestByPath.set(file.path, file);
    }
  }

  return latestByPath;
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
      `${result.pluginVersion} state=${result.portalReviewState} development_freeze=inactive ` +
      `historical_snapshot=verified successor=${result.targetVersion}`,
  );
}
