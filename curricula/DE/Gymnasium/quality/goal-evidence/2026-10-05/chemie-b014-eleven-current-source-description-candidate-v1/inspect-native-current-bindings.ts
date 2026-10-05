import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { buildGoalDescriptionReviewInput, buildGoalDescriptionCanonicalContext } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import { fingerprintGoalDescriptionReviewContext, fingerprintGoalDescriptionReviewPage } from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-eleven-current-source-description-candidate-v1'
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const write = (name: string, value: unknown) => writeFileSync(`${own}/${name}`, `${JSON.stringify(value, null, 2)}\n`)
const receipt = read(`${own}/input-receipt.json`)
const ids = new Set<string>(receipt.goalIds)
const landscape = read(receipt.canonical.path)
const goalById = new Map<string, any>(landscape.goals.map((g: any) => [g.id, g]))
const bundle = read(`${receipt.preparedBook.directory}/bundle/manifest.json`)
const reviewInput = read(`${receipt.preparedBook.directory}/bundle/review-input.json`)
const input = buildGoalDescriptionReviewInput({ bundle, reviewInput, landscape })
write('current-description-review-input.json', input)
const prepared = read(receipt.preparedBook.inputPath)
const bindings = input.goals.map(goal => {
 const bound = prepared.goals.find((g: any) => g.goalId === goal.goalId)
 return { goalId: goal.goalId, currentGoalFingerprint: goal.goalFingerprint, currentPageFingerprint: goal.pageFingerprint, currentContextFingerprint: fingerprintGoalDescriptionReviewContext(goal), currentCanonicalContext: buildGoalDescriptionCanonicalContext(goalById.get(goal.goalId)), pageFingerprintNativeMatches: fingerprintGoalDescriptionReviewPage(goal.reviewContext.page) === goal.pageFingerprint, preparedTextAndGoalBindingMatch: ['currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn','goalFingerprint','pageFingerprint'].every(key => bound[key] === (goal as any)[key]), currentGoalPageNumber: goal.reviewContext.page.pageNumber, currentPhysicalPdfPage: goal.reviewContext.page.pageNumber + 2, currentFullBookD2Status: 'open; informed author candidate is not independent dual-round acceptance' }
})
const canonical = normalizeCanonicalLandscape(landscape)
const runtimeMemoryVisibility = receipt.goalIds.length && ['curricula/DE/Gymnasium/composition-views/chemie/de-de-gym-chemistry-gk.view.json', 'curricula/DE/Gymnasium/composition-views/chemie/de-de-gym-chemistry-lk.view.json', 'curricula/DE/Gymnasium/composition-views/chemie/de-de-gym-seki-chemistry.view.json'].map(path => {
  const view = normalizeCompositionView(read(path))
  const compiled = compileCompositionView(view, canonical)
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, new Map(canonical.goals.map(g => [g.id, g])))
  return { path, viewId: view.viewId, compileErrors: compiled.findings.filter(f => f.severity === 'error'), targetedVisibleIds: [...ids].filter(id => roles.targetGoalIds.has(id)), requiredMemoryGoalId: '1e372b97-6f1c-596c-8a8b-fc03193d784a', requiredMemoryTargetVisible: roles.targetGoalIds.has('1e372b97-6f1c-596c-8a8b-fc03193d784a') }
})
const parents = new Map<string, string[]>()
for (const goal of landscape.goals) for (const child of goal.contains ?? []) parents.set(child, [...(parents.get(child) ?? []), goal.id])
const effective = (id: string, seen = new Set<string>()): any[] => {
  if (seen.has(id)) return []
  const next = new Set(seen).add(id)
  return [...(goalById.get(id)?.requires ?? []).map((requiredGoalId: string) => ({ requiredGoalId, sourceGoalId: id, sourceType: id === [...next][0] ? 'direct_requires' : 'cluster_requires', requiredTitleDe: goalById.get(requiredGoalId)?.title, requiredDescriptionDe: goalById.get(requiredGoalId)?.description })), ...(parents.get(id) ?? []).flatMap(parent => effective(parent, next))]
}
write('native-current-binding-checks.json', { observedAt: new Date().toISOString(), status: 'candidate', authority: 'ai_candidate', bindings, runtimeMemoryVisibility, effectivePrerequisiteBindings: [...ids].map(goalId => ({ goalId, bindings: effective(goalId) })), note: 'Native current input/page/context fingerprints and runtime composition compilers; source routing is not source approval, technical historical A/M matches do not adjudicate scientific disagreements, strict closure remains zero.' })
console.log(JSON.stringify({goalCount: bindings.length, allPageFingerprints: bindings.every(b=>b.pageFingerprintNativeMatches), allCurrentTextsAndBindings: bindings.every(b=>b.preparedTextAndGoalBindingMatch), compileErrors: runtimeMemoryVisibility.flatMap(s=>s.compileErrors)}))
