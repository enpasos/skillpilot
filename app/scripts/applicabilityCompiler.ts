import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ApplicabilityMap, LearningGoal, LearningLandscape } from '../src/landscapeTypes'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const curriculaDir = join(repoRoot, 'curricula')
const canonicalDir = join(curriculaDir, 'DE', 'Gymnasium', 'canonical')
const reportDir = join(repoRoot, 'tmp', 'applicability')

const SUPPORTED_DIMENSION = 'jurisdiction' as const
const SUPPORTED_JURISDICTIONS = ['DE-BY', 'DE-HE'] as const

type SupportedJurisdiction = (typeof SUPPORTED_JURISDICTIONS)[number]
type FindingSeverity = 'error' | 'warning'
type FindingCode =
  | 'APV-001'
  | 'APV-002'
  | 'APV-003'
  | 'APV-101'
  | 'APV-102'
  | 'APV-103'
  | 'APV-104'
  | 'APV-201'
  | 'APV-202'
  | 'APV-203'

type EvidenceKind = 'provenance' | 'mapping' | 'override' | 'child-union'

interface GoalMappingEntry {
  legacyGoalId?: string
  canonicalGoalId?: string
  matchType?: string
}

interface GoalMappingFile {
  sourceLandscapeId?: string
  targetLandscapeId?: string
  mappings?: GoalMappingEntry[]
}

interface LoadedCanonicalLandscape {
  file: string
  landscape: LearningLandscape
  goalById: Map<string, LearningGoal>
  rootGoalId: string | null
}

interface LoadedMappingFile {
  file: string
  sourceLandscapeId?: string
  targetLandscapeId?: string
  jurisdiction: SupportedJurisdiction | null
  mappings: GoalMappingEntry[]
}

interface GoalRef {
  landscapeId: string
  goalId: string
}

export interface ApplicabilityEvidence {
  dimension: typeof SUPPORTED_DIMENSION
  value: SupportedJurisdiction
  kind: EvidenceKind
  source: string
  mappingStrength?: 'exact' | 'partial'
}

export interface ApplicabilityFinding {
  code: FindingCode
  severity: FindingSeverity
  landscapeId: string
  goalId?: string
  title?: string
  dimension?: string
  value?: string
  message: string
}

interface GoalApplicabilityReport {
  goalId: string
  title: string
  goalType: 'atomic' | 'cluster'
  compiledApplicability: ApplicabilityMap
  evidence: ApplicabilityEvidence[]
}

interface ProjectionReport {
  dimension: typeof SUPPORTED_DIMENSION
  value: SupportedJurisdiction
  visibleGoals: number
  errors: number
  warnings: number
}

export interface LandscapeApplicabilityReport {
  landscapeId: string
  title: string
  file: string
  dimensions: [typeof SUPPORTED_DIMENSION]
  summary: {
    goals: number
    errors: number
    warnings: number
  }
  goals: GoalApplicabilityReport[]
  projections: ProjectionReport[]
  findings: ApplicabilityFinding[]
}

export interface ApplicabilityCompilationResult {
  reports: LandscapeApplicabilityReport[]
  summary: {
    dimensions: [typeof SUPPORTED_DIMENSION]
    supportedValues: SupportedJurisdiction[]
    landscapes: number
    goals: number
    errors: number
    warnings: number
    reports: Array<{
      landscapeId: string
      title: string
      file: string
      goals: number
      errors: number
      warnings: number
      projections: ProjectionReport[]
    }>
  }
}

function getAllJsonFiles(dir: string, files: string[] = []): string[] {
  const entries = readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))

  for (const entry of entries) {
    const file = join(dir, entry.name)
    if (entry.isDirectory()) {
      getAllJsonFiles(file, files)
      continue
    }
    if (entry.name.endsWith('.json')) {
      files.push(file)
    }
  }
  return files
}

function repoRelative(file: string): string {
  return relative(repoRoot, file).replace(/\\/g, '/')
}

function isLearningLandscapeJson(value: unknown): value is LearningLandscape {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<LearningLandscape>
  return typeof candidate.landscapeId === 'string' && Array.isArray(candidate.goals)
}

function parseReference(raw: string, currentLandscapeId: string) {
  if (raw.includes(':')) {
    const [landscapeId, goalId] = raw.split(':', 2)
    return { landscapeId: landscapeId || currentLandscapeId, goalId }
  }
  return { landscapeId: currentLandscapeId, goalId: raw }
}

