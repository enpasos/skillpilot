import {readFileSync, writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import assert from 'node:assert/strict'
import {normalizeCanonicalLandscape, validateCanonicalLandscape} from '../src/utils/authoring/canonicalAuthoring'
import {normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds} from '../src/utils/authoring/compositionViewAuthoring'

const root = process.cwd()
const evidence = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/'
const author = evidence + 'wirtschaft-four-SourceMemory-current-origin-AM-card-and-BE-visibility-technical-binding-v1/'
const load = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const landscape = normalizeCanonicalLandscape(load('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'))
const diagnostics = validateCanonicalLandscape(landscape)
assert.equal(diagnostics.filter(x => x.severity === 'error').length, 0)
const by = new Map(landscape.goals.map(g => [g.id, g]))
const required = readFileSync(resolve(root, author + 'memory-source25-only.review.jsonl'), 'utf8').trim().split('\n').map(x => JSON.parse(x)).filter(x => x.status === 'memory_required')
const index = load(author + '108-explicit-BE-course-variant-memory-only-placement-successors.portable-index.json')
const outcomes = []
let actualRequiredChecks = 0
for (const item of index.variants) {
  const before = normalizeCompositionView(load(item.before.path))
  const after = normalizeCompositionView(load(item.after.path))
  const compiled = compileCompositionView(after, landscape)
  assert.equal(compiled.findings.filter(x => x.severity === 'error').length, 0)
  const oldRoles = collectCompositionProjectionRoleGoalIds(before.rootNodes, by)
  const roles = collectCompositionProjectionRoleGoalIds(after.rootNodes, by)
  const added = [...roles.targetGoalIds].filter(x => !oldRoles.targetGoalIds.has(x)).sort()
  assert.deepEqual(added, [...item.addedMemoryTargets].sort())
  assert.deepEqual([...roles.prerequisiteOnlyGoalIds].sort(), [...oldRoles.prerequisiteOnlyGoalIds].sort())
  const checks = required.filter(x => roles.targetGoalIds.has(x.goalId))
  assert.equal(checks.filter(x => !x.memoryGoalIds.some((id: string) => roles.targetGoalIds.has(id))).length, 0)
  const cards = added.flatMap(id => {
    const goal = by.get(id)!
    assert.deepEqual(goal.requires, [])
    const data = goal.extendedData as {vocabularySource: string}
    const deck = load('app/public/' + data.vocabularySource.replace(/^\//, ''))
    return deck.cards.map((card: {id: string; originGoalIds: string[]; tags: string[]}) => {
      assert(card.originGoalIds.every(id => roles.targetGoalIds.has(id)))
      assert(card.tags.includes(item.courseProfile))
      return {memoryGoalId: id, deckId: deck.deckId, cardId: card.id, actualCourseTargetOrigins: card.originGoalIds}
    })
  })
  assert.equal(cards.length, item.courseProfile === 'GK' ? 7 : 14)
  actualRequiredChecks += checks.length
  outcomes.push({variantId: item.variantId, profile: item.courseProfile, compilerErrors: 0, exactOrdinaryAndPrerequisiteRoles: true, addedMemoryTargets: added, actualRequiredOriginChecks: checks.length, missingNewMemory: [], currentNewCards: cards})
}
assert.equal(actualRequiredChecks, 972)
const result = {actualNativeCanonicalErrors: 0, actualNativeCompilerErrors108: 0, actualRequiredOriginChecks: actualRequiredChecks, actualNewMemoryMissing: 0, views: outcomes, scope: 'Only independent five-memory metadata and narrow unpublished review-view delta. Source applicability, operative national Source25 discovery and complete BE course acceptance are separate gates.', humanApproval: false, strictNetGain: 0}
writeFileSync(resolve(root, 'actual-independent-native-108-memory-role-card-origin-results.json'), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({views: outcomes.length, actualNativeCanonicalErrors: 0, actualNativeCompilerErrors108: 0, actualRequiredOriginChecks: actualRequiredChecks, actualNewMemoryMissing: 0, GKCardsPerView: 7, LKCardsPerView: 14, strictNetGain: 0}))
