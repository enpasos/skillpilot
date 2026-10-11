import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const [repoArg, capsuleArg, outputArg, mode] = process.argv.slice(2)
assert(repoArg && capsuleArg && outputArg && mode)
const repo = resolve(repoArg), capsule = resolve(capsuleArg), output = resolve(outputArg)
const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M2-twenty-six-source-role-and-two-bounded-surrogate-author-v1/current-explicit-source-role-and-one-subsumption-surrogate-successor-v3'
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M2-rest26-source-role-independent-review-b-v1'
const firstReview = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M2-views-independent-review-b-v1'
const json = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const sha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex')
const sort = (ids: Iterable<string>) => [...ids].sort()
const index = json(resolve(repo, author, 'thirty-two-explicit-current-scope-views-and-25-source-only-role-corrections.current-author-index-v3.json'))
const contexts = json(resolve(repo, author, 'twenty-six-individual-current-whole-goal-P-source-role-and-one-real-subsumption-binding.author-v3.json'))
const captured = json(resolve(repo, firstReview, 'inputs/whole-current-applicability-compiler.readonly.json'))
const can = json(resolve(repo, firstReview, 'inputs/whole-current493-canonical.json'))
const kinds = json(resolve(repo, firstReview, 'inputs/whole-current493-semantic-kinds.json'))
const gb = new Map<string, any>(can.goals.map((g: any) => [g.id, g]))
const kind = new Map(kinds.decisions.map((d: any) => [d.goalId, d.semanticKind]))
const fullProfilesPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current485-V13-two-reviewed-requires-P336-SEM485-binding-only-author-v1/whole-P336-only-two-current-reviewed-requires-input-fingerprint-successors.jsonl'
const profiles = new Map(readFileSync(resolve(repo, fullProfilesPath), 'utf8').trim().split('\n').map(line => { const p = JSON.parse(line); return [p.goalId, p] }))
assert.equal(can.goals.length, 493)
assert.equal(kinds.decisions.filter((d: any) => d.semanticKind === 'curricularAtomic').length, 336)
for (const [p, h] of Object.entries(captured.actualWholeInputSHA256)) assert.equal(sha(resolve(repo, p)), h, `actual frozen compiler input ${p}`)
const native: any = await import(pathToFileURL(resolve(capsule, 'app/scripts/generateCurriculumQualityStatus.ts')).href)
const comp: any = await import(pathToFileURL(resolve(repo, 'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const canon: any = await import(pathToFileURL(resolve(repo, 'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const conversion: any = await import(pathToFileURL(resolve(repo, 'app/src/goalTypes.ts')).href)
const runtime: any = await import(pathToFileURL(resolve(repo, 'app/src/utils/compositionViewRuntime.ts')).href)
const report = captured.economics
const coverage = native.readJurisdictionCoverageByLandscapeId({ reports: [report] }).get(report.landscapeId)
assert.equal(coverage.totalAtomicGoals, 338, 'unchanged complete native source denominator includes its two assessments')
assert.equal(coverage.sourceAtomicGoals, 2134, 'no source atom retired')
assert.equal(coverage.unmappedSourceAtomicGoals, 0)
const viewRows: any[] = [], roleRows: any[] = []
if (mode === 'accepted' || mode === 'pending') {
  for (const row of index.views) {
    assert.equal(sha(resolve(repo, row.candidate.path)), row.candidate.sha256)
    const original = resolve(repo, own, 'inputs/before-views', row.beforeView.path.split('/').at(-1))
    assert.equal(sha(original), row.beforeView.sha256)
    const v = comp.normalizeCompositionView(json(resolve(repo, row.candidate.path)))
    assert.equal(v.scope.jurisdiction, row.jurisdiction)
    assert.equal(v.scope.courseProfile, row.courseProfile)
    const compiled = comp.compileCompositionView(v, canon.normalizeCanonicalLandscape(can))
    assert.equal(compiled.findings.filter((f: any) => f.severity === 'error').length, 0)
    const filters = [row.courseProfile, row.jurisdiction]
    const before: Set<string> = native.collectRenderedAtomicGoalIdsFromCompositionView(can, original, filters)
    const after: Set<string> = native.collectRenderedAtomicGoalIdsFromCompositionView(can, resolve(repo, row.candidate.path), filters)
    const removed: string[] = row.expectedRemovedUnbackedOrdinaryTargetIds
    assert.deepEqual(sort(after), sort([...before].filter(id => !removed.includes(id))), 'no unintended leaf drop or addition')
    assert.deepEqual(sort(after).filter(id => kind.get(id) === 'curricularAtomic'), row.actualPreservedOrdinaryTargetIds)
    assert.deepEqual(sort(after), row.actualPreservedAllLeafTargetIds)
    const raw = native.collectRenderedAtomicGoalIdsFromCompositionView(can, resolve(repo, row.candidate.path))
    assert.deepEqual(sort(raw), sort(after), 'unfiltered authored source claim equals actual course targets')
    const roles = comp.collectCompositionProjectionRoleGoalIds(v.rootNodes, gb)
    const beforeRoles = comp.collectCompositionProjectionRoleGoalIds(comp.normalizeCompositionView(json(original)).rootNodes, gb)
    for (const id of beforeRoles.prerequisiteOnlyGoalIds) assert(roles.prerequisiteOnlyGoalIds.has(id) || roles.targetGoalIds.has(id), 'existing explicit prerequisite support retained')
    const projected = runtime.applyCompositionViewProjection([{ meta: can, goals: can.goals.map((g: any) => conversion.convertLearningGoal(g, { landscapeId: can.landscapeId })) }], v)[0]
    const ids = new Set(projected.goals.map((g: any) => g.id))
    for (const id of removed) {
      assert.equal(kind.get(id), 'curricularAtomic')
      assert(roles.prerequisiteOnlyGoalIds.has(id) && !roles.targetGoalIds.has(id), 'explicit P-only override applied')
      assert(ids.has(id), 'global goal remains available to prerequisite resolver')
      assert(!after.has(id), 'P-only stays outside target tree/progress')
    }
    assert.equal(row.noOrdinaryTargetSetReduction, removed.length === 0, 'honest scope-reduction metadata')
    viewRows.push({ jurisdiction: row.jurisdiction, courseProfile: row.courseProfile, beforeOrdinaryTargetIds: sort(before).filter(id => kind.get(id) === 'curricularAtomic'), afterOrdinaryTargetIds: sort(after).filter(id => kind.get(id) === 'curricularAtomic'), allLeafTargetsBefore: sort(before), allLeafTargetsAfter: sort(after), actualRemovedOrdinaryTargets: removed, explicitPrerequisiteOnlyIds: sort(roles.prerequisiteOnlyGoalIds), compilerFindings: compiled.findings })
  }
  assert.equal(viewRows.length, 32)
  assert.equal(viewRows.reduce((n, r) => n + r.beforeOrdinaryTargetIds.length, 0), 3541)
  assert.equal(viewRows.reduce((n, r) => n + r.afterOrdinaryTargetIds.length, 0), 3495)
  assert.equal(viewRows.reduce((n, r) => n + r.actualRemovedOrdinaryTargets.length, 0), 46)
  const beforeEvidence = native.createCoverageEvidenceChecker(report, 'DE-BE', new Map(), gb)
  for (const row of contexts.records) {
    assert.deepEqual(row.wholeCurrentGoal, gb.get(row.goalId))
    assert.deepEqual(row.wholeCurrentPositiveRecord, profiles.get(row.goalId))
    if (row.afterRole !== 'prerequisiteOnly') continue
    const actualReport = report.goals.find((g: any) => g.goalId === row.goalId)
    assert(!actualReport.evidence.some((e: any) => e.dimension === 'jurisdiction' && e.value === row.jurisdiction && ['provenance', 'mapping'].includes(e.kind)), 'no source-backed whole target removed')
    const affected = viewRows.filter(r => r.jurisdiction === row.jurisdiction && r.actualRemovedOrdinaryTargets.includes(row.goalId))
    assert(affected.length > 0)
    roleRows.push({ jurisdiction: row.jurisdiction, goalId: row.goalId, title: row.wholeCurrentGoal.title, description: row.wholeCurrentGoal.description, afterRole: 'prerequisiteOnly', actualAffectedCourses: affected.map(r => r.courseProfile), currentJurisdictionEvidence: actualReport.evidence.filter((e: any) => e.dimension === 'jurisdiction' && e.value === row.jurisdiction), sourceBackedWholeTargetNotClaimed: true, globalGoalAndNationalTargetRetained: true, noUniversalHardPrerequisiteApproval: true })
  }
  assert.equal(roleRows.length, 25)
  const source125 = json(resolve(repo, 'curricula/DE/Gymnasium/input/BE/upper-secondary/source-extraction/DE_BE_WIRTSCHAFT_SEKII_CURRENT_BERLIN2006_EP2010_AB2022.source-extraction.json'))
  const map = json(resolve(repo, 'curricula/DE/Gymnasium/mapping/DE-BE/upper-secondary/be_wirtschaft_current125_source_extraction_to_canonical_wirtschaft.review.json'))
  assert.equal(source125.sourceGoals.length, 125)
  assert.equal(map.mappings.length, 208)
  assert(map.mappings.every((m: any) => m.matchType === 'partial'))
  const candidate = json(resolve(repo, author, 'one-bounded-norm-subsumption-source-surrogate-entry.candidate-pending-independent-review.json'))
  assert.equal(candidate.entries.length, 1)
  const entry = candidate.entries[0]
  assert.equal(entry.goalId, 'dae93971-726c-56e5-8044-19dbd40febf7')
  assert.equal(entry.requiredByGoalId, 'bd413a7c-775a-5318-813c-0b75578f9a11')
  assert.equal(entry.status, 'candidate')
  assert(gb.get(entry.requiredByGoalId).requires.includes(entry.goalId), 'actual direct prerequisite edge')
  const anchorReport = report.goals.find((g: any) => g.goalId === entry.requiredByGoalId)
  assert(beforeEvidence.hasCoverageBackedJurisdictionEvidence(anchorReport), 'actual anchor is directly source backed')
  const sourceRow = source125.sourceGoals.find((g: any) => g.id === 'be-ww-correct-q-s32-methods-09-29d8e6ca')
  assert(sourceRow && sourceRow.sourceLocator.printedPage === 16 && sourceRow.authoredScope.courseLevels.includes('GK') && sourceRow.authoredScope.courseLevels.includes('LK'))
  assert(map.mappings.some((m: any) => m.legacyGoalId === sourceRow.id && m.canonicalGoalId === entry.requiredByGoalId && m.matchType === 'partial'))
  const originalRegistry = json(resolve(repo, 'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json'))
  const checkedRegistry = json(resolve(capsule, 'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json'))
  assert.deepEqual(checkedRegistry.entries.slice(0, originalRegistry.entries.length), originalRegistry.entries, 'all 362 existing entries exact')
  assert.equal(checkedRegistry.entries.length, originalRegistry.entries.length + 1)
  const nationalIds = new Set<string>()
  for (const course of ['GK', 'LK']) {
    const file = resolve(capsule, `curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-${course.toLowerCase()}.view.json`)
    assert.equal(sha(file), sha(resolve(repo, `curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-${course.toLowerCase()}.view.json`)))
    native.collectRenderedAtomicGoalIdsFromCompositionView(can, file).forEach((id: string) => { if (kind.get(id) === 'curricularAtomic') nationalIds.add(id) })
  }
  assert.equal(nationalIds.size, 336)
}
if (mode === 'accepted') {
  assert.equal(coverage.unsupportedAssignedAtomicGoals, 0)
  assert.equal(coverage.sourceCompleteJurisdictions, 16)
} else if (['pending', 'wrong-anchor', '764-retarget'].includes(mode)) {
  assert.equal(coverage.unsupportedAssignedAtomicGoals, 1)
  assert.equal(coverage.sourceCompleteJurisdictions, 15)
} else throw Error('unknown review mode')
const result = { role: 'Independent reviewer B actual v3 source/role native qualification', mode, nativeSourceSHA256: sha(resolve(repo, 'app/scripts/generateCurriculumQualityStatus.ts')), actualNativeSourceCoverage: coverage, viewRows, individual25RoleCorrections: roleRows, nativePredicateOrThresholdChanges: 0, all336GlobalAndNationalTargetsRetained: true, newScientificFiveGateClosures: 0, overallActiveM2Claim: false, humanApprovalClaim: false }
writeFileSync(output, JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ mode, unsupported: coverage.unsupportedAssignedAtomicGoals, reverseUnmapped: coverage.unmappedSourceAtomicGoals, sourceCompleteJurisdictions: coverage.sourceCompleteJurisdictions, viewsChecked: viewRows.length, rolePairsChecked: roleRows.length, scopeRoleDeltas: viewRows.reduce((n, r) => n + r.actualRemovedOrdinaryTargets.length, 0), boundedPass: true, overallActiveM2Claim: false }))
