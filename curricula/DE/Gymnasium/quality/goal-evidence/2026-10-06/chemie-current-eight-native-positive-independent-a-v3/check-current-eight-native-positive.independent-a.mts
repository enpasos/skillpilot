import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = resolve('.')
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
const author = base + 'chemie-current-fifteen-final-native-review-inputs-author-v3/'
const own = base + 'chemie-current-eight-native-positive-independent-a-v3/'
const read = (p: string) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const sha = (bytes: Buffer | string) => 'sha256:' + createHash('sha256').update(bytes).digest('hex')
const bind = (p: string) => ({ path: p, sha256: sha(readFileSync(resolve(root, p))), bytes: readFileSync(resolve(root, p)).length })
const write = (p: string, x: unknown) => writeFileSync(resolve(root, own, p), JSON.stringify(x, null, 2) + '\n')
assert(!existsSync(resolve(root, own, 'independent-eight-p-a.final.freeze.json')))
const stageFreezes = ['native-d-stage-author-v3.final.freeze.json', 'native-p-stage-author-v3.final.freeze.json', 'final-native-review-inputs-author-v3.final.freeze.json']
for (const file of stageFreezes) {
  for (const f of read(author + file).files) {
    assert.equal(bind(f.path).sha256, f.sha256, 'Immutable author artifact changed: ' + f.path)
    assert.equal(bind(f.path).bytes, f.bytes)
  }
}
const isolation = read(author + 'temporary-native-isolation.actual-receipt.json')
const isolatedRoot = isolation.isolatedRootUsed
const helpers = ['materializePositiveGoalEvidenceCandidates.ts', 'positiveGoalEvidenceProfileModel.ts', 'positiveGoalEvidenceReview.ts']
for (const name of helpers) {
  const binding = isolation.byteIdenticalCopiedProductionHelpers.find((f: any) => f.path === 'app/scripts/' + name)
  assert(binding)
  assert.equal(bind(binding.path).sha256, binding.sha256)
  assert.equal(sha(readFileSync(resolve(isolatedRoot, binding.path))), binding.sha256)
}
const { buildPositiveGoalEvidenceCandidateRecords } = await import(pathToFileURL(resolve(isolatedRoot, 'app/scripts/materializePositiveGoalEvidenceCandidates.ts')).href)
const { reviewPositiveGoalEvidenceConfig } = await import(pathToFileURL(resolve(isolatedRoot, 'app/scripts/positiveGoalEvidenceReview.ts')).href)
const { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile, validatePositiveGoalEvidenceRecordSemantics } = await import(pathToFileURL(resolve(isolatedRoot, 'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const configPath = author + 'positive-evidence.eight.targeted.native-author-candidates.config.json'
const config = read(configPath)
const records = readFileSync(resolve(root, config.reviewPath), 'utf8').trim().split('\n').map(line => JSON.parse(line))
const specifications = read(author + 'fifteen-positive-profile-specifications.exact-v2.json')
const materials = read(author + 'sixteen-complete-targeted-materials.de-en.exact-v2.json').materials
const sciencePath = own + 'eight-whole-profiles-and-sixteen-materials.independent-a.scientific-review.json'
const science = read(sciencePath)
const canonical = read(config.landscapePath)
const goals = new Map<string, any>(canonical.goals.map((g: any) => [g.id, g]))
const criteria = bind(config.reviewCriteriaPath).sha256
assert.equal(records.length, 8)
assert.equal(materials.length, 16)
assert.deepEqual(records.map(r => r.goalId), config.scope.goalIds)
assert.deepEqual(science.rows.map((r: any) => r.goalId), config.scope.goalIds)
const resourceBindings: any[] = []
const rows = records.map(r => {
  const goal = goals.get(r.goalId)
  assert(goal)
  const resources: Record<string, string> = {}
  for (const link of (goal.resourceLinks ?? []).filter((l: any) => l.type === 'goal-visualization')) {
    const p = 'app/public' + link.url
    const bytes = readFileSync(resolve(isolatedRoot, p))
    resources[link.url] = sha(bytes)
    const staged = isolation.physicalSelectedReviewRasterCopies.find((s: any) => s.goalId === r.goalId)
    const source = staged?.source ?? bind(p)
    assert.equal(sha(bytes), source.sha256)
    assert.equal(bytes.length, source.bytes)
    assert.equal(bind(source.path).sha256, source.sha256)
    resourceBindings.push({ goalId: r.goalId, url: link.url, isolatedRelativePath: p, exactOriginalSource: source })
  }
  assert.equal(r.goalFingerprint, fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic'))
  assert.equal(r.reviewInputFingerprint, fingerprintPositiveGoalEvidenceReviewInput(goal, criteria, resources, 'curricularAtomic'))
  assert.equal(r.profileFingerprint, fingerprintPositiveGoalEvidenceProfile(r.profile))
  assert.equal(r.reviewCriteriaFingerprint, criteria)
  assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(r, goal, resources, 'curricularAtomic'), [])
  assert.deepEqual(r.profile, specifications.goals.find((s: any) => s.goalId === r.goalId).profile)
  const cases = materials.filter((c: any) => c.goalId === r.goalId)
  assert.equal(cases.length, 2)
  for (const c of cases) {
    const brief = r.profile.applicationCaseBriefs.find((b: any) => b.id === c.caseId)
    assert(brief)
    for (const lang of ['de', 'en']) {
      const suffix = lang[0].toUpperCase() + lang.slice(1)
      assert.equal(brief['taskDemand' + suffix], c.material[lang] + ' ' + c.taskDemand[lang])
      assert.equal(brief['expectedPerformance' + suffix], c.expectedPerformance[lang])
      assert.equal(brief['understandingFocus' + suffix], c.specificBoundaryOrCounterexample[lang])
    }
    assert.equal(c.empiricalLearnerEvidence, false)
  }
  assert.equal(r.reviewAuthority, 'ai_candidate')
  assert.equal(r.status, 'needs_human_review')
  assert.equal(r.evidenceLevel, 'E1')
  assert.equal(r.maximumClaimScope, 'G1')
  assert.deepEqual(r.reviewRunIds, [])
  return { goalId: r.goalId, allFourFingerprintsCurrent: true, completeBilingualCasesExact: cases.map((c: any) => c.caseId), nativeSemantics: 'PASS', profileScience: 'KEEP', separateDAndVHold: science.separateDAndVHoldGoalIds.includes(r.goalId) }
})
const originalCheck = reviewPositiveGoalEvidenceConfig(configPath)
assert.deepEqual(originalCheck.errors, [])
assert.deepEqual(originalCheck.counts, { approved: 0, needsHumanReview: 8, rejected: 0 })
const rematerialized = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet: { ...specifications, goals: config.scope.goalIds.map((id: string) => specifications.goals.find((g: any) => g.goalId === id)) } })
assert.deepEqual(rematerialized, records)
const independentConfig = {
  ...config,
  reviewId: 'chemie-current-eight-native-positive-independent-a-20261006-v3',
  reviewPath: own + 'positive-evidence.eight.independent-a.science-kept-candidates.review.jsonl',
  scope: { ...config.scope, label: 'Own targeted P-A science KEEP8; 363 actual image D/V HOLD remains; not active approval or Human Trial' },
}
const candidateSet = {
  ...specifications,
  reviewId: independentConfig.reviewId,
  reviewedAt: new Date().toISOString(),
  reviewer: 'codex-independent-targeted-positive-review-a',
  goals: config.scope.goalIds.map((id: string) => ({
    ...specifications.goals.find((g: any) => g.goalId === id),
    reason: 'Eigene aktuelle P-A-Fachprüfung aller vollständigen Profil-/Fallfelder: ' + science.rows.find((s: any) => s.goalId === id).independentRationale + ' Keine menschliche Freigabe, keine heutige Lernendenleistung, keine aktive D/P/A/M/V-Integration.',
    dissent: [],
  })),
}
const independent = await buildPositiveGoalEvidenceCandidateRecords({ config: independentConfig, candidateSet })
for (const r of independent) {
  const original = records.find(a => a.goalId === r.goalId)
  assert.deepEqual(r.profile, original.profile)
  for (const field of ['goalFingerprint', 'reviewInputFingerprint', 'profileFingerprint', 'reviewCriteriaFingerprint']) assert.equal(r[field], original[field])
}
writeFileSync(resolve(root, independentConfig.reviewPath), independent.map((r: any) => JSON.stringify(r)).join('\n') + '\n')
write('positive-evidence.eight.independent-a.science-kept-candidates.config.json', independentConfig)
const independentCheck = reviewPositiveGoalEvidenceConfig(own + 'positive-evidence.eight.independent-a.science-kept-candidates.config.json')
assert.deepEqual(independentCheck.errors, [])
assert.deepEqual(independentCheck.counts, { approved: 0, needsHumanReview: 8, rejected: 0 })
write('native-current-eight-bindings.independent-a.actual.json', {
  schemaVersion: 1,
  createdAtUTC: new Date().toISOString(),
  role: 'Own independent native execution against verified read-only author isolated inputs; original production helper bytes, no product mutation',
  actualIsolatedRootUsed: isolatedRoot,
  authorStageFreezes: stageFreezes.map(f => bind(author + f)),
  inputBindings: [configPath, config.reviewPath, config.landscapePath, config.semanticKindLedgerPath, config.reviewCriteriaPath, author + 'fifteen-positive-profile-specifications.exact-v2.json', author + 'sixteen-complete-targeted-materials.de-en.exact-v2.json', sciencePath, ...helpers.map(n => 'app/scripts/' + n)].map(bind),
  actualResources: resourceBindings,
  rows,
  exactOriginalAuthorRematerialization: 'PASS8',
  originalNativeChecker: { errors: originalCheck.errors, counts: originalCheck.counts },
  ownNativeChecker: { errors: independentCheck.errors, counts: independentCheck.counts },
  allEightProfileBodiesAndCurrentFingerprintsExactlyPreserved: true,
  separateDAndVHoldGoalIds: science.separateDAndVHoldGoalIds,
  scienceVerdictNotGrantedByTechnicalPASS: true,
  humanApproval: false, humanTrial: false, actualLearnerEvidence: false, activeWrites: false,
  strictNetGain: 0, newScientificClosures: 0, restoredActiveBindings: 0,
})
console.log(JSON.stringify({ actualWholeProfiles: 8, actualWholeMaterials: 16, nativeAuthorRematerialization: 'PASS8_EXACT', ownNativeChecker: 'PASS8', strictNetGain: 0, separateImageHold: '363c5740' }))
