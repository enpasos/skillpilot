import assert from 'node:assert/strict'
import { materializeNationalStageProjection, type NationalStageExposure, type StageProjection } from './lib/nationalStageProjection'

const set = (...ids: string[]) => new Set(ids)
const sorted = (ids: ReadonlySet<string>) => [...ids].sort()
const lowerDefault: StageProjection = { targetGoalIds: set('lower'), visibleGoalIds: set('lower', 'support') }
const national = (viewId: string, courseProfile: string, upperOnly: string): NationalStageExposure => ({
  viewId, landscapeId: 'physics', scope: { schoolForm: 'Gymnasium', stage: 'CrossStage', courseProfile },
  targetGoalIds: set('lower', 'motion', 'terminal', upperOnly),
  visibleGoalIds: set('lower', 'motion', 'terminal', 'support', upperOnly),
})
const family = [national('national-gk', 'GK', 'gk-upper'), national('national-lk', 'LK', 'lk-upper')]
const lowerBW: StageProjection = {
  targetGoalIds: set('lower', 'motion', 'terminal', 'support', 'land-only'),
  visibleGoalIds: set('lower', 'motion', 'terminal', 'support', 'land-only'),
}
const input = {
  landscapeId: 'physics', scope: { schoolForm: 'Gymnasium', stage: 'SekI' },
  defaultProjection: lowerDefault, jurisdiction: 'DE-BW',
  sourceViewIds: ['national-gk', 'national-lk'], nationalExposureFamily: family,
  stageAuthorities: [lowerBW, structuredClone(lowerBW)],
}
const snapshot = structuredClone(input)
const bw = materializeNationalStageProjection(input)
assert.deepEqual(bw.errors, [])
assert.deepEqual(sorted(bw.projection.targetGoalIds), ['lower', 'motion', 'terminal'],
  'BW can assign a nationally exposed upper-stage task to its actual lower-stage target space')
assert.deepEqual(sorted(bw.projection.visibleGoalIds), ['lower', 'motion', 'support', 'terminal'])
assert(!bw.projection.targetGoalIds.has('support'), 'national prerequisite-only support never becomes a target')
assert(!bw.projection.visibleGoalIds.has('land-only'), 'an unexposed Land goal is not silently imported')
assert.deepEqual(input, snapshot, 'the materializer never mutates views, catalog goals or source sets')

const he = materializeNationalStageProjection({ ...input, jurisdiction: 'DE-HE', stageAuthorities: [lowerDefault] })
assert.deepEqual(he.errors, [])
assert.deepEqual(sorted(he.projection.targetGoalIds), ['lower'], 'HE keeps upper-stage motion out of its lower-stage targets')
assert.deepEqual(sorted(he.projection.visibleGoalIds), ['lower', 'support'])
const canonicalDefault = materializeNationalStageProjection({ ...input, jurisdiction: null, sourceViewIds: [], stageAuthorities: [] })
assert.deepEqual(canonicalDefault.errors, [])
assert.deepEqual(canonicalDefault.projection, lowerDefault, 'no Land selection leaves the authored national default intact')

// An independently expected terminal remains required even if every bound full
// national source loses it. It must remain missing, rather than be supplied by
// the Land authority or disappear from the expected endpoint contract.
const expectedTerminals = set('terminal')
const noTerminalFamily = family.map(source => ({ ...source,
  targetGoalIds: new Set([...source.targetGoalIds].filter(id => id !== 'terminal')),
  visibleGoalIds: new Set([...source.visibleGoalIds].filter(id => id !== 'terminal')),
}))
const missing = materializeNationalStageProjection({ ...input, nationalExposureFamily: noTerminalFamily })
assert.deepEqual(missing.errors, [])
assert.deepEqual([...expectedTerminals].filter(id => !missing.projection.targetGoalIds.has(id)), ['terminal'])
const supportOnlyTerminal = materializeNationalStageProjection({ ...input, nationalExposureFamily: family.map(source => ({
  ...source, targetGoalIds: new Set([...source.targetGoalIds].filter(id => id !== 'terminal')),
})) })
assert(supportOnlyTerminal.projection.visibleGoalIds.has('terminal'))
assert(!supportOnlyTerminal.projection.targetGoalIds.has('terminal'), 'a support-only terminal still fails the expected endpoint contract')

