import assert from 'node:assert/strict'
import {
  getOfferedGymnasiumDurationModels,
  getOfferedGymnasiumStages,
  isGymnasiumSubjectOfferedForStageSelection,
  resolveCurriculumOfferingSource,
} from '../src/utils/durationModel'
import { deriveRuntimeCompositionScope } from '../src/utils/compositionViewRuntime'
import type { RuntimeCurriculumCatalog } from '../src/utils/runtimeCurriculumCatalog'

const catalog: RuntimeCurriculumCatalog = {
  catalogApiVersion: '1.2',
  generationSha256: 'a'.repeat(64),
  packages: [{
    packageId: 'fixture.package',
    packageVersion: '1.0.0',
    releaseId: 'fixture-release',
    contentDigest: `sha256:${'b'.repeat(64)}`,
    capabilities: [],
  }],
  rootLandscapeIds: ['fixture.root'],
  landscapes: [{
    packageId: 'fixture.package',
    landscapeId: 'fixture.root',
    role: 'root',
    locale: 'de-DE',
    frameworkId: 'canonical-gymnasium-fixture',
    subject: 'Fixture',
    defaultOfferingId: 'fixture.default',
  }],
  views: [
    { packageId: 'fixture.package', viewId: 'fixture.view.g8', landscapeId: 'fixture.root', scope: { jurisdiction: 'EDU-NORTH', stage: 'SekI', durationModel: 'G8' } },
    { packageId: 'fixture.package', viewId: 'fixture.view.g9', landscapeId: 'fixture.root', scope: { jurisdiction: 'EDU-NORTH', stage: 'SekI', durationModel: 'G9' } },
    { packageId: 'fixture.package', viewId: 'fixture.view.sekii', landscapeId: 'fixture.root', scope: { jurisdiction: 'EDU-NORTH', stage: 'SekII', courseProfile: 'GK' } },
  ],
  offerings: [
    {
      packageId: 'fixture.package',
      offeringId: 'fixture.default',
      landscapeId: 'fixture.root',
      scope: { jurisdiction: 'EDU-NORTH', stage: 'SekI', durationModel: 'G8' },
      resolution: { mode: 'single', viewIds: ['fixture.view.g8'] },
    },
    {
      packageId: 'fixture.package',
      offeringId: 'fixture.g9',
      landscapeId: 'fixture.root',
      scope: { jurisdiction: 'EDU-NORTH', stage: 'SekI', durationModel: 'G9' },
      resolution: { mode: 'single', viewIds: ['fixture.view.g9'] },
    },
    {
      packageId: 'fixture.package',
      offeringId: 'fixture.sekii',
      landscapeId: 'fixture.root',
      scope: { jurisdiction: 'EDU-NORTH', stage: 'SekII', courseProfile: 'GK' },
      resolution: { mode: 'single', viewIds: ['fixture.view.sekii'] },
    },
  ],
  decks: [],
  resources: [],
  sourceEvidence: [],
}

const catalogSource = resolveCurriculumOfferingSource({ mode: 'package', catalog, apiBase: '' })
assert.deepEqual(
  getOfferedGymnasiumDurationModels('fixture.root', 'EDU-NORTH', catalogSource),
  ['G8', 'G9'],
)
assert.deepEqual(
  getOfferedGymnasiumStages('fixture.root', 'EDU-NORTH', catalogSource),
  ['SekI', 'SekII'],
)
assert.equal(
  isGymnasiumSubjectOfferedForStageSelection(
    'fixture.root',
    'EDU-NORTH',
    { sek1Selected: true, sek2Selected: false },
    catalogSource,
  ),
  true,
)
assert.deepEqual(
  getOfferedGymnasiumDurationModels(
    'fixture.root',
    'EDU-NORTH',
    resolveCurriculumOfferingSource({ mode: 'loading' }),
  ),
  [],
)

const repositorySource = resolveCurriculumOfferingSource({ mode: 'repository' })
assert.deepEqual(
  getOfferedGymnasiumDurationModels('68a8ac50-f5f5-4e24-8aa9-5e408ca01ced', 'DE-HE', repositorySource),
  ['G8', 'G9'],
)

