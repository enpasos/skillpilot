import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const [executionRoot, ownRoot] = process.argv.slice(2)
if (!executionRoot || !ownRoot) throw new Error('Expected physical execution root and repository-relative author root')
const execution = resolve(executionRoot)
const own = resolve(ownRoot)
const sourcePath = resolve(own, 'positive/P37.source-author-records.before-final-normal-bind.jsonl')
const source = (await readFile(sourcePath, 'utf8')).trim().split('\n').map((line) => JSON.parse(line))
const base = JSON.parse(await readFile(resolve(own, 'configs/normal-P-final-binding.inputs.json'), 'utf8'))
const modulePath = resolve(execution, 'app/scripts/materializePositiveGoalEvidenceCandidates.ts')
const stockBytes = await readFile(resolve('app/scripts/materializePositiveGoalEvidenceCandidates.ts'))
const executionBytes = await readFile(modulePath)
if (!stockBytes.equals(executionBytes)) throw new Error('Private execution stock module is not exact production bytes')
const { buildPositiveGoalEvidenceCandidateRecords } = await import(pathToFileURL(modulePath).href)
const bound = []
const comparisons = []
for (const original of source) {
  const config = {
    ...base,
    reviewId: original.reviewId,
    reviewPath: `${ownRoot}/positive/P37.final-normal.author-candidates.jsonl`,
    scope: { label: 'One exact original author candidate; mechanical stock final-input binding only', goalIds: [original.goalId] },
  }
  const candidateSet = {
    schemaVersion: 1,
    authoringContract: 'positive-understanding-evidence-candidates-v1',
    reviewId: original.reviewId,
    reviewedAt: original.reviewedAt,
    reviewer: original.reviewer,
    goals: [{ goalId: original.goalId, reason: original.reason, evidenceLevel: original.evidenceLevel, maximumClaimScope: original.maximumClaimScope, dissent: original.dissent, profile: original.profile }],
  }
  const [record] = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet })
  const changed = [...new Set([...Object.keys(original), ...Object.keys(record)])].filter((key) => JSON.stringify(original[key]) !== JSON.stringify(record[key]))
  if (changed.some((key) => !['goalFingerprint', 'reviewInputFingerprint', 'profileFingerprint'].includes(key))) {
    throw new Error(`Mechanical binding altered non-fingerprint source content: ${original.goalId} ${changed.join(',')}`)
  }
  bound.push(record)
  comparisons.push({ goalId: original.goalId, changedFields: changed, profileExactlyRetained: JSON.stringify(original.profile) === JSON.stringify(record.profile), sourceMetadataExactlyRetained: true, before: Object.fromEntries(changed.map((key) => [key, original[key]])), after: Object.fromEntries(changed.map((key) => [key, record[key]])), newScientificVote: false })
}
const output = resolve(own, 'positive/P37.final-normal.author-candidates.jsonl')
await writeFile(output, `${bound.map((record) => JSON.stringify(record)).join('\n')}\n`, { flag: 'wx' })
const report = {
  schemaVersion: 1,
  kind: 'Exact production positive-evidence candidate materializer called on final frozen normalized landscape, SEM and actual public resource bytes',
  productionModule: { path: 'app/scripts/materializePositiveGoalEvidenceCandidates.ts', sha256: `sha256:${createHash('sha256').update(stockBytes).digest('hex')}` },
  productionImplementationChanged: false,
  records: bound.length,
  comparisons,
  newIndependentVotes: 0,
  humanApproval: false,
  statusUnchanged: 'needs_human_review / ai_candidate',
}
await writeFile(resolve(own, 'checks/P37.stock-final-normal-materialization.actual.json'), `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' })
console.log(JSON.stringify({ records: bound.length, changedFingerprintRows: comparisons.filter((row) => row.changedFields.length).length, output: `${ownRoot}/positive/P37.final-normal.author-candidates.jsonl` }))
