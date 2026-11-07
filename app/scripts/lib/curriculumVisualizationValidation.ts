// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { readFileSync, realpathSync } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'
import type { LearningGoal } from '../../src/landscapeTypes'
import { isAiApprovedForCurrentAsset } from '../../src/utils/goalVisualizationQaStatus'
import { qualifiedVisualizationAuthority, createQualifiedVisualizationContextAuthority } from './qualifiedVisualizationContextAuthority'

export interface CurriculumVisualizationValidation {
  readonly landscapeId: string
  readonly landscapePath: string
  readonly subject: string
  readonly currentGoalIds: readonly string[]
  readonly readyGoalIds: readonly string[]
  readonly deferredGoalIds: readonly string[]
  readonly contextsSha256: string
  readonly indexSha256: string
  readonly capsuleSha256: string
  readonly issues: readonly string[]
}
const nativeScopes = new WeakSet<object>()
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
const unique = (ids: readonly string[]) => ids.length > 0 && ids.every(id => typeof id === 'string' && id.length > 0)
  && new Set(ids).size === ids.length

function captureCurrentVisualizationScope(input: CurriculumVisualizationValidation): CurriculumVisualizationValidation {
  const scope = Object.freeze({ ...input, currentGoalIds: Object.freeze([...input.currentGoalIds].sort()),
    readyGoalIds: Object.freeze([...input.readyGoalIds].sort()), deferredGoalIds: Object.freeze([...input.deferredGoalIds].sort()),
    issues: Object.freeze([...input.issues].sort()) })
  nativeScopes.add(scope)
  return scope
}

export interface VisualizationGateRecord {
  goalId: string; title: string; description: string; subject: string; landscapeId: string; landscapePath: string
  visualizationState: string; missingReason: string; imageUrl: string; publicAssetPath: string; canonicalAssetPath: string
  assetSha256: string; aiApproved?: unknown; aiApprovedAssetSha256?: unknown; aiReviewedAt?: unknown
}

/** Shared native V boundary. It evaluates current inputs, never ready-ID claims. */
export function evaluateCurrentVisualizationGate(input: {
  repositoryRoot: string; landscapeId: string; landscapePath: string; subject: string
  goalById: ReadonlyMap<string, LearningGoal & { titleEn?: string; descriptionEn?: string }>
  currentGoalIds: ReadonlySet<string>
  records: readonly VisualizationGateRecord[]
  discoveryIssues?: readonly string[]
}): CurriculumVisualizationValidation {
  const root = realpathSync(input.repositoryRoot), issues = [...(input.discoveryIssues ?? [])]
  const goals = [...input.currentGoalIds].sort(), ready: string[] = [], deferred: string[] = [], contexts: unknown[] = []
  const records = new Map<string, VisualizationGateRecord>(), duplicates = new Set<string>()
  for (const row of input.records) { if (records.has(row.goalId)) duplicates.add(row.goalId); records.set(row.goalId, row) }
  for (const id of duplicates) issues.push(`duplicate visualization-QA record for ${id}`)
  const normalized = (value: unknown) => String(value ?? '').replace(/\s+/gu, ' ').trim()
  const verify = createQualifiedVisualizationContextAuthority(root)
  const actualBytes = (path: string) => {
    const absolute = realpathSync(resolve(root, path)), local = relative(root, absolute)
    if (!local || local.startsWith('../') || isAbsolute(local)) throw new Error('Current visualization asset leaves repository')
    return readFileSync(absolute)
  }
  for (const goalId of goals) {
    const goal = input.goalById.get(goalId), row = records.get(goalId)
    // Bind all current definitions/rows, including failures, for stored-report replay.
    contexts.push({ goalId, goal: goal ?? null, record: row ?? null })
    let reason = ''
    if (!goal || !row || duplicates.has(goalId)) reason = 'missing or duplicate current goal/QA record'
    else if (row.subject !== input.subject || row.landscapeId !== input.landscapeId
      || row.landscapePath !== input.landscapePath || normalized(row.title) !== normalized(goal.title)
      || normalized(row.description) !== normalized(goal.description)) reason = 'current goal/QA identity or text differs'
    else {
      const primary = (goal.resourceLinks ?? []).filter(link => link.type === 'goal-visualization' && link.role === 'primary')
      if (row.visualizationState === 'missing') {
        if ((row.missingReason === 'deferred_provider_limitation' || row.missingReason === 'deferred_quality_review')
          && primary.length === 0 && !row.imageUrl && !row.assetSha256) deferred.push(goalId)
        reason = 'necessary visualization is missing or deferred'
      } else if (row.visualizationState !== 'available' || row.missingReason !== '' || primary.length !== 1
        || primary[0].url !== row.imageUrl || !/^sha256:[0-9a-f]{64}$/u.test(row.assetSha256)
        || !isAiApprovedForCurrentAsset(row)) reason = 'current image/AI approval preconditions are incomplete'
      else try {
        const publicBytes = actualBytes(row.publicAssetPath), canonicalBytes = actualBytes(row.canonicalAssetPath)
        const publicHash = 'sha256:' + createHash('sha256').update(publicBytes).digest('hex')
        const canonicalHash = 'sha256:' + createHash('sha256').update(canonicalBytes).digest('hex')
        contexts.push({ goalId, publicHash, canonicalHash })
        if (row.publicAssetPath !== `app/public${row.imageUrl}` || publicHash !== row.assetSha256 || canonicalHash !== row.assetSha256) {
          reason = 'current actual image bytes differ'
        } else {
          const result = verify({ landscapeId: input.landscapeId, goalId, subject: input.subject,
            title: goal.title, description: goal.description, titleEn: goal.titleEn, descriptionEn: goal.descriptionEn,
            demandLevel: goal.dimensionTags?.demandLevel, imageUrl: row.imageUrl, publicAssetPath: row.publicAssetPath,
            canonicalAssetPath: row.canonicalAssetPath, assetSha256: publicHash })
          if (!result.ok) reason = result.issues.join('; ')
        }
      } catch (error) { reason = error instanceof Error ? error.message : String(error) }
    }
    if (reason) issues.push(`${input.subject}: ${goalId}: ${reason}`)
    else ready.push(goalId)
  }
  if (goals.length === 0) issues.push('Current curricularAtomic visualization scope is empty')
  return captureCurrentVisualizationScope({ landscapeId: input.landscapeId, landscapePath: input.landscapePath,
    subject: input.subject, currentGoalIds: goals, readyGoalIds: ready, deferredGoalIds: deferred,
    contextsSha256: visualizationContextDigest(contexts), indexSha256: qualifiedVisualizationAuthority.indexSha256,
    capsuleSha256: qualifiedVisualizationAuthority.capsuleSha256, issues: [...new Set(issues)] })
}

