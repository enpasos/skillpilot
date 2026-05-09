import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ApplicabilityFinding } from './applicabilityCompiler'
import { buildApplicabilityCompilation, getApplicabilityReportDir, writeApplicabilityReports } from './applicabilityCompiler'
import type { TreeProjectionFinding } from './treeProjectionValidator'
import { buildTreeProjectionValidationFindings } from './treeProjectionValidator'

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

function incrementCount(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1)
}

function countBy<T>(items: T[], keyFor: (item: T) => string): Array<[string, number]> {
  const counts = new Map<string, number>()
  items.forEach((item) => incrementCount(counts, keyFor(item)))
  return Array.from(counts.entries()).sort(([, left], [, right]) => right - left)
}

function formatFinding(
  finding: ViewValidationFinding,
  acceptedEntry: AcceptedWarningEntry | undefined,
  extraTag?: string,
): string {
  const tag = finding.severity === 'error' ? '❌' : finding.severity === 'diagnostic' || acceptedEntry ? 'ℹ️' : '⚠️'
  const goalPart = finding.goalId ? ` ${finding.goalId}` : ''
  const projectionPart = finding.dimension && finding.value ? ` [${finding.dimension}=${finding.value}]` : ''
  const acceptedPart = acceptedEntry ? ' [accepted]' : ''
  const extraPart = extraTag ? ` [${extraTag}]` : ''
  const rationalePart = acceptedEntry?.rationale ? ` (${acceptedEntry.rationale})` : ''
  return `${tag}${acceptedPart}${extraPart} [${finding.landscapeId}] [${finding.code}]${projectionPart}${goalPart} ${finding.message}${rationalePart}`
}

function printFindingSample(
  label: string,
  findings: ViewValidationFinding[],
  acceptedWarnings: Map<string, AcceptedWarningEntry>,
  limit: number,
  extraTag?: string,
) {
  if (findings.length === 0) return
  console.log(`\n${label}:`)
  findings.slice(0, limit).forEach((finding) => {
    console.log(formatFinding(finding, acceptedWarnings.get(findingKey(finding)), extraTag))
  })
  if (findings.length > limit) {
    console.log(`... ${findings.length - limit} more; see ${getApplicabilityReportDir()} for the complete report.`)
  }
}

function printBreakdown(label: string, entries: Array<[string, number]>, limit: number) {
  if (entries.length === 0) return
  const summary = entries
    .slice(0, limit)
    .map(([key, count]) => `${key}: ${count}`)
    .join(', ')
  const suffix = entries.length > limit ? `, ... ${entries.length - limit} more` : ''
  console.log(`${label}: ${summary}${suffix}`)
}

const result = buildApplicabilityCompilation()
writeApplicabilityReports(result)
const acceptedWarnings = loadAcceptedWarnings()
const treeProjectionFindings = buildTreeProjectionValidationFindings()

const reviewedCanonicalLandscapeIds = new Set([
  '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced', // Mathematics
  '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a', // Physics
  'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0', // Chemistry
  '08a43a1b-d97e-522c-9dfa-c950a493364e', // Biology
  '7d51b38c-a149-5407-bddc-d2ce7878b020', // Informatics
  '67bd301b-e11a-582d-94ba-4f4b1a4cefff', // German
  'c8c84073-46ae-57ec-898a-882d08d7a72f', // English
  '96a915cc-4fd6-5dc2-8cee-aaf3ab8c2977', // French
  '70a2cb55-127b-5c6e-b518-4a1c9f4f77a0', // Greek
  '8fdb83f5-b42a-5b36-ab5d-64edd4b2ab80', // Chinese
  '92406d94-e3c1-58ec-b7c6-12122278d25a', // History
  '51b60137-46e8-5498-973e-ea38bb32f327', // Politics and Economics
  'f620c251-c1e1-41c1-b4e1-b10950b43608', // Music
  '668cf206-941e-51f8-8704-3e8938631235', // Latin
  '90eedebf-9ea8-5247-85dd-31c147f907c3', // Spanish
  '25c6b527-10d6-5d92-9d76-fab23585f29b', // Italian
  '242ba9bd-7ec7-5ec3-a15e-4f0f2b01aa37', // Russian
  'f145785b-0c44-5246-af66-8a153d202cb9', // Polish
  '0900df4c-beeb-5542-86f9-bd479c94746a', // Czech
  '605bdaf6-32d5-56fd-8d92-5a80c2fd2901', // Economics
  'a0e13c56-c25f-4742-9272-3a1a603ee52e', // Overview
])

