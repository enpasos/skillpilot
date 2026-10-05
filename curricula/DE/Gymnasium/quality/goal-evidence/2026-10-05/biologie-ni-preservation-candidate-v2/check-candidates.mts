// SPDX-License-Identifier: Apache-2.0
import { createRequire } from 'node:module'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { sourceAtlasDescendants } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'

const directory = dirname(fileURLToPath(import.meta.url))
const root = resolve(directory, '../../../../../../..')
const require = createRequire(resolve(root, 'app/package.json'))
const Ajv2020 = require('ajv/dist/2020.js').default
const addFormats = require('ajv-formats').default
const read = async (path: string) => JSON.parse(await readFile(path, 'utf8'))
const candidates = await read(resolve(directory, 'positive-evidence.candidates.json'))
const delta = await read(resolve(directory, 'canonical.delta.candidates.json'))
const current = await read(resolve(directory, 'current-bindings.snapshot.json'))
const sourceDelta = await read(resolve(directory, 'source-extraction.delta.candidates.json'))
const mapDelta = await read(resolve(directory, 'mapping.delta.candidates.json'))
const landscape = await read(resolve(root, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'))
const ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ajv)
const schema = await read(resolve(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const validate = ajv.compile({ $schema: 'https://json-schema.org/draft/2020-12/schema', $defs: schema.$defs, ...schema.$defs.profile })
const errors: string[] = []
for (const candidate of candidates.goals) {
  if (!validate(candidate.profile)) errors.push(`${candidate.goalId}: ${ajv.errorsText(validate.errors)}`)
  const expectations = new Set(candidate.profile.expectations.map((e: { id: string }) => e.id))
  for (const id of candidate.profile.coverageExpectations.requiredExpectationIds) {
    if (!expectations.has(id)) errors.push(`${candidate.goalId}: unknown required expectation ${id}`)
  }
  if (candidate.profile.applicationCaseBriefs.length < 2) errors.push(`${candidate.goalId}: fewer than two fresh cases`)
}
const overlay = new Map(landscape.goals.map((g: any) => [g.id, structuredClone(g)]))
for (const goal of delta.newGoals) {
  if (overlay.has(goal.id)) errors.push(`New goal ID already exists: ${goal.id}`)
  overlay.set(goal.id, goal)
}
for (const change of delta.currentGoalDeltas) {
  const actual: any = overlay.get(change.goalId)
  for (const [key, before] of Object.entries(change.before)) {
    if (JSON.stringify(actual[key]) !== JSON.stringify(before)) errors.push(`${change.goalId}: stale before ${key}`)
  }
  overlay.set(change.goalId, { ...actual, ...change.after })
}
for (const change of delta.parentContainsDeltas) {
  const actual: any = overlay.get(change.goalId)
  if (JSON.stringify(actual.contains) !== JSON.stringify(change.before)) errors.push(`${change.goalId}: stale parent contains`)
  overlay.set(change.goalId, { ...actual, contains: change.after })
}
for (const relation of ['requires', 'contains']) {
  const visited = new Set<string>()
  const visiting = new Set<string>()
  const visit = (id: string) => {
    if (!overlay.has(id)) { errors.push(`${relation}: missing goal ${id}`); return }
    if (visiting.has(id)) { errors.push(`${relation}: cycle at ${id}`); return }
    if (visited.has(id)) return
    visiting.add(id)
    for (const target of (overlay.get(id) as any)[relation] ?? []) visit(target)
    visiting.delete(id)
    visited.add(id)
  }
  for (const id of overlay.keys()) visit(id as string)
}
const atomIds = new Set([...overlay.values()].filter((g: any) => g.type === 'atomic' && !g.contains?.length).map((g: any) => g.id))
const newIds = delta.newGoals.map((g: any) => g.id)
const rootGoal = landscape.goals.find((g: any) => g.tags?.includes('root'))
const inheritedAtoms = sourceAtlasDescendants(rootGoal.id, overlay as any, atomIds, landscape.landscapeId)
for (const id of newIds) {
  if (inheritedAtoms.includes(id)) errors.push(`${id}: broad root mapping incorrectly inherits into new boundary goal`)
  const direct = sourceAtlasDescendants(id, overlay as any, atomIds, landscape.landscapeId)
  if (JSON.stringify(direct) !== JSON.stringify([id])) errors.push(`${id}: direct source mapping cannot reach its boundary goal`)
}
for (const change of sourceDelta.sourceGoalDeltas) {
  const snapshot = current.sourceGoals.find((g: any) => g.id === change.sourceGoalId)
  if (JSON.stringify(snapshot) !== JSON.stringify(change.before)) errors.push(`${change.sourceGoalId}: source before does not match snapshot`)
}
for (const change of mapDelta.sourceGoalDeltas) {
  const mapped = change.afterRows.map((g: any) => g.canonicalGoalId)
  if (JSON.stringify(mapped) !== JSON.stringify(change.afterDecisionCandidate.canonicalGoalIds)) errors.push(`${change.sourceGoalId}: proposed mapping rows and decision disagree`)
  for (const id of mapped) if (!overlay.has(id)) errors.push(`${change.sourceGoalId}: proposed target missing ${id}`)
}
// All checks remain read-only with respect to canonical/source/registry files.
const receipt = {
  schemaVersion: 1, checkedAt: new Date().toISOString(),
  status: errors.length ? 'fail' : 'pass_inactive_candidate_structure',
  fullInnerProfiles: candidates.goals.length,
  freshCases: candidates.goals.reduce((s: number, g: any) => s + g.profile.applicationCaseBriefs.length, 0),
  proposedNewAtomicIds: newIds, revisedCurrentGoalIds: delta.currentGoalDeltas.map((g: any) => g.goalId),
  proposedDagCheck: 'requires and contains references/acyclicity checked against current full landscape overlay',
  broadAncestorBoundaryCheck: 'actual sourceAtlasDescendants helper denies root inheritance while allowing direct mapping of both new atoms',
  candidateFileHashes: await Promise.all(['canonical.delta.candidates.json', 'positive-evidence.candidates.json', 'source-extraction.delta.candidates.json', 'mapping.delta.candidates.json'].map(async (name) => ({ name, sha256: `sha256:${createHash('sha256').update(await readFile(resolve(directory, name))).digest('hex')}` }))),
  activeFilesChangedByChecker: false, currentStrictClosuresClaimed: 0,
  claimLimit: 'Schema/reference/candidate-DAG checks do not prove independent content review, grade-resolved runtime frontier, legal or human approval, current canonical evidence bindings, or strict M7.', errors,
}
await writeFile(resolve(directory, 'candidate-check.receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`)
console.log(JSON.stringify(receipt))
if (errors.length) process.exitCode = 1
