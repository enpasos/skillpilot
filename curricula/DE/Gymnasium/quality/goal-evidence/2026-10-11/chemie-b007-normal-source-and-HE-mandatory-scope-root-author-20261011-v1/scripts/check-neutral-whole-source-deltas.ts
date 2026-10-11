import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { buildGoalBookSourceAtlasInputs, readGoalBookSourceAtlasInputConfig } from '../../../../../../../../app/scripts/goalBookSourceAtlasInputs'

const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-normal-source-and-HE-mandatory-scope-root-author-20261011-v1'
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const manifest = read(`${base}/FIRST.neutral-whole-source-scope-author-inputs.json`)
const normalPath = 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
const original = buildGoalBookSourceAtlasInputs(readGoalBookSourceAtlasInputConfig(normalPath))
const candidateInput = readGoalBookSourceAtlasInputConfig(manifest.sourceAtlasInput.path)
const exactCandidateConfig = { ...candidateInput, landscapePath: manifest.landscape.path }
const candidate = buildGoalBookSourceAtlasInputs(exactCandidateConfig)
assert.deepEqual(original.receipt.counts, candidate.receipt.counts)
const deltas = candidate.receipt.scopes.flatMap(scope => {
  const before = original.receipt.scopes.find(row => row.key === scope.key)!
  assert.ok(before)
  const added = scope.goalIds.filter((id: string) => !before.goalIds.includes(id))
  const removed = before.goalIds.filter((id: string) => !scope.goalIds.includes(id))
  return added.length || removed.length ? [{ key: scope.key, added, removed }] : []
})
assert.deepEqual(deltas, [{ key: 'DE-BY/SekI/', added: ['1351706f-4ea6-56e9-951b-87b24cbcdee8'], removed: [] }])
const by = candidate.receipt.scopes.find(row => row.key === 'DE-BY/SekI/')!
assert.deepEqual(by.witnesses.filter(row => row.goalId === '1351706f-4ea6-56e9-951b-87b24cbcdee8')
  .map(row => [row.sourceGoalId, row.mappedTargetGoalId, row.coverage, row.profileBasis]),
  [['d6ad6ab1-1c9a-5101-9b26-d2ed456d3089', '1351706f-4ea6-56e9-951b-87b24cbcdee8', 'direct', 'source-metadata']])
assert.deepEqual(candidate.receipt.omittedGoals, original.receipt.omittedGoals)
const declaredMappingPathChanges = new Map(manifest.mappingSuccessors.map((row: { inactiveCandidate: string; operativeInput: string }) => [row.inactiveCandidate, row.operativeInput]))
assert.deepEqual(candidate.receipt.unresolvedSourceScopes.map(row => ({ ...row,
  mappingPath: declaredMappingPathChanges.get(row.mappingPath) ?? row.mappingPath })), original.receipt.unresolvedSourceScopes)
const out = `${base}/checks/neutral-whole523-source-atlas.actual.json`
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, `${JSON.stringify({ schemaVersion: 1, role: 'root technical candidate check; not independent science',
  originalCounts: original.receipt.counts, candidateCounts: candidate.receipt.counts, scopeDeltas: deltas,
  actualBYscopeSize: by.goalIds.length, solubilityScopes: candidate.receipt.scopes.filter(row => row.goalIds.includes('413040cd-ba74-5227-948c-a778b0bd0f56')).map(row => row.key),
  omittedGoalsUnchanged: true, unresolvedDutiesPreservedWithDeclaredMappingPathChanges: Object.fromEntries(declaredMappingPathChanges), exactWhole523CandidateConfig: exactCandidateConfig,
  candidateConfigSha256: `sha256:${createHash('sha256').update(JSON.stringify(exactCandidateConfig, null, 2) + '\n').digest('hex')}`,
  helperSourceSha256: `sha256:${createHash('sha256').update(readFileSync('app/scripts/goalBookSourceAtlasInputs.ts')).digest('hex')}`,
  activeOutputWrites: 0, scienceApproval: false, humanApproval: false }, null, 2)}\n`)
console.log(JSON.stringify({ counts: candidate.receipt.counts, scopeDeltas: deltas, byScopeSize: by.goalIds.length, activeOutputWrites: 0 }))
