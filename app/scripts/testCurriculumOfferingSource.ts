import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  getOfferedGymnasiumDurationModels,
  getOfferedGymnasiumStages,
  isGymnasiumSubjectOfferedForStageSelection,
  resolveCurriculumOfferingSource,
} from '../src/utils/durationModel'
import {
  applyCompositionViewProjection,
  deriveRuntimeCompositionScope,
  selectCompositionManagedLandscapeIds,
  shouldApplyLearnerPlacementFallback,
} from '../src/utils/compositionViewRuntime'
import {
  compareLearnerCompositionScopeMatches,
  scoreLearnerCompositionScope,
} from '../src/utils/learnerCompositionScopeMatching'
import { prepareLandscapeEntries } from '../src/hooks/useLandscapes'
import type { SkillLandscape } from '../src/landscapeTypes'
import {
  getGlobalStageScopeSelection,
  GLOBAL_STAGE_SCOPE_CONFIG_IDS,
  resolvePersonalCurriculumStageScope,
  setGlobalStageScopeSelection,
  synchronizePersonalCurriculumStageScope,
} from '../src/utils/personalCurriculumStageScope'
import {
  resolveLearnerRuntimeOfferingId,
  resolveRuntimeOfferingId,
  type RuntimeCurriculumCatalog,
} from '../src/utils/runtimeCurriculumCatalog'
import { migrateTrainerClassSession } from '../src/utils/trainerLandscapeContext'

const canonicalGymnasiumRootId = 'a0e13c56-c25f-4742-9272-3a1a603ee52e'
const canonicalMathId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'

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
  }, {
    packageId: 'fixture.package',
    landscapeId: canonicalMathId,
    role: 'module',
    locale: 'de-DE',
    frameworkId: 'canonical-gymnasium-fixture',
    subject: 'Mathematik',
    parentLandscapeId: 'fixture.root',
  }],
  views: [
    { packageId: 'fixture.package', viewId: 'fixture.view.g8', landscapeId: 'fixture.root', scope: { jurisdiction: 'EDU-NORTH', stage: 'SekI', durationModel: 'G8' } },
    { packageId: 'fixture.package', viewId: 'fixture.view.g9', landscapeId: 'fixture.root', scope: { jurisdiction: 'EDU-NORTH', stage: 'SekI', durationModel: 'G9' } },
    { packageId: 'fixture.package', viewId: 'fixture.view.sekii', landscapeId: 'fixture.root', scope: { jurisdiction: 'EDU-NORTH', stage: 'SekII', courseProfile: 'GK' } },
    { packageId: 'fixture.package', viewId: 'de-he-gym-sekii-math-lk', landscapeId: canonicalMathId, scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'SekII', courseProfile: 'LK' } },
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
    {
      packageId: 'fixture.package',
      offeringId: 'fixture.he.math.sekii.lk',
      landscapeId: canonicalMathId,
      scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'SekII', courseProfile: 'LK' },
      resolution: { mode: 'single', viewIds: ['de-he-gym-sekii-math-lk'] },
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
  getOfferedGymnasiumDurationModels(canonicalMathId, 'DE-HE', repositorySource),
  ['G8', 'G9'],
)

const hessenMathLkUpperSecondary = {
  [canonicalGymnasiumRootId]: {
    selected: true,
    filterId: 'DE-HE',
    stage: 'SekII',
    durationModel: 'G9',
  },
  [canonicalMathId]: {
    selected: true,
    filterId: 'LK',
    stage: 'CrossStage',
  },
  [GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1]: { selected: true },
  [GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2]: { selected: true },
}
const synchronizedHessenMathLkUpperSecondary =
  synchronizePersonalCurriculumStageScope(hessenMathLkUpperSecondary, {
    rootLandscapeId: canonicalGymnasiumRootId,
    landscapeId: canonicalMathId,
  })

