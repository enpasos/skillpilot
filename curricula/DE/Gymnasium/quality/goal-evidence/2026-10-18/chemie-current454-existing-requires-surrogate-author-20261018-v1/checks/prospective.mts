// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createReviewedRequiresClosureCoverageChecker, sourceCoverageSurrogateKey } from '../../../../../../../../app/scripts/sourceCoverageEvidence.ts'

const repo = process.cwd()
const own = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p: string) => JSON.parse(fs.readFileSync(path.resolve(own, p), 'utf8'))
const cas = read('CAS.registry-append23.INACTIVE.pending.json')
const before = read('before/registry.EXACT.json')
const after = read('candidate/registry.after23.INACTIVE.pending.json')
const pending = read('candidate/entries23.proposed-future-accepted.pending.json')
const entries = pending.entries
const report = read('evidence/native-one-landscape-applicability.json').report
const whole = read('evidence/WHOLE.five-selected-goals-and-positive-profiles.json')
const goalById = new Map<string, any>(whole.records.map((r: any) => [r.goal.id, r.goal]))
const views = read('evidence/native-selected-view-roles.json')
const inputPins = read('evidence/INPUTS.native-read-pins.json')
const digest = (raw: Buffer) => createHash('sha256').update(raw).digest('hex')
const stage = fs.existsSync(path.join(own, 'INTEGRATION.stage-transition.json')) ? read('INTEGRATION.stage-transition.json') : undefined
for (const pin of inputPins) {
  let raw = fs.readFileSync(path.resolve(repo, pin.path))
  if (digest(raw) !== pin.sha256) {
    const archived = stage?.archivedInputResolutions.find((r: any) => r.originalPinnedInput.path === pin.path && r.originalPinnedInput.sha256 === pin.sha256)
    assert(archived, `Neither current nor exact archived original input: ${pin.path}`)
    raw = fs.readFileSync(path.resolve(repo, archived.exactArchivedBefore.path))
  }
  assert.equal(raw.length, pin.bytes, `Input byte drift: ${pin.path}`)
  assert.equal(digest(raw), pin.sha256, `Input SHA drift: ${pin.path}`)
}
// The registry CAS itself always requires current bytes. Historical preservation
// of other inputs never permits overwriting an intervening registry mutation.
for (const pin of [cas.beforeRawPin, cas.beforeArtifact, cas.afterArtifact]) {
  const raw = fs.readFileSync(path.resolve(repo, pin.path))
  assert.equal(raw.length, pin.bytes, `Input byte drift: ${pin.path}`)
  assert.equal(digest(raw), pin.sha256, `Input SHA drift: ${pin.path}`)
}
assert.equal(pending.active, false)
assert.equal(pending.independentReviewPending, true)
assert.equal(cas.writerExecuted, false)
assert.deepEqual(after.entries.slice(0, before.entries.length), before.entries)
assert.deepEqual(after.entries.slice(before.entries.length), entries)
assert.equal(before.entries.length, 371)
assert.equal(after.entries.length, 394)
assert.deepEqual(Object.keys(after), Object.keys(before))
assert.equal(after.schemaVersion, before.schemaVersion)
const acceptedMap = (rows: any[]) => {
  const map = new Map<string, any[]>()
  for (const e of rows.filter(e => e.status === 'accepted' && e.evidenceType === 'requires-closure'
    && typeof e.landscapeId === 'string' && typeof e.goalId === 'string'
    && typeof e.jurisdiction === 'string' && typeof e.requiredByGoalId === 'string'
    && typeof e.rationale === 'string' && e.rationale.trim().length > 0)) {
    const key = sourceCoverageSurrogateKey(e.landscapeId, e.goalId, e.jurisdiction)
    map.set(key, [...(map.get(key) ?? []), e])
  }
  return map
}
// These five whole pinned goals have no memory, orientation or assessment
// semantic markers; this is precisely the CQR source-coverage eligibility gate.
const eligible = (g: any) => Boolean(g) && !g.examData
  && !(g.tags ?? []).some((t: string) => ['Practice', 'Assessment', 'Orientation', 'Motivation', 'memorization'].includes(t) || t.startsWith('srs-deck:'))
