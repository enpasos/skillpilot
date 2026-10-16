// SPDX-License-Identifier: Apache-2.0
// Read-only finite calls into unchanged stock predicates; no science authoring.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'

const repo = process.cwd()
const planPath = resolve(process.argv[2])
const outputPath = resolve(process.argv[3])
const load = (p: string) => JSON.parse(readFileSync(resolve(repo, p), 'utf8'))
const plan = load(planPath)
const host = resolve(repo, plan.executionHost)
const stock = async (name: string) => import(pathToFileURL(resolve(host, 'app/scripts', name)).href)
const { fingerprintSemanticKindSourceGoal } = await stock('goalBookModel.ts')
const { hasCompletedDeepUnderstandingVisualizationReview } = await stock('reportDeepUnderstandingRollout.ts')
const { fingerprintPositiveGoalEvidenceReviewInput, fingerprintGoalForPositiveEvidence } = await stock('positiveGoalEvidenceProfileModel.ts')
const hash = (path: string) => `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`
const ref = (path: string) => ({ path, sha256: hash(resolve(repo, path)), bytes: readFileSync(resolve(repo, path)).length })
const normalize = (s: unknown) => String(s ?? '').replace(/\s+/gu, ' ').trim()
const candidate = load(plan.canonical.path)
const semantic = load(plan.semantic.path)
const qa = load(plan.finalQAOutputPath)
const goals = new Map(candidate.goals.map((g: any) => [g.id, g])) as Map<string, any>
const semantics = new Map(semantic.decisions.map((d: any) => [d.goalId, d])) as Map<string, any>
const rows = new Map(qa.records.map((r: any) => [r.goalId, r])) as Map<string, any>
assert.equal(goals.size, 570)
assert.equal(semantics.size, 570)
assert.equal(rows.size, 443)
const semanticResults = [...goals].map(([goalId, g]) => ({
  goalId,
  actual: fingerprintSemanticKindSourceGoal(g),
  recorded: semantics.get(goalId)?.sourceFingerprint,
}))
const atomResults = semantic.decisions.filter((d: any) => d.semanticKind === 'curricularAtomic').map((d: any) => {
  const g = goals.get(d.goalId)
  const r = rows.get(d.goalId)
  const links = (g.resourceLinks ?? []).filter((l: any) => l.type === 'goal-visualization' && (l.role ?? 'primary') === 'primary')
  const metadataCurrent = !!r && r.goalId === g.id && r.title === normalize(g.title) && r.description === normalize(g.description)
    && r.landscapePath === plan.normalCanonicalPath && r.landscapeId === candidate.landscapeId
  const oneCurrentPrimary = links.length === 1 && !!r && links[0].url === r.imageUrl
  const publicPath = r ? resolve(host, r.publicAssetPath) : ''
  const canonicalPath = r ? resolve(host, r.canonicalAssetPath) : ''
  const actualPublic = publicPath && existsSync(publicPath) ? hash(publicPath) : null
  const actualCanonical = canonicalPath && existsSync(canonicalPath) ? hash(canonicalPath) : null
  const exactAssets = !!r && actualPublic === r.assetSha256 && actualCanonical === r.assetSha256
  const stockV = !!r && hasCompletedDeepUnderstandingVisualizationReview(r)
  const sourceFingerprintCurrent = fingerprintSemanticKindSourceGoal(g) === d.sourceFingerprint
  return { goalId: g.id, sourceFingerprintCurrent, metadataCurrent, oneCurrentPrimary, actualPublic, actualCanonical,
    recordedAsset: r?.assetSha256 ?? null, exactAssets, unchangedStockVPredicate: stockV,
    pass: sourceFingerprintCurrent && metadataCurrent && oneCurrentPrimary && exactAssets && stockV }
})
assert.equal(atomResults.length, 426)

