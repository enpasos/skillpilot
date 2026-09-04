import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  checkClaudeMarketplace,
  loadClaudeMarketplaceLane,
  prepareClaudeMarketplace,
  smokeTestLocalClaudeMarketplace,
  validateClaudeMarketplaceLane,
  validateClaudeMarketplaceManifest,
  validateClaudeMarketplaceWithCli,
  validateGeneratedTreeAgainstEvidence,
  validateMarketplaceCandidateAgainstDirectInstall,
  validatePublishedPublicationAgainstEvidence,
  verifyClaudeMarketplace,
  verifyPublishedClaudeMarketplace,
} from "./claude_marketplace_release.mjs";

const scriptRoot = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptRoot, "..");
const pluginManifest = JSON.parse(
  readFileSync(
    resolve(
      repositoryRoot,
      "ai/claude/plugin/skillpilot-coach-v1/.claude-plugin/plugin.json",
    ),
    "utf8",
  ),
);
const marketplaceTemplate = JSON.parse(
  readFileSync(
    resolve(
      repositoryRoot,
      "ai/claude/marketplace/skillpilot-marketplace/marketplace.json",
    ),
    "utf8",
  ),
);

test("production marketplace lane prepares the 1.1.0 replacement with all external evidence pending", () => {
  const lane = loadClaudeMarketplaceLane(repositoryRoot);
  validateClaudeMarketplaceLane(lane);
  assert.equal(lane.target.repository, "enpasos/skillpilot-claude-marketplace");
  assert.equal(lane.plugin.name, "skillpilot-coach-v1");
  assert.equal(lane.plugin.version, "1.1.0");
  assert.equal(
    lane.plugin.directInstallSha256,
    "ecb6e2d255699162a3221518d32eb4ee9de918cb5fce254f1cd67da0ac59f4ca",
  );
  assert.deepEqual(lane.activation, {
    state: "prepared_not_published",
    firstPartyUiRoute: "controlled_direct_install_beta",
    marketplaceUiSwitchAllowed: false,
    firstPartyGuideDecision: {
      status: "pending",
      approvedAt: null,
      approvedBy: null,
      candidateVersion: null,
      candidateSha256: null,
      repositoryRevision: null,
      repositoryTreeSha256: null,
      evidenceRef: null,
    },
    evidence: [
      {
        id: "public-repository-default-branch",
        status: "pending",
        revision: null,
        treeSha256: null,
        candidateVersion: null,
        candidateSha256: null,
        verifiedAt: null,
        evidenceRef: null,
      },
      {
        id: "clean-account-marketplace-install",
        status: "pending",
        revision: null,
        treeSha256: null,
        candidateVersion: null,
        candidateSha256: null,
        verifiedAt: null,
        evidenceRef: null,
      },
      {
        id: "uploaded-plugin-migration-and-marketplace-refresh",
        status: "pending",
        revision: null,
        treeSha256: null,
        candidateVersion: null,
        candidateSha256: null,
        verifiedAt: null,
        evidenceRef: null,
      },
    ],
  });
});

test("marketplace manifest keeps one stable plugin identity and one version authority", () => {
  const lane = loadClaudeMarketplaceLane(repositoryRoot);
  validateClaudeMarketplaceManifest(marketplaceTemplate, lane, pluginManifest);
  assert.equal(marketplaceTemplate.plugins[0].name, pluginManifest.name);
  assert.equal(Object.hasOwn(marketplaceTemplate, "version"), false);
  assert.equal(Object.hasOwn(marketplaceTemplate.plugins[0], "version"), false);

  const duplicateVersion = structuredClone(marketplaceTemplate);
  duplicateVersion.plugins[0].version = pluginManifest.version;
  assert.throws(
    () => validateClaudeMarketplaceManifest(duplicateVersion, lane, pluginManifest),
    /keys mismatch|must not duplicate/u,
  );

  const renamedEntry = structuredClone(marketplaceTemplate);
  renamedEntry.plugins[0].name = "skillpilot";
  assert.throws(
    () => validateClaudeMarketplaceManifest(renamedEntry, lane, pluginManifest),
    /marketplace plugin name mismatch/u,
  );
});