assert.equal(synchronizedHessenMathLkUpperSecondary.stage, 'SekII')
assert.equal(synchronizedHessenMathLkUpperSecondary.corrected, true)
assert.deepEqual(
  getGlobalStageScopeSelection(
    synchronizedHessenMathLkUpperSecondary.config,
    {
      rootLandscapeId: canonicalGymnasiumRootId,
      landscapeId: canonicalMathId,
    },
  ),
  {
    sek1Selected: false,
    sek2Selected: true,
  },
)
assert.equal(
  synchronizedHessenMathLkUpperSecondary.config[canonicalGymnasiumRootId]?.stage,
  'SekII',
)
assert.equal(
  synchronizedHessenMathLkUpperSecondary.config[canonicalGymnasiumRootId]?.durationModel,
  'G9',
  'Stage synchronization must retain the canonical duration model.',
)
assert.equal(
  synchronizedHessenMathLkUpperSecondary.config[canonicalMathId]?.stage,
  undefined,
  'A stale subject stage must not compete with the authoritative root stage.',
)
assert.equal(
  synchronizedHessenMathLkUpperSecondary.config[GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1]?.selected,
  false,
)
assert.equal(
  synchronizedHessenMathLkUpperSecondary.config[GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2]?.selected,
  true,
)

const hessenMathRuntimeScope = deriveRuntimeCompositionScope({
  landscapeId: canonicalMathId,
  rootLandscapeId: canonicalGymnasiumRootId,
  scopeEnabled: true,
  learnerPersonalCurriculum: JSON.stringify(
    synchronizedHessenMathLkUpperSecondary.config,
  ),
})
assert.deepEqual(
  hessenMathRuntimeScope,
  {
    landscapeId: canonicalMathId,
    schoolForm: 'Gymnasium',
    jurisdiction: 'DE-HE',
    stage: 'SekII',
    courseProfile: 'LK',
    durationModel: 'G9',
  },
)
assert.ok(hessenMathRuntimeScope)
const {
  landscapeId: hessenLandscapeId,
  ...hessenMathOfferingScope
} = hessenMathRuntimeScope
assert.equal(hessenLandscapeId, canonicalMathId)
assert.equal(
  resolveRuntimeOfferingId(
    catalog,
    canonicalMathId,
    hessenMathOfferingScope,
  ),
  undefined,
  'Exact package identity must not pretend that a duration-neutral Sek-II offering contains G9.',
)
assert.equal(
  resolveLearnerRuntimeOfferingId(
    catalog,
    canonicalMathId,
    hessenMathOfferingScope,
  ),
  'fixture.he.math.sekii.lk',
  'The learner package adapter must resolve Hessen Mathematics LK Sek II even when G9 remains committed.',
)
assert.equal(
  resolveLearnerRuntimeOfferingId(
    catalog,
    canonicalMathId,
    { ...hessenMathOfferingScope, stage: 'CrossStage' },
  ),
  undefined,
  'The duration-neutral fallback must never widen CrossStage.',
)

const hessenMathSekOneG9Scope = {
  schoolForm: 'Gymnasium',
  jurisdiction: 'DE-HE',
  stage: 'SekI',
  durationModel: 'G9',
}
assert.ok(scoreLearnerCompositionScope(
  {
    schoolForm: 'Gymnasium',
    jurisdiction: 'DE-HE',
    stage: 'SekI',
    durationModel: 'G9',
  },
  hessenMathSekOneG9Scope,
))
assert.equal(
  scoreLearnerCompositionScope(
    {
      schoolForm: 'Gymnasium',
      jurisdiction: 'DE-HE',
      stage: 'SekI',
      durationModel: 'G8',
    },
    hessenMathSekOneG9Scope,
  ),
  null,
  'A committed G9 learner scope must not resolve a G8 composition view.',
)
assert.equal(
  scoreLearnerCompositionScope(
    {
      schoolForm: 'Gymnasium',
      jurisdiction: 'DE-HE',
      stage: 'CrossStage',
      courseProfile: 'LK',
      durationModel: 'G9',
    },
    hessenMathOfferingScope,
  ),
  null,
  'A more specific CrossStage view must not override the exact Sek-II stage anchor.',
)
assert.equal(
  scoreLearnerCompositionScope(
    {
      schoolForm: 'Gymnasium',
      jurisdiction: 'DE-HE',
      stage: 'SekII',
      courseProfile: 'LK',
    },
    {
      ...hessenMathOfferingScope,
      phase: 'Q1',
    },
  ),
  null,
  'Unknown learner-scope dimensions must remain fail-closed.',
)

