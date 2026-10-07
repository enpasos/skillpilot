import assert from 'node:assert/strict'
import { parseSubjectDurationModelPolicy } from '../../../../../../../app/scripts/goalBookModel.ts'
const singleStatePolicy = {
  schemaVersion: 1,
  decisions: [{
    subject: 'Mathematik',
    jurisdiction: 'DE-BY',
    stage: 'SekI+SekII',
    status: 'reviewed',
    decision: 'single-duration-source',
    durationModels: ['G9'],
  }],
}
assert.deepEqual(
  parseSubjectDurationModelPolicy(singleStatePolicy, 'Mathematik', ['DE-BY'], []).get('DE-BY'),
  {
    jurisdiction: 'DE-BY',
    stage: 'SekI+SekII',
    durationModels: ['G9'],
    decision: 'single-duration-source',
    compositionViewIds: [],
  },
)
const stalePolicyStage = JSON.parse(JSON.stringify(singleStatePolicy)) as typeof singleStatePolicy
stalePolicyStage.decisions[0].stage = 'CrossStage'
assert.throws(
  () => parseSubjectDurationModelPolicy(stalePolicyStage, 'Mathematik', ['DE-BY'], []),
  /unsupported stage CrossStage/u,
)

const invalidSingleStatePolicy = JSON.parse(JSON.stringify(singleStatePolicy)) as typeof singleStatePolicy
invalidSingleStatePolicy.decisions[0].durationModels = ['G8', 'G9']
assert.throws(
  () => parseSubjectDurationModelPolicy(invalidSingleStatePolicy, 'Mathematik', ['DE-BY'], []),
  /single-duration policy.*exactly one duration/u,
)

const neutralStatePolicy = {
  schemaVersion: 1,
  decisions: [{
    subject: 'Mathematik',
    jurisdiction: 'DE-BB',
    stage: 'SekI',
    status: 'reviewed',
    decision: 'duration-neutral-projection',
    durationModels: ['G8', 'G9'],
  }],
}
assert.equal(
  parseSubjectDurationModelPolicy(neutralStatePolicy, 'Mathematik', ['DE-BB'], []).get('DE-BB')?.decision,
  'duration-neutral-projection',
)
assert.throws(
  () => parseSubjectDurationModelPolicy(neutralStatePolicy, 'Mathematik', ['DE-BB'], [{
    viewId: 'unexpected-bb-g8',
    jurisdiction: 'DE-BB',
    stage: 'SekI',
    durationModel: 'G8',
    courseProfile: null,
  }]),
  /duration-neutral-projection policy.*must not admit duration-specific atlas sources/u,
)

const heDualDurationSources = (['G8', 'G9'] as const).flatMap((durationModel) => ([{
  viewId: `he-seki-${durationModel.toLowerCase()}`,
  jurisdiction: 'DE-HE',
  stage: 'SekI',
  durationModel,
  courseProfile: null,
}, {
  viewId: `he-gk-${durationModel.toLowerCase()}`,
  jurisdiction: 'DE-HE',
  stage: 'CrossStage',
  durationModel,
  courseProfile: 'GK',
}, {
  viewId: `he-lk-${durationModel.toLowerCase()}`,
  jurisdiction: 'DE-HE',
  stage: 'CrossStage',
  durationModel,
  courseProfile: 'LK',
}] as const))
const heDualDurationPolicy = {
  schemaVersion: 1,
  decisions: [{
    subject: 'Mathematik',
    jurisdiction: 'DE-HE',
    stage: 'SekI',
    status: 'reviewed',
    decision: 'dual-duration-different-projection',
    durationModels: ['G8', 'G9'],
    compositionViewIds: heDualDurationSources.map(({ viewId }) => viewId),
  }],
}
assert.equal(
  parseSubjectDurationModelPolicy(
    heDualDurationPolicy,
    'Mathematik',
    ['DE-HE'],
    heDualDurationSources,
  ).get('DE-HE')?.compositionViewIds.length,
  6,
)

const hePolicyWithMissingBinding = JSON.parse(JSON.stringify(heDualDurationPolicy)) as typeof heDualDurationPolicy
hePolicyWithMissingBinding.decisions[0].compositionViewIds.pop()
assert.throws(
  () => parseSubjectDurationModelPolicy(
    hePolicyWithMissingBinding,
    'Mathematik',
    ['DE-HE'],
    heDualDurationSources,
  ),
  /must bind exactly every duration-specific atlas source/u,
)

