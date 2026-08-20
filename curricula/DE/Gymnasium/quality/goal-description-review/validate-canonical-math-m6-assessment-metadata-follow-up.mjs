#!/usr/bin/env node
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../../..");
const receiptPath = path.join(
  here,
  "canonical-math-m6-assessment-metadata-follow-up-2026-08-20.receipt.json",
);
const schemaPath = path.join(
  here,
  "canonical-math-m6-assessment-metadata-follow-up.receipt.schema.json",
);
const validatorPath = fileURLToPath(import.meta.url);

const IDS = Object.freeze({
  landscape: "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced",
  root: "c01b1ce9-a667-4a46-b251-ec33ae602b15",
  upper: "98dcf9bd-d119-5eb1-835c-7d719f67b485",
  q2Practice: "14b19ee4-364e-50bd-b6a3-499471356ef3",
  gk: "57aff94e-91b8-5cc6-9f85-3f317ecf36ca",
  lk: "e4656e83-3f33-5bda-b0bc-d4b63ec4653e",
  modal: "f1050f11-50bb-52ce-a406-4563ad976cc4",
  modalContent: "03703b29-efd8-57e0-acf5-4381b1dc67ec",
});

const HISTORICAL = Object.freeze({
  canonical: {
    path: "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json",
    bytes: 3123302,
    sha256: "4a099ada2b496cec6595092780d729211eaad9dd1bad066aaac087f983559c31",
  },
  ledger: {
    path: "curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json",
    bytes: 369293,
    sha256: "db6cb2fe38bb1daafccd1328f7c1475b23e0099baab5073cf6994702816c961f",
  },
  durationPolicy: {
    path: "app/scripts/config/math-duration-split-spanning-tree-policy.json",
    bytes: 31496,
    sha256: "c45988f3cdf3209bdb3ea251a6e4c3a788ec554a723b23b792f46118b529235f",
  },
  releaseProfile: {
    path: "contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-release-model-v1.profile.json",
    bytes: 5677,
    sha256: "0639f60b38bd10cf6eb6325927d325baeaf78ee0e14d84438b67410d66699fda",
  },
  qualityStatus: {
    path: "docs/qa-ci/status/curriculum-quality-status.json",
    bytes: 2735280,
    sha256: "f96223a71ac653ae130392b3a2276ba382ea586afba2e054594a5f5dbde0ff3b",
  },
});

const RECEIPT_CHAIN = Object.freeze({
  layerAAuthority: {
    receipt: {
      path: "curricula/DE/Gymnasium/quality/goal-description-review/canonical-layer-a-route-assessment-source-hardening-authority-2026-08-17.receipt.json",
      bytes: 1066134,
      sha256: "8eec05a01829669fbfc6bdcb3ab127ad3aa27b1e65717f396a8c3b4344a6bcf3",
    },
    receiptId: "canonical-layer-a-route-assessment-source-hardening-authority-2026-08-17",
    receiptDigest: "c0f389f9b492a8f57ea8823d93250fa3e85dd96ef1970b90ba0b48f8ae524add",
  },
  semanticFingerprintLeaf: {
    receipt: {
      path: "curricula/DE/Gymnasium/quality/goal-description-review/canonical-layer-a-route-assessment-source-hardening-semantic-kind-fingerprint-follow-up-2026-08-17.receipt.json",
      bytes: 7097,
      sha256: "59eb719b399f894c2dfd49e21ab107b4d8b1b17dde41be2468c2770c3f0b493b",
    },
    receiptId: "canonical-layer-a-route-assessment-source-hardening-semantic-kind-fingerprint-follow-up-2026-08-17-v1",
    receiptDigest: "dc31b852d9dae252c29f85506c285eb4488d855017d6e90cdf515528d2db1219",
  },
  providerMetadataLeaf: {
    receipt: {
      path: "curricula/DE/Gymnasium/quality/goal-description-review/canonical-layer-a-route-assessment-source-hardening-provider-metadata-follow-up-2026-08-17.receipt.json",
      bytes: 5364,
      sha256: "2c46ea1d9220d32c058156ad8aee4ca4b50e6b74f9777410e3224cb52b8d0152",
    },
    receiptId: "canonical-layer-a-route-assessment-source-hardening-provider-metadata-follow-up-2026-08-17-v1",
    receiptDigest: "72cfb8dc060205fa6e0586fc2dab9403d5ada899f033cdafb8361ae8cb48d71b",
  },
  deterministicRenderLeaf: {
    receipt: {
      path: "curricula/DE/Gymnasium/quality/goal-description-review/canonical-layer-a-route-assessment-source-hardening-deterministic-render-provenance-follow-up-2026-08-17.receipt.json",
      bytes: 6486,
      sha256: "54e6c180642f60bd74c98231d70f36b2b1115a358605572868962ce04eb2f796",
    },
    receiptId: "canonical-layer-a-route-assessment-source-hardening-deterministic-render-provenance-follow-up-2026-08-17-v1",
    receiptDigest: "f18d7aa625bb51bc10f6f56c4c15935a9aca74981b8bdcad736137260045b380",
  },
  measurementReviewLeaf: {
    receipt: {
      path: "curricula/DE/Gymnasium/quality/goal-description-review/canonical-layer-a-route-assessment-source-hardening-measurement-review-parity-follow-up-2026-08-17.receipt.json",
      bytes: 6433,
      sha256: "b07e4b0d9a3a4afbe7252099b415f948b9f8095e228793bb4555824a77524dc8",
    },
    receiptId: "canonical-layer-a-route-assessment-source-hardening-measurement-review-parity-follow-up-2026-08-17-v1",
    receiptDigest: "309fa4d6f55012aec19e9f58bb5379c5da785260b59a81b08dc22620ea5095e1",
  },
});

