import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type DurationModel = 'G8' | 'G9'

type SourceGoal = {
  id?: string
  tags?: string[]
}

type MappingEntry = {
  legacyGoalId?: string
  canonicalGoalId?: string
}

type LearningGoal = {
  id?: string
  title?: string
  phase?: string
  tags?: string[]
  contains?: string[]
}

type GoalPlacement = {
  goalId?: string
  unitId?: string
  relation?: string
  context?: {
    schoolForm?: string
    stage?: string
    jurisdiction?: string
    durationModel?: string
  }
}

type CanonicalMathDocument = {
  goals?: LearningGoal[]
  goalPlacements?: GoalPlacement[]
}

type EvidenceKey = `${string}\0${DurationModel}\0${string}`

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const shouldApply = process.argv.includes('--apply')
const shouldCheck = process.argv.includes('--check')

const canonicalMathPath = resolve(
  repoRoot,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
)
const sourceExtractionPath = resolve(
  repoRoot,
  'curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_MATHEMATIK_SEKI_KC_G8_G9.source-extraction.json',
)
const mappingPath = resolve(
  repoRoot,
  'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_math_lower_secondary_source_extraction_to_canonical_math.review.json',
)
const reportPath = resolve(repoRoot, 'tmp/he-math-duration-projection-audit.json')
const candidatePath = resolve(repoRoot, 'tmp/he-math-duration-projection-candidates.json')

const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T

const normalizeDurationModel = (value?: string): DurationModel | null => {
  const normalized = value?.trim().toUpperCase()
  return normalized === 'G8' || normalized === 'G9' ? normalized : null
}

const extractTagValue = (tags: string[] | undefined, prefix: string): string | null => {
  const tag = tags?.find((entry) => entry.startsWith(prefix))
  return tag ? tag.slice(prefix.length) : null
}

const increment = (record: Record<string, number>, key: string) => {
  record[key] = (record[key] ?? 0) + 1
}

const canonicalMath = readJson<CanonicalMathDocument>(canonicalMathPath)
const sourceExtraction = readJson<{ sourceGoals?: SourceGoal[] }>(sourceExtractionPath)
const mappingReview = readJson<{ mappings?: MappingEntry[] }>(mappingPath)

const canonicalGoals = canonicalMath.goals ?? []
const goalById = new Map(canonicalGoals.flatMap((goal) => goal.id ? [[goal.id, goal]] as const : []))
const sourceGoalById = new Map((sourceExtraction.sourceGoals ?? []).flatMap((goal) => goal.id ? [[goal.id, goal]] as const : []))
const parentIdsByGoalId = new Map<string, string[]>()

for (const goal of canonicalGoals) {
  if (!goal.id) continue
  for (const childId of goal.contains ?? []) {
    const parentIds = parentIdsByGoalId.get(childId) ?? []
    parentIds.push(goal.id)
    parentIdsByGoalId.set(childId, parentIds)
  }
}

const containsCache = new Map<string, boolean>()

const containsTransitively = (ancestorId: string, targetId: string, visiting: Set<string> = new Set()): boolean => {
  const cacheKey = `${ancestorId}\0${targetId}`
  const cached = containsCache.get(cacheKey)
  if (cached !== undefined) return cached
  if (ancestorId === targetId) {
    containsCache.set(cacheKey, true)
    return true
  }
  if (visiting.has(ancestorId)) {
    containsCache.set(cacheKey, false)
    return false
  }

  visiting.add(ancestorId)
  const ancestor = goalById.get(ancestorId)
  const result = (ancestor?.contains ?? []).some((childId) =>
    containsTransitively(childId, targetId, new Set(visiting)),
  )
  containsCache.set(cacheKey, result)
  return result
}

const extractYearFromUnitId = (unitId?: string) => {
  const match = /^de-gym-math-j([5-9]|10)$/u.exec(unitId ?? '')
  return match?.[1] ?? null
}

const extractYearFromGoal = (goal: LearningGoal | undefined): string | null => {
  if (!goal) return null

  for (const tag of goal.tags ?? []) {
    const match = /^phase:J([5-9]|10)$/u.exec(tag)
    if (match) return match[1]
  }

  const phaseMatch = /^J([5-9]|10)$/iu.exec(goal.phase ?? '')
  if (phaseMatch) return phaseMatch[1]

  const titleMatch = /^Jahrgang(?:sstufe)?\s+([5-9]|10)\b/iu.exec(goal.title ?? '')
  return titleMatch?.[1] ?? null
}

