import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal, loadGoalBookBuildInputs, stableGoalBookJson } from '../../../../../../app/scripts/goalBookModel'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'

const root = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/semantic-atomicity/chemie-energy-four-current-20261005-v1'
const landscapePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const semanticPath = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const candidatesPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-energy-four-revision-candidate-v1/description-decisions.candidates.json'
const reviewConfig = 'curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-book-full.config.json'
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const save = (path: string, value: unknown) => writeFileSync(resolve(root, path), `${JSON.stringify(value, null, 2)}\n`)
const digest = (value: unknown) => `sha256:${createHash('sha256').update(stableGoalBookJson(value)).digest('hex')}`
const proposals = read(candidatesPath).goals
const ids = new Set(proposals.map((goal: any) => goal.goalId))
const landscape = read(landscapePath)
const before = structuredClone(landscape)
const semantic = read(semanticPath)
const beforeSemantic = structuredClone(semantic)
const beforeModel = (await loadGoalBookBuildInputs(reviewConfig, root)).model
const changedAt = new Date().toISOString()
mkdirSync(resolve(root, own, 'snapshots'), { recursive: true })
save(`${own}/snapshots/four-before-canonical.json`, before.goals.filter((goal: any) => ids.has(goal.id)))
save(`${own}/snapshots/four-before-semantic-kinds.json`, beforeSemantic.decisions.filter((goal: any) => ids.has(goal.goalId)))

for (const proposal of proposals) {
  const goal = landscape.goals.find((entry: any) => entry.id === proposal.goalId)
  if (!goal || goal.description !== proposal.beforeDescriptionDe || goal.descriptionEn !== proposal.beforeDescriptionEn) {
    throw new Error(`Before description disagrees for ${proposal.goalId}`)
  }
  if (JSON.stringify(goal.requires) !== JSON.stringify(proposal.requiresUnchanged)) {
    throw new Error(`Prerequisites disagree for ${proposal.goalId}`)
  }
  goal.description = proposal.afterDescriptionDe
  goal.descriptionEn = proposal.afterDescriptionEn
  const decision = semantic.decisions.find((entry: any) => entry.goalId === goal.id)
  if (decision.semanticKind !== 'curricularAtomic') throw new Error(`Semantic kind disagrees for ${goal.id}`)
  decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
}
save(landscapePath, landscape)
save(semanticPath, semantic)
const afterModel = (await loadGoalBookBuildInputs(reviewConfig, root)).model
const changedPageIds = afterModel.pages.filter((page: any) => {
  const prior = beforeModel.pages.find((entry: any) => entry.goalId === page.goalId)
  return !prior || digest(prior) !== digest(page)
}).map((page: any) => page.goalId)
const context = (page: any, graph: any) => {
  const goal = graph.goals.find((entry: any) => entry.id === page.goalId)
  return {
    goalId: page.goalId,
    goalFingerprint: page.goalFingerprint,
    pageFingerprint: page.pageFingerprint,
    currentTitleDe: goal.title,
    currentTitleEn: goal.titleEn,
    currentDescriptionDe: goal.description,
    currentDescriptionEn: goal.descriptionEn,
    canonicalContext: buildGoalDescriptionCanonicalContext(goal),
    reviewContext: { page, evidenceProfile: null },
  }
}
const contextFingerprint = (page: any, graph: any) => digest({ contract: 'goal-description-review-context-v1', goal: context(page, graph) })
const changedContextIds = afterModel.pages.filter((page: any) => {
  const prior = beforeModel.pages.find((entry: any) => entry.goalId === page.goalId)
  return !prior || contextFingerprint(prior, before) !== contextFingerprint(page, landscape)
}).map((page: any) => page.goalId)
const dependencyCandidates = before.goals.filter((goal: any) =>
  (goal.requires ?? []).some((id: string) => ids.has(id))
  || (goal.contains ?? []).some((id: string) => ids.has(id))
).map((goal: any) => {
  const prior = beforeModel.pages.find((entry: any) => entry.goalId === goal.id)
  const page = afterModel.pages.find((entry: any) => entry.goalId === goal.id)
  return {
    goalId: goal.id, title: goal.title,
    requires: goal.requires ?? [], contains: goal.contains ?? [],
    compiledAsAtomicPage: !!page,
    pageChanged: prior && page ? digest(prior) !== digest(page) : null,
    contextChanged: prior && page ? contextFingerprint(prior, before) !== contextFingerprint(page, landscape) : null,
    ...(prior && page ? {
      beforePageFingerprint: prior.pageFingerprint, afterPageFingerprint: page.pageFingerprint,
      beforeContextFingerprint: contextFingerprint(prior, before), afterContextFingerprint: contextFingerprint(page, landscape),
    } : {}),
  }
})
const changes = proposals.map((proposal: any) => {
  const prior = before.goals.find((entry: any) => entry.id === proposal.goalId)
  const current = landscape.goals.find((entry: any) => entry.id === proposal.goalId)
  const changedFields = Object.keys(current).filter((key) => JSON.stringify(current[key]) !== JSON.stringify(prior[key]))
  if (JSON.stringify(changedFields) !== JSON.stringify(['description', 'descriptionEn'])) {
    throw new Error(`Unexpected changed fields for ${proposal.goalId}: ${changedFields}`)
  }
  return {
    goalId: proposal.goalId, changedFields,
    beforeDescriptionDe: prior.description, afterDescriptionDe: current.description,
    beforeDescriptionEn: prior.descriptionEn, afterDescriptionEn: current.descriptionEn,
    beforeSemanticKindFingerprint: beforeSemantic.decisions.find((entry: any) => entry.goalId === current.id).sourceFingerprint,
    afterSemanticKindFingerprint: semantic.decisions.find((entry: any) => entry.goalId === current.id).sourceFingerprint,
  }
})
for (const prior of before.goals.filter((goal: any) => !ids.has(goal.id))) {
  const current = landscape.goals.find((goal: any) => goal.id === prior.id)
  if (digest(prior) !== digest(current)) throw new Error(`Unowned goal changed ${prior.id}`)
}
for (const prior of beforeSemantic.decisions.filter((goal: any) => !ids.has(goal.goalId))) {
  const current = semantic.decisions.find((goal: any) => goal.goalId === prior.goalId)
  if (digest(prior) !== digest(current)) throw new Error(`Unowned semantic decision changed ${prior.goalId}`)
}
save(`${own}/description-and-context-integration.receipt.json`, {
  schemaVersion: 1, changedAt,
  reviewer: 'Codex independent Chemistry four implementation/source/A/M lane',
  status: 'active_intermediate_final_D_P_V_pending',
  canonicalPath: landscapePath, semanticKindPath: semanticPath, candidatesPath,
  changedGoalCount: changes.length, changes,
  unchangedCanonicalGoals: before.goals.length - ids.size,
  unchangedSemanticDecisions: beforeSemantic.decisions.length - ids.size,
  topologyAndResourcesUnchanged: true,
  comparisonConfigPath: reviewConfig,
  comparisonKind: 'read_only_in_memory_current_projection_no_PDF_or_application_build',
  beforeModelDigest: beforeModel.digest, afterModelDigest: afterModel.digest,
  changedPageIds, changedContextIds, dependencyCandidates,
  contextComparisonCaveat: 'This is the full current canonical review projection before/after this exact description change. Existing strict batch-specific current contexts must still be compared by final integration; no prior D/P/V review is replaced or restored here.',
  strictNetCompletionClaim: 0, humanApprovalClaim: false,
})
console.log(JSON.stringify({ changedGoalCount: changes.length, changedPageIds, changedContextIds, dependencyCandidates }, null, 2))