const durationNeutralSekTwoScore = scoreLearnerCompositionScope(
  {
    schoolForm: 'Gymnasium',
    jurisdiction: 'DE-HE',
    stage: 'SekII',
    courseProfile: 'LK',
  },
  hessenMathOfferingScope,
)
const durationSpecificSekTwoScore = scoreLearnerCompositionScope(
  {
    schoolForm: 'Gymnasium',
    jurisdiction: 'DE-HE',
    stage: 'SekII',
    courseProfile: 'LK',
    durationModel: 'G9',
  },
  hessenMathOfferingScope,
)
assert.ok(durationNeutralSekTwoScore)
assert.ok(durationSpecificSekTwoScore)
assert.ok(
  compareLearnerCompositionScopeMatches(
    durationSpecificSekTwoScore,
    durationNeutralSekTwoScore,
  ) < 0,
  'An exact duration-specific view must outrank a reviewed duration-neutral subset.',
)

assert.equal(
  shouldApplyLearnerPlacementFallback(
    canonicalMathId,
    new Set([canonicalMathId]),
  ),
  false,
  'A composition-managed learner scope must stay fail-closed after a 204 or lookup error.',
)
assert.equal(
  shouldApplyLearnerPlacementFallback(
    canonicalMathId,
    new Set(),
  ),
  true,
  'A landscape without a composition request may still use its ordinary placement projection.',
)

const learnerManagedCompositionIds = selectCompositionManagedLandscapeIds(
  'learner',
  [canonicalMathId],
)
assert.deepEqual(
  [...learnerManagedCompositionIds],
  [canonicalMathId],
  'Learner projection must keep composition-managed landscapes fail-closed.',
)

for (const role of ['trainer', 'explorer'] as const) {
  const managedIds = selectCompositionManagedLandscapeIds(role, [canonicalMathId])
  assert.deepEqual(
    [...managedIds],
    [],
    `${role} must not inherit the learner-only composition fail-closed boundary.`,
  )
  assert.equal(
    shouldApplyLearnerPlacementFallback(canonicalMathId, managedIds),
    true,
    `${role} must retain the ordinary landscape projection when no learner composition view is loaded.`,
  )
}

const hessenMathSekTwoLkView = JSON.parse(readFileSync(
  new URL(
    '../../curricula/DE/Gymnasium/composition-views/mathematik/de-he-sekii-lk.view.json',
    import.meta.url,
  ),
  'utf8',
)) as Record<string, unknown>
assert.equal(
  hessenMathSekTwoLkView.viewId,
  'de-he-gym-sekii-math-lk',
  'The resolved Hessen Mathematics LK upper-secondary scope must use its reviewed Sek-II composition view.',
)

const canonicalMathLandscape = JSON.parse(readFileSync(
  new URL(
    '../../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
    import.meta.url,
  ),
  'utf8',
)) as SkillLandscape
const [projectedHessenMath] = applyCompositionViewProjection(
  prepareLandscapeEntries([canonicalMathLandscape]),
  hessenMathSekTwoLkView,
)
assert.ok(projectedHessenMath)
const projectedGoalById = new Map(
  projectedHessenMath.goals.map((goal) => [goal.id, goal]),
)
const projectedMathRoot = projectedHessenMath.goals.find((goal) =>
  (goal.tags ?? []).includes('root'),
)
assert.ok(projectedMathRoot)
const projectedMathRootChildTitles = projectedMathRoot.contains.map(
  (goalId) => projectedGoalById.get(goalId)?.title,
)
assert.deepEqual(
  projectedMathRootChildTitles,
  ['Sekundarstufe II (LK)'],
  'The learner-facing Mathematics root must expose only the authored Sek-II LK structure.',
)
for (const canonicalFallbackSibling of [
  'Sekundarstufe I',
  'Zahlen, Terme und Algebra',
  'Geometrie und Raum',
  'Lernkarten – Sek I Kernformeln',
]) {
  assert.equal(
    projectedMathRootChildTitles.includes(canonicalFallbackSibling),
    false,
    `${canonicalFallbackSibling} must not remain a direct learner-facing Mathematics sibling.`,
  )
}