const authoredYearAncestorsCache = new Map<string, Set<string>>()

const getAuthoredYearAncestors = (goalId: string, visiting: Set<string> = new Set()): Set<string> => {
  const cached = authoredYearAncestorsCache.get(goalId)
  if (cached) return cached
  if (visiting.has(goalId)) return new Set()

  const nextVisiting = new Set(visiting)
  nextVisiting.add(goalId)

  const years = new Set<string>()
  for (const parentId of parentIdsByGoalId.get(goalId) ?? []) {
    const parent = goalById.get(parentId)
    const year = extractYearFromGoal(parent)
    if (year) years.add(year)
    getAuthoredYearAncestors(parentId, nextVisiting).forEach((entry) => years.add(entry))
  }

  authoredYearAncestorsCache.set(goalId, years)
  return years
}

const evidenceKeys = new Set<EvidenceKey>()
for (const mapping of mappingReview.mappings ?? []) {
  if (!mapping.legacyGoalId || !mapping.canonicalGoalId) continue

  const sourceGoal = sourceGoalById.get(mapping.legacyGoalId)
  const durationModel = normalizeDurationModel(extractTagValue(sourceGoal?.tags, 'durationModel:') ?? undefined)
  const grade = extractTagValue(sourceGoal?.tags, 'grade:')
  if (!sourceGoal || !durationModel || !grade) continue

  evidenceKeys.add(`${mapping.canonicalGoalId}\0${durationModel}\0${grade}`)
}

const gradeEvidenceByDuration: Record<DurationModel, Record<string, number>> = { G8: {}, G9: {} }
const gradeEvidenceByCanonicalGoal = new Map<string, Record<DurationModel, Set<string>>>()

for (const key of evidenceKeys) {
  const [canonicalGoalId, durationModel, grade] = key.split('\0') as [string, DurationModel, string]
  increment(gradeEvidenceByDuration[durationModel], grade)
  const byDuration = gradeEvidenceByCanonicalGoal.get(canonicalGoalId) ?? { G8: new Set<string>(), G9: new Set<string>() }
  byDuration[durationModel].add(grade)
  gradeEvidenceByCanonicalGoal.set(canonicalGoalId, byDuration)
}

let durationDifferentCanonicalGoals = 0
const durationDifferentSamples: Array<{
  canonicalGoalId: string
  title?: string
  G8: string[]
  G9: string[]
}> = []

for (const [canonicalGoalId, byDuration] of gradeEvidenceByCanonicalGoal) {
  if (byDuration.G8.size === 0 || byDuration.G9.size === 0) continue
  const g8 = [...byDuration.G8].sort((left, right) => Number(left) - Number(right))
  const g9 = [...byDuration.G9].sort((left, right) => Number(left) - Number(right))
  if (g8.join(',') === g9.join(',')) continue

  durationDifferentCanonicalGoals += 1
  if (durationDifferentSamples.length < 25) {
    durationDifferentSamples.push({
      canonicalGoalId,
      title: goalById.get(canonicalGoalId)?.title,
      G8: g8,
      G9: g9,
    })
  }
}

const primaryPlacements = (canonicalMath.goalPlacements ?? [])
  .filter((placement) => placement.relation === 'primary')
  .map((placement) => ({
    ...placement,
    durationModel: normalizeDurationModel(placement.context?.durationModel),
  }))
  .filter((placement): placement is GoalPlacement & { durationModel: DurationModel } =>
    !!placement.durationModel && !!placement.goalId && !!placement.unitId,
  )

const primaryPlacementCounts: Record<DurationModel, Record<string, number>> = { G8: {}, G9: {} }
for (const placement of primaryPlacements) {
  increment(primaryPlacementCounts[placement.durationModel], placement.unitId ?? 'unknown')
}

const durationSpecificPlacements = (canonicalMath.goalPlacements ?? [])
  .map((placement) => ({
    ...placement,
    durationModel: normalizeDurationModel(placement.context?.durationModel),
    grade: extractYearFromUnitId(placement.unitId),
  }))
  .filter((placement): placement is GoalPlacement & { durationModel: DurationModel; grade: string } =>
    !!placement.durationModel && !!placement.grade && !!placement.goalId && !!placement.unitId,
  )

