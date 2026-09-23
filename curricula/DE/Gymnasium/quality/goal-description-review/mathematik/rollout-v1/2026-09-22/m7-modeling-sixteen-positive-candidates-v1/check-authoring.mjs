import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = process.cwd();
const folder = path.dirname(fileURLToPath(import.meta.url));
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const sha = value => 'sha256:' + createHash('sha256').update(value).digest('hex');
const candidatesPath = path.join(folder, 'modeling-sixteen.candidates.json');
const contextPath = path.join(folder, 'authoring-context.json');
const candidates = read(candidatesPath);
const context = read(contextPath);
const require = createRequire(path.join(root, 'app/package.json'));
const Ajv2020 = require('ajv/dist/2020.js').default;
const addFormats = require('ajv-formats');
const schemaPath = 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json';
const schema = read(path.join(root, schemaPath));
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
ajv.addSchema(schema);
const validateProfile = ajv.compile({ $ref: schema.$id + '#/$defs/profile' });
const native = await import(pathToFileURL(path.join(root, 'app/scripts/positiveGoalEvidenceProfileModel.ts')).href);
const canonical = read(path.join(root, context.canonicalPath));
const kinds = read(path.join(root, context.semanticKindLedgerPath)).decisions;
const inventory = fs.readFileSync(path.join(root, 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-21/remaining-batch-reuse-inventory.md'), 'utf8');
const expectedPrefixes = '035b7fc6 07196e72 163dd583 27542d59 4a630596 519660d0 5836c821 74f28ce7 8d126397 8d2021d0 ae2ca565 bb4569bc bfbaedb9 dd582580 e03eca28 fb4dcd2a'.split(' ');

assert.equal(candidates.schemaVersion, 1);
assert.equal(candidates.authoringContract, 'positive-understanding-evidence-candidates-v1');
assert.equal(candidates.reviewId, context.reviewId);
assert.equal(candidates.reviewedAt, context.reviewedAt);
assert.equal(candidates.reviewer, context.reviewer);
assert.equal(context.status, 'needs_human_review');
assert.equal(context.reviewAuthority, 'ai_candidate');
assert.equal(context.finalMaterialization, false);
assert.equal(context.registered, false);
assert.equal(context.resourceBindingsFinal, false);
assert.equal(context.currentReviewInputFingerprintBound, false);
assert.equal(context.historicalDescriptionReviewIsCurrentD, false);
assert.equal(candidates.goals.length, 16);
assert.equal(context.goals.length, 16);
assert.equal(new Set(candidates.goals.map(g => g.goalId)).size, 16);
assert.deepEqual(candidates.goals.map(g => g.goalId.slice(0, 8)), expectedPrefixes);

let sourceRecordsChecked = 0;
let currentTextComparisons = 0;
let bilingualCases = 0;
const profileChecks = [];
for (const candidate of candidates.goals) {
  assert(inventory.includes(candidate.goalId), candidate.goalId + ' absent from inventory');
  const saved = context.goals.find(g => g.goalId === candidate.goalId);
  const current = canonical.goals.find(g => g.id === candidate.goalId);
  const kind = kinds.find(k => k.goalId === candidate.goalId);
  assert(saved && current && kind);
  assert.equal(current.contains.length, 0);
  assert.equal(kind.semanticKind, saved.effectiveSemanticKind);
  assert(validateProfile(candidate.profile), candidate.goalId + ' ' + JSON.stringify(validateProfile.errors));
  assert.equal(candidate.evidenceLevel, 'E1');
  assert.equal(candidate.maximumClaimScope, 'G1');
  assert.deepEqual(candidate.dissent, []);
  const p = candidate.profile;
  assert(p.expectations.length >= 2);
  assert(p.variationAxes.length >= 2);
  assert.equal(p.applicationCaseBriefs.length, 2);
  assert.deepEqual(p.coverageExpectations.requiredExpectationIds, p.expectations.map(e => e.id));
  assert.deepEqual(p.coverageExpectations.alternativeExpectationGroups, []);
  assert.equal(p.coverageExpectations.minimumIndependentDemonstrations, 2);
  assert.equal(p.coverageExpectations.freshVariationRequired, true);
  assert.equal(p.coverageExpectations.independentTransferRequired, true);
  for (const collection of ['expectations','variationAxes','applicationCaseBriefs']) {
    assert.equal(new Set(p[collection].map(item => item.id)).size, p[collection].length);
  }
  bilingualCases += p.applicationCaseBriefs.length;
  for (const key of ['id','title','titleEn','description','descriptionEn','requires','contains','dimensionTags']) {
    assert.deepEqual(current[key], saved.currentGoal[key], candidate.goalId + ':' + key);
    if (['title','titleEn','description','descriptionEn'].includes(key)) currentTextComparisons++;
  }
  assert.equal(native.fingerprintGoalForPositiveEvidence(current, kind.semanticKind), saved.goalFingerprint);
  assert.equal(native.fingerprintPositiveGoalEvidenceProfile(p), saved.profileFingerprint);
  const source = saved.originalReview;
  const sourceRaw = fs.readFileSync(path.join(root, source.path), 'utf8');
  assert.equal(sha(sourceRaw), source.sourceFileSha256);
  const sourceLine = sourceRaw.trim().split('\n').find(line => JSON.parse(line).recordId === source.recordId);
  assert(sourceLine);
  assert.equal(sha(sourceLine), source.sourceRecordLineSha256);
  const old = JSON.parse(sourceLine);
  assert.equal(old.goalId, candidate.goalId);
  assert.equal(old.decision, 'keep');
  assert.equal(old.recordStatus, 'candidate');
  assert.equal(old.reviewAuthority, 'ai_candidate');
  assert.deepEqual(old.understandingEvidence, source.understandingEvidence);
  for (const [oldKey, newKey] of [['currentTitleDe','title'],['currentTitleEn','titleEn'],['currentDescriptionDe','description'],['currentDescriptionEn','descriptionEn']]) {
    assert.equal(old[oldKey], current[newKey]);
    currentTextComparisons++;
  }
  sourceRecordsChecked++;
  profileChecks.push({ goalId: candidate.goalId, archetype: p.archetype, goalFingerprint: saved.goalFingerprint, profileFingerprint: saved.profileFingerprint, schemaPassed: true, currentTextPassed: true, originalReviewCheckPassed: true });
}
assert.equal(bilingualCases, 32);

// Independent arithmetic checks for the numerical and domain-sensitive cases.
let mathematicalAssertions = 0;
const eq = (a, b) => { mathematicalAssertions++; assert.equal(a, b); };
eq(120 - 3 * 30, 30);
eq(120 - 3 * 25, 45);
eq(120 - 3 * 40, 0);
eq(120 - 3 * 50, -30);
eq(4 * (12 - 4), 32);
eq(8 * (12 - 8), 32);
eq(3 * (10 - 3), 21);
eq(7 * (10 - 7), 21);
eq(2 * (6 - 2), 8);
eq(4 * (6 - 4), 8);
eq(4 + 2 * 8, 20);
eq(4 + 2 * 15, 34);
eq(20 + 3 * 10 + 2 * (15 - 10), 60);
eq(20 + 3 * 10 + 2 * (18 - 10), 66);
eq(20 + 3 * 15, 65);
assert(Math.abs(100 * 1.1 ** 2 - 121) < 1e-10); mathematicalAssertions++;
assert(Math.abs(100 * 1.1 ** 3 - 133.1) < 1e-10); mathematicalAssertions++;
eq(Math.ceil(125 / 50), 3);

const validation = {
  schemaVersion: 1,
  checkedAt: new Date().toISOString(),
  checker: 'check-authoring.mjs',
  result: 'pass',
  candidateSetSha256: sha(fs.readFileSync(candidatesPath)),
  contextSha256: sha(fs.readFileSync(contextPath)),
  schemaPath,
  schemaSha256: sha(fs.readFileSync(path.join(root, schemaPath))),
  scopeGoals: candidates.goals.length,
  bilingualApplicationCases: bilingualCases,
  historicalCandidateRecordsChecked: sourceRecordsChecked,
  currentTextComparisons,
  mathematicalAssertions,
  profileChecks
};
if (process.argv.includes('--write-validation')) fs.writeFileSync(path.join(folder, 'validation.json'), JSON.stringify(validation, null, 2) + '\n');
console.log(JSON.stringify({ result: validation.result, scopeGoals: validation.scopeGoals, bilingualApplicationCases: validation.bilingualApplicationCases, historicalCandidateRecordsChecked: validation.historicalCandidateRecordsChecked, mathematicalAssertions: validation.mathematicalAssertions }));
