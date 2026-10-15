import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js';
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js';

const repo = process.cwd();
const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e560-full-duty-two-atomic-children-source-preserving-author-20261013-v1';
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e560-two-child-source-A-M-P-independent-b-20261013-v1';
const read = (path: string) => JSON.parse(readFileSync(resolve(repo, path), 'utf8'));
const importStock = (path: string) => import(pathToFileURL(resolve(repo, path)).href);
const graph = read(author + '/candidate/canonical533.current407.author.inactive.json');
const cas = read(author + '/candidate/two-whole-children-and-exact-parent-terminal-CAS.author.json');
const ids = cas.newWholeChildGoals.map((g: any) => g.id);
const byId = new Map(graph.goals.map((g: any) => [g.id, g]));
const canonical = await importStock('app/src/utils/authoring/canonicalAuthoring.ts');
assert.deepEqual(canonical.validateCanonicalLandscape(canonical.normalizeCanonicalLandscape(graph)), []);
const book = await importStock('app/scripts/goalBookModel.ts');
const semantic = read(author + '/candidate/four-semantic-CAS.current-stock-fingerprints.author.json');
for (const op of semantic.operations) {
  assert.equal(book.fingerprintSemanticKindSourceGoal(byId.get(op.goalId)), op.proposedAfterWholeDecision.sourceFingerprint);
}
const schemas = read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json');
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateProfile = ajv.compile({ $schema: schemas.$schema, $defs: schemas.$defs, ...schemas.properties.profile });
const candidates = read(author + '/positive/two-complete-positive-v2-child-profiles.DEEN.author.json');
const cases = read(author + '/positive/four-whole-child-cases.DEEN.author.json').cases;
for (const spec of candidates.goals) {
  assert.ok(validateProfile(spec.profile), ajv.errorsText(validateProfile.errors));
  assert.equal(spec.evidenceLevel, 'E0');
  assert.equal(spec.maximumClaimScope, 'G0');
  for (const brief of spec.profile.applicationCaseBriefs) {
    const c = cases.find((c: any) => c.caseId === brief.id);
    assert.equal(c.goalId, spec.goalId);
    for (const lang of ['De', 'En']) {
      assert.equal(brief['taskDemand' + lang], c['task' + lang]);
      assert.equal(brief['expectedPerformance' + lang], c['modelAnswer' + lang]);
    }
    assert.equal(c.rubric.reduce((sum: number, row: any) => sum + row.maximumPoints, 0), c.maximumPoints);
    assert.deepEqual(c.rubric.map((r: any) => r.expectationId), spec.profile.coverageExpectations.requiredExpectationIds);
  }
}
const materializer = await importStock('app/scripts/materializePositiveGoalEvidenceCandidates.ts');
const config = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json', schemaVersion: 2,
  reviewId: candidates.reviewId, goalFingerprintRuleVersion: 'goal-evidence-v1', profileRuleVersion: 'positive-understanding-evidence-v2',
  landscapeId: graph.landscapeId, landscapePath: author + '/candidate/canonical533.current407.author.inactive.json',
  semanticKindLedgerPath: author + '/candidate/semantic533.current407.author.proposals.inactive.json',
  reviewCriteriaPath: 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md',
  reviewPath: own + '/not-created-P-authority.jsonl', reviewedResourceTypes: [], requireApproved: false,
  scope: { label: 'Only two inactive silicone child E0/G0 designs; independent B structural guard', goalIds: ids },
};
const records = await materializer.buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet: candidates });
assert.equal(records.length, 2);
const atlas = await importStock('app/scripts/goalBookSourceAtlasInputs.ts');
const source = atlas.buildGoalBookSourceAtlasInputs(read(author + '/candidate/source-atlas.current407.portable-author.config.json'), repo);
const directScopes = ids.map((id: string) => ({
  goalId: id,
  scopes: source.receipt.scopes.filter((s: any) => s.goalIds.includes(id)).map((s: any) => ({
    key: s.key,
    witnesses: s.witnesses.filter((w: any) => w.goalId === id),
  })),
}));
for (const child of directScopes) {
  assert.deepEqual(child.scopes.map((s: any) => s.key), ['DE-BY/SekII/GK', 'DE-BY/SekII/LK']);
  for (const scope of child.scopes) assert.ok(scope.witnesses.every((w: any) => w.coverage === 'direct' && w.mappedTargetGoalId === child.goalId));
}
writeFileSync(resolve(repo, own, 'STOCK.scoped-graph-source-profile-semantic.actual.json'), JSON.stringify({
  schemaVersion: 1, canonicalSchemaValid: true, semanticSourceFingerprintsExact: true,
  twoNativeProfileFragmentsValid: true, fourExactCaseBriefTaskAnswerJoins: true,
  fourWholeRubricPointTotalsAndExpectationJoinsExact: true,
  pureStockPDesignRecordsValidatedWithoutWriting: records.map((r: any) => ({
    goalId: r.goalId, goalFingerprint: r.goalFingerprint, reviewInputFingerprint: r.reviewInputFingerprint,
    profileFingerprint: r.profileFingerprint, evidenceLevel: r.evidenceLevel, maximumClaimScope: r.maximumClaimScope,
    status: r.status, reviewAuthority: r.reviewAuthority,
  })),
  directTechnicalSourceScopes: directScopes,
  technicalScopeWitnessIsScientificApprovalOracle: false,
  authoritativePRecordsWritten: false, nativeDRecordsWritten: false,
}, null, 2) + '\n');
console.log('PASS scoped stock graph/semantic/source and two E0/G0 P designs; exact four DE/EN case joins/rubrics. Pure APIs only; no P authority/native D record written.');