const evidenceAuditRows: Array<{
  canonicalGoalId: string
  title?: string
  durationModel: DurationModel
  grade: string
  coveredByAuthoredYear: boolean
  coveredByPrimaryPlacement: boolean
  coveredByAnyDurationPlacement: boolean
}> = []

for (const key of evidenceKeys) {
  const [canonicalGoalId, durationModel, grade] = key.split('\0') as [string, DurationModel, string]
  const unitId = `de-gym-math-j${grade}`
  const coveredByAuthoredYear = getAuthoredYearAncestors(canonicalGoalId).has(grade)
  const coveredByPrimaryPlacement = primaryPlacements.some((placement) =>
    placement.durationModel === durationModel
    && placement.unitId === unitId
    && containsTransitively(placement.goalId ?? '', canonicalGoalId),
  )
  const coveredByAnyDurationPlacement = durationSpecificPlacements.some((placement) =>
    placement.durationModel === durationModel
    && placement.unitId === unitId
    && containsTransitively(placement.goalId ?? '', canonicalGoalId),
  )

  evidenceAuditRows.push({
    canonicalGoalId,
    title: goalById.get(canonicalGoalId)?.title,
    durationModel,
    grade,
    coveredByAuthoredYear,
    coveredByPrimaryPlacement,
    coveredByAnyDurationPlacement,
  })
}

const uncoveredByPrimaryPlacement = evidenceAuditRows.filter((row) => !row.coveredByPrimaryPlacement)
const uncoveredByAnyCurrentStructure = evidenceAuditRows.filter((row) =>
  !row.coveredByAuthoredYear && !row.coveredByAnyDurationPlacement,
)

const candidatePlacements = [...gradeEvidenceByCanonicalGoal.entries()]
  .flatMap(([canonicalGoalId, byDuration]) =>
    (['G8', 'G9'] as const).flatMap((durationModel) => {
      const grades = [...byDuration[durationModel]].sort((left, right) => Number(left) - Number(right))
      return grades.map((grade, index) => {
        const auditRow = evidenceAuditRows.find((row) =>
          row.canonicalGoalId === canonicalGoalId
          && row.durationModel === durationModel
          && row.grade === grade,
        )
        return {
          goalId: canonicalGoalId,
          title: goalById.get(canonicalGoalId)?.title,
          unitId: `de-gym-math-j${grade}`,
          relation: index === 0 ? 'primary' : 'secondary',
          context: {
            schoolForm: 'Gymnasium',
            stage: 'SekI',
            jurisdiction: 'DE-HE',
            durationModel,
          },
          coveredByAuthoredYear: auditRow?.coveredByAuthoredYear ?? false,
          coveredByExistingDurationPlacement: auditRow?.coveredByAnyDurationPlacement ?? false,
        }
      })
    }),
  )

const missingPlacementCandidates = candidatePlacements.filter((placement) =>
  !placement.coveredByAuthoredYear && !placement.coveredByExistingDurationPlacement,
)

const toEvidenceKey = (goalId: string, durationModel: DurationModel, grade: string): EvidenceKey =>
  `${goalId}\0${durationModel}\0${grade}`

const toPlacementKey = (placement: GoalPlacement): string => JSON.stringify({
  goalId: placement.goalId ?? '',
  unitId: placement.unitId ?? '',
  relation: placement.relation ?? '',
  context: {
    schoolForm: placement.context?.schoolForm ?? '',
    stage: placement.context?.stage ?? '',
    jurisdiction: placement.context?.jurisdiction ?? '',
    durationModel: placement.context?.durationModel ?? '',
  },
})

let appliedMissingPlacements = 0
const appliedPlacementEvidenceKeys = new Set<EvidenceKey>()
const appliedPrimaryPlacementEvidenceKeys = new Set<EvidenceKey>()