const unresolvedStageConfig = {
  [canonicalGymnasiumRootId]: {
    selected: true,
    filterId: 'DE-HE',
  },
  [GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1]: { selected: false },
  [GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2]: { selected: false },
}
const synchronizedUnresolvedStage = synchronizePersonalCurriculumStageScope(
  unresolvedStageConfig,
  { rootLandscapeId: canonicalGymnasiumRootId },
)
assert.equal(synchronizedUnresolvedStage.corrected, false)
assert.equal(
  resolvePersonalCurriculumStageScope(
    synchronizedUnresolvedStage.config,
    { rootLandscapeId: canonicalGymnasiumRootId },
  ),
  undefined,
)
assert.deepEqual(
  getGlobalStageScopeSelection(
    synchronizedUnresolvedStage.config,
    { rootLandscapeId: canonicalGymnasiumRootId },
  ),
  {
    sek1Selected: false,
    sek2Selected: false,
  },
  'An unresolved or explicit false/false stage must not become CrossStage.',
)

assert.deepEqual(
  getGlobalStageScopeSelection(
    {
      [canonicalGymnasiumRootId]: {
        selected: true,
        filterId: 'DE-HE',
      },
    },
    { rootLandscapeId: canonicalGymnasiumRootId },
  ),
  {
    sek1Selected: false,
    sek2Selected: false,
  },
  'Missing canonical and legacy stage values must remain unresolved.',
)

const upperSecondaryFromEmptyConfig = setGlobalStageScopeSelection(
  {},
  {
    sek1Selected: false,
    sek2Selected: true,
  },
  { rootLandscapeId: canonicalGymnasiumRootId },
)
assert.deepEqual(
  upperSecondaryFromEmptyConfig[canonicalGymnasiumRootId],
  {
    selected: true,
    stage: 'SekII',
  },
  'A UI stage change must immediately write the canonical root stage.',
)
assert.equal(
  upperSecondaryFromEmptyConfig[GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1]?.selected,
  false,
)
assert.equal(
  upperSecondaryFromEmptyConfig[GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2]?.selected,
  true,
)

const migratedSubjectStage = synchronizePersonalCurriculumStageScope(
  {
    [canonicalMathId]: {
      selected: true,
      filterId: 'LK',
      stage: 'SekII',
    },
  },
  {
    rootLandscapeId: canonicalGymnasiumRootId,
    landscapeId: canonicalMathId,
  },
).config
assert.equal(
  migratedSubjectStage[canonicalGymnasiumRootId]?.stage,
  'SekII',
  'A legacy subject stage must migrate to the canonical root.',
)
assert.equal(migratedSubjectStage[canonicalMathId]?.stage, undefined)

const migratedTrainerSession = migrateTrainerClassSession({
  id: 'hessen-math-lk-g9',
  name: 'Mathematik LK Oberstufe',
  landscapeId: canonicalMathId,
  activeFilter: 'DE-HE',
  rootLandscapeId: canonicalGymnasiumRootId,
  personalConfig: hessenMathLkUpperSecondary,
  students: [],
})
assert.equal(
  migratedTrainerSession.personalConfig?.[canonicalGymnasiumRootId]?.stage,
  'SekII',
)
assert.equal(
  migratedTrainerSession.personalConfig?.[canonicalGymnasiumRootId]?.durationModel,
  'G9',
  'Trainer session migration must retain the canonical G9 duration model.',
)
assert.equal(
  migratedTrainerSession.personalConfig?.[canonicalMathId]?.stage,
  undefined,
)
assert.equal(
  migratedTrainerSession.personalConfig?.[GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1]?.selected,
  false,
)
assert.equal(
  migratedTrainerSession.personalConfig?.[GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2]?.selected,
  true,
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