const selectedReports = process.env.APPLICABILITY_VALIDATION_SCOPE === 'all'
  ? result.reports
  : result.reports.filter((report) => reviewedCanonicalLandscapeIds.has(report.landscapeId))

type ViewValidationFinding = ApplicabilityFinding | TreeProjectionFinding

const findings = Array.from(
  new Map(
    ([
      ...selectedReports.flatMap((report) => report.findings),
      ...treeProjectionFindings,
    ] as ViewValidationFinding[])
      .filter((finding) => process.env.APPLICABILITY_VALIDATION_SCOPE === 'all' || reviewedCanonicalLandscapeIds.has(finding.landscapeId))
      .map((finding) => [
        `${finding.severity}|${finding.code}|${finding.landscapeId}|${finding.goalId ?? ''}|${finding.dimension ?? ''}|${finding.value ?? ''}|${finding.message}`,
        finding,
      ]),
  ).values(),
)
const errors = findings.filter((finding) => finding.severity === 'error')
const warnings = findings.filter((finding) => finding.severity === 'warning')
const diagnostics = findings.filter((finding) => finding.severity === 'diagnostic')
const activeWarnings = warnings.filter((finding) => !acceptedWarnings.has(findingKey(finding)))
const acceptedWarningFindings = warnings.filter((finding) => acceptedWarnings.has(findingKey(finding)))
const verboseWarnings = process.env.APPLICABILITY_VERBOSE_WARNINGS === '1'

if (verboseWarnings) {
  for (const finding of findings) {
    console.log(formatFinding(finding, finding.severity === 'warning' ? acceptedWarnings.get(findingKey(finding)) : undefined))
  }
} else {
  printFindingSample('Errors', errors, acceptedWarnings, Number.MAX_SAFE_INTEGER)
  printFindingSample('Warnings', activeWarnings, acceptedWarnings, 50)
}

if (findings.length === 0) {
  console.log(`✅ ${selectedReports.length} projected-view landscape report(s) passed validation.`)
} else {
  console.log(`\n${errors.length} error(s), ${activeWarnings.length} warning(s), ${diagnostics.length} diagnostic finding(s), ${acceptedWarningFindings.length} accepted warning(s).`)
  if (!verboseWarnings && diagnostics.length > 0) {
    console.log('Diagnostic findings are not warning debt. APV-202 means applicability is backed only by partial mappings; this is useful for mapping-shape review, but not by itself a source-coverage gap.')
  }
  if (!verboseWarnings && (activeWarnings.length > 0 || diagnostics.length > 0 || acceptedWarningFindings.length > 0)) {
    const reportTitleByLandscapeId = new Map(selectedReports.map((report) => [report.landscapeId, report.title]))
    printBreakdown('Warning types', countBy(activeWarnings, (finding) => finding.code), 10)
    printBreakdown(
      'Warning landscapes',
      countBy(activeWarnings, (finding) => reportTitleByLandscapeId.get(finding.landscapeId) ?? finding.landscapeId),
      10,
    )
    printBreakdown('Diagnostic finding types', countBy(diagnostics, (finding) => finding.code), 10)
    printBreakdown(
      'Diagnostic finding landscapes',
      countBy(diagnostics, (finding) => reportTitleByLandscapeId.get(finding.landscapeId) ?? finding.landscapeId),
      10,
    )
    printBreakdown('Accepted warning types', countBy(acceptedWarningFindings, (finding) => finding.code), 10)
  }
}

if (process.env.APPLICABILITY_VALIDATION_SCOPE !== 'all') {
  console.log('Validation scope: reviewed canonical DE Gymnasium set (Mathematik, Physik, Chemie, Biologie, Informatik, Deutsch, Englisch, Französisch, Griechisch, Chinesisch, Geschichte, Politik und Wirtschaft, Musik, Latein, Spanisch, Italienisch, Russisch, Polnisch, Tschechisch, Wirtschaft, Overview).')
}
if (acceptedWarningFindings.length > 0) {
  console.log(`Accepted warning registry: ${acceptedWarningsPath}`)
}
console.log(`Reports written to ${getApplicabilityReportDir()}`)
process.exit(errors.length > 0 ? 1 : 0)
