import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ApplicabilityMap, LearningGoal, LearningLandscape } from '../src/landscapeTypes'
import { buildApplicabilityCompilation, getApplicabilityReportDir, writeApplicabilityReports } from './applicabilityCompiler'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

const REVIEWED_CANONICAL_LANDSCAPE_IDS = [
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
] as const

const APPLICABILITY_INSERTION_KEYS = new Set([
  'sourceRef',
  'resourceLinks',
  'extendedData',
  'release',
  'type',
  'nodeKind',
  'experimentData',
  'examData',
])

function parseTargetLandscapeIds(allLandscapeIds: string[]): Set<string> {
  const scope = process.env.APPLICABILITY_APPLY_SCOPE?.trim()
  if (!scope) {
    return new Set(REVIEWED_CANONICAL_LANDSCAPE_IDS)
  }
  if (scope === 'all') {
    return new Set(allLandscapeIds)
  }
  return new Set(
    scope
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  )
}

function hasApplicability(applicability: ApplicabilityMap): boolean {
  return Object.keys(applicability).length > 0
}

function stringifyApplicability(applicability: ApplicabilityMap | undefined): string {
  return JSON.stringify(applicability ?? {})
}

function applyCompiledApplicability(goal: LearningGoal, compiledApplicability: ApplicabilityMap): LearningGoal {
  const orderedGoal: Record<string, unknown> = {}
  const includeApplicability = hasApplicability(compiledApplicability)
  let inserted = false

  for (const [key, value] of Object.entries(goal as Record<string, unknown>)) {
    if (key === 'applicability') {
      continue
    }
    if (!inserted && includeApplicability && APPLICABILITY_INSERTION_KEYS.has(key)) {
      orderedGoal.applicability = compiledApplicability
      inserted = true
    }
    orderedGoal[key] = value
  }

  if (!inserted && includeApplicability) {
    orderedGoal.applicability = compiledApplicability
  }

  return orderedGoal as LearningGoal
}

const result = buildApplicabilityCompilation()
writeApplicabilityReports(result)

const targetLandscapeIds = parseTargetLandscapeIds(result.reports.map((report) => report.landscapeId))
const selectedReports = result.reports.filter((report) => targetLandscapeIds.has(report.landscapeId))

if (selectedReports.length === 0) {
  throw new Error('No applicability reports matched the requested apply scope.')
}

const missingLandscapeIds = Array.from(targetLandscapeIds).filter(
  (landscapeId) => !selectedReports.some((report) => report.landscapeId === landscapeId),
)
if (missingLandscapeIds.length > 0) {
  throw new Error(`Unknown applicability apply scope landscapeId(s): ${missingLandscapeIds.join(', ')}`)
}

const blockingFindings = selectedReports.flatMap((report) => report.findings.filter((finding) => finding.severity === 'error'))
if (blockingFindings.length > 0) {
  for (const finding of blockingFindings) {
    console.error(
      `❌ [${finding.landscapeId}] [${finding.code}] ${finding.goalId ?? ''} ${finding.message}`.trim(),
    )
  }
  throw new Error('Refusing to persist applicability because the selected scope still has validation errors.')
}

let changedFiles = 0
let changedGoals = 0

for (const report of selectedReports) {
  const targetFile = resolve(repoRoot, report.file)
  const landscape = JSON.parse(readFileSync(targetFile, 'utf8')) as LearningLandscape
  const compiledApplicabilityByGoalId = new Map(
    report.goals.map((goalReport) => [goalReport.goalId, goalReport.compiledApplicability]),
  )

  landscape.goals = landscape.goals.map((goal) => {
    const compiledApplicability = compiledApplicabilityByGoalId.get(goal.id) ?? {}
    const currentApplicability = goal.applicability
    if (stringifyApplicability(currentApplicability) !== stringifyApplicability(compiledApplicability)) {
      changedGoals += 1
    }
    return applyCompiledApplicability(goal, compiledApplicability)
  })

  const nextContent = `${JSON.stringify(landscape, null, 2)}\n`
  const previousContent = readFileSync(targetFile, 'utf8')
  if (previousContent !== nextContent) {
    writeFileSync(targetFile, nextContent)
    changedFiles += 1
  }
}

console.log(`Applicability reports written to ${getApplicabilityReportDir()}`)
console.log(`Persisted applicability for ${selectedReports.length} landscape(s).`)
console.log(`Changed ${changedGoals} goal(s) across ${changedFiles} file(s).`)
