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

// Product-owner-directed display of one known-imperfect image is not a V approval.
// Keep this exact-asset exception separate from the approval predicate above:
// curricula/DE/Gymnasium/quality/goal-visualization-review/
// mathematik-zzz-prompt5-user-pilot-2026-09-26.md
export const isExplicitOwnerPilotDisplayException = (
  subject: string,
  record: QaApprovalRecord,
): boolean => subject === 'mathematik'
  && record.goalId === '121e3fdf-54d2-4d46-bc2d-f6e725f10f41'
  && record.visualizationState === 'available'
  && record.assetSha256 === 'sha256:9a388e26e0e16f2ade9a92f92545fe1e5457f90a35dd8e6eabecb37aa3b2a5c2'
  && record.humanApproved !== 'yes'
  && record.humanIssueIdentified !== 'yes'
  && aiApprovalStatus(record) === 'rejected'

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
    const displayExceptions = active.filter((record) => isExplicitOwnerPilotDisplayException(subject, record))
    const unapproved = unapprovedActiveGoalVisualizations(ledger.records)
      .filter((record) => !isExplicitOwnerPilotDisplayException(subject, record))
    if (unapproved.length > 0) {
      failures.push(
        `${subject}: ${unapproved.length} active goal visualization(s) have neither Human=OK nor a current Approved-AI decision:`,
        ...unapproved.map((record) => (
          `- ${record.goalId} (${record.title ?? 'untitled'}): human=${record.humanIssueIdentified === 'yes' ? 'NOK' : 'open'}, ai=${aiApprovalStatus(record)}`
        )),
      )
      return
    }

    console.log(
      `${subject}: approval coverage passed (${active.length - displayExceptions.length} approved active visualization(s), `
      + `${displayExceptions.length} exact-hash owner-directed pilot display exception(s); exceptions do not satisfy M7 gate V).`,
    )
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
