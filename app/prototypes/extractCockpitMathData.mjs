import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const output = new URL('./cockpit-math.snapshot.json', import.meta.url)
const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  composition: 'curricula/DE/Gymnasium/composition-views/mathematik/de-he-sekii-gk.view.json',
  scope: 'curricula/DE/Gymnasium/completion-scopes/math-dot-product-projection.json',
  historicalProfile: 'curricula/DE/Gymnasium/completion-profiles/math-dot-product-projection.json',
  task: 'curricula/DE/Gymnasium/assessments/mathematik/sekii/q2/dot-projection-notation-20261031-v1/tasks.md',
  deck: 'curricula/DE/Gymnasium/memory-decks/de_gymnasium_math_flashcards_linalg_core.de.json',
  memoryReview: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
  historicalReview: 'curricula/DE/Gymnasium/quality/assessment-completion/math-dot-product-projection-2026-10-31.md',
}
const contents = Object.fromEntries(Object.entries(paths).map(([key, path]) => [key, readFileSync(`${root}/${path}`, 'utf8')]))
const canonical = JSON.parse(contents.canonical)
const byId = new Map(canonical.goals.map(goal => [goal.id, goal]))
const scope = JSON.parse(contents.scope)
const composition = JSON.parse(contents.composition)
const ordinaryId = '3016ec37-1c2e-47db-83f5-e767923bc97e'
const assessmentId = 'e98672c6-871a-5d0b-889c-5afc51040f0d'
const memoryId = 'bd55594a-3e06-5097-8324-4f2f1349fd2a'
const motivationId = '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2'
assert.deepEqual(scope.targetRootIds, [ordinaryId, assessmentId])
const selected = new Set()
const pending = [ordinaryId, assessmentId, memoryId]
while (pending.length) {
  const id = pending.pop()
  if (selected.has(id)) continue
  const goal = byId.get(id)
  assert(goal, `Missing canonical reference ${id}`)
  selected.add(id)
  pending.push(...(goal.requires ?? []), ...(goal.contains ?? []))
}
const kind = goal => goal.nodeKind === 'memory' ? 'memory'
  : goal.nodeKind === 'exam' || goal.examData ? 'assessment'
    : goal.semanticKind === 'orientation' ? 'motivation' : 'goal'
const parents = id => canonical.goals.filter(goal => (goal.contains ?? []).includes(id))
  .map(goal => ({ id: goal.id, title: goal.title }))
const reaches = (rootId, target, seen = new Set()) => {
  if (rootId === target) return true
  if (seen.has(rootId)) return false
  seen.add(rootId)
  return (byId.get(rootId)?.contains ?? []).some(id => reaches(id, target, seen))
}
const compositionReferences = []
const walk = (nodes, structurePath = []) => nodes.forEach(node => {
  if (node.kind === 'structure') walk(node.children ?? [], [...structurePath, node.id])
  else for (const targetId of [ordinaryId, assessmentId]) {
    if (node.goalId === targetId || node.kind === 'canonicalSubtree' && reaches(node.goalId, targetId)) {
      compositionReferences.push({ targetId, viewId: composition.viewId, structurePath,
        kind: node.kind, goalId: node.goalId, projectionRole: node.projectionRole ?? 'target' })
    }
  }
})
walk(composition.rootNodes)
const memoryReview = contents.memoryReview.trim().split('\n').map(line => JSON.parse(line))
  .find(record => record.goalId === ordinaryId)
