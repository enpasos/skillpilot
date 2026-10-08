// SPDX-License-Identifier: Apache-2.0
// Ordinary inactive structural binding and native context preparation; no review results.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.env.BASIS2_WORKSPACE_ROOT!
const own = process.env.BASIS2_AUTHOR_OUTPUT!
assert.ok(root && own)
const cap = resolve('.')
const prep = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-basis2-current-reviewed-integration-preparation-resumed-v1')
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const write = (path: string, value: any) => {
  assert.ok(!existsSync(path), `Preserve earlier artifact: ${path}`)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n')
}
const bind = (path: string) => {
  const bytes = readFileSync(path)
  return { path: relative(root, path), sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length }
}
const mod = (name: string) => import(pathToFileURL(resolve(cap, 'app/scripts', name)).href)
const bookApi = await mod('goalBookModel.ts')
const baselineApi = await import(pathToFileURL(resolve(root, 'app/scripts/goalBookModel.ts')).href)
const configPath = 'app/scripts/config/goal-books/de-gym-biology-national-atlas.json'
const { model: baseline } = await baselineApi.loadGoalBookBuildInputs(resolve(root, configPath))
assert.equal(baseline.pages.length, 392)
write(resolve(own, 'before/current392.ordinary-loader.whole-model.json'), baseline)

const preparation = read(resolve(own, 'candidate-preparation.actual.json'))
const canonPath = resolve(cap, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
const canon = read(canonPath)
const kindsRelative = 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
const kinds = read(resolve(cap, kindsRelative))
const oldKinds = read(resolve(prep, 'before/kinds.exact.json'))
const goals = new Map(canon.goals.map((goal: any) => [goal.id, goal]))
const oldKindMap = new Map(oldKinds.decisions.map((decision: any) => [decision.goalId, decision]))
const changedBindings: any[] = []
for (const decision of kinds.decisions) {
  const fingerprint = bookApi.fingerprintSemanticKindSourceGoal(goals.get(decision.goalId))
  if (decision.sourceFingerprint !== fingerprint) {
    const original = oldKindMap.get(decision.goalId) as any
    const before = structuredClone(decision)
    if (decision.goalId === preparation.oldSharedCluster) {
      assert.equal(original.sourceFingerprint, fingerprint)
      Object.keys(decision).forEach(key => delete decision[key])
      Object.assign(decision, structuredClone(original))
    } else {
      assert.equal(decision.goalId, preparation.rootGoalId, 'Only root/shared structure fingerprints may need refreshing.')
      decision.sourceFingerprint = fingerprint
    }
    changedBindings.push({ goalId: decision.goalId, before, after: structuredClone(decision), technicalReason: 'Exact restored shared-cluster classification or root contains-only structural binding; no new D/P/A/M/V scientific acceptance.' })
  }
}
const supplement = goals.get(preparation.newSupplementId)
kinds.decisions.push({
  goalId: preparation.newSupplementId,
  sourceFingerprint: bookApi.fingerprintSemanticKindSourceGoal(supplement),
  semanticKind: 'curricularArea', decisionStatus: 'authoritative',
  decisionBasis: 'authored-root-level-limited-sek1-supplement-curricular-area',
})
kinds.decisions.sort((a: any, b: any) => a.goalId.localeCompare(b.goalId))
kinds.counts.curricularArea += 1
kinds.counts.total += 1
assert.equal(kinds.counts.total, 479)
assert.equal(kinds.counts.curricularAtomic, 394)
const candidateKinds = resolve(own, 'candidate/semantic-kinds479.source-supplement394.inactive.json')
write(candidateKinds, kinds)
assert.ok(!readFileSync(resolve(cap, kindsRelative)).equals(readFileSync(candidateKinds)))
copyFileSync(candidateKinds, resolve(cap, kindsRelative))
write(resolve(own, 'checks/structural-kind-bindings.actual.json'), {
  role: 'Technical structural classification candidate, no D/P/A/M/V scientific review',
  changedOriginalBindings: changedBindings,
  newSupplementDecision: kinds.decisions.find((decision: any) => decision.goalId === preparation.newSupplementId),
  oldTwoNewCurricularAtomicDecisionsExactlyPreserved: preparation.newGoalIds.every((gid: string) => {
    const earlier = read(resolve(own, 'before/kinds478.capsule.exact.json')).decisions.find((decision: any) => decision.goalId === gid)
    return bookApi.stableGoalBookJson(earlier) === bookApi.stableGoalBookJson(kinds.decisions.find((decision: any) => decision.goalId === gid))
  }),
  candidateKinds: bind(candidateKinds), activeWrites: 0, independentApproval: false,
})
console.log('PASS: ordinary structural kinds candidate479/394; root/shared only and one new curricularArea.')
