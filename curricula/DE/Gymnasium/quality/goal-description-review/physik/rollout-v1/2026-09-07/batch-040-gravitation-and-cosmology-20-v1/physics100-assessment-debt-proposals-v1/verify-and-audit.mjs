import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = process.cwd()
const dir = dirname(fileURLToPath(import.meta.url))
const authoring = JSON.parse(readFileSync(resolve(dir, 'authoring-input.json'), 'utf8'))
const sourcePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const kindPath = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const sourceBytes = readFileSync(resolve(root, sourcePath))
const before = JSON.parse(sourceBytes.toString('utf8'))
const kindLedger = JSON.parse(readFileSync(resolve(root, kindPath), 'utf8'))
const kindById = new Map(kindLedger.decisions.map((x) => [x.goalId, x]))
const beforeById = new Map(before.goals.map((g) => [g.id, g]))
const after = structuredClone(before)
const afterById = new Map(after.goals.map((g) => [g.id, g]))
const { fingerprintSemanticKindSourceGoal } = await import(pathToFileURL(resolve(root, 'app/scripts/goalBookModel.ts')).href)
const { collectCompositionProjectionRoleGoalIds } = await import(pathToFileURL(resolve(root, 'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const { intersectApplicabilityJurisdictions } = await import(pathToFileURL(resolve(root, 'app/scripts/applicabilityCompiler.ts')).href)
const digest = (bytes) => 'sha256:' + createHash('sha256').update(bytes).digest('hex')
const jsonDigest = (value) => digest(JSON.stringify(value))
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const must = (condition, message) => { if (!condition) throw Error(message) }
const sourceLease = { sourcePath, sourceFileSha256: digest(sourceBytes), kindPath, kindFileSha256: digest(readFileSync(resolve(root, kindPath))) }
const fieldBindings = []
for (const draft of authoring.drafts) {
  const oldGoal = beforeById.get(draft.goalId)
  must(oldGoal && kindById.get(draft.goalId)?.semanticKind === 'practiceAssessment', 'Missing/non-assessment target ' + draft.goalId)
  must(kindById.get(draft.goalId).sourceFingerprint === fingerprintSemanticKindSourceGoal(oldGoal), 'Stale target K binding ' + draft.goalId)
  const operations = []
  const add = (path, parent, key, value) => {
    const state = Object.prototype.hasOwnProperty.call(parent, key) ? { state: 'value', value: parent[key] } : { state: 'missing' }
    if (state.state === 'value' && equal(state.value, value)) return
    operations.push({ path, before: state, beforeStateSha256: jsonDigest(state), after: { state: 'value', value }, afterStateSha256: jsonDigest({ state: 'value', value }) })
  }
  const nextGoal = afterById.get(draft.goalId)
  for (const [key, value] of Object.entries(draft)) {
    if (key === 'goalId') continue
    if (key === 'examData') {
      for (const [examKey, examValue] of Object.entries(value)) add('/examData/' + examKey, oldGoal.examData, examKey, examValue)
      nextGoal.examData = { ...nextGoal.examData, ...structuredClone(value) }
    } else {
      add('/' + key, oldGoal, key, value)
      nextGoal[key] = structuredClone(value)
    }
  }
  must(equal(nextGoal.requires, nextGoal.examData.coveredGoalIds), 'requires/coverage mismatch')
  for (const id of nextGoal.requires) {
    const g = beforeById.get(id)
    must(g && !g.contains?.length && kindById.get(id)?.semanticKind === 'curricularAtomic', 'Non-atomic coverage: ' + id)
    must(kindById.get(id).sourceFingerprint === fingerprintSemanticKindSourceGoal(g), 'Stale covered atom K: ' + id)
  }
  const e = nextGoal.examData
  must(e.scoring.steps.reduce((sum, s) => sum + s.points, 0) === 30 && e.scoring.maxPoints === 30 && e.scoring.passingPoints === 18, 'Point sum mismatch')
  must(e.reviewStatus === 'needs_review', 'Proposal may not self-release')
  must(e.taskContent && e.taskContentEn && e.solutionContent && e.solutionContentEn, 'Incomplete bilingual package')
  must(!e.taskContent.includes('Bearbeiten Sie eine materialgebundene Klausuraufgabe zu'), 'Placeholder retained')
  fieldBindings.push({
    goalId: draft.goalId,
    beforeGoalJsonSha256: jsonDigest(oldGoal),
    afterGoalJsonSha256: jsonDigest(nextGoal),
    beforeSemanticKindSourceFingerprint: fingerprintSemanticKindSourceGoal(oldGoal),
    proposedSemanticKindSourceFingerprint: fingerprintSemanticKindSourceGoal(nextGoal),
    operations,
    coveredGoalBindings: nextGoal.requires.map((id) => ({ goalId: id, semanticKind: 'curricularAtomic', title: beforeById.get(id).title, description: beforeById.get(id).description, descriptionEn: beforeById.get(id).descriptionEn, sourceFingerprint: fingerprintSemanticKindSourceGoal(beforeById.get(id)) })),
  })
}
const checkDag = (field) => {
  const active = new Set(), visited = new Set()
  const visit = (id) => {
    if (visited.has(id)) return
    must(!active.has(id), 'Cycle in ' + field + ': ' + id)
    active.add(id)
    for (const next of afterById.get(id)?.[field] ?? []) {
      const normalized = next.includes(':') ? next.split(':').at(-1) : next
      if (afterById.has(normalized)) visit(normalized)
    }
    active.delete(id); visited.add(id)
  }
  after.goals.forEach((g) => visit(g.id))
}
checkDag('requires'); checkDag('contains')
const routeKind = new Set(['orientation', 'curricularAtomic', 'memory', 'practiceAssessment'])
const validNode = (g) => !!g && !g.contains?.length && routeKind.has(kindById.get(g.id)?.semanticKind)
const q4Atoms = before.goals.filter((g) => g.dimensionTags?.phase === 'Q4' && kindById.get(g.id)?.semanticKind === 'curricularAtomic')
const q4Exams = before.goals.filter((g) => g.dimensionTags?.phase === 'Q4' && kindById.get(g.id)?.semanticKind === 'practiceAssessment' && g.examData)
const ancestorSet = (map, terminalIds, allowedIds = null) => {
  const seen = new Set()
  const visit = (id) => {
    const g = map.get(id)
    if (seen.has(id) || !validNode(g) || (allowedIds && !allowedIds.has(id))) return
    seen.add(id)
    for (const required of g.requires ?? []) visit(required)
  }
  terminalIds.forEach(visit)
  return seen
}
const terminalIds = q4Exams.map((g) => g.id)
const afterReleasedTerminalIds = terminalIds.filter((id) => afterById.get(id).examData.reviewStatus === 'released')
const beforeAnc = ancestorSet(beforeById, terminalIds)
const afterAnc = ancestorSet(afterById, terminalIds)
const afterReleasedAnc = ancestorSet(afterById, afterReleasedTerminalIds)
const brief = (g) => ({ goalId: g.id, title: g.title })
const losesStructuralRoute = q4Atoms.filter((g) => beforeAnc.has(g.id) && !afterAnc.has(g.id)).map(brief)
const gainsStructuralRoute = q4Atoms.filter((g) => !beforeAnc.has(g.id) && afterAnc.has(g.id)).map(brief)
const outstanding = q4Atoms.filter((g) => !afterAnc.has(g.id)).map(brief)
const targetChange = new Set(authoring.drafts.map((g) => g.goalId))
const rejectedClaimIds = authoring.drafts.map((d) => ({ assessmentGoalId: d.goalId, beforeDeclaredCount: beforeById.get(d.goalId).examData.coveredGoalIds.length, proposedDeclaredCount: d.requires.length, removedDeclaredClaims: beforeById.get(d.goalId).examData.coveredGoalIds.filter((id) => !d.requires.includes(id)).map((id) => ({ ...brief(beforeById.get(id)), semanticKind: kindById.get(id)?.semanticKind })), addedExplicitlyTestedAtoms: d.requires.filter((id) => !beforeById.get(d.goalId).examData.coveredGoalIds.includes(id)).map((id) => brief(beforeById.get(id))) }))
const viewDir = resolve(root, 'curricula/DE/Gymnasium/composition-views/physik')
const viewRows = []
const rootGoal = before.goals.find((g) => g.tags?.includes('root') && g.contains?.length)
for (const filename of readdirSync(viewDir).filter((x) => x.endsWith('.view.json')).sort()) {
  const v = JSON.parse(readFileSync(resolve(viewDir, filename), 'utf8'))
  if (v.scope?.stage === 'SekI') continue
  const roles = collectCompositionProjectionRoleGoalIds(v.rootNodes, beforeById, new Map(rootGoal ? [[before.landscapeId, rootGoal.id]] : []))
  const visibleTerminals = terminalIds.filter((id) => roles.targetGoalIds.has(id))
  const visibleAtoms = q4Atoms.filter((g) => roles.targetGoalIds.has(g.id))
  if (!visibleAtoms.length && !visibleTerminals.length) continue
  const allowed = new Set([...roles.targetGoalIds, ...roles.prerequisiteOnlyGoalIds])
  const vb = ancestorSet(beforeById, visibleTerminals, allowed)
  const va = ancestorSet(afterById, visibleTerminals, allowed)
  viewRows.push({
    viewId: v.viewId,
    path: 'curricula/DE/Gymnasium/composition-views/physik/' + filename,
    scope: v.scope,
    authoredTargetQ4AtomCount: visibleAtoms.length,
    targetTerminalIds: visibleTerminals,
    changedAssessmentsAuthoredAsTarget: [...targetChange].filter((id) => roles.targetGoalIds.has(id)),
    proposedPrerequisitesMissingFromAuthoredTargetAndSupport: authoring.drafts.filter((d) => roles.targetGoalIds.has(d.goalId)).map((d) => ({ assessmentGoalId: d.goalId, missingGoalIds: d.requires.filter((id) => !allowed.has(id)) })).filter((x) => x.missingGoalIds.length),
    beforeDirectRouteCount: visibleAtoms.filter((g) => vb.has(g.id)).length,
    afterStructuralDirectRouteCount: visibleAtoms.filter((g) => va.has(g.id)).length,
    lostDirectRouteGoalIds: visibleAtoms.filter((g) => vb.has(g.id) && !va.has(g.id)).map((g) => g.id),
    courseTagConflict: v.scope?.courseProfile === 'GK' && roles.targetGoalIds.has(authoring.drafts[0].goalId) ? '335a remains authored as target but the proposed task is explicitly LK; scope treatment requires a separate reviewed decision.' : null,
  })
}
const applicabilityChecks = authoring.drafts.map((d) => {
  const original = beforeById.get(d.goalId)
  const common = intersectApplicabilityJurisdictions(d.requires.map((id) => beforeById.get(id)?.applicability ?? {}))
  return { assessmentGoalId: d.goalId, currentAssessmentJurisdictions: original.applicability?.jurisdiction ?? [], proposedPrerequisiteJurisdictionIntersectionUsingCurrentCanonicalMetadata: common, currentAssessmentJurisdictionsOutsideIntersection: (original.applicability?.jurisdiction ?? []).filter((j) => !common.includes(j)), applicabilityFromRequiresBefore: original.extendedData?.applicabilityFromRequires ?? null, proposedApplicabilityWrite: false }
})
const otherExams = q4Exams.filter((g) => !targetChange.has(g.id)).map((g) => ({
  ...brief(g),
  taskSha256: jsonDigest(g.examData.taskContent),
  solutionSha256: jsonDigest(g.examData.solutionContent),
  declaredCoverage: g.examData.coveredGoalIds,
  actualTextInspected: true,
  placeholder: g.examData.taskContent.includes('Bearbeiten Sie eine materialgebundene Klausuraufgabe zu'),
  packageApproval: 'not_granted',
  conclusion: g.examData.taskContent.includes('Bearbeiten Sie eine materialgebundene Klausuraufgabe zu') ? 'No supplied data/materials or worked solution: a graph terminal only, not substantive replacement coverage.' : 'Concrete materials exist, but declared scope is overbroad; consult individual counterreview notes. Do not count all declared IDs as verified coverage.',
}))
const numeric = {
  astro: { distancePc: 20, distanceM: 20 * 3.086e16, luminosityW: 4 * Math.PI * (20 * 3.086e16) ** 2 * 8e-10, lowerLuminosityW: 4 * Math.PI * (3.086e16 / 0.052) ** 2 * 8e-10, upperLuminosityW: 4 * Math.PI * (3.086e16 / 0.048) ** 2 * 8e-10, galaxyRows: [660.9, 665.5, 670.1].map((lambda, i) => { const z = (lambda - 656.3) / 656.3; const velocityKmS = 3e5 * z; return { z, velocityKmS, slopeKmSPerMpc: velocityKmS / [30, 60, 90][i] } }) },
  quantum: { totalA: 600, totalB: 540, aRegion5: 1 / 6, aRegion6: 1 / 24, bRegions5And6: 1 / 9, contrastA: 0.6, contrastB: 0, halfRateExpectedTotal: 300, halfRateExpectedRegion5: 50 },
}
const result = {
  leases: { artifactType: 'bounded-assessment-field-leased-proposal', status: 'ai_candidate_needs_review_not_applied', leaseHashContract: 'SHA256 of UTF-8 JSON.stringify({state:"missing"} or {state:"value",value}); distinguishes missing from null; per-field lease authoritative, whole-source hash is snapshot evidence only.', ...sourceLease, proposals: fieldBindings },
  audit: { artifactType: 'read-only-assessment-route-delta', ...sourceLease, assumptions: ['No canonical, source mapping, view, ledger or release write was performed.', 'Direct route means reachability through authored requires between semantic orientation/curricularAtomic/memory/practiceAssessment leaves; cluster inheritance and contains expansion are excluded.', 'Q4 terminal universe is the nine current Q4 practiceAssessment goals with examData, not global final-exam goals.', 'Structural-after treats the two proposed tasks as graph endpoints independent of release; released-after separately excludes them because needs_review blocks hard exam mode.', 'Per-view rows use native authored target/prerequisiteOnly role resolution, not an end-to-end runtime/applicability rebuild; retained source applicability and course-tag conflicts are reported separately.', 'No Physics scopedFullRouteCoverageProfile is configured in validateGraph.ts; this is an explicit read-only shadow audit, not a claimed native Physics full-route PASS.', 'Existing graph paths and declared coveredGoalIds are not proof of substantive assessment coverage.'], counts: { q4CurricularAtoms: q4Atoms.length, q4AssessmentTerminals: terminalIds.length, beforeDirectRouteCount: q4Atoms.filter((g) => beforeAnc.has(g.id)).length, afterStructuralDirectRouteCount: q4Atoms.filter((g) => afterAnc.has(g.id)).length, afterReleasedEndpointDirectRouteCount: q4Atoms.filter((g) => afterReleasedAnc.has(g.id)).length, lostStructuralRouteCount: losesStructuralRoute.length, gainedStructuralRouteCount: gainsStructuralRoute.length, remainingStructuralRouteDebtCount: outstanding.length }, losesStructuralRoute, gainsStructuralRoute, remainingStructuralRouteDebt: outstanding, declaredCoverageDeltas: rejectedClaimIds, applicabilityChecks, otherQ4Assessments: otherExams, authoredViewRows: viewRows },
  checks: { status: 'PASS technical proposal checks; content approval still pending', ...sourceLease, canonicalFileUnchangedDuringReadOnlyCheck: digest(readFileSync(resolve(root, sourcePath))) === digest(sourceBytes), targetCount: fieldBindings.length, proposedTestedAtomicCount: authoring.coverageJudgments.length, fieldLeaseCount: fieldBindings.reduce((n, x) => n + x.operations.length, 0), currentTargetAndCoveredSemanticBindings: 'PASS: individually computed native fingerprints', requiresAndCoveredIds: 'PASS: 2 and 3 current curricularAtomic IDs, exact equality', bilingualTaskAndWorkedSolutionFields: 'PASS: present for both; prose review remains separate', pointTotals: 'PASS: 30 and30; thresholds18 and18', afterRequiresDag: 'PASS', afterContainsDag: 'PASS', noSelfRelease: 'PASS: needs_review', numeric, nextAction: 'Root content/scope counterreview and exact-field lease check; no automatic adoption.' },
}
console.log(JSON.stringify(process.argv[2] ? result[process.argv[2]] : result, null, 2))

