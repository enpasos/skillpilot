import assert from 'node:assert/strict'
import { clearUnitStudyIntent, readUnitStudyIntent, saveUnitStudyIntent, UNIT_STUDY_INTENT_KEY,
  unitStudyIntentDecision, type UnitStudyIntent } from './unitStudyIntent'

const intent: UnitStudyIntent = { learnerId: 'learner-a', curriculumId: 'gymnasium', scopeKey: 'HE:G9:Physics:GK',
  originGoalId: 'projectile', orientationGoalId: 'motion-introduction', targetGoalId: 'projectile', routeSettled: false }
const context = { learnerId: intent.learnerId, curriculumId: intent.curriculumId, scopeKey: intent.scopeKey,
  routeGoalId: intent.originGoalId }
assert.equal(unitStudyIntentDecision(intent, context), 'pending', 'The outgoing source route is not a cancellation')
assert.equal(unitStudyIntentDecision(intent, { ...context, routeGoalId: '' }), 'pending')
assert.equal(unitStudyIntentDecision(intent, { ...context, routeGoalId: intent.orientationGoalId }), 'settled')
const settled = { ...intent, routeSettled: true }
assert.equal(unitStudyIntentDecision(settled, { ...context, routeGoalId: intent.orientationGoalId }), 'settled')
for (const changed of [
  { learnerId: 'learner-b' }, { curriculumId: 'another-curriculum' }, { scopeKey: 'HE:G8:Physics:LK' },
  { routeGoalId: 'another-goal' }, { routeGoalId: intent.originGoalId }, { routeGoalId: '' },
]) assert.equal(unitStudyIntentDecision(settled, { ...context, routeGoalId: intent.orientationGoalId, ...changed }), 'discard')
const values = new Map<string, string>()
const storage = { getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => { values.set(key, value) }, removeItem: (key: string) => { values.delete(key) } }
clearUnitStudyIntent(storage)
saveUnitStudyIntent(intent, storage)
assert.deepEqual(JSON.parse(values.get(UNIT_STUDY_INTENT_KEY)!), intent)
assert.deepEqual(readUnitStudyIntent(storage), intent)
saveUnitStudyIntent(settled, storage)
assert.deepEqual(readUnitStudyIntent(storage), settled)
clearUnitStudyIntent(storage)
assert.equal(readUnitStudyIntent(storage), null)
for (const invalid of [{}, [], { ...intent, targetGoalId: '' }, { ...intent, routeSettled: 'yes' }]) {
  storage.setItem(UNIT_STUDY_INTENT_KEY, JSON.stringify(invalid))
  assert.equal(readUnitStudyIntent(storage), null)
  assert.equal(storage.getItem(UNIT_STUDY_INTENT_KEY), null)
}
console.log('Unit study navigation intent passed: outgoing route, settled reload context, goal/learner/curriculum/scope invalidation, bounded tab storage and no learner result.')
