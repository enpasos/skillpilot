import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  advancePublishedIndex,
  assertBehavioralReviewApproved,
  assertExactReleaseTree,
  assertReleaseCompatible,
  assertSuccessorVersionClassification,
  collectCompatibilityProblems,
  determineReleaseVerificationMode,
  loadReleaseContract,
  validatePublishedIndex,
} from "./lib/openai_plugin_contract_compatibility.mjs";

const fixturePath = fileURLToPath(
  new URL(
    "./fixtures/openai-plugin-contract-compatibility/cases.json",
    import.meta.url,
  ),
);
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));

for (const fixtureCase of fixture.cases) {
  test(`contract compatibility: ${fixtureCase.name}`, () => {
    const candidate = structuredClone(fixture.baseline);
    for (const operation of fixtureCase.operations) {
      applyOperation(candidate, operation);
    }
    const problems = collectCompatibilityProblems(fixture.baseline, candidate);
    if (fixtureCase.compatible) {
      assert.deepEqual(problems, []);
    } else {
      assert.ok(
        problems.some((problem) => problem.includes(fixtureCase.expected)),
        `Expected a problem containing "${fixtureCase.expected}", got:\n${problems.join("\n")}`,
      );
    }
  });
}

test("release-directory comparison accepts a compatible candidate", () => {
  withTemporaryDirectory((root) => {
    const baselineRoot = resolve(root, "baseline");
    const candidateRoot = resolve(root, "candidate");
    const candidate = structuredClone(fixture.baseline);
    candidate.contract.tools[0].description = "A clarified description.";
    candidate.contract.tools[0].inputSchema.properties.locale = {
      type: "string",
    };
    writeRelease(baselineRoot, fixture.baseline);
    writeRelease(candidateRoot, candidate);

    assert.doesNotThrow(() =>
      assertReleaseCompatible(baselineRoot, candidateRoot),
    );
  });
});

test("scope ordering and safer annotation corrections are not false incompatibilities", () => {
  const baseline = structuredClone(fixture.baseline);
  const candidate = structuredClone(fixture.baseline);
  baseline.contract.tools[0].meta.securitySchemes[0].scopes = [
    "skillpilot.profile",
    "skillpilot.read",
  ];
  baseline.securitySchemes.get_context[0].scopes = [
    "skillpilot.profile",
    "skillpilot.read",
  ];
  candidate.contract.tools[0].meta.securitySchemes[0].scopes = [
    "skillpilot.read",
    "skillpilot.profile",
  ];
  candidate.securitySchemes.get_context[0].scopes = [
    "skillpilot.read",
    "skillpilot.profile",
  ];
  baseline.contract.tools[1].annotations.destructiveHint = true;
  candidate.contract.tools[1].annotations.destructiveHint = false;

  assert.deepEqual(collectCompatibilityProblems(baseline, candidate), []);
});

test("release loader rejects a security inventory that disagrees with contract metadata", () => {
  withTemporaryDirectory((root) => {
    writeRelease(root, fixture.baseline);
    const securityPath = resolve(root, "contract/security-schemes.json");
    const security = JSON.parse(readFileSync(securityPath, "utf8"));
    security.get_context[0].scopes = ["skillpilot.write"];
    writeJson(securityPath, security);
    assert.throws(
      () => loadReleaseContract(root),
      /security-schemes\.json disagrees/,
    );
  });
});

test("exact-tree verification keeps published artifacts immutable", () => {
  withTemporaryDirectory((root) => {
    const expected = resolve(root, "expected");
    const actual = resolve(root, "actual");
    mkdirSync(expected);
    mkdirSync(actual);
    writeFileSync(resolve(expected, "artifact.txt"), "immutable\n");
    writeFileSync(resolve(actual, "artifact.txt"), "immutable\n");
    assert.doesNotThrow(() => assertExactReleaseTree(actual, expected));

    writeFileSync(resolve(actual, "artifact.txt"), "changed\n");
    assert.throws(
      () => assertExactReleaseTree(actual, expected),
      /Release artifact changed/,
    );
  });
});

test("an empty published index keeps version 1.0.0 as an internal draft", () => {
  const index = unpublishedIndex();
  validatePublishedIndex(index, "skillpilot-coach-de-v1", 1);
  assert.equal(
    determineReleaseVerificationMode("1.0.0", index),
    "initial-draft",
  );
});

