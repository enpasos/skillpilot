// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'
const root = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-one-analgesic-rezeptfrei-terminology-author-20261015-v1/'
const originalPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-six-final-wording-and-two-images-combined-context-20261015-v1/candidate/semantic560.six-description-source-identities.combined-author.json'
const canonicalPath = root + 'candidate/canonical560.current422.one-rezeptfrei-term.author.json'
const before = JSON.parse(readFileSync(originalPath, 'utf8'))
const after = structuredClone(before)
const canonical = JSON.parse(readFileSync(canonicalPath, 'utf8'))
const goalId = 'f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528'
const decision = after.decisions.find((d: any) => d.goalId === goalId)
decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(canonical.goals.find((g: any) => g.id === goalId))
if (JSON.stringify(before.decisions.filter((d: any) => d.goalId !== goalId)) !== JSON.stringify(after.decisions.filter((d: any) => d.goalId !== goalId))) throw Error('Other source identity changed')
for (const d of after.decisions) if (d.sourceFingerprint !== fingerprintSemanticKindSourceGoal(canonical.goals.find((g: any) => g.id === d.goalId))) throw Error('Stale source identity: ' + d.goalId)
const hash = (p: string) => 'sha256:' + createHash('sha256').update(readFileSync(p)).digest('hex')
const outputPath = root + 'candidate/semantic560.one-rezeptfrei-term.source-identity.author.json'
writeFileSync(outputPath, JSON.stringify(after, null, 2) + '\n', { flag: 'wx' })
writeFileSync(root + 'CAS.one-stock-source-identity-and-other559-exact.actual.json', JSON.stringify({ role: 'Pure technical source binding after actual author terminology correction; no new atomicity or other review vote', originalPath, originalSha256: hash(originalPath), canonicalPath, canonicalSha256: hash(canonicalPath), outputPath, outputSha256: hash(outputPath), changedSourceIdentityGoalId: goalId, other559WholeDecisionsExact: true, classificationAndBasisUnchanged: true, all560StockSourceIdentitiesChecked: true, newScientificVotes: 0 }, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ outputPath, sha256: hash(outputPath), all560StockSourceIdentitiesChecked: true }))