function goalKey(landscapeId: string, goalId: string): string {
  return `${landscapeId}:${goalId}`
}

function isAtomicGoal(goal: LearningGoal): boolean {
  return !Array.isArray(goal.contains) || goal.contains.length === 0
}

function normalizeJurisdictionValue(raw: string): SupportedJurisdiction | null {
  const normalized = raw.trim().toUpperCase()
  if (normalized === 'DE-HE' || normalized === 'HE' || normalized === 'HES' || normalized === 'DE-HES') {
    return 'DE-HE'
  }
  if (normalized === 'DE-BY' || normalized === 'BY' || normalized === 'BAY' || normalized === 'DE-BAY') {
    return 'DE-BY'
  }
  return null
}

function jurisdictionFromPath(file: string): SupportedJurisdiction | null {
  const normalized = file.replace(/\\/g, '/').toUpperCase()
  if (normalized.includes('/CURRICULA/DE/HE/')) return 'DE-HE'
  if (normalized.includes('/CURRICULA/DE/BY/')) return 'DE-BY'
  return null
}

function loadLandscapePathIndex() {
  const files = getAllJsonFiles(curriculaDir)
  const pathByLandscapeId = new Map<string, string>()

  for (const file of files) {
    try {
      const json = JSON.parse(readFileSync(file, 'utf8')) as unknown
      if (!isLearningLandscapeJson(json)) continue

      const existing = pathByLandscapeId.get(json.landscapeId)
      if (!existing) {
        pathByLandscapeId.set(json.landscapeId, file)
        continue
      }

      const existingIsGerman = existing.endsWith('.de.json')
      const nextIsGerman = file.endsWith('.de.json')
      if (!existingIsGerman && nextIsGerman) {
        pathByLandscapeId.set(json.landscapeId, file)
      }
    } catch {
      // Ignore non-landscape JSON while building the path index.
    }
  }

  return pathByLandscapeId
}

function loadCanonicalLandscapes(): LoadedCanonicalLandscape[] {
  return getAllJsonFiles(canonicalDir)
    .sort((a, b) => a.localeCompare(b))
    .map((file) => {
      const landscape = JSON.parse(readFileSync(file, 'utf8')) as LearningLandscape
      const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
      const rootGoal = landscape.goals.find((goal) => goal.tags?.includes('root')) ?? landscape.goals[0]

      return {
        file,
        landscape,
        goalById,
        rootGoalId: rootGoal?.id ?? null,
      }
    })
}

function loadMappingFiles(): LoadedMappingFile[] {
  return getAllJsonFiles(join(curriculaDir, 'DE'))
    .filter((file) => file.replace(/\\/g, '/').includes('/mapping/'))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => {
      const raw = JSON.parse(readFileSync(file, 'utf8')) as GoalMappingFile
      return {
        file,
        sourceLandscapeId: raw.sourceLandscapeId,
        targetLandscapeId: raw.targetLandscapeId,
        jurisdiction: jurisdictionFromPath(file),
        mappings: Array.isArray(raw.mappings) ? raw.mappings : [],
      }
    })
}

function getProvenanceLandscapeIds(goal: LearningGoal): string[] {
  if (!goal.extendedData || typeof goal.extendedData !== 'object') return []
  const provenance = (goal.extendedData as Record<string, unknown>).provenance
  if (!provenance || typeof provenance !== 'object') return []
  const data = provenance as Record<string, unknown>
  const ids = new Set<string>()

  for (const key of ['sourceLandscapeId'] as const) {
    const value = data[key]
    if (typeof value === 'string' && value.trim()) {
      ids.add(value.trim())
    }
  }

  for (const key of ['additionalSourceLandscapeIds', 'crossSubjectPrerequisiteLandscapeIds'] as const) {
    const value = data[key]
    if (!Array.isArray(value)) continue
    value.forEach((entry) => {
      if (typeof entry === 'string' && entry.trim()) {
        ids.add(entry.trim())
      }
    })
  }

  return Array.from(ids)
}