const EXPECTED_ARTIFACTS = Object.freeze({
  "gk-task-v2": {
    path: "curricula/DE/Gymnasium/assessments/mathematik/sekii/q2/markov-backward-v2/gk_task_v2.md",
    bytes: 3039,
    sha256: "a476c01ffe04d3cb295455b8173fde5ed7a5a0f3a43ad370177d9a9ffcc51d5a",
  },
  "gk-solution-v2": {
    path: "curricula/DE/Gymnasium/assessments/mathematik/sekii/q2/markov-backward-v2/gk_solution_v2.md",
    bytes: 6399,
    sha256: "2959801ae4cd7604f35e95097183dcd0820afc60307b425546dfd9ccbedda3b3",
  },
  "lk-task-v2": {
    path: "curricula/DE/Gymnasium/assessments/mathematik/sekii/q2/markov-backward-v2/lk_task_v2.md",
    bytes: 3703,
    sha256: "a58b032452cf0c1acb25919fce7439da132326ce4de5176c0f8ff32548efea82",
  },
  "lk-solution-v2": {
    path: "curricula/DE/Gymnasium/assessments/mathematik/sekii/q2/markov-backward-v2/lk_solution_v2.md",
    bytes: 7800,
    sha256: "38b0d992b10b4b6eb18b485dc27a5f1b110a066c80d6f374613defc697dd7fb7",
  },
  "independent-review-v2": {
    path: "curricula/DE/Gymnasium/assessments/mathematik/sekii/q2/markov-backward-v2/independent_review_v2.md",
    bytes: 7186,
    sha256: "d3574641e10020fceb3e945960b7d8f1f5a7f240975fd24d78f3dc77a2c57794",
  },
});

const EXPECTED_FINGERPRINT_TRANSITIONS = Object.freeze([
  {
    goalId: IDS.q2Practice,
    decisionIndex: 91,
    before: "sha256:eb9f645358f573f6791ee4d1b02a80a80d7b7b7d7ecc27e42aef26e7560de367",
    after: "sha256:7921a59b821f440141601a77dbb0d165a8d1193b3ecdefcd6c7da86c732545cf",
  },
  {
    goalId: IDS.gk,
    decisionIndex: 401,
    before: "sha256:df52badd1722d588074327833bda4a2f1e589a910f47f533eac5d5e1efcaed06",
    after: "sha256:827f5d72520b11d020502db399294ae12de2dfc50d2d721e6cd959f556097949",
  },
  {
    goalId: IDS.modal,
    decisionIndex: 1132,
    before: "sha256:2dd6a26c7056fa53fc9c11b654fd821f9ee7a6862a71cb6bfd978c7d5019c751",
    after: "sha256:c44e96661a4ab5fd532310723e2bba9afbecf8d8560108862d94fec0b1c79fb3",
  },
]);

const EXPECTED_LEDGER_COUNTS_BEFORE = Object.freeze({
  curricularAtomic: 780,
  curricularArea: 218,
  practiceAssessment: 128,
  programStructure: 7,
  memory: 6,
  runtimeSupport: 5,
  orientation: 2,
  total: 1146,
});
const EXPECTED_LEDGER_COUNTS_AFTER = Object.freeze({
  ...EXPECTED_LEDGER_COUNTS_BEFORE,
  practiceAssessment: 129,
  total: 1147,
});

const EXPECTED_QUALITY_BEFORE = Object.freeze({
  maturity: "M3",
  goals: 1146,
  atomicGoals: 902,
  clusterGoals: 244,
  scopes: [
    {
      scopeId: "canonical-math-sek1",
      maturity: "M3",
      selectedAtomicGoals: 257,
      terminalAutonomyGoals: 44,
      cqr201: "pass",
      cqr202: "pass",
      cqr203: "warn",
    },
    {
      scopeId: "canonical-math-sek2",
      maturity: "M2",
      selectedAtomicGoals: 568,
      terminalAutonomyGoals: 43,
      cqr201: "pass",
      cqr202: "fail",
      cqr203: "warn",
    },
  ],
});
const EXPECTED_QUALITY_AFTER = Object.freeze({
  maturity: "M6",
  goals: 1147,
  atomicGoals: 903,
  clusterGoals: 244,
  scopes: [
    {
      scopeId: "canonical-math-sek1",
      maturity: "M4",
      selectedAtomicGoals: 257,
      terminalAutonomyGoals: 44,
      cqr201: "pass",
      cqr202: "pass",
      cqr203: "pass",
    },
    {
      scopeId: "canonical-math-sek2",
      maturity: "M4",
      selectedAtomicGoals: 569,
      terminalAutonomyGoals: 44,
      cqr201: "pass",
      cqr202: "pass",
      cqr203: "pass",
    },
  ],
});

