import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { derivePackageEntry } from './learningUnitsMathPackageEntry'
import { canonicalJson, digest, mathCanonicalPath } from './learningUnitsMathAuthoring'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const config = read('app/scripts/config/learning-units/math-package-entry.json')
const overview = read(`curricula/${config.originalOverviewPath}`); const mathematics = read(mathCanonicalPath)
const originalSha = digest(canonicalJson(overview)); const mathSha = digest(canonicalJson(mathematics))
const entry = derivePackageEntry(overview, mathematics, config)
assert.equal(digest(canonicalJson(overview)), originalSha); assert.equal(digest(canonicalJson(mathematics)), mathSha)
assert.equal(overview.goals[0].contains.length, 20, 'Full Gymnasium root retains all subject children')
assert.deepEqual(entry.goals.map((goal: any) => ({ id: goal.id, kind: goal.semanticKind, type: goal.type, nodeKind: goal.nodeKind,
  contains: goal.contains, requires: goal.requires })), [{ id: config.entryRootGoalId, kind: 'programStructure', type: 'cluster', nodeKind: undefined, contains: [config.mathematicsRootGoalId], requires: [] }])
assert.deepEqual(entry.filters, overview.filters)
function expectedFlow(value: any): any {
  if (Array.isArray(value)) return value.map(expectedFlow)
  if (!value || typeof value !== 'object') return value
  const result = structuredClone(value)
  for (const key of Object.keys(result)) {
    if (key === 'landscapeIds') result[key] = [config.mathematicsLandscapeId]
    else if ((key === 'landscapeId' || key === 'targetLandscapeId') && result[key] === overview.landscapeId) result[key] = config.entryLandscapeId
    else result[key] = expectedFlow(result[key])
  }
  return result
}
assert.deepEqual(entry.personalizationFlow, expectedFlow(overview.personalizationFlow))
assert.ok(!entry.goals[0].examData && !entry.goals[0].extendedData && !entry.goalPlacements && !entry.programUnits)
assert.throws(() => derivePackageEntry(overview, mathematics, { ...config, entryLandscapeId: mathematics.landscapeId }))
assert.throws(() => derivePackageEntry(overview, mathematics, { ...config, entryRootGoalId: config.mathematicsRootGoalId }))
console.log('Package entry: independent E/e identities, original20-subject root and Math unchanged, one structural Math child, exact constrained preflow/filter derivation, no atomic/exam/acquisition result')