const checker = (e: any, rows: any[], goals = report.goals) => createReviewedRequiresClosureCoverageChecker({
  landscapeId: report.landscapeId, jurisdiction: e.jurisdiction, goals,
  canonicalGoalById: goalById, surrogateEntriesByKey: acceptedMap(rows), isEligibleCanonicalGoal: eligible,
})
const results: any[] = []
for (const e of entries) {
  const target = report.goals.find((g: any) => g.goalId === e.goalId)
  const dependent = goalById.get(e.requiredByGoalId)
  assert(target)
  assert.equal(target.goalType, 'atomic')
  assert(eligible(dependent))
  assert(dependent.requires.includes(e.goalId), 'No actual literal requires edge')
  const closure = target.evidence.filter((x: any) => x.kind === 'requires-closure' && x.value === e.jurisdiction && x.source === `required by ${e.requiredByGoalId}`)
  assert(closure.length)
  assert.equal(checker(e, before.entries).hasCoverageBackedJurisdictionEvidence(target), false)
  assert.equal(checker(e, after.entries).hasCoverageBackedJurisdictionEvidence(target), true)
  // The exact new row and actual compiler evidence are necessary: no automatic
  // requires closure, title matching or other-state witness can substitute.
  const withoutThis = after.entries.filter((r: any) => r !== e && !(r.goalId === e.goalId && r.jurisdiction === e.jurisdiction && r.requiredByGoalId === e.requiredByGoalId))
  assert.equal(checker(e, withoutThis).hasCoverageBackedJurisdictionEvidence(target), false)
  const noClosure = report.goals.map((g: any) => g.goalId === e.goalId ? { ...g, evidence: g.evidence.filter((x: any) => !closure.includes(x)) } : g)
  assert.equal(checker(e, after.entries, noClosure).hasCoverageBackedJurisdictionEvidence(noClosure.find((g: any) => g.goalId === e.goalId)), false)
  const noSource = report.goals.map((g: any) => g.goalId === e.requiredByGoalId ? { ...g, evidence: g.evidence.filter((x: any) => !(['mapping', 'provenance'].includes(x.kind) && x.value === e.jurisdiction)) } : g)
  assert.equal(checker(e, after.entries, noSource).hasCoverageBackedJurisdictionEvidence(target), false)
  const carrier = report.goals.find((g: any) => g.goalId === e.requiredByGoalId)
  const direct = carrier.evidence.filter((x: any) => ['mapping', 'provenance'].includes(x.kind) && x.value === e.jurisdiction)
  assert(direct.length)
  const localViews = views.filter((v: any) => v.scope.jurisdiction === e.jurisdiction && v.goals.some((g: any) => g.goalId === e.goalId && g.target))
  assert(localViews.length)
  for (const v of localViews) assert(v.goals.some((g: any) => g.goalId === e.requiredByGoalId && g.target), `Carrier not a local target in ${v.viewId}`)
  results.push({ goalId: e.goalId, jurisdiction: e.jurisdiction, requiredByGoalId: e.requiredByGoalId,
    beforeCoverage: false, prospectiveAfterCoverage: true, noEntryRejected: true, noClosureRejected: true,
    noSameJurisdictionCarrierSourceRejected: true, actualClosureEvidence: closure, carrierDirectEvidence: direct,
    localTargetViewIds: localViews.map((v: any) => v.viewId) })
}
const hb = report.goals.find((g: any) => g.goalId.startsWith('8e6b'))
const hbChecker = createReviewedRequiresClosureCoverageChecker({ landscapeId: report.landscapeId, jurisdiction: 'DE-HB', goals: report.goals, canonicalGoalById: goalById, surrogateEntriesByKey: acceptedMap(before.entries), isEligibleCanonicalGoal: eligible })
assert.equal(hbChecker.hasCoverageBackedJurisdictionEvidence(hb), true)
assert(!entries.some((e: any) => e.goalId.startsWith('8e6b') || e.goalId.startsWith('b732')))
for (const r of whole.records) {
  assert.equal(r.wholePositiveProfileRow.profile.coverageExpectations.minimumIndependentDemonstrations, 2)
  assert.equal(r.wholePositiveProfileRow.profile.coverageExpectations.freshVariationRequired, true)
  assert.equal(r.wholePositiveProfileRow.profile.coverageExpectations.independentTransferRequired, true)
}
const b732Jurisdictions = ['DE-BB', 'DE-BE', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-MV', 'DE-RP', 'DE-SH', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH']
const extra = ['e7c3d20e', '57d2c98d'].map(pre => {
  const goal = report.goals.find((g: any) => g.goalId.startsWith(pre))
  return { goalId: goal.goalId, title: goal.title, compiledApplicability: goal.compiledApplicability,
    queriedTwelveB732TargetJurisdictions: b732Jurisdictions.map(jurisdiction => ({ jurisdiction,
      sourceBacked: goal.evidence.some((e: any) => e.value === jurisdiction && ['mapping', 'provenance'].includes(e.kind)),
      actualSourceEvidence: goal.evidence.filter((e: any) => e.value === jurisdiction && ['mapping', 'provenance'].includes(e.kind)),
      localTargetViews: views.filter((v: any) => v.scope.jurisdiction === jurisdiction && v.goals.some((g: any) => g.goalId === goal.goalId && g.target)).map((v: any) => v.viewId),
    })), noPrerequisiteEdgeProposed: true, scientificAcquisitionOpinion: 'NOT_REVIEWED_HERE' }
})
fs.writeFileSync(path.join(own, 'evidence/QUERY.two-other-carriers.for-parent.READONLY.json'), JSON.stringify(extra, null, 2) + '\n')
const output = { role: 'BOUNDED_TECHNICAL_PROSPECTIVE_CHECK_NOT_SCIENTIFIC_REVIEW', active: false,
  productionChecker: 'app/scripts/sourceCoverageEvidence.ts', productionCheckerChanged: false,
  preintegrationNativeInputPinsPreserved: true, currentStageTransition: stage ? 'INTEGRATION.stage-transition.json' : null,
  actualNativeApplicabilityCompilerChanged: false, candidateDataOnly: true, normalWrites: 0,
  registryOldEntriesExact: 371, individualFutureAcceptedRows: 23, prospectiveCoverageFalseToTrue: 23,
  sourceAndRequiresNegativeControls: 'ALL23_PASS', wholePinnedProfilesStillMin2FreshTransfer: true,
  existingHB8e6bDirectCoverageTrueNoNewRow: true, b732RowsHere: 0, results,
  scopeBoundary: 'Only exact23 declared acquisition relations. Not full CQR, not all454-target certification, not source-union completion, native release, M7 or human acceptance.' }
fs.writeFileSync(path.join(own, 'CHECK.prospective-native-sourceCoverage-and-CAS.json'), JSON.stringify(output, null, 2) + '\n')
console.log(JSON.stringify({ proposedRows: 23, falseToTrue: 23, negativeControls: 'pass', unchangedOldRows: 371, profileBodies: 5, normalWrites: 0 }))