const sha256 = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const serializeJson = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8");
const fileBinding = (file) => {
  const bytes = fs.readFileSync(file);
  return { bytes: bytes.length, sha256: sha256(bytes) };
};
const repoFileBinding = (relativePath) => ({
  path: relativePath,
  ...fileBinding(path.join(repoRoot, relativePath)),
});
const bufferBinding = (relativePath, bytes) => ({
  path: relativePath,
  bytes: bytes.length,
  sha256: sha256(bytes),
});
const digestDocument = (value) => {
  const copy = structuredClone(value);
  delete copy.receiptDigest;
  return sha256(Buffer.from(JSON.stringify(copy), "utf8"));
};
const compareCodePoints = (left, right) => {
  const leftPoints = [...left].map((value) => value.codePointAt(0));
  const rightPoints = [...right].map((value) => value.codePointAt(0));
  const length = Math.min(leftPoints.length, rightPoints.length);
  for (let index = 0; index < length; index += 1) {
    if (leftPoints[index] !== rightPoints[index]) return leftPoints[index] - rightPoints[index];
  }
  return leftPoints.length - rightPoints.length;
};
const canonicalJson = (value) => {
  if (value === null) return "null";
  if (typeof value === "boolean" || typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    assert(Number.isFinite(value), "non-finite number in canonical JSON");
    return JSON.stringify(Object.is(value, -0) ? 0 : value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  assert.equal(typeof value, "object", "unsupported canonical JSON value");
  const members = Object.keys(value)
    .sort(compareCodePoints)
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`);
  return `{${members.join(",")}}`;
};
const goalDigest = (goal) => sha256(Buffer.from(canonicalJson(goal), "utf8"));
const sourceFingerprint = (goal, contract) => {
  const fields = contract.pointers.map((pointer) => {
    assert(/^\/[A-Za-z]+$/.test(pointer), `unsupported source-fingerprint pointer ${pointer}`);
    const key = pointer.slice(1);
    if (!Object.prototype.hasOwnProperty.call(goal, key)) return { path: pointer, state: "missing" };
    let value = structuredClone(goal[key]);
    if (pointer === "/tags") {
      assert(Array.isArray(value) && value.every((entry) => typeof entry === "string"), "invalid tags");
      assert.equal(new Set(value).size, value.length, `duplicate tags on ${goal.id}`);
      value = [...value].sort(compareCodePoints);
    }
    return { path: pointer, state: "value", value };
  });
  return `sha256:${sha256(Buffer.from(canonicalJson({ domain: contract.domain, fields }), "utf8"))}`;
};
const selectFileBinding = (value) => ({ path: value.path, bytes: value.bytes, sha256: value.sha256 });
const goalById = (goals, id) => {
  const matches = goals.filter((goal) => goal.id === id);
  assert.equal(matches.length, 1, `expected exactly one goal ${id}`);
  return matches[0];
};
const markdownBody = (markdown) => {
  const metadataStart = markdown.indexOf("- Bestehensgrenze:");
  assert(metadataStart >= 0, "assessment artifact lacks passing threshold metadata");
  const bodyStart = markdown.indexOf("\n\n", metadataStart);
  assert(bodyStart >= 0, "assessment artifact lacks body separator");
  return markdown.slice(bodyStart + 2).trim();
};
const sectionPointSum = (markdown) => [...markdown.matchAll(/^## \d+\.[^\n]*\((\d+) BE\)$/gm)]
  .reduce((sum, match) => sum + Number(match[1]), 0);
const extractQualitySnapshot = (curriculum) => ({
  maturity: curriculum.maturity,
  goals: curriculum.goals,
  atomicGoals: curriculum.atomicGoals,
  clusterGoals: curriculum.clusterGoals,
  scopes: curriculum.scopes.map((scope) => {
    const rule = (id) => {
      const matches = scope.rules.filter((entry) => entry.id === id);
      assert.equal(matches.length, 1, `scope ${scope.scopeId} lacks exactly one ${id}`);
      return matches[0];
    };
    return {
      scopeId: scope.scopeId,
      maturity: scope.maturity,
      selectedAtomicGoals: scope.selectedAtomicGoals,
      terminalAutonomyGoals: rule("CQR-201").metrics.terminalAutonomyGoals,
      cqr201: rule("CQR-201").status,
      cqr202: rule("CQR-202").status,
      cqr203: rule("CQR-203").status,
    };
  }),
});

const receipt = readJson(receiptPath);
const schema = readJson(schemaPath);
execFileSync("python3", [
  "-B",
  "-c",
  "import json,sys; from jsonschema import Draft202012Validator; s=json.load(open(sys.argv[1],encoding='utf-8')); d=json.load(open(sys.argv[2],encoding='utf-8')); Draft202012Validator.check_schema(s); errors=sorted(Draft202012Validator(s).iter_errors(d),key=lambda e:list(e.absolute_path)); assert not errors, errors[0].message if errors else ''",
  schemaPath,
  receiptPath,
], { cwd: repoRoot, stdio: "pipe" });
assert.equal(schema.additionalProperties, false, "receipt schema is not closed");
assert.equal(
  receipt.receiptDigestAlgorithm,
  "sha256-over-utf8-json-stringify-without-receiptDigest-v1",
  "unexpected receipt-digest algorithm",
);
assert.equal(digestDocument(receipt), receipt.receiptDigest, "receipt self-digest drift");
assert.deepEqual(repoFileBinding(receipt.artifactBindings.schema.path), receipt.artifactBindings.schema, "schema binding drift");
assert.deepEqual(repoFileBinding(receipt.artifactBindings.validator.path), receipt.artifactBindings.validator, "validator binding drift");
assert.equal(path.resolve(repoRoot, receipt.artifactBindings.schema.path), path.resolve(schemaPath), "schema path drift");
assert.equal(path.resolve(repoRoot, receipt.artifactBindings.validator.path), path.resolve(validatorPath), "validator path drift");

assert.equal(
  receipt.receiptRole,
  "append-only-child-of-2026-08-17-measurement-review-parity-leaf",
  "M6 receipt does not directly descend from the final measurement leaf",
);
assert.deepEqual(receipt.parentTrust.directParent, RECEIPT_CHAIN.measurementReviewLeaf);
assert.deepEqual(receipt.parentTrust.transitiveChain, {
  layerAAuthority: RECEIPT_CHAIN.layerAAuthority,
  semanticFingerprintLeaf: RECEIPT_CHAIN.semanticFingerprintLeaf,
  providerMetadataLeaf: RECEIPT_CHAIN.providerMetadataLeaf,
  deterministicRenderLeaf: RECEIPT_CHAIN.deterministicRenderLeaf,
});
const authority = readJson(path.join(repoRoot, RECEIPT_CHAIN.layerAAuthority.receipt.path));
const semanticLeaf = readJson(path.join(repoRoot, RECEIPT_CHAIN.semanticFingerprintLeaf.receipt.path));
const providerLeaf = readJson(path.join(repoRoot, RECEIPT_CHAIN.providerMetadataLeaf.receipt.path));
const deterministicLeaf = readJson(path.join(repoRoot, RECEIPT_CHAIN.deterministicRenderLeaf.receipt.path));
const measurementLeaf = readJson(path.join(repoRoot, RECEIPT_CHAIN.measurementReviewLeaf.receipt.path));
for (const [name, parent, binding] of [
  ["Layer-A authority", authority, RECEIPT_CHAIN.layerAAuthority],
  ["semantic-fingerprint leaf", semanticLeaf, RECEIPT_CHAIN.semanticFingerprintLeaf],
  ["provider-metadata leaf", providerLeaf, RECEIPT_CHAIN.providerMetadataLeaf],
  ["deterministic-render leaf", deterministicLeaf, RECEIPT_CHAIN.deterministicRenderLeaf],
  ["measurement-review leaf", measurementLeaf, RECEIPT_CHAIN.measurementReviewLeaf],
]) {
  assert.deepEqual(repoFileBinding(binding.receipt.path), binding.receipt, `${name} file binding drift`);
  assert.equal(parent.receiptId, binding.receiptId, `${name} receipt ID drift`);
  assert.equal(digestDocument(parent), parent.receiptDigest, `${name} self-digest drift`);
  assert.equal(parent.receiptDigest, binding.receiptDigest, `${name} digest binding drift`);
}
assert.equal(authority.status, "IMMUTABLE_CHANGESET_AUTHORITY_NOT_APPLIED");
assert(!Object.hasOwn(authority, "receiptRole"));
for (const leaf of [semanticLeaf, providerLeaf, deterministicLeaf, measurementLeaf]) {
  assert.equal(leaf.status, "APPLIED_AND_VALIDATED");
}
assert.equal(semanticLeaf.receiptRole, "append-only-child-of-immutable-layer-a-authority");
assert.equal(providerLeaf.receiptRole, "append-only-child-of-semantic-kind-fingerprint-follow-up");
assert.equal(deterministicLeaf.receiptRole, "append-only-child-of-provider-metadata-follow-up");
assert.equal(measurementLeaf.receiptRole, "append-only-child-of-deterministic-render-provenance-follow-up");
assert.deepEqual(semanticLeaf.parentAuthority.receipt, RECEIPT_CHAIN.layerAAuthority.receipt);
assert.equal(semanticLeaf.parentAuthority.receiptDigest, RECEIPT_CHAIN.layerAAuthority.receiptDigest);
assert.deepEqual(providerLeaf.parentReceipt.receipt, RECEIPT_CHAIN.semanticFingerprintLeaf.receipt);
assert.equal(providerLeaf.parentReceipt.receiptDigest, RECEIPT_CHAIN.semanticFingerprintLeaf.receiptDigest);
assert.deepEqual(deterministicLeaf.parentReceipt.receipt, RECEIPT_CHAIN.providerMetadataLeaf.receipt);
assert.equal(deterministicLeaf.parentReceipt.receiptDigest, RECEIPT_CHAIN.providerMetadataLeaf.receiptDigest);
assert.deepEqual(measurementLeaf.parentReceipt.receipt, RECEIPT_CHAIN.deterministicRenderLeaf.receipt);
assert.equal(measurementLeaf.parentReceipt.receiptDigest, RECEIPT_CHAIN.deterministicRenderLeaf.receiptDigest);
for (const [name, leaf] of [["provider", providerLeaf], ["deterministic", deterministicLeaf]]) {
  assert.deepEqual(leaf.transitiveAuthority.receipt, RECEIPT_CHAIN.layerAAuthority.receipt, `${name} authority file drift`);
  assert.equal(leaf.transitiveAuthority.receiptDigest, RECEIPT_CHAIN.layerAAuthority.receiptDigest, `${name} authority digest drift`);
  assert.deepEqual(leaf.transitiveAuthority.canonicalMathematics, HISTORICAL.canonical, `${name} canonical authority drift`);
}
assert.deepEqual(receipt.historicalLeaves.canonicalMathematics, HISTORICAL.canonical);
assert.deepEqual(receipt.historicalLeaves.semanticKindLedger, HISTORICAL.ledger);
assert.deepEqual(receipt.historicalLeaves.durationPolicy, HISTORICAL.durationPolicy);
assert.deepEqual(receipt.historicalLeaves.releaseProfile, HISTORICAL.releaseProfile);
assert.deepEqual(receipt.historicalLeaves.qualityStatus, HISTORICAL.qualityStatus);
assert.deepEqual(
  selectFileBinding(authority.candidateBindings.canonicalMathematics),
  HISTORICAL.canonical,
  "historical canonical leaf is not the authority candidate",
);
assert.equal(authority.candidateBindings.canonicalMathematics.goalCount, 1146);
assert.deepEqual(
  selectFileBinding(semanticLeaf.ledgerTransition.after),
  HISTORICAL.ledger,
  "historical ledger leaf is not the semantic-fingerprint follow-up leaf",
);
const authorityDurationDelta = authority.contentChangeSet.files.find(
  (entry) => entry.path === HISTORICAL.durationPolicy.path,
);
assert(authorityDurationDelta, "Layer-A authority lacks the duration-policy leaf");
assert.deepEqual(
  { path: authorityDurationDelta.path, ...authorityDurationDelta.after },
  { ...HISTORICAL.durationPolicy, mode: "100644" },
  "historical duration-policy leaf is not the Layer-A authority after-state",
);
assert.deepEqual(
  selectFileBinding(authority.candidateBindings.qualityStatus),
  HISTORICAL.qualityStatus,
  "historical quality-status leaf is not the authority candidate",
);

for (const binding of Object.values(receipt.currentBindings)) {
  assert.deepEqual(repoFileBinding(binding.path), binding, `current binding drift: ${binding.path}`);
}
for (const binding of Object.values(receipt.algorithmBindings)) {
  assert.deepEqual(repoFileBinding(binding.path), binding, `algorithm binding drift: ${binding.path}`);
}

const ontologyProfile = readJson(path.join(repoRoot, receipt.algorithmBindings.ontologyProfile.path));
const normalizationProfile = readJson(path.join(repoRoot, receipt.algorithmBindings.normalizationProfile.path));
const fingerprintContract = ontologyProfile.semanticKindDecisions.sourceFingerprint;
assert.equal(fingerprintContract.contractId, "semantic-kind-source-fingerprint-v1");
assert.equal(fingerprintContract.canonicalJsonProfile, normalizationProfile.profileId);
assert.equal(fingerprintContract.canonicalJsonProfileVersion, normalizationProfile.version);
assert.equal(fingerprintContract.canonicalJsonProfileSha256, receipt.algorithmBindings.normalizationProfile.sha256);

const canonicalBytes = fs.readFileSync(path.join(repoRoot, receipt.currentBindings.canonicalMathematics.path));
const canonical = JSON.parse(canonicalBytes);
assert.equal(canonical.landscapeId, IDS.landscape);
assert.equal(canonical.goals.length, 1147);
assert.equal(canonical.goals.filter((goal) => goal.type === "atomic").length, 903);
assert.equal(canonical.goals.filter((goal) => goal.type === "cluster").length, 244);
const canonicalIds = new Set(canonical.goals.map((goal) => goal.id));
assert.equal(canonicalIds.size, canonical.goals.length, "duplicate canonical goal IDs");
const root = goalById(canonical.goals, IDS.root);
const upper = goalById(canonical.goals, IDS.upper);
const q2Practice = goalById(canonical.goals, IDS.q2Practice);
const gk = goalById(canonical.goals, IDS.gk);
const lk = goalById(canonical.goals, IDS.lk);
const modal = goalById(canonical.goals, IDS.modal);
const modalContent = goalById(canonical.goals, IDS.modalContent);
assert.equal(canonical.goals.indexOf(gk), 970);
assert.equal(canonical.goals.indexOf(lk), 971);
assert.equal(canonical.goals.indexOf(modal), 1133);

const oldGkRecord = authority.canonicalReversal.changedGoals.find((entry) => entry.goalId === IDS.gk);
const oldModalRecord = authority.canonicalReversal.addedGoals.find((entry) => entry.goalId === IDS.modal);
assert(oldGkRecord?.afterGoal, "authority lacks the pre-follow-up GK snapshot");
assert(oldModalRecord?.afterGoal, "authority lacks the pre-follow-up modal snapshot");
const oldGk = oldGkRecord.afterGoal;
const oldModal = oldModalRecord.afterGoal;
assert.equal(oldGkRecord.afterIndex, 970);
assert.equal(oldModalRecord.afterIndex, 1132);
assert.equal(goalDigest(oldGk), receipt.canonicalTransition.gkReplacement.beforeGoalDigest);
assert.equal(goalDigest(gk), receipt.canonicalTransition.gkReplacement.afterGoalDigest);
assert.equal(goalDigest(lk), receipt.canonicalTransition.lkAddition.afterGoalDigest);
assert.equal(receipt.canonicalTransition.gkReplacement.beforeGoalDigest, "d22f0d7c888ad50759805912b33453f1f8b36f3492e77413cd0deee6c77d2982");
assert.equal(receipt.canonicalTransition.gkReplacement.afterGoalDigest, "60711ae0260424019c361d1821fc930429698dba75de7dc2c43a784d8686ba99");
assert.equal(receipt.canonicalTransition.lkAddition.afterGoalDigest, "e21709eb29dc8eaeaa0839b134360619c16b3ad5483f64ffdcfec8e9f2dc679e");

for (const transition of receipt.canonicalTransition.modalMetadataTransitions) {
  const segments = transition.pointer.slice(1).split("/");
  const get = (value) => segments.reduce((current, segment) => current[segment], value);
  assert.deepEqual(get(oldModal), transition.before, `modal before-state drift at ${transition.pointer}`);
  assert.deepEqual(get(modal), transition.after, `modal after-state drift at ${transition.pointer}`);
}
assert.deepEqual(modal.requires, [IDS.modalContent]);
assert.deepEqual(modal.examData.coveredGoalIds, [IDS.modalContent]);
assert.deepEqual(modal.dimensionTags.processCompetencies, modalContent.dimensionTags.processCompetencies);
assert.deepEqual(modal.dimensionTags.guidingIdeas, modalContent.dimensionTags.guidingIdeas);
assert.deepEqual(modal.examData.coveredStrands, modalContent.dimensionTags.guidingIdeas);

const expectedContainsBefore = [
  "bd2c5e29-31c6-58bf-9858-d08e9c8a32ad",
  "1878f680-095c-511d-aaed-e98393f7fde9",
  "2f8a3a90-717d-5ac1-b54e-facca26e9008",
  IDS.gk,
  "81823f27-0c92-5444-ac4e-32b83169f318",
  "66d75e35-bcbc-5ec9-95f9-8e0558e75f14",
  "3db949bd-3091-5a25-a1a0-c8ff0369db94",
  "e457af0b-e87f-5d61-9177-41daa6361dd3",
];
const expectedContainsAfter = [...expectedContainsBefore];
expectedContainsAfter.splice(4, 0, IDS.lk);
assert.deepEqual(receipt.canonicalTransition.containsTransition.before, expectedContainsBefore);
assert.deepEqual(receipt.canonicalTransition.containsTransition.after, expectedContainsAfter);
assert.deepEqual(q2Practice.contains, expectedContainsAfter);

const atomicDescendantCache = new Map();
const atomicDescendants = (goalId, stack = new Set()) => {
  if (atomicDescendantCache.has(goalId)) return new Set(atomicDescendantCache.get(goalId));
  assert(!stack.has(goalId), `contains cycle at ${goalId}`);
  const goal = goalById(canonical.goals, goalId);
  if (goal.contains.length === 0) return new Set([goalId]);
  const nextStack = new Set(stack).add(goalId);
  const result = new Set();
  for (const childId of goal.contains) {
    for (const atomicId of atomicDescendants(childId, nextStack)) result.add(atomicId);
  }
  atomicDescendantCache.set(goalId, result);
  return new Set(result);
};
const expectedWeightTransitions = [
  { goalId: IDS.q2Practice, before: 8, after: 9, afterUniqueAtomicDescendants: 9 },
  { goalId: IDS.upper, before: 154, after: 155, afterUniqueAtomicDescendants: 155 },
  { goalId: IDS.root, before: 902, after: 903, afterUniqueAtomicDescendants: 903 },
];
assert.deepEqual(receipt.canonicalTransition.weightTransitions, expectedWeightTransitions);
for (const transition of expectedWeightTransitions) {
  const goal = goalById(canonical.goals, transition.goalId);
  assert.equal(goal.weight, transition.after, `weight drift on ${transition.goalId}`);
  assert.equal(atomicDescendants(transition.goalId).size, transition.afterUniqueAtomicDescendants);
}

const artifactByRole = new Map();
for (const artifact of receipt.assessmentEvidence.v2Artifacts) {
  assert(!artifactByRole.has(artifact.role), `duplicate artifact role ${artifact.role}`);
  assert.deepEqual(artifact.binding, EXPECTED_ARTIFACTS[artifact.role], `unexpected ${artifact.role} binding`);
  assert.deepEqual(repoFileBinding(artifact.binding.path), artifact.binding, `${artifact.role} file drift`);
  artifactByRole.set(artifact.role, artifact.binding);
}
assert.deepEqual([...artifactByRole.keys()], Object.keys(EXPECTED_ARTIFACTS));
const v1Binding = receipt.assessmentEvidence.v1PendingEvidence;
assert.deepEqual(repoFileBinding(v1Binding.path), v1Binding, "v1 pending evidence drift");
assert.equal(v1Binding.sha256, "9f855ec14e163d3bcc67be5ddf2305af466301ea190908405c6853a73a1ff3e1");
const v1Evidence = fs.readFileSync(path.join(repoRoot, v1Binding.path), "utf8");
assert(v1Evidence.includes("Status: `needs_review`"), "v1 evidence no longer has needs_review status");
assert(v1Evidence.includes("Decision: `pending_human_approval`"), "v1 evidence no longer has pending decision");
assert(
  canonical.goals.every((goal) => goal.sourceRef !== `${v1Binding.path}#aufgabe`
    && goal.examData?.sourceArtifactPath !== v1Binding.path),
  "current canonical still treats the v1 pending artifact as released evidence",
);

const readArtifact = (role) => fs.readFileSync(path.join(repoRoot, artifactByRole.get(role).path), "utf8");
const gkTask = readArtifact("gk-task-v2");
const gkSolution = readArtifact("gk-solution-v2");
const lkTask = readArtifact("lk-task-v2");
const lkSolution = readArtifact("lk-solution-v2");
const independentReview = readArtifact("independent-review-v2");
for (const [profile, goal, task, solution, maxPoints, passingPoints] of [
  ["Grundkurs", gk, gkTask, gkSolution, 50, 25],
  ["Leistungskurs", lk, lkTask, lkSolution, 60, 30],
]) {
  for (const artifact of [task, solution]) {
    assert(artifact.includes("- Version: `v2`"));
    assert(artifact.includes(`- Profil: ${profile}`));
    assert(artifact.includes(`- Assessment-Ziel: \`${goal.id}\``));
    assert(artifact.includes(`- Maximalpunktzahl: ${maxPoints} BE`));
    assert(artifact.includes(`- Bestehensgrenze: ${passingPoints} BE`));
    assert.equal(sectionPointSum(artifact), maxPoints, `${profile} section points do not close`);
  }
  assert.equal(goal.examData.reviewStatus, "released");
  assert.equal(goal.examData.scoring.maxPoints, maxPoints);
  assert.equal(goal.examData.scoring.passingPoints, passingPoints);
  assert.equal(goal.examData.scoring.steps.reduce((sum, step) => sum + step.points, 0), maxPoints);
  assert.deepEqual(goal.requires, goal.examData.coveredGoalIds);
}
assert.equal(gk.examData.taskContent, markdownBody(gkTask));
assert.equal(gk.examData.solutionContent, markdownBody(gkSolution));
assert.equal(lk.examData.taskContent, markdownBody(lkTask));
assert.equal(lk.examData.solutionContent, markdownBody(lkSolution));
assert(markdownBody(lkTask).startsWith(`${markdownBody(gkTask)}\n\n## 6.`), "LK task is not the GK basis plus task 6");
assert.deepEqual(gk.tags, ["GK", "Practice", "Assessment"]);
assert.deepEqual(lk.tags, ["LK", "Practice", "Assessment"]);
assert.equal(gk.requires.length, 12);
assert.equal(lk.requires.length, 15);
assert.deepEqual(lk.requires.slice(0, 12), gk.requires);
assert.deepEqual(lk.requires.slice(12), [
  "0de1e45c-aea9-5e53-932a-027dcf509efa",
  "922d89fc-1cbd-56e9-ac5d-5cb59085de6c",
  "4bc6cc77-3d20-5d27-a74a-8efb0a038d17",
]);
assert.equal(gk.examData.sourceArtifactPath, artifactByRole.get("gk-task-v2").path);
assert.equal(lk.examData.sourceArtifactPath, artifactByRole.get("lk-task-v2").path);
assert.equal(gk.sourceRef, `${artifactByRole.get("gk-task-v2").path}#aufgabe`);
assert.equal(lk.sourceRef, `${artifactByRole.get("lk-task-v2").path}#aufgabe`);
assert(independentReview.includes("nicht menschlich"));
assert(independentReview.includes("keine menschliche Freigabe"));
assert(independentReview.includes("| GK | `57aff94e-91b8-5cc6-9f85-3f317ecf36ca` | 1–5 | 50 BE | 25 BE |"));
assert(independentReview.includes("| LK | `e4656e83-3f33-5bda-b0bc-d4b63ec4653e` | 1–6 | 60 BE | 30 BE |"));
for (const role of ["gk-task-v2", "gk-solution-v2", "lk-task-v2", "lk-solution-v2"]) {
  const binding = artifactByRole.get(role);
  assert(
    independentReview.includes(`| \`${path.basename(binding.path)}\` | \`${binding.sha256}\` |`),
    `independent review lacks ${role} SHA binding`,
  );
}

const reversedCanonical = structuredClone(canonical);
const removedLk = reversedCanonical.goals.splice(971, 1);
assert.equal(removedLk.length, 1);
assert.equal(removedLk[0].id, IDS.lk);
assert.equal(reversedCanonical.goals[970].id, IDS.gk);
reversedCanonical.goals[970] = structuredClone(oldGk);
const reversedModalIndex = reversedCanonical.goals.findIndex((goal) => goal.id === IDS.modal);
assert.equal(reversedModalIndex, 1132);
reversedCanonical.goals[reversedModalIndex] = structuredClone(oldModal);
const reversedQ2Practice = goalById(reversedCanonical.goals, IDS.q2Practice);
assert.equal(reversedQ2Practice.contains.splice(4, 1)[0], IDS.lk);
assert.deepEqual(reversedQ2Practice.contains, expectedContainsBefore);
for (const transition of expectedWeightTransitions) {
  goalById(reversedCanonical.goals, transition.goalId).weight = transition.before;
}
const reversedCanonicalBytes = serializeJson(reversedCanonical);
assert.deepEqual(
  bufferBinding(HISTORICAL.canonical.path, reversedCanonicalBytes),
  HISTORICAL.canonical,
  "exact canonical reverse does not reproduce the historical authority leaf",
);

const ledgerBytes = fs.readFileSync(path.join(repoRoot, receipt.currentBindings.semanticKindLedger.path));
const ledger = JSON.parse(ledgerBytes);
assert.equal(ledger.decisions.length, 1147);
assert.deepEqual(ledger.counts, EXPECTED_LEDGER_COUNTS_AFTER);
assert.deepEqual(receipt.ledgerTransition.beforeCounts, EXPECTED_LEDGER_COUNTS_BEFORE);
assert.deepEqual(receipt.ledgerTransition.afterCounts, EXPECTED_LEDGER_COUNTS_AFTER);
assert.deepEqual(receipt.ledgerTransition.fingerprintTransitions, EXPECTED_FINGERPRINT_TRANSITIONS);
assert.equal(new Set(ledger.decisions.map((decision) => decision.goalId)).size, 1147);
const ledgerCounts = Object.fromEntries(
  Object.keys(EXPECTED_LEDGER_COUNTS_AFTER).filter((key) => key !== "total").map((key) => [key, 0]),
);
for (const decision of ledger.decisions) {
  const goal = goalById(canonical.goals, decision.goalId);
  assert.equal(decision.sourceFingerprint, sourceFingerprint(goal, fingerprintContract), `stale fingerprint for ${goal.id}`);
  assert(Object.hasOwn(ledgerCounts, decision.semanticKind), `unknown semantic kind ${decision.semanticKind}`);
  ledgerCounts[decision.semanticKind] += 1;
}
assert.deepEqual({ ...ledgerCounts, total: ledger.decisions.length }, EXPECTED_LEDGER_COUNTS_AFTER);
for (const transition of EXPECTED_FINGERPRINT_TRANSITIONS) {
  const decision = ledger.decisions[transition.decisionIndex];
  assert.equal(decision.goalId, transition.goalId);
  assert.equal(decision.sourceFingerprint, transition.after);
}
const addedDecision = ledger.decisions[1146];
assert.deepEqual(receipt.ledgerTransition.addedDecision, { decisionIndex: 1146, decision: addedDecision });
assert.deepEqual(addedDecision, {
  goalId: IDS.lk,
  sourceFingerprint: "sha256:c01c853033f2455437f680e2a0ab8803f698b87fdedd3d79fa8b05a4b757f396",
  semanticKind: "practiceAssessment",
  decisionStatus: "authoritative",
  decisionBasis: "reviewed-current-pilot-practice-assessment",
});
const reversedLedger = structuredClone(ledger);
assert.deepEqual(reversedLedger.decisions.pop(), addedDecision);
for (const transition of EXPECTED_FINGERPRINT_TRANSITIONS) {
  const decision = reversedLedger.decisions[transition.decisionIndex];
  assert.equal(decision.goalId, transition.goalId);
  decision.sourceFingerprint = transition.before;
}
reversedLedger.counts = structuredClone(EXPECTED_LEDGER_COUNTS_BEFORE);
const reversedLedgerBytes = serializeJson(reversedLedger);
assert.deepEqual(
  bufferBinding(HISTORICAL.ledger.path, reversedLedgerBytes),
  HISTORICAL.ledger,
  "exact semantic-ledger reverse does not reproduce the historical fingerprint leaf",
);

const durationPolicy = readJson(path.join(repoRoot, receipt.currentBindings.durationPolicy.path));
assert.equal(receipt.durationPolicyTransition.pointer, "/inputs/canonical/sha256");
assert.equal(receipt.durationPolicyTransition.before, HISTORICAL.canonical.sha256);
assert.equal(receipt.durationPolicyTransition.after, receipt.currentBindings.canonicalMathematics.sha256);
assert.equal(durationPolicy.inputs.canonical.path, HISTORICAL.canonical.path);
assert.equal(durationPolicy.inputs.canonical.sha256, receipt.currentBindings.canonicalMathematics.sha256);
const reversedDurationPolicy = structuredClone(durationPolicy);
reversedDurationPolicy.inputs.canonical.sha256 = HISTORICAL.canonical.sha256;
assert.deepEqual(
  bufferBinding(HISTORICAL.durationPolicy.path, serializeJson(reversedDurationPolicy)),
  HISTORICAL.durationPolicy,
  "exact duration-policy reverse does not reproduce the historical authority leaf",
);

const releaseProfile = readJson(path.join(repoRoot, receipt.currentBindings.releaseProfile.path));
assert.equal(releaseProfile.profileVersion, "1.1.1");
assert.equal(releaseProfile.package.packageVersion, "0.1.0-conformance.3");
assert.equal(releaseProfile.expectedCounts.goals, 1147);
assert.equal(receipt.releaseProfileTransition.pointer, "/expectedCounts/goals");
const reversedReleaseProfile = structuredClone(releaseProfile);
reversedReleaseProfile.expectedCounts.goals = 1146;
assert.deepEqual(
  bufferBinding(HISTORICAL.releaseProfile.path, serializeJson(reversedReleaseProfile)),
  HISTORICAL.releaseProfile,
  "exact release-profile reverse does not reproduce the historical leaf",
);

const qualityStatus = readJson(path.join(repoRoot, receipt.currentBindings.qualityStatusJson.path));
const mathQualityMatches = qualityStatus.curricula.filter((entry) => entry.landscapeId === IDS.landscape);
assert.equal(mathQualityMatches.length, 1);
const mathQuality = mathQualityMatches[0];
assert.deepEqual(receipt.qualityTransition.before, EXPECTED_QUALITY_BEFORE);
assert.deepEqual(receipt.qualityTransition.after, EXPECTED_QUALITY_AFTER);
assert.deepEqual(extractQualitySnapshot(mathQuality), EXPECTED_QUALITY_AFTER);
const globalRule = (id) => {
  const matches = mathQuality.rules.filter((entry) => entry.id === id);
  assert.equal(matches.length, 1, `quality status lacks exactly one ${id}`);
  return matches[0];
};
assert.equal(globalRule("CQR-302").status, "pass");
assert.equal(globalRule("CQR-303").status, "warn");
const qualityMarkdown = fs.readFileSync(path.join(repoRoot, receipt.currentBindings.qualityStatusMarkdown.path), "utf8");
assert(qualityMarkdown.includes("| Mathematik (Gymnasium, DE) | M6 | 1147 | 903 |"));
const maturityFloorCheckerSource = fs.readFileSync(
  path.join(repoRoot, receipt.algorithmBindings.maturityFloorChecker.path),
  "utf8",
);
assert(
  maturityFloorCheckerSource.includes("const match = /^M([0-7])$/.exec(value ?? '')"),
  "maturity-floor checker is not fail-closed to M0..M7",
);
assert(
  !maturityFloorCheckerSource.includes("const match = /^M(\\d)$/.exec"),
  "maturity-floor checker still accepts maturity values above M7",
);
const maturityFloorPolicy = readJson(path.join(repoRoot, receipt.algorithmBindings.maturityFloorPolicy.path));
assert.deepEqual(maturityFloorPolicy.exceptions, []);
const mathFloors = maturityFloorPolicy.floors.filter((entry) => entry.landscapeId === IDS.landscape);
assert.equal(mathFloors.length, 1);
assert.deepEqual(mathFloors[0], {
  landscapeId: IDS.landscape,
  frameworkId: "canonical-gymnasium-math",
  subject: "Mathematik",
  minimumMaturity: "M6",
  reason: "Established canonical mathematics maturity baseline with completed semantic-atomicity and memory-card layers.",
});
assert(!mathFloors[0].reason.includes("Human-reviewed"));
assert.equal(mathQuality.maturity, mathFloors[0].minimumMaturity);

assert.deepEqual(receipt.validation, {
  closedSchema: "PASS",
  parentTrust: "PASS",
  currentFileBindings: "PASS",
  assessmentEvidenceBindings: "PASS",
  canonicalExactReverse: "PASS",
  semanticLedgerExactReverse: "PASS",
  durationPolicyExactReverse: "PASS",
  releaseProfileExactReverse: "PASS",
  semanticFingerprints: "PASS",
  assessmentProfileCoverage: "PASS",
  weightClosure: "PASS",
  qualityM3ToM6: "PASS",
  openAiCoachV1Boundary: "PASS",
});
assert.equal(receipt.authorization.affectsOpenAiCoachV1Contract, false);
assert.equal(receipt.authorization.openAiCoachV1Version, "1.0.0 unchanged");
assert.equal(receipt.authorization.historicalAssessmentV1Mutated, false);
assert.equal(receipt.authorization.humanReviewClaimed, false);
assert.equal(receipt.authorization.commitPushDeployPerformed, false);

console.log(JSON.stringify({
  result: "PASS",
  receiptDigest: receipt.receiptDigest,
  canonicalSha256: receipt.currentBindings.canonicalMathematics.sha256,
  semanticLedgerSha256: receipt.currentBindings.semanticKindLedger.sha256,
  durationPolicySha256: receipt.currentBindings.durationPolicy.sha256,
  releaseProfileSha256: receipt.currentBindings.releaseProfile.sha256,
  qualityStatusSha256: receipt.currentBindings.qualityStatusJson.sha256,
  assessmentEvidenceSha256: Object.fromEntries(
    receipt.assessmentEvidence.v2Artifacts.map((artifact) => [artifact.role, artifact.binding.sha256]),
  ),
  canonicalCounts: receipt.canonicalTransition.afterCounts,
  semanticCounts: receipt.ledgerTransition.afterCounts,
  maturity: `${receipt.qualityTransition.before.maturity}->${receipt.qualityTransition.after.maturity}`,
}, null, 2));