const noPrerequisite = materializeNationalStageProjection({ ...input, nationalExposureFamily: family.map(source => ({
  ...source, visibleGoalIds: new Set([...source.visibleGoalIds].filter(id => id !== 'support')),
})) })
assert(!noPrerequisite.projection.visibleGoalIds.has('support'),
  'missing whole-task preparation remains missing; neither canonical requires nor a Land path auto-imports it')
const differingCourses = materializeNationalStageProjection({ ...input, nationalExposureFamily: [family[0], {
  ...family[1], targetGoalIds: set('lower'), visibleGoalIds: set('lower', 'motion'),
}] })
assert.deepEqual(differingCourses.errors, [])
assert.deepEqual(differingCourses.projection, bw.projection,
  'the explicitly complete neutral GK/LK family can expose content from either course, without widening the Land authority')

const rejects: Array<[string, Parameters<typeof materializeNationalStageProjection>[0], RegExp]> = [
  ['missing binding', { ...input, sourceViewIds: [] }, /binding/],
  ['duplicate binding', { ...input, sourceViewIds: ['national-gk', 'national-gk'] }, /duplicate/],
  ['missing source', { ...input, nationalExposureFamily: [family[0]] }, /Missing or ambiguous/],
  ['duplicate source identity', { ...input, nationalExposureFamily: [...family, family[0]] }, /Missing or ambiguous/],
  ['incomplete neutral family', { ...input, sourceViewIds: ['national-gk'] }, /Incomplete course-neutral/],
  ['wrong course', { ...input, scope: { ...input.scope, courseProfile: 'GK' } }, /Incompatible/],
  ['wrong duration', { ...input, scope: { ...input.scope, durationModel: 'G8' } }, /Incompatible/],
  ['wrong landscape', { ...input, nationalExposureFamily: family.map(source => ({ ...source, landscapeId: 'other' })) }, /Incompatible/],
  ['Land source', { ...input, nationalExposureFamily: family.map(source => ({ ...source, scope: { ...source.scope, jurisdiction: 'DE-BW' } })) }, /Incompatible/],
  ['isolated source is not a full source', { ...input, nationalExposureFamily: family.map(source => ({ ...source, scope: { ...source.scope, stage: 'SekI' } })) }, /Incompatible/],
  ['missing stage authority', { ...input, stageAuthorities: [] }, /Missing jurisdiction/],
  ['different target authority', { ...input, stageAuthorities: [lowerBW, { ...lowerBW, targetGoalIds: set('lower') }] }, /Ambiguous jurisdiction/],
  ['different support authority', { ...input, stageAuthorities: [lowerBW, { ...lowerBW, visibleGoalIds: set('lower') }] }, /Ambiguous jurisdiction/],
  ['unknown neutral course', { ...input, nationalExposureFamily: family.map(source => ({ ...source,
    scope: { ...source.scope, courseProfile: 'UNKNOWN' } })) }, /complete explicit GK\/LK/],
]
for (const [label, candidate, expected] of rejects) {
  const result = materializeNationalStageProjection(candidate)
  assert(result.errors.some(error => expected.test(error)), label)
  assert.deepEqual(result.projection, lowerDefault, `${label}: errors do not create an unbound target or hidden support path`)
}
const specificCourse = materializeNationalStageProjection({
  ...input, scope: { ...input.scope, courseProfile: 'GK' }, sourceViewIds: ['national-gk'],
})
assert.deepEqual(specificCourse.errors, [])
assert.deepEqual(specificCourse.projection, bw.projection)
console.log('National stage compatibility materialization: BW/HE/default, exact neutral GK/LK union, missing endpoint/preparation and 14 fail-closed cases passed.')
