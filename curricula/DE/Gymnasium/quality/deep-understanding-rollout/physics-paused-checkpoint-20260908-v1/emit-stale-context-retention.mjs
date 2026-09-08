// Read-only patch emitter: no historical review, resolution, or digest is rebound.
import fs from 'node:fs'
const base = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/physics-paused-checkpoint-20260908-v1'
const registryPath = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const parse = p => JSON.parse(fs.readFileSync(p, 'utf8'))
const encode = x => JSON.stringify(x, null, 2) + '\n'
const registry = parse(registryPath)
const physics = registry.subjects.find(s => s.subject === 'physik')
const excluded = new Set([
  '7d78da7f-6af5-440a-9d6b-6cab4bee8dd2',
  '50877233-7abf-54df-b347-6d3224678fc9',
  '1b060e79-dc2d-5e4e-abb5-42eca39f9cc7',
  '3d466956-04fb-58d7-9008-ad8090f8706d',
  '68034218-8f3e-5f7f-ae4e-ed057dd4e44e',
  'af5dfdbc-5fd6-5c3e-a81b-093cb7c14b93',
  'c2af45aa-e3fc-5119-9159-c5a260b4135a',
  'c52d55c3-b687-586c-b0f9-8ffcd1069424',
  'db0394ca-297c-5892-b414-525ec186f928',
])
let patch = '*** Begin Patch\n'
const add = (p, x) => {
  if (fs.existsSync(p)) throw Error('Refuse existing derivative ' + p)
  patch += '*** Add File: ' + p + '\n' + encode(x).trimEnd().split('\n').map(s => '+' + s).join('\n') + '\n'
}
const retainedPaths = []
const removedClaims = []
const replacements = []
for (const path of physics.resolutionIndexPaths) {
  const index = parse(path)
  const removed = index.resolutions.filter(r => excluded.has(r.goalId))
  if (!removed.length) { retainedPaths.push(path); continue }
  const next = structuredClone(index)
  next.resolutions = index.resolutions.filter(r => !excluded.has(r.goalId))
  next.groups = index.groups.map(g => ({ ...g, resolvedGoalCount: next.resolutions.filter(r => r.groupId === g.groupId).length })).filter(g => g.resolvedGoalCount)
  next.artifactSetId += '-paused-current-context-retention-20260908-v1'
  next.curriculumAtomicDenominator = 478
  next.strictDescriptionReviewCompleteCount = next.resolutions.length
  next.descriptionReviewPercentage = Math.round(next.resolutions.length / 478 * 1000) / 10
  const nextPath = path.replace(/\.json$/, '.paused-context-current-20260908-v1.json')
  if (!next.resolutions.length) throw Error('Unexpected empty subset ' + path)
  add(nextPath, next)
  retainedPaths.push(nextPath)
  replacements.push({ path, nextPath, retained: next.resolutions.length })
  removedClaims.push(...removed.map(r => ({ goalId: r.goalId, originalIndex: path, resolutionPath: r.resolutionPath, resolutionDigest: r.resolutionDigest })))
}
if (removedClaims.length !== 9 || new Set(removedClaims.map(r => r.goalId)).size !== 9 || replacements.length !== 3) throw Error('Unexpected context-claim delta')
patch += '*** Update File: ' + registryPath + '\n'
for (const { path, nextPath } of replacements) patch += '@@\n-        "' + path + '",\n+        "' + nextPath + '",\n'

const kinds = parse(physics.semanticKindLedgerPath).decisions
const atoms = kinds.filter(k => k.semanticKind === 'curricularAtomic').map(k => k.goalId)
const closed = new Set(physics.resolutionIndexPaths.flatMap(p => parse(p).resolutions.map(r => r.goalId)).filter(id => !excluded.has(id)))
if (atoms.length !== 478 || closed.size !== 422) throw Error('Unexpected native checkpoint denominator/claims')
const goals = new Map(parse(physics.landscapePath).goals.map(g => [g.id, g]))
const remaining = new Set(atoms.filter(id => !closed.has(id)))
const order = [], seen = new Set(), visiting = new Set()
function visit(id) {
  if (seen.has(id)) return
  if (visiting.has(id)) throw Error('Unexpected requires cycle')
  visiting.add(id)
  for (const req of goals.get(id).requires ?? []) if (remaining.has(req)) visit(req)
  visiting.delete(id); seen.add(id); order.push(id)
}
for (const id of remaining) visit(id)
if (order.length !== 56) throw Error('Expected 56 held goals')
for (let n = 1; n <= 3; n++) {
  const p = `curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-08/paused-current-remaining-${n}-20260908-v1.config.json`
  const before = parse(p), after = structuredClone(before)
  after.goalIds = order.slice((n - 1) * 20, n * 20)
  patch += '*** Update File: ' + p + '\n@@\n' + encode(before).trimEnd().split('\n').map(s => '-' + s).join('\n') + '\n' + encode(after).trimEnd().split('\n').map(s => '+' + s).join('\n') + '\n'
}
const cacheReceipt = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-08/physics100-traffic-flow-audit-v1/pause-applicability-cache-consolidation-receipt-a-20260908.json'
add(base + '/stale-context-retention.receipt.json', {
  schemaVersion: 1, checkedAt: new Date().toISOString(),
  reason: 'Native V3 canonical-context equality failed for these nine claims after the recorded applicability-cache correction. Existing compiled target sets are preserved, but that does not authorize rebinding sealed review inputs.',
  historicalArtifactsChanged: false, newReviewsStarted: false, humanApproval: false,
  nativeBefore: { descriptions: 431, denominator: 478 },
  nativeCurrentExpected: { descriptions: 422, denominator: 478, heldGoals: 56 },
  cacheReceipt, cacheChanges: parse(cacheReceipt).cacheChanges.filter(c => excluded.has(c.goalId)),
  removedClaims, retainedSubsets: replacements,
})
patch += '*** End Patch\n'
process.stdout.write(patch)
