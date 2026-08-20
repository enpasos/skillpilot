import { readFileSync } from 'node:fs'

interface MaturityRule {
  id?: string
  status?: string
  summary?: string
  details?: string[]
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

const statusPath = new URL('../../docs/qa-ci/status/curriculum-quality-status.json', import.meta.url)
const policyPath = new URL('./config/curriculum-maturity-floor-policy.json', import.meta.url)
const artifact = JSON.parse(readFileSync(statusPath, 'utf8')) as { curricula?: CurriculumStatus[] }
const policy = JSON.parse(readFileSync(policyPath, 'utf8')) as FloorPolicy

if (policy.schemaVersion !== 1 || !policy.policyId || policy.baselineDate !== '2026-08-20' || !Array.isArray(policy.floors) || policy.floors.length === 0 || !Array.isArray(policy.exceptions) || !Array.isArray(policy.knownPreBaselineRegressions)) {
  throw new Error('Invalid or empty curriculum maturity-floor policy')
}
if (policy.exceptions.length > 0) {
  throw new Error('Maturity-floor exceptions require the dedicated reviewed exception schema; none is active in policy v1')
}
if (!Array.isArray(artifact.curricula)) throw new Error('Curriculum quality status has no curricula array')

const maturityRank = (value: string | undefined, label: string): number => {
  const match = /^M([0-7])$/.exec(value ?? '')
  if (!match) throw new Error(`Invalid maturity ${JSON.stringify(value)} for ${label}`)
  return Number(match[1])
}

const ruleAppliesAtFloor = (rule: MaturityRule, floorRank: number): boolean => {
  // CQR-303 is the optional M7 visualization layer and is not a reason for an
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
  if (maturityRank(current.maturity, floor.subject) < floorRank) {
    failures.push(`${floor.subject} [${floor.landscapeId}]: current ${current.maturity} is below protected floor ${floor.minimumMaturity}`)
    failures.push(...diagnosticLines(current, floorRank))
  }
}

if (failures.length > 0) {
  throw new Error([
    `Curriculum maturity regression detected by ${policy.policyId}.`,
    ...failures,
    'Restore the fachliche quality gates or obtain an explicit product-owner decision before changing the protected floor.',
  ].join('\n'))
}

console.log(`curriculum maturity floors passed: ${policy.floors.length} protected curricula`)