function getApplicabilityOverrideValues(
  goal: LearningGoal,
  landscapeId: string,
  findings: ApplicabilityFinding[],
): SupportedJurisdiction[] {
  if (!goal.extendedData || typeof goal.extendedData !== 'object') return []

  const overrides = (goal.extendedData as Record<string, unknown>).applicabilityOverrides
  if (!overrides || typeof overrides !== 'object') return []

  const overrideRecord = overrides as Record<string, unknown>
  const overrideKeys = Object.keys(overrideRecord).sort()
  const supportedValues: SupportedJurisdiction[] = []

  for (const key of overrideKeys) {
    if (key !== SUPPORTED_DIMENSION) {
      findings.push({
        code: 'APV-001',
        severity: 'error',
        landscapeId,
        goalId: goal.id,
        title: goal.title,
        dimension: key,
        message: `Unsupported applicability override dimension "${key}".`,
      })
      continue
    }

    const rawValues = overrideRecord[key]
    if (!Array.isArray(rawValues)) {
      findings.push({
        code: 'APV-001',
        severity: 'error',
        landscapeId,
        goalId: goal.id,
        title: goal.title,
        dimension: key,
        message: 'Applicability override must be an array of strings.',
      })
      continue
    }

    const seen = new Set<string>()
    const normalizedValues: SupportedJurisdiction[] = []
    let hasDuplicate = false
    let hasOutOfOrder = false
    let previous = ''

    for (const rawValue of rawValues) {
      if (typeof rawValue !== 'string') {
        findings.push({
          code: 'APV-001',
          severity: 'error',
          landscapeId,
          goalId: goal.id,
          title: goal.title,
          dimension: key,
          message: 'Applicability override contains a non-string value.',
        })
        continue
      }
      const normalized = normalizeJurisdictionValue(rawValue)
      if (!normalized) {
        findings.push({
          code: 'APV-001',
          severity: 'error',
          landscapeId,
          goalId: goal.id,
          title: goal.title,
          dimension: key,
          value: rawValue,
          message: `Unsupported applicability override value "${rawValue}".`,
        })
        continue
      }
      if (seen.has(normalized)) {
        hasDuplicate = true
        continue
      }
      if (previous && normalized.localeCompare(previous) < 0) {
        hasOutOfOrder = true
      }
      previous = normalized
      seen.add(normalized)
      normalizedValues.push(normalized)
    }

    if (hasDuplicate || hasOutOfOrder) {
      findings.push({
        code: 'APV-002',
        severity: 'error',
        landscapeId,
        goalId: goal.id,
        title: goal.title,
        dimension: key,
        message: 'Applicability override values must be unique and sorted.',
      })
    }

    supportedValues.push(...normalizedValues)
  }

  return Array.from(new Set(supportedValues)).sort() as SupportedJurisdiction[]
}

function normalizeCompiledApplicability(values: Iterable<SupportedJurisdiction>): ApplicabilityMap {
  const sorted = Array.from(new Set(values)).sort()
  return sorted.length > 0 ? { [SUPPORTED_DIMENSION]: sorted } : {}
}

function currentApplicabilityForGoal(goal: LearningGoal): ApplicabilityMap {
  const current = goal.applicability
  if (!current || typeof current !== 'object') return {}
  const jurisdictions = Array.isArray(current[SUPPORTED_DIMENSION]) ? current[SUPPORTED_DIMENSION] : []
  const normalized = jurisdictions
    .filter((value): value is string => typeof value === 'string')
    .map((value) => normalizeJurisdictionValue(value))
    .filter((value): value is SupportedJurisdiction => Boolean(value))
  return normalizeCompiledApplicability(normalized)
}