if (shouldApply) {
  const currentPlacements = canonicalMath.goalPlacements ?? []
  const existingPlacementKeys = new Set(currentPlacements.map(toPlacementKey))

  const placementsToAdd = missingPlacementCandidates
    .map((placement): GoalPlacement => ({
      goalId: placement.goalId,
      unitId: placement.unitId,
      relation: placement.relation,
      context: placement.context,
    }))
    .filter((placement) => {
      const key = toPlacementKey(placement)
      if (existingPlacementKeys.has(key)) return false
      existingPlacementKeys.add(key)
      return true
    })

  canonicalMath.goalPlacements = [...currentPlacements, ...placementsToAdd]
  writeFileSync(canonicalMathPath, `${JSON.stringify(canonicalMath, null, 2)}\n`)
  appliedMissingPlacements = placementsToAdd.length

  for (const placement of placementsToAdd) {
    const durationModel = normalizeDurationModel(placement.context?.durationModel)
    const grade = extractYearFromUnitId(placement.unitId)
    if (!placement.goalId || !durationModel || !grade) continue

    const evidenceKey = toEvidenceKey(placement.goalId, durationModel, grade)
    appliedPlacementEvidenceKeys.add(evidenceKey)
    if (placement.relation === 'primary') {
      appliedPrimaryPlacementEvidenceKeys.add(evidenceKey)
    }
  }
}

const uncoveredByPrimaryPlacementForReport = uncoveredByPrimaryPlacement.filter((row) =>
  !appliedPrimaryPlacementEvidenceKeys.has(toEvidenceKey(row.canonicalGoalId, row.durationModel, row.grade)),
)
const uncoveredByAnyCurrentStructureForReport = uncoveredByAnyCurrentStructure.filter((row) =>
  !appliedPlacementEvidenceKeys.has(toEvidenceKey(row.canonicalGoalId, row.durationModel, row.grade)),
)
const missingPlacementCandidatesForReport = shouldApply
  ? missingPlacementCandidates.filter((placement) =>
    !appliedPlacementEvidenceKeys.has(toEvidenceKey(
      placement.goalId,
      placement.context.durationModel,
      extractYearFromUnitId(placement.unitId) ?? '',
    )),
  )
  : missingPlacementCandidates

const report = {
  sourceExtractionPath: sourceExtractionPath.replace(`${repoRoot}/`, ''),
  mappingPath: mappingPath.replace(`${repoRoot}/`, ''),
  canonicalMathPath: canonicalMathPath.replace(`${repoRoot}/`, ''),
  sourceEvidence: {
    uniqueCanonicalDurationGradeEvidence: evidenceKeys.size,
    canonicalGoalsWithDurationEvidence: gradeEvidenceByCanonicalGoal.size,
    canonicalGoalsWithDifferentG8G9Grades: durationDifferentCanonicalGoals,
    gradeEvidenceByDuration,
    durationDifferentSamples,
  },
  currentProjection: {
    primaryPlacementCounts,
    uniqueEvidenceCoveredByPrimaryPlacements: evidenceKeys.size - uncoveredByPrimaryPlacementForReport.length,
    uniqueEvidenceUncoveredByPrimaryPlacements: uncoveredByPrimaryPlacementForReport.length,
    primaryPlacementCoverageRatio: evidenceKeys.size === 0 ? 1 : (evidenceKeys.size - uncoveredByPrimaryPlacementForReport.length) / evidenceKeys.size,
    uniqueEvidenceCoveredByAuthoredYearOrDurationPlacement: evidenceKeys.size - uncoveredByAnyCurrentStructureForReport.length,
    uniqueEvidenceUncoveredByAuthoredYearOrDurationPlacement: uncoveredByAnyCurrentStructureForReport.length,
    authoredOrPlacementCoverageRatio: evidenceKeys.size === 0 ? 1 : (evidenceKeys.size - uncoveredByAnyCurrentStructureForReport.length) / evidenceKeys.size,
    uncoveredByPrimaryPlacementSamples: uncoveredByPrimaryPlacementForReport.slice(0, 50),
    uncoveredByAnyCurrentStructureSamples: uncoveredByAnyCurrentStructureForReport.slice(0, 50),
  },
  candidatePlacements: {
    count: candidatePlacements.length,
    primary: candidatePlacements.filter((placement) => placement.relation === 'primary').length,
    secondary: candidatePlacements.filter((placement) => placement.relation === 'secondary').length,
    alreadyCoveredByAuthoredYear: candidatePlacements.filter((placement) => placement.coveredByAuthoredYear).length,
    alreadyCoveredByExistingDurationPlacement: candidatePlacements.filter((placement) => placement.coveredByExistingDurationPlacement).length,
    missing: missingPlacementCandidatesForReport.length,
    applied: appliedMissingPlacements,
    file: candidatePath.replace(`${repoRoot}/`, ''),
  },
}

