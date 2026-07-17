import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  aiApprovalStatus,
  isAiApprovedForCurrentAsset,
  type AiApprovalRecord,
} from '../src/utils/goalVisualizationQaStatus'

interface QaApprovalRecord extends AiApprovalRecord {
  goalId: string
  title?: string
  visualizationState: 'available' | 'missing'
  humanApproved?: unknown
  humanIssueIdentified?: unknown
}

interface QaLedger {
  schemaVersion: number
  subject: string
  records: QaApprovalRecord[]
}

export const hasCurrentGoalVisualizationApproval = (record: QaApprovalRecord): boolean => {
  // An explicit human NOK always wins over automated evidence for the same image.
  if (record.humanIssueIdentified === 'yes') return false
  return record.humanApproved === 'yes' || isAiApprovedForCurrentAsset(record)
}

export const unapprovedActiveGoalVisualizations = (
  records: QaApprovalRecord[],
): QaApprovalRecord[] => records.filter((record) => (
  record.visualizationState === 'available'
  && !hasCurrentGoalVisualizationApproval(record)
))

const scriptDir = fileURLToPath(new URL('.', import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

const requestedSubjects = (argv: string[]): string[] => argv
  .flatMap((arg) => arg.replace(/^--subjects?=/u, '').split(','))
  .map((subject) => subject.trim())
  .filter(Boolean)

const main = (): void => {
  const subjects = requestedSubjects(process.argv.slice(2))
  const selectedSubjects = subjects.length > 0
    ? subjects
    : ['mathematik', 'physik', 'chemie']
  const failures: string[] = []

  selectedSubjects.forEach((subject) => {
    assert.match(subject, /^[a-z][a-z0-9-]*$/u, `Invalid subject slug: ${subject}`)
    const qaPath = resolve(
      repoRoot,
      `curricula/DE/Gymnasium/quality/goal-visualization-qa/${subject}.qa.json`,
    )
    const ledger = JSON.parse(readFileSync(qaPath, 'utf8')) as QaLedger
    assert.equal(ledger.schemaVersion, 1, `${subject}: unsupported QA schema`)
    assert.equal(ledger.subject, subject, `${subject}: QA subject mismatch`)
    assert.ok(Array.isArray(ledger.records), `${subject}: QA records must be an array`)

    const active = ledger.records.filter((record) => record.visualizationState === 'available')
    active.forEach((record) => {
      assert.match(
        String(record.assetSha256 ?? ''),
        /^sha256:[0-9a-f]{64}$/u,
        `${subject}:${record.goalId}: active record has no valid asset hash`,
      )
    })
    const unapproved = unapprovedActiveGoalVisualizations(ledger.records)
    if (unapproved.length > 0) {
      failures.push(
        `${subject}: ${unapproved.length} active goal visualization(s) have neither Human=OK nor a current Approved-AI decision:`,
        ...unapproved.map((record) => (
          `- ${record.goalId} (${record.title ?? 'untitled'}): human=${record.humanIssueIdentified === 'yes' ? 'NOK' : 'open'}, ai=${aiApprovalStatus(record)}`
        )),
      )
      return
    }

    console.log(`${subject}: approval coverage passed (${active.length} active visualization(s)).`)
  })

  if (failures.length > 0) {
    console.error(failures.join('\n'))
    process.exit(1)
  }
}

const invokedScriptPath = process.argv[1] ? resolve(process.argv[1]) : ''
if (invokedScriptPath === fileURLToPath(import.meta.url)) {
  main()
}