test("public activation cannot bypass the existing open-public-beta blockers", () => {
  const lane = loadClaudeMarketplaceLane(repositoryRoot);
  const directInstallLane = JSON.parse(
    readFileSync(
      resolve(
        repositoryRoot,
        "ai/claude/plugin/skillpilot-coach-v1/release/direct-install-beta.json",
      ),
      "utf8",
    ),
  );
  validateMarketplaceCandidateAgainstDirectInstall(lane, directInstallLane);

  const activated = structuredClone(lane);
  activated.activation.state = "published_verified";
  activated.activation.firstPartyUiRoute = "personal_git_marketplace";
  activated.activation.marketplaceUiSwitchAllowed = true;
  activated.activation.firstPartyGuideDecision = {
    status: "approved",
    approvedAt: "2026-08-31T18:01:00.000Z",
    approvedBy: "product-owner",
    candidateVersion: activated.plugin.version,
    candidateSha256: activated.plugin.directInstallSha256,
    repositoryRevision: "a".repeat(40),
    repositoryTreeSha256: "e".repeat(64),
    evidenceRef: "product-owner-decision",
  };
  activated.activation.evidence = activated.activation.evidence.map((evidence) => ({
    ...evidence,
    status: "pass",
    revision: "a".repeat(40),
    treeSha256: "e".repeat(64),
    candidateVersion: activated.plugin.version,
    candidateSha256: activated.plugin.directInstallSha256,
    verifiedAt: "2026-08-31T18:00:00.000Z",
    evidenceRef: `release-evidence/${evidence.id}`,
  }));
  assert.throws(
    () => validateMarketplaceCandidateAgainstDirectInstall(
      activated,
      directInstallLane,
    ),
    /requires every direct-install open-public-beta blocker to pass/u,
  );
});

test("marketplace activation state is derived from revision-bound evidence", () => {
  const lane = loadClaudeMarketplaceLane(repositoryRoot);
  const repositoryPublished = structuredClone(lane);
  repositoryPublished.activation.state = "published_pending_acceptance";
  repositoryPublished.activation.firstPartyUiRoute = "controlled_direct_install_beta";
  repositoryPublished.activation.marketplaceUiSwitchAllowed = false;
  repositoryPublished.activation.firstPartyGuideDecision = {
    status: "pending",
    approvedAt: null,
    approvedBy: null,
    candidateVersion: null,
    candidateSha256: null,
    repositoryRevision: null,
    repositoryTreeSha256: null,
    evidenceRef: null,
  };
  repositoryPublished.activation.evidence[0] = {
    ...repositoryPublished.activation.evidence[0],
    status: "pass",
    revision: "b".repeat(40),
    treeSha256: "e".repeat(64),
    candidateVersion: repositoryPublished.plugin.version,
    candidateSha256: repositoryPublished.plugin.directInstallSha256,
    verifiedAt: "2026-08-31T18:15:00.000Z",
    evidenceRef: "release-evidence/public-repository-default-branch",
  };
  validateClaudeMarketplaceLane(repositoryPublished);
  validateGeneratedTreeAgainstEvidence(repositoryPublished, "e".repeat(64));
  validatePublishedPublicationAgainstEvidence(repositoryPublished, {
    revision: "b".repeat(40),
    treeSha256: "e".repeat(64),
  });
  assert.throws(
    () => validatePublishedPublicationAgainstEvidence(
      repositoryPublished,
      { revision: "d".repeat(40), treeSha256: "e".repeat(64) },
    ),
    /published marketplace revision and approved evidence mismatch/u,
  );

  const dishonestActivation = structuredClone(repositoryPublished);
  dishonestActivation.activation.state = "published_verified";
  dishonestActivation.activation.firstPartyUiRoute = "personal_git_marketplace";
  dishonestActivation.activation.marketplaceUiSwitchAllowed = true;
  assert.throws(
    () => validateClaudeMarketplaceLane(dishonestActivation),
    /state must be derived from revision-bound evidence/u,
  );

  const conflictingRevisions = structuredClone(repositoryPublished);
  conflictingRevisions.activation.evidence[1] = {
    ...conflictingRevisions.activation.evidence[1],
    status: "pass",
    revision: "c".repeat(40),
    treeSha256: "e".repeat(64),
    candidateVersion: conflictingRevisions.plugin.version,
    candidateSha256: conflictingRevisions.plugin.directInstallSha256,
    verifiedAt: "2026-08-31T18:16:00.000Z",
    evidenceRef: "release-evidence/clean-account-marketplace-install",
  };
  assert.throws(
    () => validateClaudeMarketplaceLane(conflictingRevisions),
    /must reference one Git revision/u,
  );

  const staleCandidateEvidence = structuredClone(repositoryPublished);
  staleCandidateEvidence.plugin.version = "1.0.5";
  staleCandidateEvidence.plugin.directInstallSha256 = "f".repeat(64);
  assert.throws(
    () => validateClaudeMarketplaceLane(staleCandidateEvidence),
    /candidateVersion mismatch/u,
  );

  assert.throws(
    () => validatePublishedPublicationAgainstEvidence(repositoryPublished, {
      revision: "b".repeat(40),
      treeSha256: "f".repeat(64),
    }),
    /generated marketplace tree and approved evidence mismatch/u,
  );
  assert.throws(
    () => validateGeneratedTreeAgainstEvidence(
      repositoryPublished,
      "f".repeat(64),
    ),
    /generated marketplace tree and approved evidence mismatch/u,
  );
});

