import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { hasCompletePassingSkillGraphIntegrity } from './lib/skillGraphIntegrity'
import { hasCompletePassingCurriculumExamReadiness, type CurriculumAssessmentScope } from './lib/curriculumAssessmentValidation'
import { readCurrentCurriculumAssessmentScopes } from './generateCurriculumQualityStatus'
import { readCurrentCurriculumVisualizationScopes } from './reportDeepUnderstandingRollout'
import { hasCompletePassingVisualizationContext, type CurriculumVisualizationValidation } from './lib/curriculumVisualizationValidation'

interface MaturityRule {
  id?: string
  status?: string
  summary?: string
  details?: string[]
  graphIntegrity?: unknown
  assessmentValidation?: unknown
  visualizationValidation?: unknown
  metrics?: Record<string, number>
}

interface CurriculumStatus {
  landscapeId?: string
  frameworkId?: string
  subject?: string
  maturity?: string
  rules?: MaturityRule[]
  scopes?: Array<{
    scopeId?: string
    maturity?: string
    rules?: MaturityRule[]
  }>
}

interface FloorPolicy {
  schemaVersion?: number
  policyId?: string
  baselineDate?: string
  exceptions?: unknown[]
  knownPreBaselineRegressions?: unknown[]
  floors?: Array<{
    landscapeId?: string
    frameworkId?: string
    subject?: string
    minimumMaturity?: string
    reason?: string
  }>
}


const maturityRank = (value: string | undefined, label: string): number => {
  const match = /^M([0-7])$/.exec(value ?? '')
  if (!match) throw new Error(`Invalid maturity ${JSON.stringify(value)} for ${label}`)
  return Number(match[1])
}

const ruleAppliesAtFloor = (rule: MaturityRule, floorRank: number): boolean => {
  // CQR-303 is the M7 deep curriculum QA layer and is not a reason for an
  // M6-floor failure. Lower-level and unknown rules remain fail-closed.
  if (rule.id === 'CQR-303') return floorRank >= 7
  return true
}

const diagnosticLines = (curriculum: CurriculumStatus, floorRank: number): string[] => {
  const lines: string[] = []
  for (const rule of curriculum.rules ?? []) {
    if (rule.status === 'pass' || !ruleAppliesAtFloor(rule, floorRank)) continue
    lines.push(`  global ${rule.id ?? 'unknown'} ${rule.status ?? 'unknown'}: ${rule.summary ?? ''}`)
    for (const detail of rule.details ?? []) lines.push(`    - ${detail}`)
  }
  for (const scope of curriculum.scopes ?? []) {
    for (const rule of scope.rules ?? []) {
      if (rule.status === 'pass' || !ruleAppliesAtFloor(rule, floorRank)) continue
      lines.push(`  ${scope.scopeId ?? 'unknown-scope'} (${scope.maturity ?? 'unknown'}) ${rule.id ?? 'unknown'} ${rule.status ?? 'unknown'}: ${rule.summary ?? ''}`)
      for (const detail of rule.details ?? []) lines.push(`    - ${detail}`)
    }
  }
  return lines
}