assert.throws(
  () => parseSubjectDurationModelPolicy(
    heDualDurationPolicy,
    'Mathematik',
    ['DE-HE'],
    [...heDualDurationSources, {
      viewId: 'he-extra-g8',
      jurisdiction: 'DE-HE',
      stage: 'SekI',
      durationModel: 'G8',
      courseProfile: null,
    }],
  ),
  /must bind exactly every duration-specific atlas source/u,
)

const heSourcesWithWrongRole = heDualDurationSources.map((source) => (
  source.viewId === 'he-lk-g9' ? { ...source, courseProfile: 'GK' as const } : source
))
assert.throws(
  () => parseSubjectDurationModelPolicy(
    heDualDurationPolicy,
    'Mathematik',
    ['DE-HE'],
    heSourcesWithWrongRole,
  ),
  /exactly one SekI, CrossStage\/GK, and CrossStage\/LK view/u,
)

const sourceBoundSingleRows = ['parent', 'component', 'second-component'].map((name) => ({
  ...singleStatePolicy.decisions[0],
  sourceExtractionPath: `fixtures/${name}.source-extraction.json`,
}))
const policyRows = (...decisions: Record<string, unknown>[]) => ({ schemaVersion: 1, decisions })
const singleEffectivePolicy = parseSubjectDurationModelPolicy(singleStatePolicy, 'Mathematik', ['DE-BY'], [])
assert.deepEqual(
  parseSubjectDurationModelPolicy(policyRows(...sourceBoundSingleRows), 'Mathematik', ['DE-BY'], []),
  singleEffectivePolicy,
  'different reviewed source paths with identical effective policy yield one country decision',
)
assert.deepEqual(
  parseSubjectDurationModelPolicy(policyRows(...[...sourceBoundSingleRows].reverse()), 'Mathematik', ['DE-BY'], []),
  singleEffectivePolicy,
  'effective policy does not depend on which equivalent source row comes first',
)
assert.deepEqual(
  parseSubjectDurationModelPolicy(policyRows(...sourceBoundSingleRows.map((row, index) => ({
    ...row,
    rationale: `Different source-specific explanation ${index}`,
  }))), 'Mathematik', ['DE-BY'], []),
  singleEffectivePolicy,
  'source-specific provenance explanations do not change effective duration policy',
)
assert.throws(
  () => parseSubjectDurationModelPolicy(policyRows(sourceBoundSingleRows[0], sourceBoundSingleRows[0]), 'Mathematik', ['DE-BY'], []),
  /duplicate Mathematik sourceExtractionPath/u,
  'the same source path is never a second reviewed component',
)
for (const rows of [
  [singleStatePolicy.decisions[0], sourceBoundSingleRows[1]],
  [sourceBoundSingleRows[0], singleStatePolicy.decisions[0]],
  [singleStatePolicy.decisions[0], singleStatePolicy.decisions[0]],
]) {
  assert.throws(
    () => parseSubjectDurationModelPolicy(policyRows(...rows), 'Mathematik', ['DE-BY'], []),
    /must each declare sourceExtractionPath/u,
    'every row in a repeated country group needs its own source path',
  )
}
assert.throws(
  () => parseSubjectDurationModelPolicy(policyRows(sourceBoundSingleRows[0], {
    ...sourceBoundSingleRows[1], sourceExtractionPath: ' ',
  }), 'Mathematik', ['DE-BY'], []),
  /sourceExtractionPath must be a non-empty string/u,
)
for (const changed of [{ durationModels: ['G8'] }, { stage: 'SekI' }]) {
  for (const rows of [
    [sourceBoundSingleRows[0], { ...sourceBoundSingleRows[1], ...changed }],
    [{ ...sourceBoundSingleRows[1], ...changed }, sourceBoundSingleRows[0]],
  ]) {
    assert.throws(
      () => parseSubjectDurationModelPolicy(policyRows(...rows), 'Mathematik', ['DE-BY'], []),
      /conflicting Mathematik decisions/u,
      'valid but incompatible country policies cannot be resolved by row order',
    )
  }
}
for (const [changed, failure] of [
  [{ status: 'candidate' }, /is not reviewed/u],
  [{ stage: 'CrossStage' }, /unsupported stage/u],
  [{ durationModels: ['G10'] }, /unsupported duration/u],
  [{ durationModels: ['G8', 'G9'] }, /single-duration policy.*exactly one duration/u],
  [{ decision: 'unknown-decision' }, /unsupported decision/u],
  [{ compositionViewIds: ['unbound'] }, /references unbound composition view/u],
  [{ compositionViewIds: 'unbound' }, /compositionViewIds must be an array/u],
] as const) {
  assert.throws(
    () => parseSubjectDurationModelPolicy(policyRows(sourceBoundSingleRows[0], {
      ...sourceBoundSingleRows[1], ...changed,
    }), 'Mathematik', ['DE-BY'], []),
    failure,
    'later source rows must pass the same review, stage, duration and view guards',
  )
}
assert.throws(
  () => parseSubjectDurationModelPolicy(policyRows(sourceBoundSingleRows[0], {
    ...sourceBoundSingleRows[1], jurisdiction: 'DE-BB',
    sourceExtractionPath: sourceBoundSingleRows[0].sourceExtractionPath,
  }), 'Mathematik', ['DE-BB', 'DE-BY'], []),
  /duplicate Mathematik sourceExtractionPath/u,
  'a source path cannot silently acquire another country decision',
)
const sourceBoundNeutralRows = ['parent', 'component'].map((name) => ({
  ...neutralStatePolicy.decisions[0], sourceExtractionPath: `fixtures/neutral-${name}.json`,
}))
assert.deepEqual(
  parseSubjectDurationModelPolicy(policyRows(...sourceBoundNeutralRows), 'Mathematik', ['DE-BB'], []),
  parseSubjectDurationModelPolicy(neutralStatePolicy, 'Mathematik', ['DE-BB'], []),
)
assert.throws(
  () => parseSubjectDurationModelPolicy(policyRows(...sourceBoundNeutralRows), 'Mathematik', ['DE-BB'], [{
    viewId: 'unexpected-bb-g8', jurisdiction: 'DE-BB', stage: 'SekI',
    durationModel: 'G8', courseProfile: null,
  }]),
  /duration-neutral-projection policy.*must not admit duration-specific atlas sources/u,
  'merging neutral rows retains the atlas-source guard',
)
const sourceBoundDualRows = ['parent', 'component'].map((name) => ({
  ...heDualDurationPolicy.decisions[0], sourceExtractionPath: `fixtures/dual-${name}.json`,
}))
assert.deepEqual(
  parseSubjectDurationModelPolicy(policyRows(...sourceBoundDualRows), 'Mathematik', ['DE-HE'], heDualDurationSources),
  parseSubjectDurationModelPolicy(heDualDurationPolicy, 'Mathematik', ['DE-HE'], heDualDurationSources),
)
assert.throws(
  () => parseSubjectDurationModelPolicy(policyRows(sourceBoundDualRows[0], {
    ...sourceBoundDualRows[1], compositionViewIds: sourceBoundDualRows[1].compositionViewIds.slice(1),
  }), 'Mathematik', ['DE-HE'], heDualDurationSources),
  /conflicting Mathematik decisions/u,
  'source rows cannot union incomplete or conflicting view bindings',
)
assert.throws(
  () => parseSubjectDurationModelPolicy(policyRows(sourceBoundDualRows[0], {
    ...sourceBoundDualRows[1], decision: 'duration-neutral-projection', compositionViewIds: [],
  }), 'Mathematik', ['DE-HE'], heDualDurationSources),
  /conflicting Mathematik decisions/u,
  'two individually valid decision types still have to agree',
)
assert.throws(
  () => parseSubjectDurationModelPolicy(policyRows(...sourceBoundDualRows), 'Mathematik', ['DE-HE'], heSourcesWithWrongRole),
  /exactly one SekI, CrossStage\/GK, and CrossStage\/LK view/u,
  'merged dual rows retain the exact duration/stage/course-view guard',
)
assert.throws(
  () => parseSubjectDurationModelPolicy(policyRows(...sourceBoundSingleRows), 'Mathematik', ['DE-BB', 'DE-BY'], []),
  /exactly one reviewed.*decision per atlas jurisdiction/u,
  'merging does not fabricate a missing country policy',
)


console.log('Exact existing duration-policy section plus new merge guards passed.');
