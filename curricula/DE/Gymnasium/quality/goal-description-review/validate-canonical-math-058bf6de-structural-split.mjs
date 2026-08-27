#!/usr/bin/env node

import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '../../../../..')
const receiptName = 'canonical-math-058bf6de-structural-split-2026-08-27.receipt.json'
const adjudicationName = 'canonical-math-058bf6de-structural-split-2026-08-27.adjudication.json'
const receiptPath = path.join(here, receiptName)
const adjudicationPath = path.join(here, adjudicationName)
const canonicalPath = path.join(
  repoRoot,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
)
const compositionRoot = path.join(repoRoot, 'curricula/DE/Gymnasium/composition-views/mathematik')
const oldId = '058bf6de-6c0e-4298-b054-9e8dff6e6a66'
const reusedId = '325771e1-602d-4bca-a199-a8f39a2d3dee'
const ratioId = '671ef00a-034e-5c2b-85ef-c6fa6eb7f1f6'
const solvabilityId = 'cc60f759-1168-5fc0-8ff5-5f7a2533e61c'
const affectedViews = new Set([
  'de-by-gk.view.json',
  'de-by-lk.view.json',
  'de-he-gk-g8.view.json',
  'de-he-gk-g9.view.json',
  'de-he-lk-g8.view.json',
  'de-he-lk-g9.view.json',
  'de-he-seki-g8.view.json',
  'de-he-seki-g9.view.json',
  'de-sh-gk-g8.view.json',
  'de-sh-gk-g9.view.json',
  'de-sh-lk-g8.view.json',
  'de-sh-lk-g9.view.json',
  'de-sh-seki-g8.view.json',
  'de-sh-seki-g9.view.json',
])

const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex')
const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'))
const sourceId = (entry) => entry.legacyGoalId ?? entry.sourceGoalId
const sameSet = (left, right) => (
  JSON.stringify([...new Set(left)].sort()) === JSON.stringify([...new Set(right)].sort())
)
const assertBinding = (binding, label) => {
  const bytes = fs.readFileSync(path.join(repoRoot, binding.path))
  assert.equal(bytes.length, binding.bytes, `${label}: byte length drift`)
  assert.equal(sha256(bytes), binding.sha256, `${label}: SHA-256 drift`)
}
const isGoalReference = (value) => Boolean(
  value
  && typeof value === 'object'
  && ['goalEntry', 'canonicalSubtree'].includes(value.kind)
  && typeof value.goalId === 'string',
)
const countGoalReferences = (value, goalId) => {
  if (Array.isArray(value)) return value.reduce((sum, entry) => sum + countGoalReferences(entry, goalId), 0)
  if (!value || typeof value !== 'object') return 0
  const own = isGoalReference(value) && value.goalId === goalId ? 1 : 0
  return own + Object.values(value).reduce((sum, nested) => sum + countGoalReferences(nested, goalId), 0)
}

assert.equal(fs.existsSync(receiptPath), true, `missing receipt ${receiptPath}`)
const receipt = readJson(receiptPath)
const receiptPayload = structuredClone(receipt)
delete receiptPayload.receiptDigest
assert.equal(
  receipt.receiptDigest,
  `sha256:${sha256(Buffer.from(JSON.stringify(receiptPayload), 'utf8'))}`,
  'receipt digest drift',
)
assert.equal(receipt.receiptId, 'canonical-math-058bf6de-structural-split-2026-08-27-v1')
assert.equal(receipt.status, 'applied-locally-not-committed')
assert.deepEqual(receipt.counts, {
  retainedClusters: 1,
  reusedChildren: 1,
  newAtomicGoals: 2,
  logicalSourceRoutes: 11,
  historicalPhysicalOldOccurrences: 21,
  affectedCompositionViews: 14,
  assessmentCoveredGoalIdRewires: 0,
})
for (const [name, binding] of Object.entries(receipt.designBindings)) {
  if (name === 'adjudicationDigest') continue
  assertBinding(binding, `design binding ${name}`)
}
for (const binding of receipt.postApplyBindings) assertBinding(binding, binding.path)

const adjudication = readJson(adjudicationPath)
const adjudicationPayload = structuredClone(adjudication)
delete adjudicationPayload.adjudicationDigest
assert.equal(
  adjudication.adjudicationDigest,
  `sha256:${sha256(Buffer.from(JSON.stringify(adjudicationPayload), 'utf8'))}`,
  'adjudication digest drift',
)
assert.equal(receipt.designBindings.adjudicationDigest, adjudication.adjudicationDigest)
assert.equal(adjudication.sourceMappingRoutes.length, 11)
assert.equal(
  adjudication.sourceMappingRoutes.reduce(
    (sum, route) => sum + route.physicalOldOccurrences.length,
    0,
  ),
  21,
)