export function buildApplicabilityCompilation(): ApplicabilityCompilationResult {
  const canonicalLandscapes = loadCanonicalLandscapes()
  const canonicalLandscapeById = new Map(
    canonicalLandscapes.map((entry) => [entry.landscape.landscapeId, entry]),
  )
  const mappingFiles = loadMappingFiles()
  const landscapePathById = loadLandscapePathIndex()
  const mappingEvidenceByTarget = new Map<string, Map<string, LoadedMappingFile[]>>()
  const canonicalGoalToLandscapeId = new Map<string, string>()
  const ambiguousCanonicalGoalIds = new Set<string>()

  for (const canonical of canonicalLandscapes) {
    for (const goal of canonical.landscape.goals) {
      const existing = canonicalGoalToLandscapeId.get(goal.id)
      if (!existing) {
        canonicalGoalToLandscapeId.set(goal.id, canonical.landscape.landscapeId)
        continue
      }
      if (existing !== canonical.landscape.landscapeId) {
        canonicalGoalToLandscapeId.delete(goal.id)
        ambiguousCanonicalGoalIds.add(goal.id)
      }
    }
  }

  for (const mappingFile of mappingFiles) {
    if (!mappingFile.targetLandscapeId) continue
    const goalMap = mappingEvidenceByTarget.get(mappingFile.targetLandscapeId) ?? new Map<string, LoadedMappingFile[]>()
    for (const entry of mappingFile.mappings) {
      if (!entry.canonicalGoalId) continue
      const files = goalMap.get(entry.canonicalGoalId) ?? []
      files.push(mappingFile)
      goalMap.set(entry.canonicalGoalId, files)
    }
    mappingEvidenceByTarget.set(mappingFile.targetLandscapeId, goalMap)
  }

  const reports: LandscapeApplicabilityReport[] = []

  for (const canonical of canonicalLandscapes) {
    const findings: ApplicabilityFinding[] = []
    const reportGoals: GoalApplicabilityReport[] = []
    const compiledByGoalId = new Map<string, ApplicabilityMap>()
    const evidenceByGoalId = new Map<string, ApplicabilityEvidence[]>()
    const goalTypeById = new Map<string, 'atomic' | 'cluster'>()
    const childRefsByGoalId = new Map<string, GoalRef[]>()

    const resolveCanonicalReference = (raw: string): GoalRef => {
      const parsed = parseReference(raw, canonical.landscape.landscapeId)
      if (parsed.landscapeId !== canonical.landscape.landscapeId) {
        return parsed
      }
      if (canonical.goalById.has(parsed.goalId)) {
        return parsed
      }
      if (ambiguousCanonicalGoalIds.has(parsed.goalId)) {
        return parsed
      }
      const targetLandscapeId = canonicalGoalToLandscapeId.get(parsed.goalId)
      if (targetLandscapeId) {
        return { landscapeId: targetLandscapeId, goalId: parsed.goalId }
      }
      return parsed
    }

    for (const goal of canonical.landscape.goals) {
      const childRefs = (goal.contains ?? [])
        .map((ref) => resolveCanonicalReference(ref))
        .filter((ref) => canonicalLandscapeById.get(ref.landscapeId)?.goalById.has(ref.goalId) ?? false)
      childRefsByGoalId.set(goal.id, childRefs)
      goalTypeById.set(goal.id, isAtomicGoal(goal) ? 'atomic' : 'cluster')
    }

    const compileGoal = (landscapeId: string, goalId: string, visiting = new Set<string>()): ApplicabilityMap => {
      const key = goalKey(landscapeId, goalId)
      const cached = compiledByGoalId.get(key)
      if (cached) return cached

      if (visiting.has(key)) {
        return {}
      }
      visiting.add(key)

      const sourceLandscape = canonicalLandscapeById.get(landscapeId)
      const goal = sourceLandscape?.goalById.get(goalId)
      if (!goal) {
        const empty: ApplicabilityMap = {}
        compiledByGoalId.set(key, empty)
        visiting.delete(key)
        return empty
      }

      if (!isAtomicGoal(goal)) {
        const jurisdictions = new Set<SupportedJurisdiction>()
        const evidence: ApplicabilityEvidence[] = []
        const childRefs = sourceLandscape
          ? (sourceLandscape.landscape.landscapeId === canonical.landscape.landscapeId
            ? childRefsByGoalId.get(goal.id) ?? []
            : (goal.contains ?? [])
              .map((ref) => {
                const parsed = parseReference(ref, landscapeId)
                if (parsed.landscapeId !== landscapeId) return parsed
                if (sourceLandscape.goalById.has(parsed.goalId)) return parsed
                if (ambiguousCanonicalGoalIds.has(parsed.goalId)) return parsed
                const targetLandscapeId = canonicalGoalToLandscapeId.get(parsed.goalId)
                return targetLandscapeId ? { landscapeId: targetLandscapeId, goalId: parsed.goalId } : parsed
              })
              .filter((ref) => canonicalLandscapeById.get(ref.landscapeId)?.goalById.has(ref.goalId) ?? false))
          : []
        for (const childRef of childRefs) {
          const childApplicability = compileGoal(childRef.landscapeId, childRef.goalId, visiting)
          for (const value of childApplicability[SUPPORTED_DIMENSION] ?? []) {
            jurisdictions.add(value as SupportedJurisdiction)
          }
        }

        for (const value of Array.from(jurisdictions).sort()) {
          const visibleChildren = childRefs
            .filter((childRef) => (compiledByGoalId.get(goalKey(childRef.landscapeId, childRef.goalId))?.[SUPPORTED_DIMENSION] ?? []).includes(value))
          evidence.push({
            dimension: SUPPORTED_DIMENSION,
            value,
            kind: 'child-union',
            source: `${visibleChildren.length} visible child goal(s)`,
          })
        }

        const compiled = normalizeCompiledApplicability(jurisdictions)
        compiledByGoalId.set(key, compiled)
        evidenceByGoalId.set(key, evidence)
        visiting.delete(key)
        return compiled
      }

      const jurisdictions = new Set<SupportedJurisdiction>()
      const evidence: ApplicabilityEvidence[] = []

      for (const sourceLandscapeId of getProvenanceLandscapeIds(goal)) {
        const sourcePath = landscapePathById.get(sourceLandscapeId)
        if (!sourcePath) {
          findings.push({
            code: 'APV-003',
            severity: 'error',
            landscapeId,
            goalId: goal.id,
            title: goal.title,
            dimension: SUPPORTED_DIMENSION,
            message: `Cannot resolve provenance source landscape ${sourceLandscapeId}.`,
          })
          continue
        }
        const jurisdiction = jurisdictionFromPath(sourcePath)
        if (!jurisdiction) {
          findings.push({
            code: 'APV-003',
            severity: 'error',
            landscapeId,
            goalId: goal.id,
            title: goal.title,
            dimension: SUPPORTED_DIMENSION,
            message: `Cannot resolve jurisdiction from provenance source ${repoRelative(sourcePath)}.`,
          })
          continue
        }
        jurisdictions.add(jurisdiction)
        evidence.push({
          dimension: SUPPORTED_DIMENSION,
          value: jurisdiction,
          kind: 'provenance',
          source: repoRelative(sourcePath),
        })
      }

      const mappingFilesForGoal = mappingEvidenceByTarget.get(landscapeId)?.get(goal.id) ?? []
      for (const mappingFile of mappingFilesForGoal) {
        if (!mappingFile.jurisdiction) {
          findings.push({
            code: 'APV-003',
            severity: 'error',
            landscapeId,
            goalId: goal.id,
            title: goal.title,
            dimension: SUPPORTED_DIMENSION,
            message: `Cannot resolve jurisdiction from mapping file ${repoRelative(mappingFile.file)}.`,
          })
          continue
        }
        const matchTypes = mappingFile.mappings
          .filter((entry) => entry.canonicalGoalId === goal.id)
          .map((entry) => (entry.matchType === 'partial' ? 'partial' : 'exact'))
        const strongest = matchTypes.includes('exact') ? 'exact' : 'partial'

        jurisdictions.add(mappingFile.jurisdiction)
        evidence.push({
          dimension: SUPPORTED_DIMENSION,
          value: mappingFile.jurisdiction,
          kind: 'mapping',
          source: repoRelative(mappingFile.file),
          mappingStrength: strongest,
        })
      }

      const overrideValues = getApplicabilityOverrideValues(goal, landscapeId, findings)
      if (overrideValues.length > 0) {
        findings.push({
          code: 'APV-201',
          severity: 'warning',
          landscapeId,
          goalId: goal.id,
          title: goal.title,
          dimension: SUPPORTED_DIMENSION,
          message: `Goal uses applicability override for ${overrideValues.join(', ')}.`,
        })
      }
      for (const overrideValue of overrideValues) {
        jurisdictions.add(overrideValue)
        evidence.push({
          dimension: SUPPORTED_DIMENSION,
          value: overrideValue,
          kind: 'override',
          source: 'extendedData.applicabilityOverrides',
        })
      }

      for (const jurisdiction of Array.from(jurisdictions).sort()) {
        const matchingEvidence = evidence.filter((entry) => entry.value === jurisdiction)
        if (
          matchingEvidence.length > 0
          && matchingEvidence.every((entry) => entry.kind === 'mapping' && entry.mappingStrength === 'partial')
        ) {
          findings.push({
            code: 'APV-202',
            severity: 'warning',
            landscapeId,
            goalId: goal.id,
            title: goal.title,
            dimension: SUPPORTED_DIMENSION,
            value: jurisdiction,
            message: `Applicability for ${jurisdiction} is backed only by partial mappings.`,
          })
        }
      }

      const compiled = normalizeCompiledApplicability(jurisdictions)
      if ((compiled[SUPPORTED_DIMENSION]?.length ?? 0) > 0 && evidence.length === 0) {
        findings.push({
          code: 'APV-104',
          severity: 'error',
          landscapeId,
          goalId: goal.id,
          title: goal.title,
          dimension: SUPPORTED_DIMENSION,
          message: 'Goal is visible without provenance, mapping, or override evidence.',
        })
      }

      const currentApplicability = currentApplicabilityForGoal(goal)
      if (Object.prototype.hasOwnProperty.call(goal, 'applicability') && JSON.stringify(currentApplicability) !== JSON.stringify(compiled)) {
        findings.push({
          code: 'APV-203',
          severity: 'warning',
          landscapeId,
          goalId: goal.id,
          title: goal.title,
          dimension: SUPPORTED_DIMENSION,
          message: 'Compiled applicability differs from the currently committed applicability field.',
        })
      }

      compiledByGoalId.set(key, compiled)
      evidenceByGoalId.set(key, evidence.sort((a, b) => {
        return a.value.localeCompare(b.value)
          || a.kind.localeCompare(b.kind)
          || a.source.localeCompare(b.source)
      }))
      visiting.delete(key)
      return compiled
    }

    canonical.landscape.goals.forEach((goal) => {
      compileGoal(canonical.landscape.landscapeId, goal.id)
    })

    for (const value of SUPPORTED_JURISDICTIONS) {
      const visibleGoalIds = new Set(
        canonical.landscape.goals
          .filter((goal) => (compiledByGoalId.get(goalKey(canonical.landscape.landscapeId, goal.id))?.[SUPPORTED_DIMENSION] ?? []).includes(value))
          .map((goal) => goal.id),
      )

      for (const goal of canonical.landscape.goals) {
        if (!visibleGoalIds.has(goal.id)) continue

        if (!isAtomicGoal(goal)) {
          const visibleChildren = (childRefsByGoalId.get(goal.id) ?? []).filter(
            (childRef) => (compiledByGoalId.get(goalKey(childRef.landscapeId, childRef.goalId))?.[SUPPORTED_DIMENSION] ?? []).includes(value),
          )
          if (visibleChildren.length === 0) {
            findings.push({
              code: 'APV-101',
              severity: 'error',
              landscapeId: canonical.landscape.landscapeId,
              goalId: goal.id,
              title: goal.title,
              dimension: SUPPORTED_DIMENSION,
              value,
              message: `Visible cluster has no visible child in projection ${SUPPORTED_DIMENSION}=${value}.`,
            })
          }
        }

        for (const rawReq of goal.requires ?? []) {
          const req = resolveCanonicalReference(rawReq)
          const targetApplicability = compiledByGoalId.get(goalKey(req.landscapeId, req.goalId))
          if (!targetApplicability) continue
          if (!(targetApplicability[SUPPORTED_DIMENSION] ?? []).includes(value)) {
            findings.push({
              code: 'APV-102',
              severity: 'error',
              landscapeId: canonical.landscape.landscapeId,
              goalId: goal.id,
              title: goal.title,
              dimension: SUPPORTED_DIMENSION,
              value,
              message: `Visible goal requires invisible prerequisite ${req.goalId} in projection ${SUPPORTED_DIMENSION}=${value}.`,
            })
          }
        }
      }

      if (canonical.rootGoalId) {
        const reachable = new Set<string>()
        const stack = visibleGoalIds.has(canonical.rootGoalId) ? [canonical.rootGoalId] : []

        while (stack.length > 0) {
          const current = stack.pop()
          if (!current || reachable.has(current)) continue
          reachable.add(current)
          for (const childRef of childRefsByGoalId.get(current) ?? []) {
            if (childRef.landscapeId !== canonical.landscape.landscapeId) continue
            if (visibleGoalIds.has(childRef.goalId) && !reachable.has(childRef.goalId)) {
              stack.push(childRef.goalId)
            }
          }
        }

        for (const goalId of visibleGoalIds) {
          if (reachable.has(goalId)) continue
          const goal = canonical.goalById.get(goalId)
          if (!goal) continue
          findings.push({
            code: 'APV-103',
            severity: 'error',
            landscapeId: canonical.landscape.landscapeId,
            goalId,
            title: goal.title,
            dimension: SUPPORTED_DIMENSION,
            value,
            message: `Visible goal is not reachable from the visible root in projection ${SUPPORTED_DIMENSION}=${value}.`,
          })
        }
      }
    }

    for (const goal of canonical.landscape.goals) {
      reportGoals.push({
        goalId: goal.id,
        title: goal.title,
        goalType: goalTypeById.get(goal.id) ?? 'atomic',
        compiledApplicability: compiledByGoalId.get(goalKey(canonical.landscape.landscapeId, goal.id)) ?? {},
        evidence: evidenceByGoalId.get(goalKey(canonical.landscape.landscapeId, goal.id)) ?? evidenceByGoalId.get(goal.id) ?? [],
      })
    }

    const sortedFindings = Array.from(
      new Map(
        findings.map((finding) => [
          `${finding.severity}|${finding.code}|${finding.landscapeId}|${finding.goalId ?? ''}|${finding.dimension ?? ''}|${finding.value ?? ''}|${finding.message}`,
          finding,
        ]),
      ).values(),
    ).sort((a, b) => {
      return a.severity.localeCompare(b.severity)
        || a.code.localeCompare(b.code)
        || (a.dimension ?? '').localeCompare(b.dimension ?? '')
        || (a.value ?? '').localeCompare(b.value ?? '')
        || (a.goalId ?? '').localeCompare(b.goalId ?? '')
        || a.message.localeCompare(b.message)
    })

    const projections: ProjectionReport[] = SUPPORTED_JURISDICTIONS.map((value) => {
      const projectionFindings = sortedFindings.filter(
        (finding) => finding.dimension === SUPPORTED_DIMENSION && finding.value === value,
      )
      return {
        dimension: SUPPORTED_DIMENSION,
        value,
        visibleGoals: reportGoals.filter((goal) => (goal.compiledApplicability[SUPPORTED_DIMENSION] ?? []).includes(value)).length,
        errors: projectionFindings.filter((finding) => finding.severity === 'error').length,
        warnings: projectionFindings.filter((finding) => finding.severity === 'warning').length,
      }
    })

    reports.push({
      landscapeId: canonical.landscape.landscapeId,
      title: canonical.landscape.title,
      file: repoRelative(canonical.file),
      dimensions: [SUPPORTED_DIMENSION],
      summary: {
        goals: reportGoals.length,
        errors: sortedFindings.filter((finding) => finding.severity === 'error').length,
        warnings: sortedFindings.filter((finding) => finding.severity === 'warning').length,
      },
      goals: reportGoals,
      projections,
      findings: sortedFindings,
    })
  }

  const sortedReports = reports.sort((a, b) => a.landscapeId.localeCompare(b.landscapeId))

  return {
    reports: sortedReports,
    summary: {
      dimensions: [SUPPORTED_DIMENSION],
      supportedValues: [...SUPPORTED_JURISDICTIONS],
      landscapes: sortedReports.length,
      goals: sortedReports.reduce((sum, report) => sum + report.summary.goals, 0),
      errors: sortedReports.reduce((sum, report) => sum + report.summary.errors, 0),
      warnings: sortedReports.reduce((sum, report) => sum + report.summary.warnings, 0),
      reports: sortedReports.map((report) => ({
        landscapeId: report.landscapeId,
        title: report.title,
        file: report.file,
        goals: report.summary.goals,
        errors: report.summary.errors,
        warnings: report.summary.warnings,
        projections: report.projections,
      })),
    },
  }
}

export function writeApplicabilityReports(result: ApplicabilityCompilationResult) {
  mkdirSync(reportDir, { recursive: true })
  writeFileSync(join(reportDir, 'summary.json'), `${JSON.stringify(result.summary, null, 2)}\n`, 'utf8')
  for (const report of result.reports) {
    writeFileSync(join(reportDir, `${report.landscapeId}.json`), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  }
}

export function getApplicabilityReportDir(): string {
  return reportDir
}
