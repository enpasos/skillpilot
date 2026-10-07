// SPDX-License-Identifier: Apache-2.0
// Targeted current bindings after actual P-A/P-B science reviews; no new science votes.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = resolve('.')
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
const own = base + 'chemie-current-fifteen-positive-reviewed-bindings-v1/'
const v6 = base + 'chemie-current-aromatic-delocalization-final-native-author-v6/'
const v3 = base + 'chemie-current-fifteen-final-native-review-inputs-author-v3/'
const read = (p: string) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const raw = (p: string) => readFileSync(resolve(root, p))
const sha = (b: Buffer | string) => 'sha256:' + createHash('sha256').update(b).digest('hex')
const bind = (p: string) => ({ path: p, sha256: sha(raw(p)), bytes: raw(p).length })
const write = (p: string, v: unknown) => writeFileSync(resolve(root, own, p), JSON.stringify(v, null, 2) + '\n')
assert(!existsSync(resolve(root, own, 'current-fifteen-positive-bindings.final.freeze.json')))
const freezePaths = [
  v6 + 'final-aromatic-native-author-v6.final.freeze.json',
  base + 'chemie-current-eight-native-positive-independent-a-v3/independent-eight-p-a.final.freeze.json',
  base + 'chemie-current-eight-native-positive-independent-b-v3/native-positive-eight.independent-b.final.freeze.json',
  base + 'chemie-current-fifteen-native-p-independent-a-v1/independent-p-a.final.freeze.json',
  base + 'chemie-current-fifteen-native-positive-independent-b-v1/native-positive-fifteen.independent-b.final.freeze.json',
]
for (const p of freezePaths) {
  const frozen = read(p)
  const files = frozen.files ?? frozen.outputs
  assert(Array.isArray(files) && files.length > 0)
  for (const f of files) {
    assert.equal(bind(f.path).sha256, f.sha256.startsWith('sha256:') ? f.sha256 : 'sha256:' + f.sha256)
    if (f.bytes !== undefined) assert.equal(bind(f.path).bytes, f.bytes)
  }
}
const isolatedRoot = read(v6 + 'temporary-isolated-root.reuse.author.json').isolatedRootUsed
const helpers = ['materializePositiveGoalEvidenceCandidates.ts', 'positiveGoalEvidenceReview.ts', 'positiveGoalEvidenceProfileModel.ts']
for (const n of helpers) assert.equal(sha(readFileSync(resolve(isolatedRoot, 'app/scripts', n))), bind('app/scripts/' + n).sha256)
const { buildPositiveGoalEvidenceCandidateRecords } = await import(pathToFileURL(resolve(isolatedRoot, 'app/scripts/materializePositiveGoalEvidenceCandidates.ts')).href)
const { reviewPositiveGoalEvidenceConfig } = await import(pathToFileURL(resolve(isolatedRoot, 'app/scripts/positiveGoalEvidenceReview.ts')).href)
const { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile, validatePositiveGoalEvidenceRecordSemantics } = await import(pathToFileURL(resolve(isolatedRoot, 'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const canonicalPath = v6 + 'prospective-current378.canonical.author-candidate.json'
const ledgerPath = v6 + 'prospective-current378.semantic-kinds.author-input.json'
const goals = new Map<string, any>(read(canonicalPath).goals.map((g: any) => [g.id, g]))
const specs = read(v3 + 'fifteen-positive-profile-specifications.exact-v2.json')
const materials = read(v3 + 'thirty-complete-materials.de-en.exact-v2.json').materials
const changed = new Set(['b8d3b453-d638-5518-aab0-d84ec2e8567c', '363c5740-8a3c-50b8-8c3a-5548c80c36ea'])
const scopes = [
  { name: 'eight', source: base + 'chemie-current-eight-native-positive-independent-a-v3/positive-evidence.eight.independent-a.science-kept-candidates.config.json' },
  { name: 'seven', source: base + 'chemie-current-fifteen-native-p-independent-a-v1/positive-evidence.seven.science-kept-candidates.config.json' },
]
const outcomes: any[] = []
const actualResources: any[] = []
const currentIds: string[] = []
for (const scope of scopes) {
  const beforeConfig = read(scope.source)
  const sourceLines = raw(beforeConfig.reviewPath).toString().trimEnd().split('\n')
  const beforeRecords = sourceLines.map((s: string) => JSON.parse(s))
  const config = { ...beforeConfig, landscapePath: canonicalPath, semanticKindLedgerPath: ledgerPath,
    reviewPath: own + 'positive.' + scope.name + '.current-reviewed-bindings.review.jsonl',
    scope: { ...beforeConfig.scope, label: 'Previously reviewed P science preserved; actual current v6 goal/image bindings; machine candidate, no Human Approval or Trial' } }
  assert.deepEqual(beforeRecords.map((r: any) => r.goalId), config.scope.goalIds)
  const criteria = bind(config.reviewCriteriaPath).sha256
  const candidateSet = { ...specs, reviewId: config.reviewId, reviewedAt: new Date().toISOString(),
    reviewer: 'codex-targeted-current-positive-binding-verification',
    goals: config.scope.goalIds.map((id: string) => ({ ...specs.goals.find((g: any) => g.goalId === id),
      reason: 'Keine neue fachliche Prüfrunde: vollständiges Profil und beide vollständigen DE/EN-Fälle wurden bereits in getrennten P-A/P-B-Runden geprüft und bleiben exakt. Gezielt aktuelle v6-Ziel-/Bildbindung nativ verifiziert; keine empirische Lernendenleistung oder menschliche Freigabe.', dissent: [] })) }
  const rematerialized = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet })
  const lines: string[] = []
  const rows: any[] = []
  for (let i = 0; i < beforeRecords.length; i++) {
    const prior = beforeRecords[i], current = rematerialized[i], goal = goals.get(prior.goalId)
    assert(goal)
    assert.deepEqual(current.profile, prior.profile)
    assert.equal(current.profileFingerprint, prior.profileFingerprint)
    assert.equal(current.reviewCriteriaFingerprint, prior.reviewCriteriaFingerprint)
    const resources: Record<string, string> = {}
    for (const l of goal.resourceLinks ?? []) if (l.type === 'goal-visualization') {
      const p = 'app/public' + l.url
      resources[l.url] = sha(readFileSync(resolve(isolatedRoot, p)))
      actualResources.push({ goalId: prior.goalId, imageUrl: l.url, isolatedRelativePath: p, actualSHA256: resources[l.url] })
    }
    assert.equal(current.goalFingerprint, fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic'))
    assert.equal(current.reviewInputFingerprint, fingerprintPositiveGoalEvidenceReviewInput(goal, criteria, resources, 'curricularAtomic'))
    assert.equal(current.profileFingerprint, fingerprintPositiveGoalEvidenceProfile(current.profile))
    assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(current, goal, resources, 'curricularAtomic'), [])
    const cases = materials.filter((m: any) => m.goalId === prior.goalId)
    assert.equal(cases.length, 2)
    for (const c of cases) for (const lang of ['de', 'en']) {
      const suffix = lang === 'de' ? 'De' : 'En'
      const brief = current.profile.applicationCaseBriefs.find((b: any) => b.id === c.caseId)
      assert(brief)
      assert.equal(brief['taskDemand' + suffix], c.material[lang] + ' ' + c.taskDemand[lang])
      assert.equal(brief['expectedPerformance' + suffix], c.expectedPerformance[lang])
      assert.equal(brief['understandingFocus' + suffix], c.specificBoundaryOrCounterexample[lang])
      assert.equal(c.empiricalLearnerEvidence, false)
    }
    if (changed.has(prior.goalId)) {
      assert.notEqual(current.reviewInputFingerprint, prior.reviewInputFingerprint)
      if (prior.goalId.startsWith('363c')) assert.equal(current.goalFingerprint, prior.goalFingerprint)
      else assert.notEqual(current.goalFingerprint, prior.goalFingerprint)
      lines.push(JSON.stringify(current))
    } else {
      for (const f of ['goalFingerprint', 'reviewInputFingerprint']) assert.equal(current[f], prior[f])
      lines.push(sourceLines[i]) // Preserve all 13 unaffected complete records byte for byte.
    }
    const written = JSON.parse(lines.at(-1)!)
    assert.equal(written.reviewAuthority, 'ai_candidate')
    assert.equal(written.status, 'needs_human_review')
    assert.equal(written.evidenceLevel, 'E1')
    assert.equal(written.maximumClaimScope, 'G1')
    rows.push({ goalId: prior.goalId, wholeProfileAndBothCompleteCasesExact: true,
      currentGoalAndInputBindingsVerified: true, wholeRecordUnchanged: !changed.has(prior.goalId),
      beforeGoalFingerprint: prior.goalFingerprint, currentGoalFingerprint: current.goalFingerprint,
      beforeReviewInputFingerprint: prior.reviewInputFingerprint, currentReviewInputFingerprint: current.reviewInputFingerprint })
    currentIds.push(prior.goalId)
  }
  writeFileSync(resolve(root, config.reviewPath), lines.join('\n') + '\n')
  write('positive.' + scope.name + '.current-reviewed-bindings.config.json', config)
  const checked = reviewPositiveGoalEvidenceConfig(own + 'positive.' + scope.name + '.current-reviewed-bindings.config.json')
  assert.deepEqual(checked.errors, [])
  assert.deepEqual(checked.counts, { approved: 0, needsHumanReview: beforeRecords.length, rejected: 0 })
  outcomes.push({ scope: scope.name, sourceConfig: bind(scope.source), sourceRecords: bind(beforeConfig.reviewPath),
    currentConfig: bind(own + 'positive.' + scope.name + '.current-reviewed-bindings.config.json'),
    currentRecords: bind(config.reviewPath), counts: checked.counts, errors: checked.errors, rows })
}
assert.equal(currentIds.length, 15)
assert.equal(new Set(currentIds).size, 15)
write('native-fifteen-current-reviewed-positive-bindings.actual.json', {
  schemaVersion: 1, createdAtUTC: new Date().toISOString(), role: 'Targeted technical current binding verification after prior actual scientific P-A and P-B reviews; no additional science round claimed',
  priorImmutableScienceReviews: freezePaths.map(bind), currentCanonical: bind(canonicalPath),
  actualReadOnlyIsolatedRoot: isolatedRoot, verifiedProductionHelperBytes: helpers.map(n => bind('app/scripts/' + n)),
  wholeFifteenProfilesAndThirtyCompleteBilingualCasesPreserved: true, exactUnchangedWholeRecords: 13,
  targetedBindingDeltaGoalIds: [...changed], actualResources, outcomes,
  activeWrites: false, humanApproval: false, humanTrial: false, actualLearnerEvidence: false,
  strictNetGain: 0, newScientificClosures: 0, restoredActiveBindings: 0,
})
console.log(JSON.stringify({ nativeCurrentP: 'PASS15', unchangedWholeRecords: 13, targetedGoalImageBindings: 2, approved: 0, needsHumanReview: 15, activeWrites: false }))
