// Apache-2.0. Native preparation only; independent current D/P/A/M review pending.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const root = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next25-orbital-nano-targeted-author-v3'
const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-next-coherent-current-gap-native-author-v2'
const load = (p: string) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const write = (name: string, value: unknown) => writeFileSync(resolve(root, own, name), JSON.stringify(value, null, 2) + '\n', { flag: 'wx' })
const model = await import(pathToFileURL(resolve(root, 'app/scripts/goalBookModel.ts')).href)
const canonPath = own + '/canonical.nine-goal-final-resources-and-two-targeted-corrections.candidate.json'
const canonical = load(canonPath)
const goals = new Map(canonical.goals.map((g: any) => [g.id, g]))
const oldKinds = load(author + '/semantic-kinds.current-authority.prospective-bindings.candidate.json')
const kinds = structuredClone(oldKinds)
kinds.sourceLandscapePath = canonPath
const changedKindBindings: string[] = []
for (const [index, row] of kinds.decisions.entries()) {
  const nativeFingerprint = model.fingerprintSemanticKindSourceGoal(goals.get(row.goalId))
  if (row.sourceFingerprint !== nativeFingerprint) {
    changedKindBindings.push(row.goalId)
    row.sourceFingerprint = nativeFingerprint
  }
  const old = oldKinds.decisions[index]
  assert.equal(row.goalId, old.goalId)
  const { sourceFingerprint: _new, ...newDecision } = row
  const { sourceFingerprint: _old, ...oldDecision } = old
  assert.deepEqual(newDecision, oldDecision)
}
assert.deepEqual(new Set(changedKindBindings), new Set(['5e2eb826-6e60-5273-91d6-c23f6dfa33b1', '0acc8cd2-be6d-567e-a023-1d9e90475510']))
// This file is explicitly an unsealed pending binding candidate, not historical evidence.
writeFileSync(resolve(root, own, 'semantic-kinds.native-bindings.pending-candidate.json'), JSON.stringify(kinds, null, 2) + '\n')
const full = await model.loadGoalBookBuildInputs(own + '/full378.targeted-candidate.book.config.json', root)
assert.equal(full.model.pages.length, 378)
write('full378.targeted-candidate.book-model.json', full.model)
const oldModel = load(author + '/qa-artifacts/full-prospective378.book-model.json')
const oldPages = new Map(oldModel.pages.map((p: any) => [p.goalId, p]))
const pageDeltas = full.model.pages.filter((p: any) => model.stableGoalBookJson(p) !== model.stableGoalBookJson(oldPages.get(p.goalId)))
assert.deepEqual(pageDeltas.map((p: any) => p.goalId), ['0acc8cd2-be6d-567e-a023-1d9e90475510'])
const oldCanon = load(author + '/canonical.final-png-current.author-candidate.json')
const goalDeltas = canonical.goals.filter((g: any, index: number) => model.stableGoalBookJson(g) !== model.stableGoalBookJson(oldCanon.goals[index]))
assert.equal(goalDeltas.length, 2)
write('native-two-targeted-bindings-and-one-page-continuity.actual.json', {
  documentType: 'inert native bindings and actual complete model comparison; not new science approval',
  checkedAtUTC: new Date().toISOString(),
  actual479KindDecisionBodiesExact: true,
  actualChangedKindBindings: changedKindBindings,
  wholeNativePagesExactToFinalAuthorV2: 377,
  changedNativePages: pageDeltas,
  actualWholeGoalDeltas: goalDeltas,
  candidateOnly: true, activeWrites: false,
  D_P_A_MFollowupPending: true, strictNetGain: 0, humanApproval: false, humanTrial: false,
})
console.log('PASS479 exact kind decision bodies, PASS378 full model,377 whole pages exact; only orbital page changes. Nano metadata is not a new D/P performance.')
