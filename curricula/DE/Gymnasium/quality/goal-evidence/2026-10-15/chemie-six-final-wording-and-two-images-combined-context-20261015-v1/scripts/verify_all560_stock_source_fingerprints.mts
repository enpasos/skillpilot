// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../../app/scripts/goalBookModel.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repo = resolve(root, '../../../../../../..')
const hash = (data: Buffer) => `sha256:${createHash('sha256').update(data).digest('hex')}`
const pin = (path: string) => ({ path: relative(repo, path), sha256: hash(readFileSync(path)), bytes: readFileSync(path).length })
const canonicalPath = resolve(root, 'candidate/canonical560.current422.six-wording-two-PNG.combined-author.json')
const semanticPath = resolve(root, 'candidate/semantic560.six-description-source-identities.combined-author.json')
const canonical = JSON.parse(readFileSync(canonicalPath, 'utf8'))
const semantic = JSON.parse(readFileSync(semanticPath, 'utf8'))
const by = new Map(semantic.decisions.map((d: any) => [d.goalId, d]))
if (canonical.goals.length !== 560 || semantic.decisions.length !== 560 || by.size !== 560) throw Error('Expected exact560')
const rows = canonical.goals.map((goal: any) => {
  const decision: any = by.get(goal.id)
  const actual = fingerprintSemanticKindSourceGoal(goal)
  if (!decision || decision.sourceFingerprint !== actual) throw Error(`Stale source identity ${goal.id}`)
  return { goalId: goal.id, actualStockSourceFingerprint: actual, exactStoredSourceFingerprint: true }
})
const receipt = {
  schemaVersion: 1,
  role: 'Actual unmodified normal stock source-fingerprint execution, no semantic atomicity or other scientific vote',
  canonical: pin(canonicalPath), semantic: pin(semanticPath),
  stockModule: pin(resolve(repo, 'app/scripts/goalBookModel.ts')),
  stockExport: 'fingerprintSemanticKindSourceGoal', usesUnmodifiedRepositoryImplementation: true,
  actualGoalCalls: rows.length, storedIdentitiesVerified: rows.length,
  existingSemanticClassificationsAndDecisionBasisReassessed: false,
  nativeBuildPerformed: false, wholeCheckPerformed: false,
  rows,
}
writeFileSync(resolve(root, 'checks/STOCK.all560-normal-source-fingerprints.actual.json'), JSON.stringify(receipt, null, 2) + '\n')
console.log(JSON.stringify({ actualGoalCalls: rows.length, storedIdentitiesVerified: rows.length, stockModuleSha256: receipt.stockModule.sha256 }))