test("a Product Owner decision can switch only after repository evidence is recorded", () => {
  const lane = loadClaudeMarketplaceLane(repositoryRoot);
  assert.equal(lane.activation.state, "prepared_not_published");
  assert.equal(lane.activation.firstPartyUiRoute, "controlled_direct_install_beta");
  assert.equal(lane.activation.marketplaceUiSwitchAllowed, false);
  assert.equal(lane.activation.firstPartyGuideDecision.status, "pending");
  assert.deepEqual(
    lane.activation.evidence.map(({ status }) => status),
    ["pending", "pending", "pending"],
  );

  validateClaudeMarketplaceLane(lane);

  const dishonestSwitch = structuredClone(lane);
  dishonestSwitch.activation.firstPartyUiRoute = "personal_git_marketplace";
  dishonestSwitch.activation.marketplaceUiSwitchAllowed = true;
  assert.throws(
    () => validateClaudeMarketplaceLane(dishonestSwitch),
    /must be derived from repository verification and the Product Owner guide decision/u,
  );

  const staleDecision = structuredClone(lane);
  staleDecision.activation.state = "published_pending_acceptance";
  staleDecision.activation.evidence[0] = {
    ...staleDecision.activation.evidence[0],
    status: "pass",
    revision: "a".repeat(40),
    treeSha256: "b".repeat(64),
    candidateVersion: lane.plugin.version,
    candidateSha256: lane.plugin.directInstallSha256,
    verifiedAt: "2026-09-04T10:00:00.000Z",
    evidenceRef: "release-evidence/public-repository-default-branch",
  };
  staleDecision.activation.firstPartyGuideDecision = {
    status: "approved",
    approvedAt: "2026-09-04T10:01:00.000Z",
    approvedBy: "product-owner",
    candidateVersion: "1.0.4",
    candidateSha256: lane.plugin.directInstallSha256,
    repositoryRevision: "a".repeat(40),
    repositoryTreeSha256: "b".repeat(64),
    evidenceRef: "product-owner-decision",
  };
  staleDecision.activation.firstPartyGuideDecision.candidateVersion = "1.0.3";
  assert.throws(
    () => validateClaudeMarketplaceLane(staleDecision),
    /firstPartyGuideDecision\.candidateVersion mismatch/u,
  );
});

test("prepare exports exactly the reviewed plugin allowlist and verifies reproducibly", () => {
  withOutput(({ outputRoot }) => {
    const prepared = prepareClaudeMarketplace({ repositoryRoot, outputRoot });
    const verified = verifyClaudeMarketplace({
      repositoryRoot,
      marketplaceRoot: outputRoot,
    });
    assert.equal(prepared.pluginName, "skillpilot-coach-v1");
    assert.equal(prepared.version, "1.1.0");
    assert.equal(prepared.files.length, 11);
    assert.deepEqual(prepared.files, verified.files);
    assert.equal(prepared.treeSha256, verified.treeSha256);
    assert(prepared.files.includes(".claude-plugin/marketplace.json"));
    assert(prepared.files.includes(".github/workflows/validate.yml"));
    assert(prepared.files.includes("LICENSE"));
    assert(prepared.files.includes("plugins/skillpilot-coach-v1/.mcp.json"));
    assert.equal(
      prepared.files.some((path) => /(?:check-package|release\/)/u.test(path)),
      false,
    );
  });
});

