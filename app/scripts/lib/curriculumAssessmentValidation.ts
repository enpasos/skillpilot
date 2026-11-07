// SPDX-License-Identifier: Apache-2.0
import { isTrustedRetainedCoverageContext, retainedContextMatchesScope, RETAINED_INFO_OWNER, stableCoverageJson,
  isTrustedCurriculumSourceMaterialContext, sourceMaterialContextMatchesScope, type CurriculumSourceMaterialContext, type CurriculumSourceMaterialManifest,
  type RetainedCoverageContext, type RetainedCoverageManifest } from './retainedAssessmentCoverage'
export interface CurriculumAssessmentScope {
  readonly sourceMaterialContext?: CurriculumSourceMaterialContext
  readonly retainedCoverage?: RetainedCoverageContext
  readonly landscapeId: string
  readonly definitionGoalIds: readonly string[]
  readonly requiredGoalIds: readonly string[]
  readonly discoveryIssues: readonly string[]
}

export interface CurriculumAssessmentValidation extends CurriculumAssessmentScope {
  definitionGoalIds: string[]
  requiredGoalIds: string[]
  discoveryIssues: string[]
  sourceMaterialManifest?: CurriculumSourceMaterialManifest
  retainedCoverageManifest?: RetainedCoverageManifest
  kind: 'structure' | 'readiness'
  checkedGoalIds: string[]
  failingGoalIds: string[]
}

const uniqueStrings = (value: unknown): value is string[] => Array.isArray(value)
  && value.every((id) => typeof id === 'string' && id.length > 0) && new Set(value).size === value.length
const same = (a: string[], b: string[]) => a.length === b.length && a.every((id) => b.includes(id))
const record = (value: unknown): Record<string, unknown> | undefined => value !== null
  && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined

/** Expected scope comes from current source discovery, never the claimed report. */
export function hasCompletePassingCurriculumExamReadiness(
  rules: unknown,
  landscapeId: string,
  expectedScope: unknown,
): boolean {
  const expected = record(expectedScope)
  if (!Array.isArray(rules) || !expected || expected.landscapeId !== landscapeId
    || !uniqueStrings(expected.definitionGoalIds) || !uniqueStrings(expected.requiredGoalIds)
    || !Array.isArray(expected.discoveryIssues) || expected.discoveryIssues.length !== 0) return false
  const retained = expected.retainedCoverage
  if (landscapeId === RETAINED_INFO_OWNER && (!isTrustedRetainedCoverageContext(retained)
    || !retainedContextMatchesScope(retained, landscapeId, expected.definitionGoalIds, expected.requiredGoalIds)
    || retained.manifest.status !== 'pass'
    || retained.manifest.sourceMaterialFailures.structureGoalIds.length !== 0
    || retained.manifest.sourceMaterialFailures.readinessGoalIds.length !== 0)) return false
  const material = expected.sourceMaterialContext
  if (landscapeId !== RETAINED_INFO_OWNER && (!isTrustedCurriculumSourceMaterialContext(material)
    || !sourceMaterialContextMatchesScope(material, landscapeId, expected.definitionGoalIds, expected.requiredGoalIds, expected.discoveryIssues)
    || material.manifest.discoveryIssues.length !== 0
    || material.manifest.sourceMaterialFailures.structureGoalIds.length !== 0
    || material.manifest.sourceMaterialFailures.readinessGoalIds.length !== 0)) return false
  const definitions = expected.definitionGoalIds
  const required = expected.requiredGoalIds
  if (!required.every((id) => definitions.includes(id))) return false
  const graphRules = rules.filter((rule) => record(rule)?.id === 'CQR-001')
  const checkedKeys = record(record(graphRules[0])?.graphIntegrity)?.checkedGoalKeys
  if (graphRules.length !== 1 || !uniqueStrings(checkedKeys)
    || !definitions.every((id) => checkedKeys.includes(`${landscapeId}:${id}`))) return false
  for (const [id, kind] of [['CQR-204', 'structure'], ['CQR-202', 'readiness']] as const) {
    const matches = rules.filter((rule) => record(rule)?.id === id)
    if (matches.length !== 1) return false
    const rule = record(matches[0])!
    const manifest = record(rule.assessmentValidation)
    const metrics = record(rule.metrics)
    if (landscapeId === RETAINED_INFO_OWNER
      && (!isTrustedRetainedCoverageContext(retained)
        || stableCoverageJson(manifest?.retainedCoverageManifest) !== stableCoverageJson(retained.manifest))) return false
    if (landscapeId !== RETAINED_INFO_OWNER
      && (!isTrustedCurriculumSourceMaterialContext(material)
        || stableCoverageJson(manifest?.sourceMaterialManifest) !== stableCoverageJson(material.manifest))) return false
    const checked = kind === 'structure' ? definitions : required
    if (rule.status !== 'pass' || !manifest || !metrics
      || manifest.landscapeId !== landscapeId || manifest.kind !== kind
      || !uniqueStrings(manifest.definitionGoalIds) || !same(manifest.definitionGoalIds, definitions)
      || !uniqueStrings(manifest.requiredGoalIds) || !same(manifest.requiredGoalIds, required)
      || !uniqueStrings(manifest.checkedGoalIds) || !same(manifest.checkedGoalIds, checked)
      || !Array.isArray(manifest.failingGoalIds) || manifest.failingGoalIds.length !== 0
      || !Array.isArray(manifest.discoveryIssues) || manifest.discoveryIssues.length !== 0
      || metrics.examDefinitions !== definitions.length || metrics.requiredExams !== required.length
      || metrics.checkedExams !== checked.length || metrics.weakExamData !== 0 || metrics.discoveryIssues !== 0) return false
  }
  return true
}
