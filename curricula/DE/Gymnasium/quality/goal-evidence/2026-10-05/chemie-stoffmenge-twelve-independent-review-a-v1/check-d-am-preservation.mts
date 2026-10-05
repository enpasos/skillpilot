// SPDX-License-Identifier: Apache-2.0
// Independent D/A/M preservation checks. P files are deliberately excluded.
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { compileCompositionView, normalizeCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const own = dirname(fileURLToPath(import.meta.url)), root = resolve(own, '../../../../../../..')
const author = resolve(own, '../chemie-stoffmenge-quantitative-foundations-twelve-candidate-v1')
const read = async (path: string) => JSON.parse(await readFile(path, 'utf8'))
const local = (path: string) => resolve(root, path)
const hash = (value: Buffer | string) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const same = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b)
const errors: string[] = [], expect = (ok: boolean, message: string) => { if (!ok) errors.push(message) }
const normalizeText = (value: unknown) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim()
const stable = (value: any): string => Array.isArray(value) ? `[${value.map(stable).join(',')}]`
  : value && typeof value === 'object' ? `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${stable(v)}`).join(',')}}` : JSON.stringify(value)
// Exact payload fields read from repository A/M checker; a fingerprint match is not substantive approval.
const fingerprint = (goal: any, ruleVersion: string) => hash(stable({ ruleVersion, goalId: goal.id,
  shortKey: goal.shortKey ?? '', title: normalizeText(goal.title), titleEn: normalizeText(goal.titleEn),
  description: normalizeText(goal.description), descriptionEn: normalizeText(goal.descriptionEn),
  phase: normalizeText(goal.dimensionTags?.phase), area: normalizeText(goal.dimensionTags?.area),
  topicCode: normalizeText(goal.dimensionTags?.topicCode), nodeKind: normalizeText(goal.nodeKind) }))
const jsonl = async (path: string) => (await readFile(local(path), 'utf8')).split('\n').filter(Boolean).map(line => JSON.parse(line))
const delta = await read(resolve(author, 'canonical.delta.candidates.json'))
const snapshot = await read(resolve(author, 'current-goals-and-bindings.snapshot.json'))
const source = await read(resolve(author, 'current-primary-source-and-mapping.snapshot.json'))
const am = await read(resolve(author, 'memory-and-visual-preservation.candidates-v2.json'))
const canonical = await read(local(snapshot.canonicalPath)), byId = new Map<string, any>(canonical.goals.map((g: any) => [g.id, g]))
const candidateById = new Map(byId), changed = []
for (const row of snapshot.goals) expect(same(byId.get(row.goal.id), row.goal), `Current whole goal differs: ${row.goal.id}`)
for (const row of delta.goals) {
  const current = byId.get(row.goalId)
  for (const [key, value] of Object.entries(row.before)) expect(same(current[key], value), `Current semantic snapshot differs: ${row.goalId} ${key}`)
  expect(same(row.before.requires, row.afterCandidate.requires) && same(row.before.contains, row.afterCandidate.contains), `Topology changed: ${row.goalId}`)
  const fields = [...new Set([...Object.keys(row.before), ...Object.keys(row.afterCandidate)])].filter(k => !same(row.before[k], row.afterCandidate[k]))
  if (fields.length) changed.push({ goalId: row.goalId, fields, authorDecision: row.descriptionDecision })
  // The salt narrowing is diagnostic only; adoption overlay includes precisely the eleven admissible author entries.
  if (!row.goalId.startsWith('965ca297')) candidateById.set(row.goalId, { ...current, ...row.afterCandidate })
}
expect(delta.goals.length === 12 && snapshot.goals.length === 13, 'Expected twelve assigned plus retained950 snapshot')
expect(changed.length === 2 && changed.find(r => r.goalId.startsWith('11bea4c6'))?.fields.join() === 'descriptionEn', 'Unexpected operative fields changed')

for (const row of source.sourceExtractionFiles) expect(hash(await readFile(local(row.path))) === `sha256:${row.sha256}`, `Source extraction bytes changed: ${row.path}`)
for (const row of source.selectedMappingRows) {
  const mapping = await read(local(row.mappingPath))
  expect(hash(await readFile(local(row.mappingPath))) === `sha256:${row.mappingFileSha256}`, `Mapping bytes changed: ${row.mappingPath}`)
  expect(mapping.mappings.some((r: any) => same(r, row.mapping)), `Selected mapping lost: ${row.mapping.legacyGoalId}`)
  const extraction = await read(local(mapping.sourceExtractionPath))
  expect(same(extraction.sourceGoals.find((g: any) => g.id === row.sourceGoal.id), row.sourceGoal), `Selected source clause snapshot changed: ${row.sourceGoal.id}`)
}
const registry = await read(local('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'))
const subject = registry.subjects.find((r: any) => r.subject === 'chemie')
expect(subject.memoryReviewConfigPath === am.memoryConfigPath, 'Author memory config is no longer the registered config')
const memoryConfig = await read(local(am.memoryConfigPath))
expect(hash(await readFile(local(am.memoryConfigPath))) === `sha256:${am.memoryConfigSha256}`, 'Memory config bytes changed')
const memoryRecords = await jsonl(memoryConfig.reviewPath), cardRecords = await jsonl(memoryConfig.cardReviewPath)
const deck = await read(local(am.memoryDeckPath))
expect(hash(await readFile(local(am.memoryDeckPath))) === `sha256:${am.memoryDeckSha256}`, 'Existing deck bytes changed')
const aRecords: any[] = []
for (const configPath of subject.semanticAtomicityConfigPaths) {
  const config = await read(local(configPath))
  for (const record of await jsonl(config.reviewPath)) if (delta.goals.some((g: any) => g.goalId === record.goalId)) aRecords.push({ configPath, ruleVersion: config.ruleVersion, ...record })
}
const memoryRows = [], atomicRows = []
for (const row of am.memoryCandidates) {
  const actual = memoryRecords.find((r: any) => r.goalId === row.goalId)
  expect(same(actual, row.currentReview), `Current memory decision differs: ${row.goalId}`)
  expect(actual?.fingerprint === fingerprint(byId.get(row.goalId), memoryConfig.ruleVersion), `Current M fingerprint stale: ${row.goalId}`)
  for (const card of row.actualRelevantCards) expect(same(deck.cards.find((r: any) => r.id === card.id), card), `Current card differs: ${card.id}`)
  for (const card of row.currentCardReviewRecords) {
    const current = cardRecords.find((r: any) => r.deckId === card.deckId && r.cardId === card.cardId)
    expect(same(current, card), `Current card decision differs: ${card.cardId}`)
    const content = deck.cards.find((r: any) => r.id === card.cardId)
    const fp = hash(stable({ ruleVersion: memoryConfig.ruleVersion, deckId: deck.deckId, cardId: content.id,
      front: normalizeText(content.front), back: normalizeText(content.back), category: normalizeText(content.category),
      tags: content.tags.map((t: string) => normalizeText(t)).filter(Boolean) }))
    expect(card.fingerprint === fp && card.status === 'kept' && card.necessary && card.originGoalIds.includes(row.goalId), `Card fingerprint/origin invalid: ${card.cardId}`)
  }
  memoryRows.push({ goalId: row.goalId, currentStatus: actual.status, currentFingerprintValid: true,
    candidateFingerprint: fingerprint(candidateById.get(row.goalId), memoryConfig.ruleVersion),
    candidateRequiresNewBinding: actual.fingerprint !== fingerprint(candidateById.get(row.goalId), memoryConfig.ruleVersion),
    existingCardIds: row.actualRelevantCards.map((c: any) => c.id), reviewerSubstantiveDecisionIsSeparate: true })
  const records = aRecords.filter(r => r.goalId === row.goalId)
  expect(records.length > 0, `Current A record missing: ${row.goalId}`)
  const a = records.find(r => r.fingerprint === fingerprint(byId.get(row.goalId), r.ruleVersion))
  expect(Boolean(a), `Current A fingerprint stale: ${row.goalId}`)
  atomicRows.push({ goalId: row.goalId, currentStatus: a?.status, currentSemanticAtomic: a?.semanticAtomic,
    currentFingerprintValid: Boolean(a), candidateRequiresNewBinding: a?.fingerprint !== fingerprint(candidateById.get(row.goalId), a?.ruleVersion),
    saltCandidateExcludedFromAdoptionOverlay: row.goalId.startsWith('965ca297') })
}
const visibility = []
const originalLandscape = normalizeCanonicalLandscape(canonical)
const candidateLandscape = normalizeCanonicalLandscape({ ...canonical, goals: [...candidateById.values()] })
for (const scope of memoryConfig.visibilityScopes) {
  const raw = await read(local(scope.viewPath)), view = normalizeCompositionView(raw)
  const before = compileCompositionView(view, originalLandscape), after = compileCompositionView(view, candidateLandscape)
  const beforeErrors = before.findings.filter(f => f.severity === 'error'), afterErrors = after.findings.filter(f => f.severity === 'error')
  expect(same(beforeErrors, afterErrors), `Configured memory view errors changed: ${scope.label}`)
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, candidateById)
  for (const row of am.memoryCandidates.filter((r: any) => r.currentReview.status === 'memory_required')) {
    const targetVisible = roles.targetGoalIds.has(row.goalId)
    const visibleMemoryIds = row.currentReview.memoryGoalIds.filter((id: string) => roles.targetGoalIds.has(id))
    expect(!targetVisible || visibleMemoryIds.length > 0, `Required memory target hidden: ${scope.label} ${row.goalId}`)
    visibility.push({ viewPath: scope.viewPath, goalId: row.goalId, ordinaryTargetVisible: targetVisible,
      memoryTargetIdsVisible: visibleMemoryIds, staticTargetVisibilityPassed: true, runtimeYearFrontierClaim: false })
  }
}
const assetRows = []
const qa = await read(local(am.visualQaPath))
const qaRecords = Array.isArray(qa) ? qa : qa.goals ?? qa.records ?? qa.items
for (const row of am.visualCandidates) {
  if (qaRecords) expect(same(qaRecords.find((r: any) => r.goalId === row.goalId), row.currentQaRecord), `Selected current V record changed: ${row.goalId}`)
  for (const asset of row.assets) for (const copy of asset.copies) {
    expect(copy.exists && hash(await readFile(local(copy.path))) === `sha256:${copy.sha256}`, `Existing image bytes changed: ${copy.path}`)
    assetRows.push({ path: copy.path, exactBytesRetained: true, freshVisualApproval: false })
  }
}
const receipt = { schemaVersion: 1, checkedAtUtc: new Date().toISOString(), independentReviewer: 'codex-chemie-stoffmenge-twelve-review-a',
  status: errors.length ? 'FAIL' : 'PASS_targeted_D_A_M_preservation', positiveEvidenceOpened: false,
  selectedWholeGoalSnapshotsCurrent: snapshot.goals.length, assignedGoals: delta.goals.length,
  operativeFieldChanges: changed, saltScopeCandidateExcludedFromAdoptionOverlay: true,
  currentSourceRowBindingsChecked: source.selectedMappingRows.length, normativeAllStateApprovalClaimed: false,
  memoryRows, atomicRows, currentCardsAndDeckBytesRetained: true, configuredMemoryVisibility: visibility,
  existingImageCopyBindings: assetRows, freshVisualApprovalClaimed: false,
  activeWrites: [], strictClosures: 0, humanApprovals: 0, errors }
await writeFile(resolve(own, 'D-A-M-preservation.check.receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`)
console.log(JSON.stringify({ status: receipt.status, snapshots: snapshot.goals.length, sourceRows: source.selectedMappingRows.length,
  memoryGoalRows: memoryRows.length, visibilityChecks: visibility.length, imageCopies: assetRows.length, errors }))
if (errors.length) process.exitCode = 1