assert.equal(memoryReview.status, 'no_memory_needed')
const exam = byId.get(assessmentId).examData
assert.equal(exam.scoring.maxPoints, 10)
assert.equal(exam.scoring.passingPoints, 10)
assert.deepEqual(exam.coveredGoalIds, [ordinaryId])
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')
const imageSize = bytes => {
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), mimeType: 'image/png' }
  }
  assert.equal(bytes.readUInt16BE(0), 0xffd8, 'Only an existing JPEG or PNG is supported')
  const frameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf])
  let offset = 2
  while (offset + 8 < bytes.length) {
    assert.equal(bytes[offset], 0xff, 'Invalid JPEG segment')
    while (bytes[offset] === 0xff) offset++
    const marker = bytes[offset++]
    const length = bytes.readUInt16BE(offset)
    if (frameMarkers.has(marker)) return {
      width: bytes.readUInt16BE(offset + 5), height: bytes.readUInt16BE(offset + 3), mimeType: 'image/jpeg',
    }
    assert.ok(length >= 2, 'Invalid JPEG segment length')
    offset += length
  }
  throw new Error('JPEG dimensions not found')
}
const assetBindings = []
const visualizationsByGoalId = Object.fromEntries([ordinaryId, assessmentId].map(goalId => {
  const resources = (byId.get(goalId).resourceLinks ?? [])
    .filter(resource => resource.type === 'goal-visualization' && resource.resourceType === 'image')
  const images = resources.map(resource => {
    assert.equal(resource.skillpilotId, goalId, 'A visualization must belong to this exact goal')
    const prefix = '/assets/goal-visualizations/'
    assert.ok(resource.url.startsWith(prefix) && !resource.url.includes('..'), 'Only the existing local visualization resource is allowed')
    const sourcePath = `curricula/DE/Gymnasium/visualizations/${resource.url.slice(prefix.length)}`
    const publicPath = `app/public${resource.url}`
    const bytes = readFileSync(`${root}/${sourcePath}`)
    const publicBytes = readFileSync(`${root}/${publicPath}`)
    assert.ok(bytes.equals(publicBytes), 'Existing public visualization must match its canonical bytes')
    const metadata = { goalId, url: resource.url, sourcePath, publicPath,
      sha256: sha256(bytes), publicSha256: sha256(publicBytes), bytes: bytes.length, ...imageSize(bytes),
      title: resource.title, altText: resource.altText, reviewStatus: resource.reviewStatus }
    assetBindings.push(metadata)
    return metadata
  })
  const primary = resources.findIndex(resource => resource.role === 'primary')
  return [goalId, { goalId, status: images.length ? 'available' : 'not-authored', resources,
    image: images[primary < 0 ? 0 : primary] ?? null }]
}))
const snapshot = {
  licensing: { content: 'CC-BY-4.0', reference: 'LICENSES/CC-BY-4.0.txt',
    attribution: 'SkillPilot / enpasos – Enterprise Patterns & Solutions GmbH',
    changes: 'Bounded source extraction for a local prototype; original goal, task and card texts retained.' },
  sourcePaths: paths,
  sourceSha256: Object.fromEntries(Object.entries(contents).map(([key, text]) => [key, createHash('sha256').update(text).digest('hex')])),
  scope: { title: scope.title.de, historicalScopeId: scope.id, ordinaryId, assessmentId, motivationId, memoryId,
    targetGoalIds: [ordinaryId, assessmentId], memoryTargetIds: [] },
  goals: [...selected].sort().map(id => {
    const goal = byId.get(id)
    return { id, title: goal.title, description: goal.description ?? '', kind: kind(goal),
      requires: goal.requires ?? [], contains: goal.contains ?? [], role: scope.targetRootIds.includes(id) ? 'target' : 'external',
      canonicalParents: parents(id), sourcePath: paths.canonical }
  }),
  targetCanonicalParents: Object.fromEntries([ordinaryId, assessmentId].map(id => [id, parents(id)])),
  compositionReferences,
  visualizationsByGoalId, assetBindings,
  assessment: { goalId: assessmentId, taskContent: exam.taskContent, solutionContent: exam.solutionContent,
    scoring: exam.scoring, coveredGoalIds: exam.coveredGoalIds, reviewStatus: exam.reviewStatus,
    reviewNote: exam.reviewNote, sourcePath: paths.task },
  cards: { goalId: memoryId, ...JSON.parse(contents.deck), isExternal: true,
    notice: 'Vollständiges vorhandenes Deck als zusätzlicher Kontext. Es gehört nicht zum Zwei-Target-Ausschnitt.' },
  memoryReview,
}
const serialized = `${JSON.stringify(snapshot, null, 2)}\n`
if (process.argv.includes('--check')) {
  assert.equal(readFileSync(output, 'utf8'), serialized, 'Cockpit snapshot differs from current bounded source files')
  console.log(`PASS: cockpit snapshot matches ${Object.keys(paths).length} source files and ${assetBindings.length} byte-exact local visualization(s); ${selected.size} resolved canonical goals, 2 targets, full external deck.`)
} else {
  writeFileSync(output, serialized)
  console.log(`Wrote ${fileURLToPath(output)}`)
}