mkdirSync(dirname(reportPath), { recursive: true })
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
writeFileSync(candidatePath, `${JSON.stringify({
  sourceExtractionPath: sourceExtractionPath.replace(`${repoRoot}/`, ''),
  mappingPath: mappingPath.replace(`${repoRoot}/`, ''),
  canonicalMathPath: canonicalMathPath.replace(`${repoRoot}/`, ''),
  candidates: candidatePlacements,
  missingCandidates: missingPlacementCandidatesForReport,
}, null, 2)}\n`)

console.log('HE Mathematik G8/G9 duration projection audit')
console.log(`Source evidence: ${report.sourceEvidence.uniqueCanonicalDurationGradeEvidence} canonical-duration-grade links`)
console.log(`Canonical goals with duration evidence: ${report.sourceEvidence.canonicalGoalsWithDurationEvidence}`)
console.log(`Canonical goals with different G8/G9 grades: ${report.sourceEvidence.canonicalGoalsWithDifferentG8G9Grades}`)
console.log(`Current primary placement coverage: ${report.currentProjection.uniqueEvidenceCoveredByPrimaryPlacements}/${report.sourceEvidence.uniqueCanonicalDurationGradeEvidence} (${Math.round(report.currentProjection.primaryPlacementCoverageRatio * 100)}%)`)
console.log(`Current authored-or-placement coverage: ${report.currentProjection.uniqueEvidenceCoveredByAuthoredYearOrDurationPlacement}/${report.sourceEvidence.uniqueCanonicalDurationGradeEvidence} (${Math.round(report.currentProjection.authoredOrPlacementCoverageRatio * 100)}%)`)
console.log(`Candidate placements: ${report.candidatePlacements.count} (${report.candidatePlacements.primary} primary, ${report.candidatePlacements.secondary} secondary)`)
console.log(`Missing placement candidates: ${report.candidatePlacements.missing}`)
if (shouldApply) {
  console.log(`Applied missing placements: ${report.candidatePlacements.applied}`)
}
console.log(`Report written: ${reportPath.replace(`${repoRoot}/`, '')}`)
console.log(`Candidates written: ${candidatePath.replace(`${repoRoot}/`, '')}`)

if (shouldCheck) {
  const checkFailures = [
    {
      id: 'duration-evidence-present',
      failed: report.sourceEvidence.uniqueCanonicalDurationGradeEvidence === 0
        || Object.keys(report.sourceEvidence.gradeEvidenceByDuration.G8).length === 0
        || Object.keys(report.sourceEvidence.gradeEvidenceByDuration.G9).length === 0,
      message: 'G8/G9 source evidence is missing or incomplete.',
    },
    {
      id: 'g8-g9-differences-present',
      failed: report.sourceEvidence.canonicalGoalsWithDifferentG8G9Grades === 0,
      message: 'No canonical goals with different G8/G9 grade evidence were found.',
    },
    {
      id: 'duration-projection-covered',
      failed: report.currentProjection.uniqueEvidenceUncoveredByAuthoredYearOrDurationPlacement > 0,
      message: `${report.currentProjection.uniqueEvidenceUncoveredByAuthoredYearOrDurationPlacement} G8/G9 evidence link(s) are not covered by authored year structure or duration-specific placements.`,
    },
    {
      id: 'missing-candidates-empty',
      failed: report.candidatePlacements.missing > 0,
      message: `${report.candidatePlacements.missing} placement candidate(s) are still missing.`,
    },
  ].filter((check) => check.failed)

  if (checkFailures.length > 0) {
    console.error('HE Mathematik G8/G9 duration projection check failed:')
    for (const failure of checkFailures) {
      console.error(`- ${failure.id}: ${failure.message}`)
    }
    process.exitCode = 1
  } else {
    console.log('HE Mathematik G8/G9 duration projection check passed.')
  }
}