test("published index selects exact verification for latestPublishedVersion", () => {
  const index = publishedIndex();
  validatePublishedIndex(index, "skillpilot-coach-de-v1", 1);
  assert.equal(
    determineReleaseVerificationMode("1.0.0", index),
    "exact-published",
  );
});

test("published index selects compatibility verification for a newer 1.x candidate", () => {
  const index = publishedIndex();
  assert.equal(
    determineReleaseVerificationMode("1.1.0", index),
    "compatible-successor",
  );
  assert.equal(
    determineReleaseVerificationMode("1.0.1", index),
    "compatible-successor",
  );
});

test("recording the initial publication preserves the 1.0.0 package version", () => {
  const next = advancePublishedIndex(
    unpublishedIndex(),
    "1.0.0",
    "contracts/published/openai/skillpilot-coach-de-v1/1.0.0",
  );
  assert.equal(next.latestPublishedVersion, "1.0.0");
  assert.deepEqual(next.publishedVersions, ["1.0.0"]);
  assert.equal(
    next.baselinePath,
    "contracts/published/openai/skillpilot-coach-de-v1/1.0.0",
  );
});

test("recording a successor advances latestPublishedVersion while preserving baselines", () => {
  const next = advancePublishedIndex(
    publishedIndex(),
    "1.1.0",
    "contracts/published/openai/skillpilot-coach-de-v1/1.1.0",
  );
  assert.equal(next.latestPublishedVersion, "1.1.0");
  assert.deepEqual(next.publishedVersions, ["1.0.0", "1.1.0"]);
  assert.equal(
    next.baselinePath,
    "contracts/published/openai/skillpilot-coach-de-v1/1.1.0",
  );
});

test("published index rejects downgrades and contract-major changes", () => {
  const index = {
    ...publishedIndex(),
    latestPublishedVersion: "1.2.0",
    publishedVersions: ["1.0.0", "1.2.0"],
    baselinePath:
      "contracts/published/openai/skillpilot-coach-de-v1/1.2.0",
  };
  assert.throws(
    () => determineReleaseVerificationMode("1.1.9", index),
    /older than latestPublishedVersion/,
  );
  assert.throws(
    () => determineReleaseVerificationMode("2.0.0", index),
    /outside contract major/,
  );
});

test("PATCH accepts wording corrections but rejects additive public fields", () => {
  withTemporaryDirectory((root) => {
    const baselineRoot = resolve(root, "baseline");
    const wordingRoot = resolve(root, "wording");
    const additiveRoot = resolve(root, "additive");
    const wording = structuredClone(fixture.baseline);
    wording.contract.tools[0].description = "Clarified wording.";
    const additive = structuredClone(fixture.baseline);
    additive.contract.tools[0].inputSchema.properties.locale = {
      type: "string",
    };
    writeRelease(baselineRoot, fixture.baseline);
    writeRelease(wordingRoot, wording);
    writeRelease(additiveRoot, additive);

    assert.doesNotThrow(() =>
      assertSuccessorVersionClassification(
        "1.0.0",
        "1.0.1",
        baselineRoot,
        wordingRoot,
      ),
    );
    assert.throws(
      () =>
        assertSuccessorVersionClassification(
          "1.0.0",
          "1.0.1",
          baselineRoot,
          additiveRoot,
        ),
      /require a MINOR version bump/,
    );
    assert.doesNotThrow(() =>
      assertSuccessorVersionClassification(
        "1.0.0",
        "1.1.0",
        baselineRoot,
        additiveRoot,
      ),
    );
  });
});

test("behavioural instruction and skill changes are reported for release review", () => {
  withTemporaryDirectory((root) => {
    const baselineRoot = resolve(root, "baseline");
    const candidateRoot = resolve(root, "candidate");
    const candidate = structuredClone(fixture.baseline);
    candidate.contract.serverInstructions = "A reviewed workflow correction.";
    candidate.skillsBundle.files[0].sha256 = "skill-v1-corrected";
    writeRelease(baselineRoot, fixture.baseline);
    writeRelease(candidateRoot, candidate);

    const changes = assertSuccessorVersionClassification(
      "1.0.0",
      "1.0.1",
      baselineRoot,
      candidateRoot,
    );
    assert.ok(changes.reviewRequired.includes("server instructions changed"));
    assert.ok(
      changes.reviewRequired.some((change) =>
        change.includes("skill bundle content changed"),
      ),
    );
    assert.throws(
      () =>
        assertBehavioralReviewApproved(
          changes,
          "# Release without approval\n",
          "1.0.0",
          "1.0.1",
        ),
      /require a skillpilot-release-classification/,
    );
    assert.doesNotThrow(() =>
      assertBehavioralReviewApproved(
        changes,
        releaseNotesClassification(changes.reviewRequired),
        "1.0.0",
        "1.0.1",
      ),
    );
    assert.throws(
      () =>
        assertBehavioralReviewApproved(
          changes,
          releaseNotesClassification(["server instructions changed"]),
          "1.0.0",
          "1.0.1",
        ),
      /enumerate the exact behavioural diff/,
    );
  });
});