export function collectCurriculumMaturityFloorFailures(
  artifact: { curricula?: CurriculumStatus[] },
  policy: FloorPolicy,
  expectedAssessmentScopes?: ReadonlyMap<string, CurriculumAssessmentScope>,
  expectedVisualizationScopes?: ReadonlyMap<string, CurriculumVisualizationValidation>,
): string[] {
  if (policy.schemaVersion !== 1 || !policy.policyId || policy.baselineDate !== '2026-08-20' || !Array.isArray(policy.floors) || policy.floors.length === 0 || !Array.isArray(policy.exceptions) || !Array.isArray(policy.knownPreBaselineRegressions)) {
    throw new Error('Invalid or empty curriculum maturity-floor policy')
  }
  if (policy.exceptions.length > 0) {
    throw new Error('Maturity-floor exceptions require the dedicated reviewed exception schema; none is active in policy v1')
  }
  if (!Array.isArray(artifact.curricula)) throw new Error('Curriculum quality status has no curricula array')

  const seen = new Set<string>()
  const failures: string[] = []
  for (const floor of policy.floors) {
    if (!floor.landscapeId || !floor.frameworkId || !floor.subject || !floor.minimumMaturity || !floor.reason) {
      throw new Error(`Malformed maturity floor: ${JSON.stringify(floor)}`)
    }
    if (seen.has(floor.landscapeId)) throw new Error(`Duplicate maturity floor: ${floor.landscapeId}`)
    seen.add(floor.landscapeId)
    const matches = artifact.curricula.filter((entry) => entry.landscapeId === floor.landscapeId)
    if (matches.length !== 1) {
      failures.push(`${floor.subject} [${floor.landscapeId}]: expected exactly one status entry, found ${matches.length}`)
      continue
    }
    const current = matches[0]
    if (current.frameworkId !== floor.frameworkId || current.subject !== floor.subject) {
      failures.push(`${floor.subject} [${floor.landscapeId}]: identity mismatch in generated status`)
      continue
    }
    const floorRank = maturityRank(floor.minimumMaturity, `${floor.subject} floor`)
    const graphRules = (current.rules ?? []).filter((rule) => rule.id === 'CQR-001')
    if (floorRank > 0 && (graphRules.length !== 1 || graphRules[0].status !== 'pass'
      || !hasCompletePassingSkillGraphIntegrity(graphRules[0].graphIntegrity, floor.landscapeId))) {
      failures.push(`${floor.subject} [${floor.landscapeId}]: protected maturity has no complete passing strict graph-integrity report`)
    }
    if (floorRank >= 4 && !hasCompletePassingCurriculumExamReadiness(current.rules, floor.landscapeId,
      expectedAssessmentScopes?.get(floor.landscapeId))) {
      failures.push(`${floor.subject} [${floor.landscapeId}]: protected maturity has no complete passing assessment reports bound to current source discovery`)
    }
    if (floorRank >= 7 && !hasCompletePassingVisualizationContext(current.rules, floor.landscapeId,
      expectedVisualizationScopes?.get(floor.landscapeId))) {
      failures.push(`${floor.subject} [${floor.landscapeId}]: protected M7 has no complete passing visualization context report bound to current source/asset/review inputs`)
    }
    if (maturityRank(current.maturity, floor.subject) < floorRank) {
      failures.push(`${floor.subject} [${floor.landscapeId}]: current ${current.maturity} is below protected floor ${floor.minimumMaturity}`)
      failures.push(...diagnosticLines(current, floorRank))
    }
  }

  return failures
}

export function checkCurriculumMaturityFloors(
  artifact: { curricula?: CurriculumStatus[] },
  policy: FloorPolicy,
  expectedAssessmentScopes?: ReadonlyMap<string, CurriculumAssessmentScope>,
  expectedVisualizationScopes?: ReadonlyMap<string, CurriculumVisualizationValidation>,
): void {
  const failures = collectCurriculumMaturityFloorFailures(artifact, policy, expectedAssessmentScopes, expectedVisualizationScopes)
  if (failures.length > 0) {
    throw new Error([
      `Curriculum maturity regression detected by ${policy.policyId}.`,
      ...failures,
      'Restore the fachliche quality gates or obtain an explicit product-owner decision before changing the protected floor.',
    ].join('\n'))
  }
}

function main(): void {
  const statusPath = new URL('../../docs/qa-ci/status/curriculum-quality-status.json', import.meta.url)
  const policyPath = new URL('./config/curriculum-maturity-floor-policy.json', import.meta.url)
  const artifact = JSON.parse(readFileSync(statusPath, 'utf8')) as { curricula?: CurriculumStatus[] }
  const policy = JSON.parse(readFileSync(policyPath, 'utf8')) as FloorPolicy
  const expectedScopes = readCurrentCurriculumAssessmentScopes((policy.floors ?? [])
    .flatMap((floor) => floor.landscapeId ? [floor.landscapeId] : []))
  const expectedVisualizationScopes = readCurrentCurriculumVisualizationScopes((policy.floors ?? [])
    .flatMap(floor => floor.landscapeId && floor.minimumMaturity === 'M7' ? [floor.landscapeId] : []))
  checkCurriculumMaturityFloors(artifact, policy, expectedScopes, expectedVisualizationScopes)
  console.log(`curriculum maturity floors passed: ${policy.floors!.length} protected curricula`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