const canonical = readJson(canonicalPath)
const goalById = new Map(canonical.goals.map((goal) => [goal.id, goal]))
assert.equal(goalById.size, canonical.goals.length, 'duplicate canonical goal IDs')
const cluster = goalById.get(oldId)
assert(cluster, 'retained cluster is missing')
assert.equal(cluster.type, 'cluster')
assert.equal(cluster.weight, 3)
assert.deepEqual(cluster.requires, [])
assert.deepEqual(cluster.contains, [reusedId, ratioId, solvabilityId])
assert.equal(Object.hasOwn(cluster, 'semanticAtomic'), false)
assert.deepEqual(cluster.resourceLinks, [])
for (const childId of [ratioId, solvabilityId]) {
  const child = goalById.get(childId)
  assert(child, `new child ${childId} is missing`)
  assert.equal(child.type, 'atomic')
  assert.equal(child.semanticAtomic, true)
  assert.deepEqual(child.contains, [])
}
const year7 = goalById.get('5a7095a2-2b3a-48bf-9536-eca79ee5ff8c')
assert.equal(year7.contains.includes(oldId), true)
assert.equal(year7.contains.includes(reusedId), false, 'reused atom remains duplicated under Year 7')
const year8 = goalById.get('fa0b6b69-ce54-4711-90e6-26f27249cd71')
assert.equal(year8.requires.includes(oldId), false)
assert.equal(year8.requires.includes(ratioId), true)
const systemsMultiplicity = goalById.get('e42c208d-9555-43cc-92f5-5bb4c0688726')
assert.equal(systemsMultiplicity.requires.includes(solvabilityId), true)
assert.equal(systemsMultiplicity.requires.includes(reusedId), false)
for (const goal of canonical.goals) {
  assert.equal((goal.requires ?? []).includes(oldId), false, `${goal.id}: retained cluster remains a prerequisite`)
  assert.equal(
    (goal.examData?.coveredGoalIds ?? []).includes(oldId),
    false,
    `${goal.id}: retained cluster remains in assessment coverage`,
  )
}

for (const route of adjudication.sourceMappingRoutes) {
  const document = readJson(path.join(repoRoot, route.path))
  const targets = document.mappings
    .filter((entry) => sourceId(entry) === route.sourceGoalId)
    .map((entry) => entry.canonicalGoalId)
  assert.equal(sameSet(targets, route.afterCanonicalGoalIds), true, `${route.routeId}: mapping target drift`)
  if (document.decisions) {
    const decision = document.decisions.find((entry) => entry.sourceGoalId === route.sourceGoalId)
    assert(decision, `${route.routeId}: decision missing`)
    assert.deepEqual(decision.canonicalGoalIds, route.afterCanonicalGoalIds, `${route.routeId}: decision drift`)
  }
}

let affectedCount = 0
for (const entry of fs.readdirSync(compositionRoot, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.view.json')) continue
  const view = readJson(path.join(compositionRoot, entry.name))
  assert.equal(countGoalReferences(view, oldId), 0, `${entry.name}: stale retained-cluster projection`)
  const ratioCount = countGoalReferences(view, ratioId)
  const solvabilityCount = countGoalReferences(view, solvabilityId)
  if (affectedViews.has(entry.name)) {
    affectedCount += 1
    assert.equal(ratioCount, 1, `${entry.name}: ratio projection count`)
    assert.equal(solvabilityCount, 1, `${entry.name}: solvability projection count`)
    assert.equal(countGoalReferences(view, reusedId), 1, `${entry.name}: reused projection count`)
  } else {
    assert.equal(ratioCount, 0, `${entry.name}: unexpected ratio projection`)
    assert.equal(solvabilityCount, 0, `${entry.name}: unexpected solvability projection`)
  }
}
assert.equal(affectedCount, 14)

execFileSync('npm', ['exec', '--', 'tsx', 'scripts/applyMathBatch004StructuralSplit.ts'], {
  cwd: path.join(repoRoot, 'app'),
  stdio: 'inherit',
})

console.log('CHECK canonical_math_058bf6de_structural_split PASS routes=11 occurrences=21 views=14 newAtoms=2')
