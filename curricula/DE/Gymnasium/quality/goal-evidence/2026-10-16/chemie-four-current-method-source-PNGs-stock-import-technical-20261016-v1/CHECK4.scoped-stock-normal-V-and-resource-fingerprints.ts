import { readFileSync, writeFileSync, realpathSync, lstatSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import ts from '/home/enpasos/projects/skillpilot/tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1/app/node_modules/typescript/lib/typescript.js';
import { hasCompletedDeepUnderstandingVisualizationReview } from '/home/enpasos/projects/skillpilot/app/scripts/reportDeepUnderstandingRollout.ts';
import { fingerprintGoalForPositiveEvidence } from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts';
import { fingerprintGoalEvidenceReviewInput } from '/home/enpasos/projects/skillpilot/app/scripts/goalEvidenceProfileModel.ts';
import { fingerprintSemanticKindSourceGoal } from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts';
import { isAiApprovedForCurrentAsset } from '/home/enpasos/projects/skillpilot/app/src/utils/goalVisualizationQaStatus.ts';

const R = '/home/enpasos/projects/skillpilot';
const H = resolve(R, 'tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1');
const E = resolve(R, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16');
const O = resolve(E, 'chemie-four-current-method-source-PNGs-stock-import-technical-20261016-v1');
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const hashBytes = (b: Buffer | string) => 'sha256:' + createHash('sha256').update(b).digest('hex');
const pin = (p: string) => ({ path: p.slice(R.length + 1), sha256: hashBytes(readFileSync(p)), bytes: readFileSync(p).length });
const verify = (p: any) => { assert.equal(hashBytes(readFileSync(resolve(R, p.path))), p.sha256); };
const input = read(resolve(O, 'CHECK4.inputs-frozen-science-and-exact454-retention.json'));
for (const key of ['importSelector', 'canonicalBefore', 'canonicalAfter', 'goalCAS4', 'QA455Before', 'QA458Candidate']) verify(input[key]);
const imports = read(resolve(R, input.importSelector.path));
const before = read(resolve(R, input.canonicalBefore.path));
const current = read(resolve(R, input.canonicalAfter.path));
const cas = read(resolve(R, input.goalCAS4.path));
const qaBefore = read(resolve(R, input.QA455Before.path));
const qa = read(resolve(R, input.QA458Candidate.path));
const obsolete = '413c5ee5-7826-549f-ad76-63743c59b188';
assert.equal(qaBefore.records.length, 455);
assert.equal(qa.records.length, 458);
assert.equal(qaBefore.records.filter((x: any) => x.goalId === obsolete).length, 1);
assert.equal(qa.records.filter((x: any) => x.goalId === obsolete).length, 0);
assert.equal(current.goals.some((x: any) => x.id === obsolete), false);
assert.deepEqual(qa.records.slice(0, 454), qaBefore.records.filter((x: any) => x.goalId !== obsolete));
assert.equal(new Set(qa.records.map((x: any) => x.goalId)).size, 458);
assert.deepEqual(Object.keys(qa).filter(x => x !== 'records'), Object.keys(qaBefore).filter(x => x !== 'records'));
for (const key of Object.keys(qaBefore).filter(x => x !== 'records')) assert.deepEqual(qa[key], qaBefore[key]);
assert.equal(cas.length, 4);
assert.equal(current.goals.length, 593);
assert.equal(before.goals.length, 593);

// A and M keep their actual local stock implementation. Extract only the unchanged
// function declarations with TypeScript's parser; transpilation strips types, not
// semantics. No full CLI execution or copied/reinvented fingerprint algorithm.
function stockLocalFingerprint(script: string, names: string[]) {
  const p = resolve(R, script);
  const source = readFileSync(p, 'utf8');
  const ast = ts.createSourceFile(p, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const chunks = names.map(name => {
    const declaration = ast.statements.find(n => ts.isFunctionDeclaration(n) && n.name?.text === name);
    assert(declaration, 'missing stock declaration ' + name);
    return declaration!.getText(ast);
  });
  const exactDeclarations = chunks.join('\n\n');
  const js = ts.transpileModule(exactDeclarations, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  const fingerprint = new Function('createHash', js + '\nreturn fingerprintGoal;')(createHash);
  return { fingerprint, source: pin(p), exactDeclarationSha256: hashBytes(exactDeclarations), names };
}
const atomicity = stockLocalFingerprint('app/scripts/semanticAtomicityReview.ts', ['normalizeText', 'stableJson', 'getSemanticPayload', 'fingerprintGoal']);
const memory = stockLocalFingerprint('app/scripts/memoryCardReview.ts', ['normalizeText', 'stableJson', 'fingerprintGoal']);
const atomicityConfigPath = resolve(H, 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-chemistry-inquiry-communication.config.json');
const memoryConfigPath = resolve(H, 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json');
const atomicityRule = read(atomicityConfigPath).ruleVersion;
const memoryRule = read(memoryConfigPath).ruleVersion;
assert.equal(atomicityRule, 'semantic-atomicity-v1');
assert.equal(memoryRule, 'memory-card-review-v1');

const scienceById = new Map<string, any>();
for (const frozen of input.frozenScience) {
  verify(frozen.selector); verify(frozen.first);
  const science = read(resolve(R, frozen.first.path));
  assert.equal(science.createdAtUtc, frozen.actualReviewedAt);
  for (const judgment of science.judgments) {
    assert.equal(judgment.decision, 'KEEP');
    scienceById.set(judgment.goalId, { judgment, actualReviewedAt: science.createdAtUtc, sciencePin: frozen.first });
  }
}
const gcWholeRead = read(resolve(E, 'chemie-gc-pharma-two-actual-PNG-independent-V-and-bounded-P-compatibility-20261016-v1/inputs/TWO.whole-current-goals-SIX-whole-prereq-contexts-P2-FOUR-whole-DEEN-cases.actually-read.json'));
const rows: any[] = [];
const ids = new Set(cas.map((r: any) => r.goalId));
assert.deepEqual(current.goals.filter((g: any) => !ids.has(g.id)), before.goals.filter((g: any) => !ids.has(g.id)));
assert.equal(current.goals.filter((g: any) => !ids.has(g.id)).length, 589);
for (const c of cas) {
  const id = c.goalId;
  const b = before.goals.find((g: any) => g.id === id);
  const g = current.goals.find((x: any) => x.id === id);
  assert.deepEqual(c.wholeBefore, b); assert.deepEqual(c.wholeAfter, g);
  const bNoResources = { ...b }; const gNoResources = { ...g };
  delete bNoResources.resourceLinks; delete gNoResources.resourceLinks;
  assert.deepEqual(bNoResources, gNoResources);
  const science = scienceById.get(id)!; assert(science);
  const j = science.judgment;
  if (j.wholeGoal) {
    verify(j.wholeGoal);
    assert.deepEqual(read(resolve(R, j.wholeGoal.path)), b);
  } else {
    assert.deepEqual(gcWholeRead.wholeGoalBodies.find((x: any) => x.id === id), b);
  }
  const q = qa.records.filter((r: any) => r.goalId === id); assert.equal(q.length, 1); const v = q[0];
  const links = g.resourceLinks.filter((r: any) => r.type === 'goal-visualization' && r.role === 'primary'); assert.equal(links.length, 1); const link = links[0];
  assert.equal(v.imageUrl, link.url); assert.equal(v.goalId, g.id);
  assert.equal(v.title, g.title.replace(/\s+/g, ' ').trim()); assert.equal(v.description, g.description.replace(/\s+/g, ' ').trim());
  assert.equal(v.subject, 'chemie'); assert.equal(v.landscapeId, current.landscapeId);
  assert.equal(v.landscapePath, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');
  assert.equal(v.publicAssetPath, 'app/public' + link.url);
  assert.equal(v.canonicalAssetPath, 'curricula/DE/Gymnasium/visualizations/chemie/' + id + '/' + id + '.png');
  assert.equal(v.humanApproved, 'no'); assert.equal(v.humanIssueIdentified, 'no'); assert.equal(v.humanReviewedAt, null); assert.equal(v.humanReviewer, '');
  assert.equal(v.aiReviewedAt, science.actualReviewedAt);
  const expectedSha = 'sha256:' + String(j.assetSha256 ?? j.selectedActualPNG.sha256).replace(/^sha256:/, '');
  assert.equal(v.assetSha256, expectedSha); assert.equal(v.aiApprovedAssetSha256, expectedSha);
  const importReceipt = read(resolve(O, id, 'IMPORT.actual-stock.receipt.json'));
  assert.equal(importReceipt.returncode, 0); assert.equal('sha256:' + importReceipt.imageSha256, expectedSha);
  const hostCopies = [];
  for (const path of importReceipt.sourcePublicBackendExact) {
    const hp = resolve(H, path);
    assert.equal(lstatSync(hp).isSymbolicLink(), false); assert(realpathSync(hp).startsWith(H + '/'));
    assert.equal(hashBytes(readFileSync(hp)), expectedSha);
    hostCopies.push(pin(hp));
  }
  assert.equal(hostCopies.length, 3);
  const authorImagePin = j.selectedActualPNG ?? {
    path: read(resolve(R, input.frozenScience[0].selector.path)).selectedExactlySupportedImages.find((x: any) => x.goalId === id).actualPNG.path,
    sha256: expectedSha,
  };
  verify({ ...authorImagePin, sha256: expectedSha });
  // Source-dependent guards above precede the normal stock V predicates.
  assert.equal(isAiApprovedForCurrentAsset(v), true);
  assert.equal(hasCompletedDeepUnderstandingVisualizationReview(v), true);
  const kind = 'curricularAtomic';
  const pGoal = fingerprintGoalForPositiveEvidence(g, kind); assert.equal(pGoal, fingerprintGoalForPositiveEvidence(b, kind));
  const sem = fingerprintSemanticKindSourceGoal(g); assert.equal(sem, fingerprintSemanticKindSourceGoal(b));
  const a = atomicity.fingerprint(g, atomicityRule); assert.equal(a, atomicity.fingerprint(b, atomicityRule));
  const m = memory.fingerprint(g, memoryRule); assert.equal(m, memory.fingerprint(b, memoryRule));
  const resourceDigests = { [link.url]: expectedSha };
  const beforeInput = fingerprintGoalEvidenceReviewInput(b, 'goal-evidence-v1', {}, kind);
  const afterInput = fingerprintGoalEvidenceReviewInput(g, 'goal-evidence-v1', resourceDigests, kind);
  assert.notEqual(beforeInput, afterInput);
  rows.push({ goalId: id, wholeCurrentGoal: g, beforeWholeObjectVerified: true, afterWholeObjectVerified: true,
    unchangedWholeGoalOutsideResourceLinks: true, frozenScience: science.sciencePin, actualScienceReviewedAt: science.actualReviewedAt,
    currentPrimaryResourceLink: link, resourceDigests, exactHostSourcePublicBackendCopies: hostCopies,
    existingPortableNativeAuthorImage: authorImagePin, noAdditionalNativeCopyCreated: true,
    aiApprovedForCurrentAsset: true, completedNormalDeepUnderstandingVisualizationPredicate: true,
    effectiveKindForFingerprintComparisonOnly: kind, kindAdoptionOrVotePerformed: false,
    atomicityGoalFingerprint: a, memoryGoalFingerprint: m, semanticKindSourceGoalFingerprint: sem, positiveEvidenceGoalFingerprint: pGoal,
    allFourGoalOnlyFingerprintsUnchangedByResourceLinkImport: true,
    previousEmptyResourcePositiveReviewInputFingerprint: beforeInput, currentResourcePositiveReviewInputFingerprint: afterInput,
    resourceBoundPInputChangedRequiresSeparateBinding: true, fullPReviewOrApprovalPerformed: false });
}
const result = { schemaVersion: 1, role: 'Actual bounded stock V predicates, four goal/resource bindings and unchanged stock A/M/SEM/P goal-only fingerprints; technical serialization of frozen judgments',
  canonical: input.canonicalAfter, QA458: input.QA458Candidate, checked: 4, normalVPredicatePassed: 4,
  retained454WholeQARecordsAndRelativeOrder: true, obsolete413RemovedOnlyFromNewCurrentSelection: true,
  unchanged589OtherWholeCurrentGoals: true, rows,
  stockModules: ['app/scripts/reportDeepUnderstandingRollout.ts','app/src/utils/goalVisualizationQaStatus.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceProfileModel.ts','app/scripts/goalBookModel.ts'].map(p => pin(resolve(R,p))),
  unexportedAtomicityFingerprintActualSource: { source: atomicity.source, declarations: atomicity.names, exactDeclarationSha256: atomicity.exactDeclarationSha256, method: 'Unchanged declarations extracted with stock TypeScript AST and type-only transpilation; actual function invoked, no CLI or source modification.' },
  unexportedMemoryFingerprintActualSource: { source: memory.source, declarations: memory.names, exactDeclarationSha256: memory.exactDeclarationSha256, method: 'Unchanged declarations extracted with stock TypeScript AST and type-only transpilation; actual function invoked, no CLI or source modification.' },
  ruleConfigurationSources: [pin(atomicityConfigPath), pin(memoryConfigPath)],
  fullGlobalQaFreshnessCliExecuted: false,
  availableExportScopedSubstitute: 'The standalone QA CLIs fix their normal input paths and offer no alternate candidate-QA/four-goal scope. Normal aliases were not overwritten. Exported unchanged normal V predicates were called after exact current-goal/source/public/backend/science guards. This is scoped4 PASS, not a global CLI/check/report PASS.',
  strictGain: 0, newFullPOrSourceOrDescriptionOrAMOrKindReviews: 0, humanApproval: false, humanTrial: false, M7Claim: false, publicationOrRuntimeChange: false };
writeFileSync(resolve(O, 'CHECK4.actual-scoped-normal-V-resource-and-goal-fingerprints.result.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ checked: 4, normalVPredicatePassed: 4, sourcePublicBackendExact: true, retainedOld454WholeRecordsAndOrder: true, retainedOther589WholeGoals: true, AMsemPGoalFingerprintsUnchanged: true, currentResourcePInputsChangedAndSeparate: true, fullCli: false }));