const baseline = load(plan.baselineSelector.path)
const central = load(baseline.actualCentralConfig.path)
const chemie = central.subjects.find((s: any) => s.subject === 'chemie')
const goalId = '0773a104-aaeb-5e96-a615-2a2bec3eb096'
const oldGoal = load(baseline.canonical.path).goals.find((g: any) => g.id === goalId)
const currentGoal = goals.get(goalId)
const effectiveSemanticKind = semantics.get(goalId).semanticKind
const pBindings = []
for (const configPath of chemie.positiveEvidenceConfigPaths) {
  const config = load(configPath)
  if (!config.scope?.goalIds?.includes(goalId)) continue
  const record = readFileSync(resolve(repo, config.reviewPath), 'utf8').split(/\r?\n/u).filter(Boolean)
    .map((line: string) => JSON.parse(line)).find((r: any) => r.goalId === goalId)
  assert.ok(record)
  const digestInputs = (goal: any) => {
    const digests: Record<string, string> = {}
    if (config.reviewedResourceTypes.includes('goal-visualization')) {
      for (const link of goal.resourceLinks ?? []) if (link.type === 'goal-visualization') {
        assert.ok(link.url.startsWith('/assets/goal-visualizations/'))
        digests[link.url] = hash(resolve(host, 'app/public', link.url.slice(1)))
      }
    }
    return digests
  }
  const oldDigests = digestInputs(oldGoal)
  const newDigests = digestInputs(currentGoal)
  const oldReviewInput = fingerprintPositiveGoalEvidenceReviewInput(oldGoal, record.reviewCriteriaFingerprint, oldDigests, effectiveSemanticKind)
  const currentReviewInput = fingerprintPositiveGoalEvidenceReviewInput(currentGoal, record.reviewCriteriaFingerprint, newDigests, effectiveSemanticKind)
  const currentGoalFingerprint = fingerprintGoalForPositiveEvidence(currentGoal, effectiveSemanticKind)
  pBindings.push({ goalId, config: ref(configPath), records: ref(config.reviewPath), reviewedResourceTypes: config.reviewedResourceTypes,
    criteria: ref(config.reviewCriteriaPath), effectiveSemanticKind,
    recordedGoalFingerprint: record.goalFingerprint, currentGoalFingerprint,
    recordedReviewInputFingerprint: record.reviewInputFingerprint,
    baselineComputedReviewInputFingerprint: oldReviewInput, currentComputedReviewInputFingerprint: currentReviewInput,
    baselineResourceDigests: oldDigests, currentResourceDigests: newDigests,
    staleBeforeThreeLinks: oldReviewInput !== record.reviewInputFingerprint,
    staleAfterThreeLinks: currentReviewInput !== record.reviewInputFingerprint,
    linkChangeAltersReviewInputFingerprint: oldReviewInput !== currentReviewInput,
    noPositiveRecordOrScienceChanged: true })
}
assert.equal(pBindings.length, 1)
const result = {
  schemaVersion: 1, role: 'Read-only exact stock V predicate and P fingerprint helper; no scientific decisions',
  sourceCanonical: plan.canonical, sourceSemantic: plan.semantic, sourceQA: ref(plan.finalQAOutputPath),
  stockModelSnapshot: plan.stockModelAndComponentSnapshot,
  semanticSourceFingerprints: { total: 570, current: semanticResults.filter((r: any) => r.actual === r.recorded).length, results: semanticResults },
  strictVisualization: { expectedAtoms: 426, passed: atomResults.filter((r: any) => r.pass).length, failed: atomResults.filter((r: any) => !r.pass), results: atomResults },
  readOnly077PositiveEvidenceBinding: pBindings,
  noCentralOrNativeOrNewEvidence: true,
}
assert.ok(!existsSync(outputPath))
writeFileSync(outputPath, JSON.stringify(result, null, 2) + '\n')
const pass = result.semanticSourceFingerprints.current === 570 && result.strictVisualization.passed === 426
console.log(JSON.stringify({ semanticCurrent: result.semanticSourceFingerprints.current, strictV: result.strictVisualization.passed,
  scope: 426, failed: result.strictVisualization.failed, readOnly077P: pBindings.map((r: any) => ({
    staleBefore: r.staleBeforeThreeLinks, staleAfter: r.staleAfterThreeLinks, linkChangesFingerprint: r.linkChangeAltersReviewInputFingerprint,
  })), pass }))
if (!pass) process.exitCode = 1
