import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// Review-only harness. The capsule contains the byte-exact production module
// followed by exports of private readers; no production predicate is changed.
const [repoArg, capsuleArg, outputArg, mode = 'candidate'] = process.argv.slice(2)
assert(repoArg && capsuleArg && outputArg)
const repo = resolve(repoArg), capsule = resolve(capsuleArg), output = resolve(outputArg)
const authorRelative = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M2-current493-country-source-and-explicit-GK-LK-role-author-v1'
const ownRelative = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M2-views-independent-review-b-v1'
const json = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const sha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex')
const sorted = (values: Iterable<string>) => [...values].sort()
const index = json(resolve(repo, authorRelative, 'thirty-explicit-existing-course-target-preservation-view.author-index.json'))
const reverse = json(resolve(repo, authorRelative, 'seventy-individual-existing-source-edges-and-current-GK-LK-union-coverage-bindings.author.json'))
const baseline = json(resolve(repo, authorRelative, 'actual-baseline-current493-exact2470-unsupported-and70-reverse-source-IDs.native-intake.json'))
const captured = json(resolve(repo, ownRelative, 'inputs/whole-current-applicability-compiler.readonly.json'))
const can = json(resolve(repo, ownRelative, 'inputs/whole-current493-canonical.json'))
const kinds = json(resolve(repo, ownRelative, 'inputs/whole-current493-semantic-kinds.json'))
const kind = new Map(kinds.decisions.map((d: any) => [d.goalId, d.semanticKind]))
const gb = new Map<string, any>(can.goals.map((g: any) => [g.id, g]))
const report = captured.economics
for (const [p, expected] of Object.entries(captured.actualWholeInputSHA256)) assert.equal(sha(resolve(repo, p)), expected, `captured whole compiler input ${p}`)
const native: any = await import(pathToFileURL(resolve(capsule, 'app/scripts/generateCurriculumQualityStatus.ts')).href)
const composition: any = await import(pathToFileURL(resolve(repo, 'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const canonical: any = await import(pathToFileURL(resolve(repo, 'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const conversion: any = await import(pathToFileURL(resolve(repo, 'app/src/goalTypes.ts')).href)
const projection: any = await import(pathToFileURL(resolve(repo, 'app/src/utils/compositionViewRuntime.ts')).href)
const viewInfo = native.readCompositionViewAtomicGoalIds(report)
const coverage = native.readJurisdictionCoverageByLandscapeId({ reports: [report] }).get(report.landscapeId)
assert.equal(can.goals.length, 493)
assert.equal(kinds.decisions.filter((d: any) => d.semanticKind === 'curricularAtomic').length, 336)
const viewRows: any[] = [], reverseRows: any[] = []
if (mode === 'candidate') {
  for (const row of index.views) {
    assert.equal(sha(resolve(repo, row.candidate.path)), row.candidate.sha256)
    const oldViewPath = resolve(repo, ownRelative, 'inputs/before-views', row.beforeView.path.split('/').at(-1))
    assert.equal(sha(oldViewPath), row.beforeView.sha256)
    const candidatePath = resolve(repo, row.candidate.path), view = composition.normalizeCompositionView(json(candidatePath))
    assert.equal(view.scope.jurisdiction, row.jurisdiction)
    assert.equal(view.scope.courseProfile, row.courseProfile)
    const compiler = composition.compileCompositionView(view, canonical.normalizeCanonicalLandscape(can))
    assert.equal(compiler.findings.filter((f: any) => f.severity === 'error').length, 0)
    const filters = [row.courseProfile, row.jurisdiction]
    const before = native.collectRenderedAtomicGoalIdsFromCompositionView(can, oldViewPath, filters)
    const after = native.collectRenderedAtomicGoalIdsFromCompositionView(can, candidatePath, filters)
    const afterUnfiltered = native.collectRenderedAtomicGoalIdsFromCompositionView(can, candidatePath)
    assert.deepEqual(sorted(after), sorted(before), `whole runtime leaf preservation ${row.jurisdiction}/${row.courseProfile}`)
    assert.deepEqual(sorted(after).filter(id => kind.get(id) === 'curricularAtomic'), row.actualPreservedOrdinaryTargetIds)
    assert.deepEqual(sorted(after), row.actualPreservedAllLeafTargetIds)
    assert.deepEqual(sorted(afterUnfiltered), sorted(after), 'explicit source claim equals actual runtime target set')
    const beforeRoles = composition.collectCompositionProjectionRoleGoalIds(composition.normalizeCompositionView(json(oldViewPath)).rootNodes, gb)
    const afterRoles = composition.collectCompositionProjectionRoleGoalIds(view.rootNodes, gb)
    for (const id of beforeRoles.prerequisiteOnlyGoalIds) {
      assert(afterRoles.prerequisiteOnlyGoalIds.has(id) || afterRoles.targetGoalIds.has(id), `retained prerequisite access ${id}`)
      assert(!after.has(id) || before.has(id), `no new visible prerequisite-only target ${id}`)
    }
    const entry = { meta: can, goals: can.goals.map((g: any) => conversion.convertLearningGoal(g, { landscapeId: can.landscapeId })) }
    const projected = projection.applyCompositionViewProjection([entry], view)[0]
    const projectedIds = new Set(projected.goals.map((g: any) => g.id))
    for (const id of afterRoles.prerequisiteOnlyGoalIds) assert(projectedIds.has(id), `P-only remains available to resolver ${id}`)
    viewRows.push({ jurisdiction: row.jurisdiction, courseProfile: row.courseProfile, wholeRuntimeLeafTargetIdsBefore: sorted(before), wholeRuntimeLeafTargetIdsAfter: sorted(after), ordinaryGoalIds: sorted(after).filter(id => kind.get(id) === 'curricularAtomic'), beforePrerequisiteOnlyIds: sorted(beforeRoles.prerequisiteOnlyGoalIds), afterPrerequisiteOnlyIds: sorted(afterRoles.prerequisiteOnlyGoalIds), compilerFindings: compiler.findings, decision: 'KEEP', rationale: 'Explicit references reproduce the actual existing course/jurisdiction projection; P-only support stays outside targets and available to prerequisite resolution.' })
  }
  assert.equal(viewRows.reduce((n, r) => n + r.ordinaryGoalIds.length, 0), 3237)
  const maps = native.readGoalMappingFilesForReport(report), closure = native.readSourceGoalClosureByLandscapeId(), extraction = native.readExtractedSourceGoalIdsByLandscapeId()
  const sourceRegistry = native.readSourceLandscapeRegistryEntriesById()
  const descendantAtoms = (id: string, seen = new Set<string>()): string[] => {
    if (seen.has(id)) return []; seen.add(id)
    const g = gb.get(id); assert(g, `canonical mapping target exists ${id}`)
    return g.contains?.length ? g.contains.flatMap((child: string) => descendantAtoms(child, seen)) : [id]
  }
  const expectedKeys = baseline.reverseSourceDiagnostics.flatMap((r: any) => r.actualUnmappedSourceAtomicGoalIds.map((key: string) => `${r.jurisdiction}|${key}`)).sort()
  assert.deepEqual(reverse.rows.map((r: any) => `${r.jurisdiction}|${r.sourceAtomicGoalKey}`).sort(), expectedKeys)
  for (const row of reverse.rows) {
    const split = row.sourceAtomicGoalKey.indexOf(':'), sid = row.sourceAtomicGoalKey.slice(0, split), atom = row.sourceAtomicGoalKey.slice(split + 1)
    assert.equal(sourceRegistry.get(sid)?.jurisdiction, row.jurisdiction)
    const targetUnion: Set<string> = viewInfo.viewAtomicGoalIdsByJurisdiction.get(row.jurisdiction)
    const countryViews = viewRows.filter(r => r.jurisdiction === row.jurisdiction)
    const checkedBindings: any[] = []
    for (const binding of row.existingEvidenceBindings) {
      const originalMap = json(resolve(repo, binding.existingMappingPath))
      assert.equal(sha(resolve(repo, binding.existingMappingPath)), binding.existingMappingWholeSHA256)
      assert.equal(originalMap.sourceLandscapeId, sid)
      assert.equal(originalMap.targetLandscapeId, can.landscapeId)
      assert(originalMap.mappings.some((m: any) => JSON.stringify(m) === JSON.stringify(binding.existingMappingEntry)), 'whole original source edge exists')
      const entry = binding.existingMappingEntry
      const sourceAtoms = extraction.has(sid) ? new Set([entry.legacyGoalId]) : native.expandSourceAtomicGoalIds(sid, entry.legacyGoalId, closure)
      assert(sourceAtoms.has(atom), 'native source atomic closure contains this atom')
      if (extraction.has(sid)) assert(originalMap.decisions.some((d: any) => d.sourceGoalId === entry.legacyGoalId && d.decision === 'mapped'), 'existing scientific mapping decision remains mapped')
      assert.deepEqual(binding.targetCanonicalGoalObject, gb.get(entry.canonicalGoalId))
      const hits = descendantAtoms(entry.canonicalGoalId).filter(id => targetUnion.has(id))
      assert(hits.length > 0, 'actual canonical descendant intersects actual GK/LK source union')
      assert.deepEqual(hits, binding.actualNewViewHits.map((h: any) => h.goalId))
      for (const hit of binding.actualNewViewHits) {
        assert.deepEqual(hit.wholeCurrentGoal, gb.get(hit.goalId))
        const beforeCountry = baseline.jurisdictionRows.find((r: any) => r.jurisdiction === row.jurisdiction)
        assert.equal(hit.alreadyRuntimeGKTarget, beforeCountry.actualRuntimeGKOrdinaryIds.includes(hit.goalId))
        assert.equal(hit.alreadyRuntimeLKTarget, beforeCountry.actualRuntimeLKDefaultOrdinaryIds.includes(hit.goalId))
        assert.equal(hit.authorGKTarget, countryViews.find(r => r.courseProfile === 'GK').ordinaryGoalIds.includes(hit.goalId))
        assert.equal(hit.authorLKTarget, countryViews.find(r => r.courseProfile === 'LK').ordinaryGoalIds.includes(hit.goalId))
        assert(hit.alreadyRuntimeGKTarget || hit.alreadyRuntimeLKTarget, 'binding recovery adds no curriculum target')
      }
      checkedBindings.push({ mappingPath: binding.existingMappingPath, wholeExistingMappingEntry: entry, sourceAtom: atom, canonicalTargetTitle: gb.get(entry.canonicalGoalId).title, actualSourceTargetUnionIntersection: hits, decision: 'KEEP_EXISTING_BINDING', mappingStrengthUnchanged: true })
    }
    assert(checkedBindings.length > 0)
    reverseRows.push({ jurisdiction: row.jurisdiction, sourceAtomicGoalKey: row.sourceAtomicGoalKey, checkedExistingBindings: checkedBindings, decision: 'KEEP', reviewBoundary: 'Existing source scientific decisions reused; only missing course-view union placement is restored.' })
  }
  assert.equal(reverseRows.length, 70)
  assert.equal(coverage.unsupportedAssignedAtomicGoals, 26)
  assert.equal(coverage.unmappedSourceAtomicGoals, 0)
} else if (mode === 'baseline') {
  assert.equal(coverage.unsupportedAssignedAtomicGoals, 2470)
  assert.equal(coverage.unmappedSourceAtomicGoals, 70)
} else if (mode === 'negative-source-drop') {
  assert(coverage.unmappedSourceAtomicGoals > 0, 'real mapped source target removal fails the unchanged native source check')
} else if (mode === 'negative-runtime-drop') {
  const mutation = json(resolve(capsule, 'mutation.json'))
  const row = index.views.find((r: any) => r.jurisdiction === mutation.jurisdiction && r.courseProfile === mutation.courseProfile)
  const old = native.collectRenderedAtomicGoalIdsFromCompositionView(can, resolve(repo, ownRelative, 'inputs/before-views', row.beforeView.path.split('/').at(-1)), [row.courseProfile, row.jurisdiction])
  const changed = native.collectRenderedAtomicGoalIdsFromCompositionView(can, resolve(capsule, row.prospectiveActivePath), [row.courseProfile, row.jurisdiction])
  assert(old.has(mutation.removedGoalId) && !changed.has(mutation.removedGoalId), 'real unauthorized scope drop detected')
  assert.notDeepEqual(sorted(old), sorted(changed), 'full runtime leaf preservation rejects the manipulated candidate')
} else throw Error(`unknown review mode ${mode}`)
const result = { role: 'Independent reviewer B actual native source/view qualification', mode, nativeSourceSha256: sha(resolve(repo, 'app/scripts/generateCurriculumQualityStatus.ts')), wholeCanonicalSha256: sha(resolve(repo, ownRelative, 'inputs/whole-current493-canonical.json')), viewRows, individualSeventyReverseSourceBindings: reverseRows, nativeJurisdictionCoverage: coverage, passForBoundedChecks: true, overallM2Claim: false, newScientificClosures: 0, strictGain: 0, noHumanApprovalOrTrialClaim: true, sourceBoundary: '26 forward source assignments remain open in this candidate. Route, APV, memory-visibility and final M2 are separate gates.' }
writeFileSync(output, JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ mode, viewsChecked: viewRows.length, ordinaryScopePairs: viewRows.reduce((n, r) => n + r.ordinaryGoalIds.length, 0), reverseRowsChecked: reverseRows.length, unsupported: coverage.unsupportedAssignedAtomicGoals, reverseUnmapped: coverage.unmappedSourceAtomicGoals, boundedPass: true, overallM2Claim: false }))
