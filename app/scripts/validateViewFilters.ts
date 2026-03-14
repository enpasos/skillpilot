import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ApplicabilityFinding } from './applicabilityCompiler'
import { buildApplicabilityCompilation, getApplicabilityReportDir, writeApplicabilityReports } from './applicabilityCompiler'

interface AcceptedWarningEntry {
  code: string
  landscapeId: string
  goalId?: string
  dimension?: string
  value?: string
  rationale?: string
}

interface AcceptedWarningRegistry {
  version?: number
  acceptedWarnings?: AcceptedWarningEntry[]
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const acceptedWarningsPath = resolve(scriptDir, '../../docs/qa-ci/applicability-accepted-warnings.json')

function findingKey(finding: Pick<ApplicabilityFinding, 'code' | 'landscapeId' | 'goalId' | 'dimension' | 'value'>): string {
  return [
    finding.code,
    finding.landscapeId,
    finding.goalId ?? '',
    finding.dimension ?? '',
    finding.value ?? '',
  ].join('|')
}

function loadAcceptedWarnings(): Map<string, AcceptedWarningEntry> {
  const raw = JSON.parse(readFileSync(acceptedWarningsPath, 'utf8')) as AcceptedWarningRegistry
  const acceptedWarnings = Array.isArray(raw.acceptedWarnings) ? raw.acceptedWarnings : []

  return new Map(
    acceptedWarnings.map((entry) => [
      findingKey(entry),
      entry,
    ]),
  )
}

const result = buildApplicabilityCompilation()
writeApplicabilityReports(result)
const acceptedWarnings = loadAcceptedWarnings()

const pilotLandscapeIds = new Set([
  '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced', // Mathematics
  '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a', // Physics
  'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0', // Chemistry
  '08a43a1b-d97e-522c-9dfa-c950a493364e', // Biology
  '7d51b38c-a149-5407-bddc-d2ce7878b020', // Informatics
  '67bd301b-e11a-582d-94ba-4f4b1a4cefff', // German
  '51b60137-46e8-5498-973e-ea38bb32f327', // Politics and Economics
  'f620c251-c1e1-41c1-b4e1-b10950b43608', // Music
  '668cf206-941e-51f8-8704-3e8938631235', // Latin
  '90eedebf-9ea8-5247-85dd-31c147f907c3', // Spanish
  '605bdaf6-32d5-56fd-8d92-5a80c2fd2901', // Economics
  'a0e13c56-c25f-4742-9272-3a1a603ee52e', // Overview
])

const selectedReports = process.env.APPLICABILITY_VALIDATION_SCOPE === 'all'
  ? result.reports
  : result.reports.filter((report) => pilotLandscapeIds.has(report.landscapeId))

const findings = Array.from(
  new Map(
    selectedReports
      .flatMap((report) => report.findings)
      .filter((finding) => process.env.APPLICABILITY_VALIDATION_SCOPE === 'all' || pilotLandscapeIds.has(finding.landscapeId))
      .map((finding) => [
        `${finding.severity}|${finding.code}|${finding.landscapeId}|${finding.goalId ?? ''}|${finding.dimension ?? ''}|${finding.value ?? ''}|${finding.message}`,
        finding,
      ]),
  ).values(),
)
const errors = findings.filter((finding) => finding.severity === 'error')
const warnings = findings.filter((finding) => finding.severity === 'warning')
const activeWarnings = warnings.filter((finding) => !acceptedWarnings.has(findingKey(finding)))
const acceptedWarningFindings = warnings.filter((finding) => acceptedWarnings.has(findingKey(finding)))

for (const finding of findings) {
  const acceptedEntry = finding.severity === 'warning' ? acceptedWarnings.get(findingKey(finding)) : undefined
  const tag = finding.severity === 'error' ? '❌' : acceptedEntry ? 'ℹ️' : '⚠️'
  const goalPart = finding.goalId ? ` ${finding.goalId}` : ''
  const projectionPart = finding.dimension && finding.value ? ` [${finding.dimension}=${finding.value}]` : ''
  const acceptedPart = acceptedEntry ? ' [accepted]' : ''
  const rationalePart = acceptedEntry?.rationale ? ` (${acceptedEntry.rationale})` : ''
  console.log(`${tag}${acceptedPart} [${finding.landscapeId}] [${finding.code}]${projectionPart}${goalPart} ${finding.message}${rationalePart}`)
}

if (findings.length === 0) {
  console.log(`✅ ${selectedReports.length} projected-view landscape report(s) passed validation.`)
} else {
  console.log(`\n${errors.length} error(s), ${activeWarnings.length} warning(s), ${acceptedWarningFindings.length} accepted warning(s).`)
}

if (process.env.APPLICABILITY_VALIDATION_SCOPE !== 'all') {
  console.log('Validation scope: reviewed pilot set (Mathematik, Physik, Chemie, Biologie, Informatik, Deutsch, Politik und Wirtschaft, Musik, Latein, Spanisch, Wirtschaft, Overview).')
}
if (acceptedWarningFindings.length > 0) {
  console.log(`Accepted warning registry: ${acceptedWarningsPath}`)
}
console.log(`Reports written to ${getApplicabilityReportDir()}`)
process.exit(errors.length > 0 ? 1 : 0)
