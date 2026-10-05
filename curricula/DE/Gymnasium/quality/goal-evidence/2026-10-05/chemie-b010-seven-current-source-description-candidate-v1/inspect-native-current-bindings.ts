import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { buildGoalDescriptionReviewInput, buildGoalDescriptionCanonicalContext } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import { fingerprintGoalDescriptionReviewContext, fingerprintGoalDescriptionReviewPage } from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b010-seven-current-source-description-candidate-v1'
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const write = (name: string, value: unknown) => writeFileSync(`${own}/${name}`, `${JSON.stringify(value, null, 2)}\n`)
const receipt = read(`${own}/input-receipt.json`)
const ids = new Set<string>(receipt.goalIds)
const landscape = read(receipt.canonical.path)
const goalById = new Map<string, any>(landscape.goals.map((g: any) => [g.id, g]))
const bundle = read(`${own}/bundle/manifest.json`)
const reviewInput = read(`${own}/bundle/review-input.json`)
const input = buildGoalDescriptionReviewInput({ bundle, reviewInput, landscape })
write('current-description-review-input.json', input)
const old = read('curricula/DE/Gymnasium/quality/goal-description-review/chemie/rollout-v1/2026-09-30/batch-010-sek1-ions-element-groups-salts-current-9-v1/round-a/description-review-input.json')
const bindings = input.goals.map(goal => {
  const historical = old.goals.find((g: any) => g.goalId === goal.goalId)
  return { goalId: goal.goalId, currentGoalFingerprint: goal.goalFingerprint, currentPageFingerprint: goal.pageFingerprint, currentContextFingerprint: fingerprintGoalDescriptionReviewContext(goal), currentCanonicalContext: buildGoalDescriptionCanonicalContext(goalById.get(goal.goalId)), pageFingerprintNativeMatches: fingerprintGoalDescriptionReviewPage(goal.reviewContext.page) === goal.pageFingerprint, historicalTextUnchanged: ['currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn'].every(key => historical[key] === (goal as any)[key]), historicalSemanticFingerprintUnchanged: historical.goalFingerprint === goal.goalFingerprint, historicalPageBindingCurrent: historical.pageFingerprint === goal.pageFingerprint, currentGoalPageNumber: goal.reviewContext.page.pageNumber, currentPhysicalPdfPage: goal.reviewContext.page.pageNumber + 2, currentFullBookD2Status: 'open; author inspection is not independently accepted dual-round resolution' }
})
const canonical = normalizeCanonicalLandscape(landscape)
const runtimeMemoryVisibility = receipt.goalIds.length && ['curricula/DE/Gymnasium/composition-views/chemie/de-de-gym-chemistry-gk.view.json', 'curricula/DE/Gymnasium/composition-views/chemie/de-de-gym-chemistry-lk.view.json', 'curricula/DE/Gymnasium/composition-views/chemie/de-de-gym-seki-chemistry.view.json'].map(path => {
  const view = normalizeCompositionView(read(path))
  const compiled = compileCompositionView(view, canonical)
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, new Map(canonical.goals.map(g => [g.id, g])))
  return { path, viewId: view.viewId, compileErrors: compiled.findings.filter(f => f.severity === 'error'), targetedVisibleIds: [...ids].filter(id => roles.targetGoalIds.has(id)), requiredMemoryGoalId: '1e372b97-6f1c-596c-8a8b-fc03193d784a', requiredMemoryTargetVisible: roles.targetGoalIds.has('1e372b97-6f1c-596c-8a8b-fc03193d784a') }
})
const registeredRoutes = receipt.registeredDIndexPaths.map((path: string) => {
  const index = read(path)
  return { path, schemaVersion: index.schemaVersion, targetedBatchIds: (index.batchGoalIds ?? []).filter((id: string) => ids.has(id)), targetedDeferrals: (index.deferredGoalIds ?? []).filter((id: string) => ids.has(id)), targetedResolutions: (index.resolutions ?? []).filter((r: any) => ids.has(r.goalId)) }
}).filter((route: any) => route.targetedBatchIds.length || route.targetedDeferrals.length || route.targetedResolutions.length)
const parents = new Map<string, string[]>()
for (const goal of landscape.goals) for (const child of goal.contains ?? []) parents.set(child, [...(parents.get(child) ?? []), goal.id])
const effective = (id: string, seen = new Set<string>()): any[] => {
  if (seen.has(id)) return []
  const next = new Set(seen).add(id)
  return [...(goalById.get(id)?.requires ?? []).map((requiredGoalId: string) => ({ requiredGoalId, sourceGoalId: id, sourceType: id === [...next][0] ? 'direct_requires' : 'cluster_requires', requiredTitleDe: goalById.get(requiredGoalId)?.title, requiredDescriptionDe: goalById.get(requiredGoalId)?.description })), ...(parents.get(id) ?? []).flatMap(parent => effective(parent, next))]
}
write('native-current-binding-checks.json', { observedAt: new Date().toISOString(), status: 'candidate', authority: 'ai_candidate', bindings, registeredRoutes, runtimeMemoryVisibility, effectivePrerequisiteBindings: [...ids].map(goalId => ({ goalId, bindings: effective(goalId) })), note: 'Native current input/page/context fingerprints and runtime composition compilers; source routing is not source approval, technical historical A/M matches do not adjudicate scientific disagreements, strict closure remains zero.' })
const rawCardDeck = read('curricula/DE/Gymnasium/memory-decks/de_gymnasium_chemistry_flashcards_basics_seki.de.json')
write('targeted-memory-card-trace.json', { goalId: '72236f2c-771e-4ab6-933a-e549ee49d15b', memoryGoalId: '1e372b97-6f1c-596c-8a8b-fc03193d784a', deckId: 'de_gymnasium_chemistry_basics_seki', cards: (rawCardDeck.cards ?? rawCardDeck.entries ?? []).filter((c: any) => c.id === 'chem_basics_005'), deckSha256: createHash('sha256').update(readFileSync('curricula/DE/Gymnasium/memory-decks/de_gymnasium_chemistry_flashcards_basics_seki.de.json')).digest('hex'), note: 'Compact particle charges/locations remain justified recall for particle assignment; Rutherford inference needs understanding, not a new recall card.' })
console.log(`Native current bindings inspected: ${bindings.length}; all page fingerprints=${bindings.every(b => b.pageFingerprintNativeMatches)}; all DE/EN texts unchanged=${bindings.every(b => b.historicalTextUnchanged)}`)