assert.deepEqual(
  deriveRuntimeCompositionScope({
    landscapeId: 'fixture.root',
    rootLandscapeId: 'fixture.root',
    scopeEnabled: true,
    catalogJurisdictions: ['EDU-NORTH'],
    learnerPersonalCurriculum: JSON.stringify({
      'fixture.root': { selected: true, filterId: 'EDU-NORTH', durationModel: 'G9' },
      __skillpilot_stage_scope_sek1__: { selected: true },
      __skillpilot_stage_scope_sek2__: { selected: false },
    }),
  }),
  {
    landscapeId: 'fixture.root',
    schoolForm: 'Gymnasium',
    jurisdiction: 'EDU-NORTH',
    stage: 'SekI',
    durationModel: 'G9',
  },
)

for (const courseProfile of ['GK', 'LK'] as const) {
  assert.deepEqual(
    deriveRuntimeCompositionScope({
      landscapeId: 'fixture.root',
      rootLandscapeId: 'fixture.root',
      scopeEnabled: true,
      learnerPersonalCurriculum: JSON.stringify({
        'fixture.root': { selected: true, filterId: courseProfile },
      }),
    }),
    {
      landscapeId: 'fixture.root',
      schoolForm: 'Gymnasium',
      courseProfile,
    },
  )
}

assert.deepEqual(
  deriveRuntimeCompositionScope({
    landscapeId: 'fixture.math',
    rootLandscapeId: 'fixture.root',
    scopeEnabled: true,
    learnerPersonalCurriculum: JSON.stringify({
      'fixture.root': { selected: true, stage: 'SekII' },
      'fixture.math': { selected: true, filterId: 'LK' },
      'fixture.physics': { selected: true, filterId: 'GK' },
    }),
  }),
  {
    landscapeId: 'fixture.math',
    schoolForm: 'Gymnasium',
    stage: 'SekII',
    courseProfile: 'LK',
  },
)

assert.deepEqual(
  deriveRuntimeCompositionScope({
    landscapeId: 'fixture.physics',
    rootLandscapeId: 'fixture.root',
    scopeEnabled: true,
    learnerPersonalCurriculum: JSON.stringify({
      'fixture.root': { selected: true, stage: 'SekII' },
      'fixture.math': { selected: true, filterId: 'LK' },
      'fixture.physics': { selected: true, filterId: 'GK' },
    }),
  }),
  {
    landscapeId: 'fixture.physics',
    schoolForm: 'Gymnasium',
    stage: 'SekII',
    courseProfile: 'GK',
  },
)

assert.deepEqual(
  deriveRuntimeCompositionScope({
    landscapeId: 'fixture.math',
    rootLandscapeId: 'fixture.root',
    scopeEnabled: true,
    learnerPersonalCurriculum: JSON.stringify({
      'fixture.root': { selected: true, stage: 'SekI' },
      'fixture.math': { selected: true, filterId: 'LK' },
    }),
  }),
  {
    landscapeId: 'fixture.math',
    schoolForm: 'Gymnasium',
    stage: 'SekI',
  },
)

assert.deepEqual(
  deriveRuntimeCompositionScope({
    landscapeId: 'fixture.math',
    rootLandscapeId: 'fixture.root',
    scopeEnabled: true,
    learnerPersonalCurriculum: JSON.stringify({
      'fixture.root': { selected: true, stage: 'CrossStage' },
      'fixture.math': { selected: true, filterId: 'LK' },
    }),
  }),
  {
    landscapeId: 'fixture.math',
    schoolForm: 'Gymnasium',
    stage: 'CrossStage',
    courseProfile: 'LK',
  },
)

assert.deepEqual(
  deriveRuntimeCompositionScope({
    landscapeId: 'fixture.root',
    rootLandscapeId: 'fixture.root',
    scopeEnabled: true,
    learnerPersonalCurriculum: JSON.stringify({
      'fixture.root': { selected: true, filterId: 'LK' },
      __skillpilot_stage_scope_sek1__: { selected: true },
      __skillpilot_stage_scope_sek2__: { selected: true },
    }),
  }),
  {
    landscapeId: 'fixture.root',
    schoolForm: 'Gymnasium',
    stage: 'CrossStage',
    courseProfile: 'LK',
  },
)

console.log('Curriculum offering source self-test passed (catalog-only package mode, repository regression).')
