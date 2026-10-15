import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
const repo = process.cwd();
const input = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e560-full-duty-two-atomic-children-source-preserving-author-20261013-v1';
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e560-two-child-source-A-M-P-independent-a-20261013-v1';
const read = (p: string) => JSON.parse(readFileSync(resolve(repo, p), 'utf8'));
const sha = (p: string) => 'sha256:' + createHash('sha256').update(readFileSync(resolve(repo, p))).digest('hex');
const write = (p: string, v: unknown) => { mkdirSync(dirname(resolve(repo, p)), { recursive: true }); writeFileSync(resolve(repo, p), JSON.stringify(v, null, 2) + '\n'); };
const graph = read(input + '/candidate/canonical533.current407.author.inactive.json');
const cas = read(input + '/candidate/two-whole-children-and-exact-parent-terminal-CAS.author.json');
const base = read(cas.baseLandscape.path);
const byId = new Map<string, any>(graph.goals.map((g: any) => [g.id, g]));
const parent = cas.parentWholeGoalCAS.after.id;
const childIds = cas.newWholeChildGoals.map((g: any) => g.id);
const terminal = cas.terminalWholeGoalCAS.after.id;
assert.deepEqual(byId.get(parent), cas.parentWholeGoalCAS.after);
assert.deepEqual(byId.get(terminal), cas.terminalWholeGoalCAS.after);
for (const child of cas.newWholeChildGoals) assert.deepEqual(byId.get(child.id), child);
for (const k of ['id', 'shortKey', 'title', 'titleEn', 'description', 'descriptionEn', 'resourceLinks']) assert.deepEqual(cas.parentWholeGoalCAS.before[k], cas.parentWholeGoalCAS.after[k]);
assert.deepEqual(base.goals.filter((g: any) => JSON.stringify(g) !== JSON.stringify(byId.get(g.id))).map((g: any) => g.id), [parent, terminal]);
assert.deepEqual(base.goals.find((g: any) => g.id === parent), cas.parentWholeGoalCAS.before);
assert.deepEqual(base.goals.find((g: any) => g.id === terminal), cas.terminalWholeGoalCAS.before);
const terminalBefore = cas.terminalWholeGoalCAS.before;
const terminalAfter = cas.terminalWholeGoalCAS.after;
assert.deepEqual({ ...terminalBefore, requires: [] }, { ...terminalAfter, requires: [] });
assert.deepEqual(terminalBefore.requires.filter((id: string) => id !== parent), terminalAfter.requires.filter((id: string) => !childIds.includes(id)));
assert.ok(!terminalAfter.requires.includes(parent));
assert.ok(childIds.every((id: string) => terminalAfter.requires.includes(id)));
const canonical = await import(pathToFileURL(resolve(repo, 'app/src/utils/authoring/canonicalAuthoring.ts')).href);
assert.deepEqual(canonical.validateCanonicalLandscape(canonical.normalizeCanonicalLandscape(graph)), []);
for (const field of ['contains', 'requires']) {
  const done = new Set<string>(), active = new Set<string>();
  const walk = (id: string) => {
    assert.ok(!active.has(id), field + ' cycle at ' + id);
    if (done.has(id)) return;
    const g = byId.get(id); assert.ok(g);
    active.add(id); for (const ref of g[field] ?? []) walk(ref.replace(graph.landscapeId + ':', ''));
    active.delete(id); done.add(id);
  };
  for (const id of byId.keys()) walk(id);
}
for (const id of childIds) assert.deepEqual(graph.goals.filter((g: any) => (g.contains ?? []).includes(id)).map((g: any) => g.id), [parent]);
assert.deepEqual(byId.get(childIds[0]).requires, ['2652caef-b557-58b9-9b28-70db62625ce5']);
assert.deepEqual(byId.get(childIds[1]).requires, [childIds[0]]);
const sourceCAS = read(input + '/candidate/exact-source-cell-CAS-two-child-entitlements.author.json').operations[0];
const beforeSource = read(sourceCAS.beforeCarrier.path), afterSource = read(sourceCAS.afterCarrier.path);
const sourceId = sourceCAS.originalSourceGoal.id;
const withoutCell = (s: any) => ({ ...s, mappings: s.mappings.filter((m: any) => m.legacyGoalId !== sourceId), decisions: s.decisions.filter((d: any) => d.sourceGoalId !== sourceId) });
assert.deepEqual(withoutCell(beforeSource), withoutCell(afterSource));
assert.deepEqual(afterSource.mappings.filter((m: any) => m.legacyGoalId === sourceId), sourceCAS.afterWholeSelectedCell.mappingCells);
assert.deepEqual(afterSource.decisions.filter((d: any) => d.sourceGoalId === sourceId), sourceCAS.afterWholeSelectedCell.decisionCells);
assert.deepEqual(beforeSource.mappings.filter((m: any) => m.legacyGoalId === sourceId), sourceCAS.beforeWholeSelectedCell.mappingCells);
assert.deepEqual(beforeSource.decisions.filter((d: any) => d.sourceGoalId === sourceId), sourceCAS.beforeWholeSelectedCell.decisionCells);
const sourceAtlas = await import(pathToFileURL(resolve(repo, 'app/scripts/goalBookSourceAtlasInputs.ts')).href);
const atlas = sourceAtlas.buildGoalBookSourceAtlasInputs(read(input + '/candidate/source-atlas.current407.portable-author.config.json'), repo);
const actualScopes = childIds.map((goalId: string) => ({ goalId, scopes: atlas.receipt.scopes.filter((s: any) => s.goalIds.includes(goalId)).map((s: any) => ({ key: s.key, witnesses: s.witnesses.filter((w: any) => w.goalId === goalId) })) }));
for (const row of actualScopes) {
  assert.deepEqual(row.scopes.map((s: any) => s.key), ['DE-BY/SekII/GK', 'DE-BY/SekII/LK']);
  assert.ok(row.scopes.every((s: any) => s.witnesses.every((w: any) => w.coverage === 'direct' && w.mappedTargetGoalId === row.goalId)));
}
const pDraft = read(input + '/positive/two-complete-positive-v2-child-profiles.DEEN.author.json');
const allCases = read(input + '/positive/four-whole-child-cases.DEEN.author.json').cases;
const Ajv2020 = (await import(pathToFileURL(resolve(repo, 'app/node_modules/ajv/dist/2020.js')).href)).default;
const addFormats = (await import(pathToFileURL(resolve(repo, 'app/node_modules/ajv-formats/dist/index.js')).href)).default;
const schema = read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json');
const ajv = new Ajv2020({ allErrors: true, strict: false }); addFormats(ajv);
const validateProfile = ajv.compile({ $schema: schema.$schema, $defs: schema.$defs, ...schema.properties.profile });
const materializer = await import(pathToFileURL(resolve(repo, 'app/scripts/materializePositiveGoalEvidenceCandidates.ts')).href);
const readOwnCandidates = read(own + '/positive/two-independent-reviewed-E0-G0-designs.json');
const config = read(own + '/positive/two-independent-reviewed-E0-G0.config.json');
for (const row of readOwnCandidates.goals) {
  const original = pDraft.goals.find((g: any) => g.goalId === row.goalId);
  assert.deepEqual(row.profile, original.profile);
  assert.ok(validateProfile(row.profile), ajv.errorsText(validateProfile.errors));
  const cases = allCases.filter((c: any) => c.goalId === row.goalId);
  assert.equal(cases.length, 2);
  for (const c of cases) {
    const brief = row.profile.applicationCaseBriefs.find((b: any) => b.id === c.caseId);
    assert.ok(brief);
    for (const lang of ['De', 'En']) {
      assert.equal(brief['taskDemand' + lang], c['task' + lang]);
      assert.equal(brief['expectedPerformance' + lang], c['modelAnswer' + lang]);
      assert.equal(brief['understandingFocus' + lang], c.rubric.map((r: any) => r['criterion' + lang]).join(' / '));
    }
    assert.equal(c.maximumPoints, c.rubric.reduce((sum: number, r: any) => sum + r.maximumPoints, 0));
    assert.deepEqual(c.expectationIds, row.profile.coverageExpectations.requiredExpectationIds);
  }
}
const records = await materializer.buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet: readOwnCandidates });
for (const record of records) assert.ok(record.evidenceLevel === 'E0' && record.maximumClaimScope === 'G0' && record.status === 'needs_human_review' && record.reviewAuthority === 'ai_candidate');
writeFileSync(resolve(repo, config.reviewPath), records.map((r: any) => JSON.stringify(r)).join('\n') + '\n');
write(own + '/checks/stock-bounded-graph-source-scope-and-P-design-checks.actual.json', {
  checkedAt: new Date().toISOString(), canonicalGraphShapeErrors: [], containsCycles: 0, requiresCycles: 0,
  exactExistingGoalMutationIds: [parent, terminal], fullParentDEENAndImagePreserved: true,
  terminalRemovedRequires: [parent], terminalAddedRequires: childIds, allOtherTerminalFieldsAndPrerequisitesPreserved: true,
  childCanonicalParentCounts: [1, 1], explicitChildPrerequisitesExact: true,
  exactSingleSourceCellCAS: true, allOtherSourceCarrierFieldsAndPartnersPreserved: true,
  technicalSourceCounts: atlas.receipt.counts, actualChildTechnicalSourceScopes: actualScopes,
  technicalSourceScopeIsNotFullPrimaryContentApproval: true,
  profileFragmentSchemasValid: true, fullFourCaseBriefAnswerRubricJoinsExact: true,
  stockMaterializedDesignRecords: records.map((r: any) => ({ goalId: r.goalId, goalFingerprint: r.goalFingerprint, reviewInputFingerprint: r.reviewInputFingerprint, profileFingerprint: r.profileFingerprint, status: r.status, reviewAuthority: r.reviewAuthority, evidenceLevel: r.evidenceLevel, maximumClaimScope: r.maximumClaimScope })),
  imageApprovalInherited: false, newNativeDApproval: false, sourceCosmeticsGapResolved: false,
  stockModuleBindings: ['app/scripts/goalBookSourceAtlasInputs.ts', 'app/scripts/positiveGoalEvidenceProfileModel.ts', 'app/scripts/materializePositiveGoalEvidenceCandidates.ts'].map(path => ({ path, sha256: sha(path) }))
});
console.log('Independent A bounded stock graph/source/P checks PASS: exact two-child CAS and terminal delta; actual BY GK/LK direct scopes; four whole cases and two E0/G0 candidate records. Full-primary cosmetics source gap remains separately HOLD.');
