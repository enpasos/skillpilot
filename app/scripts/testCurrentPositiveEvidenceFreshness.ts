import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { cpSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadCurrentPositiveEvidenceOwners, isCanonicalMathPhysicsEvidenceSource,
  validateDescriptionPositiveEvidenceBinding } from './currentPositiveEvidenceOwners'
import { loadCurrentDescriptionEvidenceGates, loadDeepUnderstandingRolloutConfig,
  projectDeepUnderstandingSubjectReport, assertRegisteredMathPhysicsNativeAcceptanceComplete, type DeepUnderstandingSubjectReport } from './reportDeepUnderstandingRollout'
import { fingerprintPositiveGoalEvidenceProfile, fingerprintPositiveGoalEvidenceReviewInput,
  type PositiveGoalEvidenceReviewRecord } from './positiveGoalEvidenceProfileModel'
import { reviewPositiveGoalEvidenceConfig, type PositiveGoalEvidenceReviewConfig } from './positiveGoalEvidenceReview'
import { evaluateDeepUnderstandingQa, generateQualityNativeReport } from './generateCurriculumQualityStatus'
import { stableGoalEvidenceJson } from './goalEvidenceProfileModel'
import { collectRequiredTaskMaterialDigests } from './goalEvidenceTaskMaterials'
import { validateGoalDescriptionDualRoundResolution } from './validateGoalDescriptionDualRoundResolution'
import { loadGoalDescriptionReviewCampaignResultDirectories } from './validateGoalDescriptionReviewCampaignResults'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const fixture = resolve(root, 'app/scripts/fixtures/current-positive-evidence-freshness')
mkdirSync(resolve(root, 'tmp'), { recursive: true })
// Run against the actual two-goal source context in an isolated repository.
// Static module repoRoot bindings stay honest; no canonical Root file is edited.
if (!process.env.SKILLPILOT_FRESHNESS_WORKER) {
  const sandbox = mkdtempSync(resolve(root, 'tmp/current-P-D-regression-repository-'))
  try {
    mkdirSync(join(sandbox, 'app'), { recursive: true })
    cpSync(resolve(root, 'app/scripts'), join(sandbox, 'app/scripts'), { recursive: true })
    cpSync(resolve(root, 'app/package.json'), join(sandbox, 'app/package.json'))
    for (const name of ['src', 'node_modules', 'public']) symlinkSync(resolve(root, 'app', name), join(sandbox, 'app', name))
    // Source/config fixtures are real file copies in real ancestor directories.
    // No Curricula or contract ancestor symlink is allowed in this repository.
    cpSync(resolve(root, 'contracts'), join(sandbox, 'contracts'), { recursive: true })
    const copySource = (path: string) => {
      const target = join(sandbox, path)
      mkdirSync(dirname(target), { recursive: true })
      cpSync(resolve(root, path), target)
      assert.equal(lstatSync(dirname(target)).isSymbolicLink(), false)
      return target
    }
    const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
    const ledgerPath = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
    for (const path of [canonicalPath, ledgerPath,
      'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
      'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json',
      'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
      'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
      'curricula/DE/Gymnasium/quality/deep-understanding-rollout/deep-understanding-rollout.schema.json',
      'curricula/DE/Gymnasium/quality/goal-evidence/prompts/physics-positive-understanding-evidence-profile-criteria-v1.md',
      'curricula/DE/Gymnasium/quality/goal-evidence/prompts/mathematik-positive-understanding-evidence-profile-criteria-v2.md',
    ]) copySource(path)
    const canonical = JSON.parse(readFileSync(join(sandbox, canonicalPath), 'utf8'))
    const actualGoals = JSON.parse(readFileSync(join(fixture, 'actual-canonical-goals.json'), 'utf8')) as Array<{ id: string }>
    const byId = new Map(actualGoals.map((g) => [g.id, g]))
    canonical.goals = canonical.goals.map((g: { id: string }) => byId.get(g.id) ?? g)
    const ledger = JSON.parse(readFileSync(join(sandbox, ledgerPath), 'utf8'))
    const actualDecisions = JSON.parse(readFileSync(join(fixture, 'actual-kind-decisions.json'), 'utf8')) as Array<{ goalId: string }>
    const decisionsById = new Map(actualDecisions.map((d) => [d.goalId, d]))
    ledger.decisions = ledger.decisions.map((d: { goalId: string }) => decisionsById.get(d.goalId) ?? d)
    for (const [path, value] of [[canonicalPath, canonical], [ledgerPath, ledger]] as const) {
      const target = join(sandbox, path)
      // Assert actual resolved containment immediately before each source write.
      assert.ok(realpathSync(target).startsWith(`${realpathSync(sandbox)}/`))
      writeFileSync(target, JSON.stringify(value))
    }
    const result = spawnSync(process.execPath, ['--import', 'tsx', join(sandbox, 'app/scripts/testCurrentPositiveEvidenceFreshness.ts')], {
      cwd: join(sandbox, 'app'), env: { ...process.env, SKILLPILOT_FRESHNESS_WORKER: '1' }, encoding: 'utf8',
    })
    process.stdout.write(result.stdout ?? ''); process.stderr.write(result.stderr ?? '')
    if (result.error) throw result.error
    process.exitCode = result.status ?? 1
  } finally { rmSync(sandbox, { recursive: true, force: true }) }
  process.exit(process.exitCode ?? 0)
}
const temp = mkdtempSync(resolve(root, 'tmp/current-positive-evidence-freshness-'))
const json = <T = any>(p: string): T => JSON.parse(readFileSync(p, 'utf8'))
const save = (p: string, value: unknown) => writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`)
const hash = (bytes: Buffer | string) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const id = '106417ed-80db-5490-a1ee-bb4160d3f2b4'
const other = '9851bd02-ca48-5ce4-8e9f-9ec4af1c43b8'
const registered = loadDeepUnderstandingRolloutConfig()
const source = registered.subjects.find((subject) => subject.subject === 'physik')!
const landscape = json(resolve(root, source.landscapePath))
const landscapeId = landscape.landscapeId
const bound = json(resolve(fixture, 'round-a/description-review-input.json'))
const boundGoal = bound.goals.find((goal: any) => goal.goalId === id)
const oldP: PositiveGoalEvidenceReviewRecord = boundGoal.reviewContext.evidenceProfile
const currentP = json<PositiveGoalEvidenceReviewRecord>(resolve(fixture, 'actual-current-1064-P.json'))
const goal = landscape.goals.find((g: any) => g.id === id)
const baseConfig: PositiveGoalEvidenceReviewConfig = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
  schemaVersion: 2, reviewId: oldP.reviewId, goalFingerprintRuleVersion: 'goal-evidence-v1',
  profileRuleVersion: 'positive-understanding-evidence-v2', landscapeId, landscapePath: source.landscapePath,
  semanticKindLedgerPath: source.semanticKindLedgerPath,
  reviewCriteriaPath: 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/physics-positive-understanding-evidence-profile-criteria-v1.md',
  reviewPath: '', reviewRunManifestPaths: [], reviewedResourceTypes: ['goal-visualization'], requireApproved: false,
  scope: { label: 'Technical freshness regression; no new review or acceptance', goalIds: [id] },
}
let count = 0
const makeOwner = (record: PositiveGoalEvidenceReviewRecord, changes: Partial<PositiveGoalEvidenceReviewConfig> = {}, reorder = false) => {
  const n = ++count
  const reviewPath = relative(root, join(temp, `owner-${n}.jsonl`))
  const reverseKeys = (value: unknown): unknown => Array.isArray(value) ? value.map(reverseKeys)
    : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).reverse().map(([key, nested]) => [key, reverseKeys(nested)])) : value
  const serialized = reorder ? JSON.stringify(reverseKeys(record), null, 4) : JSON.stringify(record)
  // JSONL needs one complete JSON value per line; whitespace may change without changing its meaning.
  writeFileSync(resolve(root, reviewPath), reorder ? '  ' + JSON.stringify(JSON.parse(serialized), null, 0) + '  \n' : serialized + '\n')
  const configPath = relative(root, join(temp, `owner-${n}.config.json`))
  save(resolve(root, configPath), { ...baseConfig, reviewId: record.reviewId, reviewPath,
    scope: { ...baseConfig.scope, goalIds: [record.goalId] }, ...changes })
  return configPath
}
const fixedOwner = makeOwner(bound.goals.find((g: any) => g.goalId === other).reviewContext.evidenceProfile)
const indexPath = relative(root, join(temp, 'native/resolution-index.json'))
cpSync(fixture, join(temp, 'native'), { recursive: true })
const config = (p: string[], indexes = [indexPath]) => ({ ...source,
  resolutionIndexPaths: indexes, resolutionSupersessions: [], resolutionWithdrawals: [],
  currentCanonicalBindingAuditPaths: [], currentCanonicalBindingAuditGoalIds: [], positiveEvidenceConfigPaths: [...p, fixedOwner] })
const stage = (p: string[]) => loadCurrentDescriptionEvidenceGates(config(p))
const seen: string[] = []
const ownerCatalog = (p: string[]) => loadCurrentPositiveEvidenceOwners({
  ...source, landscapeId, atomicGoalIds: new Set([id, other]), positiveEvidenceConfigPaths: p,
}, (_path, _config, record) => seen.push(record.goalId))
const technicalProjection = (state: Awaited<ReturnType<typeof stage>>, configForProjection = config([])) => projectDeepUnderstandingSubjectReport(configForProjection, {
  ...state,
  // Technical projection only. These three deliberately generous fixture gates
  // isolate the D/P join; they are never claimed as genuine A/M/V acceptance.
  atomicityReady: state.scope.atomicGoalIds, memoryReady: state.scope.atomicGoalIds,
  visualizationReady: state.scope.atomicGoalIds, atomicityIssues: [], memoryIssues: [], visualizationIssues: [],
  deferredVisualizationGoalIds: new Set(),
})
try {
  const originalConfig = makeOwner(oldP)
  const exact = await stage([originalConfig])
  assert.deepEqual(exact.scope.issues, [])
  assert.equal(exact.scope.denominator, 478, 'The full canonical Physics scope remains intact')
  assert.deepEqual(exact.evidenceIssues, [])
  assert.deepEqual(exact.descriptionIssues, [])
  assert.ok(exact.descriptionReady.has(id), 'Actual historical D, both rounds and synthesis are independently valid')
  assert.ok(technicalProjection(exact).strictCompleteGoalIds.includes(id))

  const genuineCurrent = makeOwner(currentP)
  const stale = await stage([genuineCurrent])
  assert.deepEqual(stale.evidenceIssues, [], 'Actual current P must remain normally valid')
  assert.ok(stale.evidenceReady.has(id))
  assert.ok(!stale.descriptionReady.has(id), 'DEFECT: historical D must not join a different whole current P record')
  assert.ok(stale.descriptionIssues.some((x) => x.includes('stale full P record') && x.includes('/profile/applicationCaseBriefs/1/taskDemandDe')))
  const projected = technicalProjection(stale)
  assert.ok(!projected.strictCompleteGoalIds.includes(id))
  assert.equal(projected.requiredChecks.find((x) => x.id === 'description-review-validation')?.status, 'fail')
  assert.equal(projected.requiredChecks.find((x) => x.id === 'positive-evidence-validation')?.status, 'pass')
  assert.equal(evaluateDeepUnderstandingQa(landscape, source.landscapePath, {
    schemaVersion: 1, reportId: registered.reportId, subjects: [projected], blockingIssueCount: projected.issues.length,
  }).status, 'fail')
  assert.equal(projected.strictCompletionReady, false, 'Native producer requires strictCompletionReady and zero blockers')

  const reordered = await stage([makeOwner(oldP, {}, true)])
  assert.deepEqual(reordered.descriptionIssues, [])
  assert.ok(reordered.descriptionReady.has(id), 'File move, key ordering and JSON whitespace are semantic no-ops')
  const layoutOnly = structuredClone(boundGoal)
  layoutOnly.reviewContext.page.navigationOrder += 1; layoutOnly.reviewContext.page.treeOrder += 2
  assert.equal(validateDescriptionPositiveEvidenceBinding(layoutOnly, exact.evidenceOwners.get(id)).status, 'current',
    'P currentness is independent of new Book layout; normal D/page integrity remains separately enforced')

  const body = structuredClone(oldP)
  body.profile.applicationCaseBriefs[0].taskDemandDe += ' Technische Negativvariante.'
  body.profileFingerprint = fingerprintPositiveGoalEvidenceProfile(body.profile)
  const bodyDrift = await stage([makeOwner(body)])
  assert.deepEqual(bodyDrift.evidenceIssues, [])
  assert.ok(!bodyDrift.descriptionReady.has(id))
  const forged = structuredClone(body); forged.profileFingerprint = oldP.profileFingerprint
  const forgedStage = await stage([makeOwner(forged)])
  assert.ok(forgedStage.evidenceIssues.some((x) => x.includes('profileFingerprint does not match the profile')))
  assert.ok(!forgedStage.evidenceReady.has(id))

  const criteria = join(temp, 'changed-criteria.md')
  writeFileSync(criteria, readFileSync(resolve(root, baseConfig.reviewCriteriaPath), 'utf8') + '\nTechnical criteria-binding regression.\n')
  const resources: Record<string, string> = { ...collectRequiredTaskMaterialDigests(goal, root).digests }
  for (const link of goal.resourceLinks ?? []) if (link.type === 'goal-visualization') resources[link.url] = hash(readFileSync(resolve(root, 'app/public', link.url.slice(1))))
  const changedInput = structuredClone(oldP)
  changedInput.reviewCriteriaFingerprint = hash(readFileSync(criteria))
  changedInput.reviewInputFingerprint = fingerprintPositiveGoalEvidenceReviewInput(goal, changedInput.reviewCriteriaFingerprint, resources, 'curricularAtomic')
  assert.equal(changedInput.profileFingerprint, oldP.profileFingerprint)
  const inputDrift = await stage([makeOwner(changedInput, { reviewCriteriaPath: relative(root, criteria) })])
  assert.deepEqual(inputDrift.evidenceIssues, [])
  assert.ok(!inputDrift.descriptionReady.has(id), 'A legitimate new input binding with the same P body is stale D context')
  const badInput = structuredClone(oldP); badInput.reviewInputFingerprint = hash('fabricated')
  assert.ok((await stage([makeOwner(badInput)])).evidenceIssues.some((x) => x.includes('stale reviewInputFingerprint')))

  const metadata = structuredClone(oldP)
  metadata.reviewId += '-new-owner'; metadata.reviewedAt = '2026-10-15T19:00:00Z'; metadata.reviewer += ' technical variant'; metadata.reason += ' Technical metadata test.'
  const metadataStage = await stage([makeOwner(metadata)])
  assert.deepEqual(metadataStage.evidenceIssues, [])
  assert.ok(metadataStage.descriptionIssues.some((x) => x.includes('/reviewId') && !x.includes('/profile/')))

  seen.length = 0
  const duplicate = ownerCatalog([originalConfig, makeOwner(oldP)])
  assert.ok(!duplicate.ready.has(id) && !duplicate.owners.has(id)); assert.deepEqual(seen, [])
  const duplicateStage = await stage([originalConfig, makeOwner(oldP)])
  assert.ok(!duplicateStage.evidenceReady.has(id) && !duplicateStage.descriptionReady.has(id))
  assert.ok(!technicalProjection(duplicateStage).strictCompleteGoalIds.includes(id))
  const foreignSourcePath = join(temp, 'foreign-source.json')
  save(foreignSourcePath, landscape)
  const foreignSourceConfig = makeOwner(oldP, { landscapePath: relative(root, foreignSourcePath) })
  assert.deepEqual(reviewPositiveGoalEvidenceConfig(foreignSourceConfig).errors, [], 'Foreign source can be independently valid and still cannot own this source')
  seen.length = 0
  assert.ok(!ownerCatalog([foreignSourceConfig]).owners.has(id)); assert.deepEqual(seen, [])
  const wrongSource = makeOwner(oldP, { semanticKindLedgerPath: 'tmp/does-not-exist-kind-ledger.json' })
  seen.length = 0
  const laterInvalid = ownerCatalog([originalConfig, wrongSource])
  assert.ok(!laterInvalid.owners.has(id)); assert.deepEqual(seen, [])
  const duplicateRecord = makeOwner(oldP)
  const duplicateRecordConfig = json<PositiveGoalEvidenceReviewConfig>(resolve(root, duplicateRecord))
  writeFileSync(resolve(root, duplicateRecordConfig.reviewPath), `${JSON.stringify(oldP)}\n${JSON.stringify(oldP)}\n`)
  seen.length = 0
  const duplicatedRows = ownerCatalog([duplicateRecord])
  assert.ok(!duplicatedRows.owners.has(id)); assert.deepEqual(seen, [])
  assert.ok(duplicatedRows.issues.some((x) => x.includes('duplicate review record')))
  const outOfScopeClaim = makeOwner(oldP, { scope: { label: 'Invalid foreign record claim', goalIds: [other] } })
  seen.length = 0
  assert.ok(!ownerCatalog([originalConfig, outOfScopeClaim]).owners.has(id)); assert.deepEqual(seen, [])
  const foreignLandscape = makeOwner(oldP, { landscapeId: 'foreign-landscape' })
  seen.length = 0
  assert.ok(!ownerCatalog([originalConfig, foreignLandscape]).owners.has(id)); assert.deepEqual(seen, [])
  const kindPath = join(temp, 'foreign-kind.json'); const kind = json(resolve(root, source.semanticKindLedgerPath))
  kind.decisions.find((d: any) => d.goalId === id).semanticKind = 'memory'; save(kindPath, kind)
  const foreignKind = makeOwner(oldP, { semanticKindLedgerPath: relative(root, kindPath) })
  seen.length = 0; assert.ok(!ownerCatalog([originalConfig, foreignKind]).owners.has(id)); assert.deepEqual(seen, [])

  const independentGoal = structuredClone(boundGoal)
  independentGoal.reviewContext.evidenceProfile = null; independentGoal.reviewContext.page.evidenceReview = null
  assert.equal(validateDescriptionPositiveEvidenceBinding(independentGoal, undefined).status, 'profile-independent')
  independentGoal.reviewContext.page.evidenceReview = boundGoal.reviewContext.page.evidenceReview
  assert.equal(validateDescriptionPositiveEvidenceBinding(independentGoal, undefined).status, 'invalid')
  assert.equal(validateDescriptionPositiveEvidenceBinding(boundGoal, undefined).status, 'invalid')
  assert.equal(isCanonicalMathPhysicsEvidenceSource({ landscapePath: source.landscapePath, landscapeId }), true)
  assert.equal(isCanonicalMathPhysicsEvidenceSource({ landscapePath: source.landscapePath, landscapeId: 'foreign' }), false)
  assert.equal(isCanonicalMathPhysicsEvidenceSource({ landscapePath: 'curricula/foreign/physics.json', landscapeId }), false)

  // The low resolver still proves precisely the explicit old input supplied to it.
  const round = async (name: string) => {
    const dir = resolve(fixture, name); const campaign = json(resolve(dir, 'description-review-campaign.json'))
    const loaded = await loadGoalDescriptionReviewCampaignResultDirectories({ campaign, batchesDirectory: resolve(dir, 'batches'), resultsDirectory: resolve(dir, 'results') })
    assert.deepEqual(loaded.errors, [])
    return { campaign, bundle: json(resolve(dir, 'review-bundle-manifest.json')), input: json(resolve(dir, 'description-review-input.json')), resultPairs: loaded.resultPairs }
  }
  const first = await round('round-a'); const second = await round('round-b')
  const synthesisBytes = readFileSync(resolve(fixture, 'synthesis-decisions.json'))
  const explicit = {
    resolution: json(resolve(fixture, `resolutions/${id}.resolution.json`)), dualSummary: json(resolve(fixture, 'dual-summary.json')),
    dualSummaryBytes: readFileSync(resolve(fixture, 'dual-summary.json')), currentInput: first.input, landscape,
    first, second, synthesisDecisionManifestArtifact: { manifest: JSON.parse(synthesisBytes.toString()), manifestBytes: synthesisBytes, manifestPath: 'synthesis-decisions.json' },
  }
  assert.equal((await validateGoalDescriptionDualRoundResolution(explicit)).strictDescriptionComplete, true)
  const removedP = structuredClone(first.input)
  removedP.goals.find((g: any) => g.goalId === id).reviewContext.evidenceProfile = null
  assert.ok((await validateGoalDescriptionDualRoundResolution({ ...explicit, currentInput: removedP })).errors.length > 0,
    'Removing embedded P cannot turn an existing bound D chain into independent evidence')

  // Historical superseded D is retained; the exact still-valid current replacement is checked.
  const historicalIndex = relative(root, join(temp, 'native/historical-index.json'))
  cpSync(resolve(root, indexPath), resolve(root, historicalIndex))
  const withHistory = { ...config([originalConfig]), resolutionIndexPaths: [historicalIndex, indexPath],
    resolutionSupersessions: [id, other].map((goalId) => ({ goalId, supersededIndexPath: historicalIndex, replacementIndexPath: indexPath })) }
  assert.ok((await loadCurrentDescriptionEvidenceGates(withHistory)).descriptionReady.has(id))
  const missingReplacement = { ...withHistory, positiveEvidenceConfigPaths: [genuineCurrent, fixedOwner] }
  assert.ok(!(await loadCurrentDescriptionEvidenceGates(missingReplacement)).descriptionReady.has(id))
  const broken = json(resolve(root, historicalIndex)); broken.resolutions[0].resolutionDigest = hash('broken old digest'); save(resolve(root, historicalIndex), broken)
  assert.ok(!(await loadCurrentDescriptionEvidenceGates(withHistory)).descriptionReady.has(id))

  const mathState = await loadCurrentDescriptionEvidenceGates({ ...registered.subjects.find((s) => s.subject === 'mathematik')!,
    resolutionIndexPaths: [], resolutionSupersessions: [], resolutionWithdrawals: [], currentCanonicalBindingAuditPaths: [],
    currentCanonicalBindingAuditGoalIds: [], positiveEvidenceConfigPaths: [] })
  assert.equal(mathState.scope.denominator, 807, 'All 807 canonical Math atoms remain in scope without a whitelist')

  const independentDirectory = join(temp, 'independent-null')
  cpSync(join(fixture, 'independent-null'), independentDirectory, { recursive: true })
  const independentPConfig = json<PositiveGoalEvidenceReviewConfig>(join(independentDirectory, 'current-P.config.json'))
  independentPConfig.reviewPath = relative(root, join(independentDirectory, 'current-P.review.jsonl'))
  const independentPPath = relative(root, join(independentDirectory, 'relocated-current-P.config.json'))
  save(resolve(root, independentPPath), independentPConfig)
  const independentId = independentPConfig.scope.goalIds[0]
  const mathConfig = { ...registered.subjects.find((subject) => subject.subject === 'mathematik')!,
    resolutionIndexPaths: [relative(root, join(independentDirectory, 'resolution-index.json'))],
    resolutionSupersessions: [], resolutionWithdrawals: [], currentCanonicalBindingAuditPaths: [],
    currentCanonicalBindingAuditGoalIds: [], positiveEvidenceConfigPaths: [independentPPath] }
  const independentStage = await loadCurrentDescriptionEvidenceGates(mathConfig)
  assert.deepEqual(independentStage.descriptionIssues, [])
  assert.deepEqual(independentStage.evidenceIssues, [])
  assert.ok(independentStage.descriptionReady.has(independentId) && independentStage.evidenceReady.has(independentId),
    'Real historical V3 null/null D remains valid alongside a separate normally valid current P')
  const independentWithoutP = await loadCurrentDescriptionEvidenceGates({ ...mathConfig, positiveEvidenceConfigPaths: [] })
  assert.ok(independentWithoutP.descriptionReady.has(independentId) && !independentWithoutP.evidenceReady.has(independentId))
  assert.ok(!technicalProjection(independentWithoutP, mathConfig).strictCompleteGoalIds.includes(independentId), 'Independent D never waives the separate mandatory P gate')

  // Reuse genuinely produced corrected D/P report objects. Other subjects are only
  // transported here; no QA engine or M7 acceptance run is performed.
  const mathReport: DeepUnderstandingSubjectReport = { ...projected, subject: 'mathematik', label: 'Mathematik',
    landscapePath: registered.subjects.find((s) => s.subject === 'mathematik')!.landscapePath, landscapeId: mathState.scope.landscape.landscapeId! }
  const admitted = { schemaVersion: 1 as const, reportId: registered.reportId, subjects: [mathReport, projected], blockingIssueCount: mathReport.issues.length + projected.issues.length }
  assert.throws(() => assertRegisteredMathPhysicsNativeAcceptanceComplete(admitted), /acceptance is incomplete/u)
  let remainingCalls = 0
  const transport = await generateQualityNativeReport(admitted, async (_path, _observer, ids) => {
    remainingCalls++
    return { schemaVersion: 1, reportId: registered.reportId, subjects: registered.subjects.filter((s) => ids!.has(s.subject)).map((s) => ({ ...projected, subject: s.subject, label: s.label, issues: [`${s.subject}: technical transport fixture`] })), blockingIssueCount: 0 }
  })
  assert.equal(remainingCalls, 1)
  assert.strictEqual(transport.subjects.find((s) => s.subject === 'physik'), projected)
  assert.equal(transport.subjects.find((s) => s.subject === 'physik')!.strictCompletionReady, false)
  assert.deepEqual(transport.subjects.map((s) => s.subject), registered.subjects.map((s) => s.subject))
  assert.equal(stableGoalEvidenceJson(oldP) === stableGoalEvidenceJson(currentP), false)
  console.log('Current P freshness regression passed: actual 1064 owner→full native D→shared report/strict/CQR projection; semantic equality, body/input/metadata drift, invalid and duplicate claims, null contract, supersession, unchanged 807/478 scope. No full-engine or new review acceptance.')
} finally { rmSync(temp, { recursive: true, force: true }) }
