// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const root = process.cwd()
const rel = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-bacterial-structure-fission-native-candidate-v1'
const own = resolve(root, rel)
const meta = JSON.parse(readFileSync(resolve(own, 'prospective-paths.json'), 'utf8'))
const iso = meta.isolationRoot
const read = (path: string) => JSON.parse(readFileSync(resolve(iso, path), 'utf8'))
const write = (path: string, value: unknown) => writeFileSync(resolve(iso, path), JSON.stringify(value, null, 2) + '\n')
const { fingerprintSemanticKindSourceGoal } = await import(pathToFileURL(resolve(iso, 'app/scripts/goalBookModel.ts')).href)
const canonical = read(meta.canonicalPath), semantic = read(meta.semanticPath), qa = read(meta.qaPath)
const plan = JSON.parse(readFileSync(resolve(own, 'native-image-import-plan.json'), 'utf8'))
const priorCanon = JSON.parse(readFileSync(resolve(own, 'current-canonical.before.snapshot.json'), 'utf8'))
const priorQA = JSON.parse(readFileSync(resolve(root, meta.qaPath), 'utf8'))
const strict = JSON.parse(readFileSync(resolve(own, 'baseline-active-biology.report.json'), 'utf8')).subjects.find((s: any) => s.subject === 'biologie').strictCompleteGoalIds
const semanticDeltas = []
for (const id of meta.changedCanonicalGoalIds) {
  const goal = canonical.goals.find((g: any) => g.id === id)
  assert.ok(goal)
  let decision = semantic.decisions.find((r: any) => r.goalId === id)
  if (!decision) {
    decision = { goalId: id, semanticKind: 'curricularAtomic', decisionStatus: 'authoritative', decisionBasis: 'reviewed-current-post-split-curricular-atomic' }
    semantic.decisions.push(decision)
  }
  const before = decision.sourceFingerprint
  decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
  semanticDeltas.push({ goalId: id, before, after: decision.sourceFingerprint, kind: decision.semanticKind, meaning: 'technical source binding after explicit inactive author scope decision; not independent scientific approval' })
}
semantic.counts.total = 443
semantic.counts.curricularAtomic = 365
write(meta.semanticPath, semantic)
const assets = []
for (const visual of plan.visuals) {
  const goal = canonical.goals.find((g: any) => g.id === visual.id)
  const link = goal.resourceLinks.find((l: any) => l.type === 'goal-visualization' && l.role === 'primary')
  const paths = [`curricula/DE/Gymnasium/visualizations/biologie/${visual.id}/${visual.id}.png`, `app/public${link.url}`, `backend/src/main/resources/static${link.url}`]
  const actual = paths.map(path => ({ path, sha256: 'sha256:' + createHash('sha256').update(readFileSync(resolve(iso, path))).digest('hex') }))
  assert.ok(actual.every(row => row.sha256 === visual.sha256))
  assets.push({ goalId: visual.id, paths: actual, title: goal.title, description: goal.description, altText: link.altText, provider: link.provider, pixelsChanged: false, independentCurrentV: 'pending' })
  let row = qa.records.find((r: any) => r.goalId === visual.id)
  if (!row) {
    row = { ...qa.records.find((r: any) => r.goalId === meta.goalIds[0]), goalId: visual.id }
    qa.records.push(row)
  }
  Object.assign(row, { title: goal.title, description: goal.description, subject: 'biologie', landscapeId: canonical.landscapeId,
    landscapePath: meta.canonicalPath, visualizationState: 'available', missingReason: '', imageUrl: link.url,
    publicAssetPath: paths[1], canonicalAssetPath: paths[0], assetSha256: visual.sha256,
    umlautsCorrectChatGpt: 'no', contentApprovedChatGpt: 'no', humanApproved: 'no', humanIssueIdentified: 'no', humanIssueDescription: '',
    humanReviewedAt: null, humanReviewer: '', chatGptReviewedAt: null, chatGptReviewer: '',
    chatGptNotes: 'Exact independently reviewed candidate pixels retained; prospective stable-ID/title/alt/source/prerequisite binding remains pending current independent inspection.',
    aiApproved: 'no', aiApprovedAssetSha256: '', aiReviewedAt: null, aiReviewer: '', aiNotes: '' })
}
for (const id of strict) {
  assert.deepEqual(canonical.goals.find((g: any) => g.id === id), priorCanon.goals.find((g: any) => g.id === id))
  assert.deepEqual(qa.records.find((r: any) => r.goalId === id), priorQA.records.find((r: any) => r.goalId === id))
}
write(meta.qaPath, qa)
writeFileSync(resolve(own, 'classification-and-assets.actual.author.receipt.json'), JSON.stringify({
  status: 'inactive_author_native_binding', prospectiveGoalCount: 443, prospectiveCurricularAtomic: 365,
  semanticDeltas, assets, allCurrent40FullGoalObjectsAndVRowsUnchanged: true,
  currentIndependentScientificAndVApproval: 'pending', humanApproval: false, activeWrites: 0,
}, null, 2) + '\n')
console.log(JSON.stringify({ prospectiveGoalCount: 443, prospectiveCurricularAtomic: 365, exactImportedPNGs: 2, old40FullGoalAndVRowsPreserved: true, activeWrites: 0 }))