test("an additive stable error code is compatible but requires MINOR", () => {
  withTemporaryDirectory((root) => {
    const baselineRoot = resolve(root, "baseline");
    const candidateRoot = resolve(root, "candidate");
    const candidate = structuredClone(fixture.baseline);
    candidate.errorCatalog.errors.push({
      code: "SESSION_VERSION_UNAVAILABLE",
      category: "session",
      retryable: false,
      stateChanged: false,
      recovery: "Start a fresh learning session.",
    });
    writeRelease(baselineRoot, fixture.baseline);
    writeRelease(candidateRoot, candidate);

    assert.doesNotThrow(() =>
      assertReleaseCompatible(baselineRoot, candidateRoot),
    );
    assert.throws(
      () =>
        assertSuccessorVersionClassification(
          "1.0.0",
          "1.0.1",
          baselineRoot,
          candidateRoot,
        ),
      /require a MINOR version bump/,
    );
    assert.doesNotThrow(() =>
      assertSuccessorVersionClassification(
        "1.0.0",
        "1.1.0",
        baselineRoot,
        candidateRoot,
      ),
    );
  });
});

function writeRelease(root, release) {
  mkdirSync(resolve(root, "contract"), { recursive: true });
  const toolNames = release.contract.tools.map((tool) => tool.name);
  writeJson(resolve(root, "contract/contract.json"), release.contract);
  writeJson(resolve(root, "contract/tools-list.json"), toolNames);
  writeJson(
    resolve(root, "contract/security-schemes.json"),
    release.securitySchemes,
  );
  writeJson(
    resolve(root, "contract/error-catalog.json"),
    release.errorCatalog,
  );
  writeJson(resolve(root, "contract/resources-list.json"), release.resources);
  writeJson(resolve(root, "ui-manifest.json"), release.uiManifest);
  writeJson(resolve(root, "skills-bundle.json"), release.skillsBundle);
}

function applyOperation(root, operation) {
  let parent = root;
  for (const segment of operation.path.slice(0, -1)) {
    parent = parent[segment];
  }
  const key = operation.path.at(-1);
  if (operation.op === "set") {
    parent[key] = structuredClone(operation.value);
  } else if (operation.op === "delete") {
    delete parent[key];
  } else {
    throw new Error(`Unsupported fixture operation ${operation.op}`);
  }
}

function publishedIndex() {
  return {
    schemaVersion: 2,
    pluginIdentity: "skillpilot-coach-de-v1",
    contractMajor: 1,
    latestPublishedVersion: "1.0.0",
    publishedVersions: ["1.0.0"],
    baselinePath:
      "contracts/published/openai/skillpilot-coach-de-v1/1.0.0",
  };
}

function unpublishedIndex() {
  return {
    schemaVersion: 2,
    pluginIdentity: "skillpilot-coach-de-v1",
    contractMajor: 1,
    latestPublishedVersion: null,
    publishedVersions: [],
    baselinePath: null,
  };
}

function releaseNotesClassification(reviewedChanges) {
  return `# Reviewed release

<!-- skillpilot-release-classification
${JSON.stringify(
  {
    schemaVersion: 1,
    fromVersion: "1.0.0",
    toVersion: "1.0.1",
    decision: "BACKWARDS_COMPATIBLE",
    reviewedBy: "release-test",
    rationale: "The wording correction preserves the published V1 workflow.",
    reviewedChanges,
  },
  null,
  2,
)}
-->
`;
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function withTemporaryDirectory(callback) {
  const root = mkdtempSync(resolve(tmpdir(), "skillpilot-openai-release-test-"));
  try {
    callback(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
