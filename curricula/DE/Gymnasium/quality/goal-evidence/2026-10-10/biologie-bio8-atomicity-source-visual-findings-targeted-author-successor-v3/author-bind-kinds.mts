// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
const root = '/home/enpasos/projects/skillpilot/tmp/m7-bio8-findings-v3-author-isolated-capsule'
const { fingerprintSemanticKindSourceGoal } = await import(resolve(root, 'app/scripts/goalBookModel.ts'))
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/'
const old = base + 'biologie-biotechnologie-evolution-eight-current353-source-raster-native-technical-preparation-20261010-v1/'
const out = base + 'biologie-bio8-atomicity-source-visual-findings-targeted-author-successor-v3/'
const landscapePath = out + 'candidate/whole483-substantive-four-successors.inactive.json'
const before = JSON.parse(readFileSync('/home/enpasos/projects/skillpilot/' + old + 'candidate/kinds394.inactive.pending-technical.json', 'utf8'))
const landscape = JSON.parse(readFileSync(resolve(root, landscapePath), 'utf8'))
const map = new Map(before.decisions.map((r: any) => [r.goalId, r]))
const decisions = landscape.goals.map((g: any) => {
  const prior: any = map.get(g.id)
  const current = fingerprintSemanticKindSourceGoal(g)
  const kind = g.id === '523f7ef4-ed2b-5bda-8fc1-e4c4c94669a0' || g.id === 'd11b3b18-deec-5d1a-bff6-512cddf595a2'
    ? 'curricularArea' : prior?.semanticKind ?? 'curricularAtomic'
  return prior && prior.sourceFingerprint === current && prior.semanticKind === kind ? prior : {
    goalId: g.id, sourceFingerprint: current, semanticKind: kind, decisionStatus: 'authoritative',
    decisionBasis: 'author-current-classification-for-inactive-normal-compiler-only-independent-A-M-pending',
  }
})
const counts: Record<string, number> = { ...before.counts }
for (const key of Object.keys(counts)) counts[key] = 0
for (const row of decisions) counts[row.semanticKind] = (counts[row.semanticKind] ?? 0) + 1
counts.total = decisions.length
const ledger = { ...before, sourceLandscapePath: landscapePath, decisions, counts }
const file = resolve(root, out + 'candidate/kinds396.author-classification-only.json')
writeFileSync(file, JSON.stringify(ledger, null, 2) + '\n', { flag: 'wx' })
writeFileSync('/home/enpasos/projects/skillpilot/' + out + 'candidate/kinds396.author-classification-only.json', JSON.stringify(ledger, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ counts, classificationOnly: true, semanticAtomicApproval: false, memoryApproval: false }))
