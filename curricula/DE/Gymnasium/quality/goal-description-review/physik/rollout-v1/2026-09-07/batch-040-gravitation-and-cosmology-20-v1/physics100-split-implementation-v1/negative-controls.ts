import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { buildLedgerCandidates } from './ledger-candidate.ts'
import { applyPhysicsB040AstroSplitMappings } from './generator-overlay-candidate.ts'

async function main() {
  const root = process.cwd(), own = dirname(fileURLToPath(import.meta.url))
  const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
  const authoring = read(resolve(own, 'authoring-input.json')), judgments = read(resolve(own, 'individual-am-judgments.json'))
  const beforeLandscape = read(resolve(root, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'))
  const afterLandscape = structuredClone(beforeLandscape)
  for (const c of authoring.clusterChanges) Object.assign(afterLandscape.goals.find((g: any) => g.id === c.goalId), c.after)
  for (const c of authoring.edgeChanges) afterLandscape.goals.find((g: any) => g.id === c.goalId).requires = structuredClone(c.after)
  afterLandscape.goals.push(...structuredClone(authoring.newGoals))
  const args = { root, beforeLandscape, afterLandscape, authoring, reviewedAt: judgments.reviewedAt, judgments: judgments.decisions }
  const positive = buildLedgerCandidates(args)
  const tests: any[] = []
  const reject = (name: string, run: () => any) => {
    try { run() } catch (error: any) { tests.push({ name, status: 'PASS_REJECTED', message: error.message }); return }
    throw new Error('Negative control was not rejected: ' + name)
  }
  const badBefore = structuredClone(beforeLandscape)
  badBefore.goals.find((g: any) => g.id === authoring.clusterChanges[0].goalId).title += ' [unexpected drift]'
  reject('exact old-parent wording lease', () => buildLedgerCandidates({ ...args, beforeLandscape: badBefore }))
  const badAfter = structuredClone(afterLandscape)
  badAfter.goals.find((g: any) => g.id === authoring.edgeChanges[0].goalId).requires = []
  reject('exact planned requires-after lease', () => buildLedgerCandidates({ ...args, afterLandscape: badAfter }))
  const duplicateAfter = structuredClone(afterLandscape)
  duplicateAfter.goals.push(structuredClone(authoring.newGoals[0]))
  reject('duplicate new UUID', () => buildLedgerCandidates({ ...args, afterLandscape: duplicateAfter }))
  const source = read(resolve(own, 'source-decisions.json')).records[0]
  reject('changed source wording cannot keep static generator reconciliation', () =>
    applyPhysicsB040AstroSplitMappings([{ ...source.beforeDecision, sourceSpan: source.beforeDecision.sourceSpan + ' changed' }], structuredClone(source.beforeMappings)))
  const native = await import(pathToFileURL(resolve(root, 'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
  const duplicate = native.compileCompositionView({
    viewId: 'b040-negative-control', landscapeId: beforeLandscape.landscapeId, scope: { schoolForm: 'Gymnasium', stage: 'CrossStage' },
    rootNodes: [{ kind: 'structure', id: 'negative-root', label: 'Astrophysik', children: [
      { kind: 'goalEntry', goalId: authoring.newGoals[0].id }, { kind: 'goalEntry', goalId: authoring.newGoals[0].id },
    ] }],
  }, afterLandscape)
  if (!duplicate.findings.some((f: any) => f.code === 'CPV-005' && f.severity === 'error')) throw new Error('Native duplicate-target control not detected')
  tests.push({ name: 'native duplicate learner-visible target', status: 'PASS_REJECTED', code: 'CPV-005' })
  console.log(JSON.stringify({ schemaVersion: 1, status: 'READ_ONLY_NEGATIVE_CONTROLS_PASS', executedAt: new Date().toISOString(),
    filesWritten: 0, positiveLedgerScope: positive.receipt.finalScope, negativeControls: tests }))
}
main().catch(error => { console.error(error.stack ?? error); process.exitCode = 1 })