export const visualizationContextDigest = (contexts: readonly unknown[]) => createHash('sha256')
  .update(JSON.stringify(contexts)).digest('hex')

export function hasCompleteCurrentVisualizationScope(expected: CurriculumVisualizationValidation | undefined): boolean {
  return !!expected && nativeScopes.has(expected) && unique(expected.currentGoalIds)
    && same(expected.readyGoalIds, expected.currentGoalIds) && expected.deferredGoalIds.length === 0
    && expected.issues.length === 0 && expected.indexSha256 === qualifiedVisualizationAuthority.indexSha256
    && expected.capsuleSha256 === qualifiedVisualizationAuthority.capsuleSha256
}

export const hasMatchingVisualizationContextManifest = (manifest: unknown, expected: CurriculumVisualizationValidation | undefined) => (
  !!expected && nativeScopes.has(expected) && same(manifest, expected)
)

/** A serialized pass is insufficient without the independently read current scope. */
export function hasCompletePassingVisualizationContext(
  rules: unknown,
  landscapeId: string,
  expected: CurriculumVisualizationValidation | undefined,
): boolean {
  if (!expected || !hasCompleteCurrentVisualizationScope(expected) || expected.landscapeId !== landscapeId || !Array.isArray(rules)) return false
  const matches = rules.filter(rule => rule?.id === 'CQR-303')
  const graphs = rules.filter(rule => rule?.id === 'CQR-001')
  const checked = graphs[0]?.graphIntegrity?.checkedGoalKeys
  if (matches.length !== 1 || graphs.length !== 1 || !Array.isArray(checked)
    || !expected.currentGoalIds.every(id => checked.includes(`${landscapeId}:${id}`))) return false
  const rule = matches[0]
  return rule.status === 'pass' && same(rule.visualizationValidation, expected)
    && rule.metrics?.expectedGoals === expected.currentGoalIds.length
    && rule.metrics?.currentVisualizationQaRecords === expected.currentGoalIds.length
    && rule.metrics?.currentDescriptionResolutions === expected.currentGoalIds.length
    && rule.metrics?.currentPositiveEvidenceProfiles === expected.currentGoalIds.length
    && rule.metrics?.currentSemanticAtomicityDecisions === expected.currentGoalIds.length
    && rule.metrics?.currentMemoryReviewDecisions === expected.currentGoalIds.length
    && rule.metrics?.requiredChecksPassed === 6 && rule.metrics?.requiredChecksTotal === 6
    && rule.metrics?.strictComplete === expected.currentGoalIds.length
    && rule.metrics?.remaining === 0 && rule.metrics?.blockingIssues === 0
}
