import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const model = await import(pathToFileURL(resolve(root, 'app/scripts/goalBookModel.ts')).href)
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const current = read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-four-package-joint576-portable-technical-context-20261016-v1/candidate/CANONICAL.joint576.closed-schema-and-six-assets.technical-preview.json')
const before = read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-current426-five-genuine-informed-PA-bindings-technical-20261015-v1/candidate/canonical570.current426.final-two-texts-and-genuine96-PNG.inactive.json')
const oldLedger = read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-current426-five-genuine-informed-PA-bindings-technical-20261015-v1/candidate/semantic570.current426.two-genuine-text-context-bindings.final.json')
const byId = new Map(before.goals.map((g: any) => [g.id, g]))
const oldDecision = new Map(oldLedger.decisions.map((d: any) => [d.goalId, d]))
const changes = []
let unchanged = 0
for (const goal of current.goals) {
  const b: any = byId.get(goal.id)
  if (!b) continue
  const oldFingerprint = model.fingerprintSemanticKindSourceGoal(b)
  const currentFingerprint = model.fingerprintSemanticKindSourceGoal(goal)
  if (oldFingerprint !== (oldDecision.get(goal.id) as any).sourceFingerprint) throw new Error(`Stale original ledger ${goal.id}`)
  if (oldFingerprint === currentFingerprint) { unchanged += 1; continue }
  const changedFields = [...new Set([...Object.keys(b), ...Object.keys(goal)])].filter(k => JSON.stringify(b[k]) !== JSON.stringify(goal[k]))
  changes.push({goalId: goal.id, title: goal.title, oldKind: (oldDecision.get(goal.id) as any).semanticKind, changedFields})
}
console.log(JSON.stringify({ unchangedSemanticSourceFingerprints: unchanged, changedExistingCount: changes.length, changes }, null, 2))