test("CLI validation checks both the marketplace and embedded plugin strictly", () => {
  withOutput(({ outputRoot }) => {
    prepareClaudeMarketplace({ repositoryRoot, outputRoot });
    const calls = [];
    validateClaudeMarketplaceWithCli({
      repositoryRoot,
      marketplaceRoot: outputRoot,
      runCommand(command, args) {
        calls.push({ command, args });
        return { stdout: "", stderr: "" };
      },
    });
    assert.deepEqual(calls, [
      {
        command: "claude",
        args: ["plugin", "validate", "--strict", outputRoot],
      },
      {
        command: "claude",
        args: [
          "plugin",
          "validate",
          "--strict",
          resolve(outputRoot, "plugins/skillpilot-coach-v1"),
        ],
      },
    ]);
  });
});

test("local smoke test installs the expected version in an isolated Claude profile", () => {
  withOutput(({ outputRoot }) => {
    prepareClaudeMarketplace({ repositoryRoot, outputRoot });
    const calls = [];
    const result = smokeTestLocalClaudeMarketplace({
      repositoryRoot,
      marketplaceRoot: outputRoot,
      runCommand(command, args, options = {}) {
        calls.push({ command, args, hasIsolatedConfig: Boolean(options.env?.CLAUDE_CONFIG_DIR) });
        if (args.join(" ") === "plugin list --json") {
          return {
            stdout: JSON.stringify([
              {
                id: "skillpilot-coach-v1@skillpilot-marketplace",
                version: "1.1.0",
                enabled: true,
                mcpServers: {
                  skillpilot: {
                    type: "http",
                    url: "https://mcp-claude-v1.skillpilot.com/mcp",
                  },
                },
              },
            ]),
            stderr: "",
          };
        }
        return { stdout: "", stderr: "" };
      },
    });
    assert.equal(result.installedId, "skillpilot-coach-v1@skillpilot-marketplace");
    assert.equal(calls.length, 5);
    assert.deepEqual(
      calls.slice(0, 2).map(({ args }) => args),
      [
        ["plugin", "validate", "--strict", outputRoot],
        [
          "plugin",
          "validate",
          "--strict",
          resolve(outputRoot, "plugins/skillpilot-coach-v1"),
        ],
      ],
    );
    assert(calls.slice(2).every(({ hasIsolatedConfig }) => hasIsolatedConfig));
    assert.deepEqual(calls[3].args, [
      "plugin",
      "install",
      "skillpilot-coach-v1@skillpilot-marketplace",
      "--scope",
      "user",
    ]);
  });
});

test("verification rejects changed plugin bytes and unexpected files", () => {
  withOutput(({ outputRoot }) => {
    prepareClaudeMarketplace({ repositoryRoot, outputRoot });
    const mcpPath = resolve(outputRoot, "plugins/skillpilot-coach-v1/.mcp.json");
    writeFileSync(mcpPath, `${readFileSync(mcpPath, "utf8")}\n`);
    assert.throws(
      () => verifyClaudeMarketplace({ repositoryRoot, marketplaceRoot: outputRoot }),
      /not byte-identical/u,
    );
  });

  withOutput(({ outputRoot }) => {
    prepareClaudeMarketplace({ repositoryRoot, outputRoot });
    writeFileSync(resolve(outputRoot, "internal-release-evidence.json"), "{}\n");
    assert.throws(
      () => verifyClaudeMarketplace({ repositoryRoot, marketplaceRoot: outputRoot }),
      /marketplace output file allowlist mismatch/u,
    );
  });
});

test("prepare refuses to overwrite an arbitrary external checkout", () => {
  withOutput(({ outputRoot }) => {
    mkdirSync(outputRoot);
    writeFileSync(resolve(outputRoot, "README.md"), "user-owned checkout\n");
    assert.throws(
      () => prepareClaudeMarketplace({ repositoryRoot, outputRoot }),
      /Refusing to replace an existing non-default marketplace output/u,
    );
  }, { prepareDirectory: false });
});

test("published verification is pinned to the configured repository", () => {
  assert.throws(
    () => verifyPublishedClaudeMarketplace({
      repositoryRoot,
      repositorySource: "https://github.com/example/other-marketplace",
    }),
    /must match the configured repository/u,
  );
});

test("source check leaves no publication tree behind", () => {
  const result = checkClaudeMarketplace({ repositoryRoot });
  assert.equal(result.pluginName, "skillpilot-coach-v1");
  assert.equal(result.files.length, 11);
});

function withOutput(callback, { prepareDirectory = false } = {}) {
  const root = mkdtempSync(resolve(tmpdir(), "skillpilot-marketplace-test-"));
  const outputRoot = resolve(root, "skillpilot-claude-marketplace");
  try {
    if (prepareDirectory) mkdirSync(outputRoot);
    callback({ root, outputRoot });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
