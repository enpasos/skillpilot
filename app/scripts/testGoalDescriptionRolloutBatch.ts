import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  GOAL_BOOK_EDITION,
  GOAL_BOOK_MODEL_SCHEMA_VERSION,
  parseAndValidateGoalBookModel,
  stableGoalBookJson,
  type GoalBookPage,
} from './goalBookModel'
import {
  buildGoalDescriptionRolloutSubsetModel,
  loadGoalDescriptionRolloutBatchConfig,
  loadGoalDescriptionRolloutInFlightLedger,
  selectGoalDescriptionRolloutCandidates,
} from './materializeGoalDescriptionRolloutBatch'
import {
  validateLegacyResolutionIndexSnapshot,
  validateStandaloneResolutionIndexSchema,
  validateStandaloneResolutionIndexStructure,
  type AggregateResolutionIndex,
  type StandaloneBatchResolutionIndex,
} from './reportDeepUnderstandingRollout'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const digest = (value: unknown) => (
  `sha256:${createHash('sha256').update(stableGoalBookJson(value)).digest('hex')}`
)
const fixedDigest = (character: string) => `sha256:${character.repeat(64)}`

const page = ({
  pageNumber,
  goalId,
  title,
  requires = [],
  reverseRequires = [],
}: {
  pageNumber: number
  goalId: string
  title: string
  requires?: Array<{ goalId: string; title: string; pageNumber: number }>
  reverseRequires?: Array<{ goalId: string; title: string; pageNumber: number }>
}): GoalBookPage => {
  const withoutFingerprint = {
    pageNumber,
    navigationOrder: pageNumber - 1,
    treeOrder: pageNumber,
    goalId,
    anchor: `goal-${goalId}`,
    title,
    description: `Die lernende Person kann ${title.toLocaleLowerCase('de-DE')} erklären und anwenden.`,
    breadcrumbs: ['Fixture'],
    chapterIds: ['fixture'],
    requires: requires.map((reference) => ({
      ...reference,
      anchor: `goal-${reference.goalId}`,
    })),
    reverseRequires: reverseRequires.map((reference) => ({
      ...reference,
      anchor: `goal-${reference.goalId}`,
    })),
    externalPrerequisites: [],
    externalReverseRequires: [],
    visualization: null,
    evidenceReview: null,
    goalFingerprint: fixedDigest(String(pageNumber)),
  }
  return {
    ...withoutFingerprint,
    pageFingerprint: digest({
      modelSchemaVersion: GOAL_BOOK_MODEL_SCHEMA_VERSION,
      edition: GOAL_BOOK_EDITION,
      page: withoutFingerprint,
    }),
  }
}

const pages = [
  page({
    pageNumber: 1,
    goalId: 'goal-1',
    title: 'Grundlage verstehen',
    reverseRequires: [{ goalId: 'goal-2', title: 'Zusammenhang erklären', pageNumber: 2 }],
  }),
  page({
    pageNumber: 2,
    goalId: 'goal-2',
    title: 'Zusammenhang erklären',
    requires: [{ goalId: 'goal-1', title: 'Grundlage verstehen', pageNumber: 1 }],
  }),
  page({ pageNumber: 3, goalId: 'goal-3', title: 'Unabhängigen Fall untersuchen' }),
  page({ pageNumber: 4, goalId: 'goal-4', title: 'Späteren Zahlenfall untersuchen' }),
]
const navigationGraphWithoutDigest = {
  schemaVersion: '1.0.0' as const,
  landscapeId: 'fixture-landscape',
  title: 'Fixture landscape',
  goals: [{
    id: 'fixture-root',
    title: 'Fixture',
    contains: pages.map(({ goalId }) => goalId),
    type: 'cluster' as const,
    semanticKind: 'curricularArea',
  }, ...pages.map(({ goalId, title: goalTitle }) => ({
    id: goalId,
    title: goalTitle,
    contains: [],
    type: 'atomic' as const,
    semanticKind: 'curricularAtomic',
  }))],
}
const navigationProjectionWithoutFingerprint = {
  schemaVersion: '1.0.0' as const,
  viewId: 'fixture-view',
  landscapeId: 'fixture-landscape',
  title: 'Fixture navigation',
  scope: { schoolForm: 'Gymnasium' },
  chapters: [{
    chapterId: 'fixture',
    label: 'Fixture',
    parentChapterId: null,
    order: 0,
    treeOrder: 0,
  }],
  placements: pages.map(({ goalId, breadcrumbs, chapterIds, navigationOrder, treeOrder }) => ({
    goalId,
    breadcrumbs,
    chapterIds,
    navigationOrder,
    treeOrder,
  })),
}
const navigationProjectionFingerprint = digest(navigationProjectionWithoutFingerprint)
const baseWithoutDigest = {
  schemaVersion: GOAL_BOOK_MODEL_SCHEMA_VERSION,
  book: {
    id: 'fixture-base-book',
    title: 'Fixture base book',
    locale: 'de-DE',
    landscapeId: 'fixture-landscape',
    viewId: 'fixture-view',
    scope: { schoolForm: 'Gymnasium' },
    pageCount: pages.length,
    projectedAtomicGoalCount: pages.length,
    excludedTargetAtomicGoalCount: 0,
    edition: GOAL_BOOK_EDITION,
    publicationMode: 'review' as const,
    atlasBaseUrl: 'https://skillpilot.example/lernzielbuch',
    oneGoalPerPage: true as const,
  },
  source: {
    landscapePath: 'fixtures/landscape.json',
    compositionViewPath: 'fixtures/view.json',
    semanticKindLedgerPath: 'fixtures/semantic-kinds.json',
    goalVisualizationQaPath: 'fixtures/visualization-qa.json',
    landscapeDigest: fixedDigest('a'),
    compositionViewDigest: fixedDigest('b'),
    semanticKindLedgerDigest: fixedDigest('c'),
    goalVisualizationQaDigest: fixedDigest('d'),
    evidenceReviewSources: [],
    goalFingerprintRuleVersion: 'goal-evidence-v1' as const,
  },
  navigation: {
    schemaVersion: '1.0.0' as const,
    canonicalProjectionSource: {
      path: 'fixtures/view.json',
      viewId: 'fixture-view',
      title: 'Fixture navigation',
      scope: { schoolForm: 'Gymnasium' },
      digest: fixedDigest('b'),
      projectionFingerprint: navigationProjectionFingerprint,
    },
    goalGraph: {
      ...navigationGraphWithoutDigest,
      digest: digest(navigationGraphWithoutDigest),
    },
  },
  chapters: [{
    chapterId: 'fixture',
    label: 'Fixture',
    parentChapterId: null,
    order: 0,
    treeOrder: 0,
    goalIds: pages.map(({ goalId }) => goalId),
    pageNumbers: pages.map(({ pageNumber }) => pageNumber),
  }],
  pages,
  excludedTargetGoals: [],
}
const baseModel = parseAndValidateGoalBookModel({
  ...baseWithoutDigest,
  digest: digest(baseWithoutDigest),
})

const subset = buildGoalDescriptionRolloutSubsetModel({
  baseModel,
  goalIds: ['goal-1', 'goal-2'],
  bookId: 'fixture-batch-001',
  title: 'Fixture batch 001',
})
assert.deepEqual(subset.pages.map(({ goalId }) => goalId), ['goal-1', 'goal-2'])
assert.equal(subset.book.pageCount, 2)
assert.equal(subset.book.projectedAtomicGoalCount, 2)
assert.equal(subset.pages[0].reverseRequires[0].pageNumber, 2)
assert.equal(subset.pages[1].requires[0].pageNumber, 1)
assert.deepEqual(subset.pages.map(({ navigationOrder }) => navigationOrder), [0, 1])
assert.deepEqual(
  [...subset.chapters.map(({ treeOrder }) => treeOrder), ...subset.pages.map(({ treeOrder }) => treeOrder)]
    .sort((left, right) => left - right),
  [0, 1, 2],
)
assert.equal(
  subset.navigation.derivedProjection?.baseProjectionFingerprint,
  baseModel.navigation.canonicalProjectionSource.projectionFingerprint,
)
assert.deepEqual(parseAndValidateGoalBookModel(subset), subset)

const sparseSubset = buildGoalDescriptionRolloutSubsetModel({
  baseModel,
  goalIds: ['goal-1', 'goal-3'],
  bookId: 'fixture-batch-sparse',
  title: 'Fixture sparse batch',
})
assert.deepEqual(sparseSubset.pages.map(({ navigationOrder }) => navigationOrder), [0, 1])
assert.deepEqual(sparseSubset.pages.map(({ treeOrder }) => treeOrder), [1, 2])
assert.deepEqual(sparseSubset.navigation.derivedProjection?.selectedGoalIds, ['goal-1', 'goal-3'])
assert.deepEqual(parseAndValidateGoalBookModel(sparseSubset), sparseSubset)

const separated = buildGoalDescriptionRolloutSubsetModel({
  baseModel,
  goalIds: ['goal-2'],
  bookId: 'fixture-batch-002',
  title: 'Fixture batch 002',
})
assert.deepEqual(separated.pages[0].requires, [])
assert.deepEqual(separated.pages[0].externalPrerequisites.map(({ goalId }) => goalId), ['goal-1'])
assert.match(separated.pages[0].externalPrerequisites[0].canonicalUrl ?? '', /#goal-goal-1$/u)
await assert.rejects(
  async () => buildGoalDescriptionRolloutSubsetModel({
    baseModel,
    goalIds: ['goal-2', 'goal-1'],
    bookId: 'fixture-batch-forward',
    title: 'Fixture invalid order',
  }),
  /not in prerequisite-safe order/u,
)
await assert.rejects(
  async () => buildGoalDescriptionRolloutSubsetModel({
    baseModel,
    goalIds: ['missing-goal'],
    bookId: 'fixture-batch-missing',
    title: 'Fixture missing goal',
  }),
  /absent from the current base GoalBook/u,
)

const standaloneIndex: StandaloneBatchResolutionIndex = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-standalone-batch-resolution-index.schema.json',
  schemaVersion: 2,
  indexContract: 'goal-description-standalone-batch-resolution-index-v1',
  artifactSetId: 'fixture-batch-001-strict-resolutions',
  subject: 'Mathematik',
  semanticKind: 'curricularAtomic',
  batchGoalIds: ['goal-1', 'goal-2'],
  groups: [{
    groupId: 'fixture-batch-001',
    artifactDirectory: '.',
    dualSummaryPath: 'dual-summary.json',
    dualSummaryDigest: fixedDigest('e'),
    campaignGoalCount: 2,
    resolvedGoalCount: 2,
  }],
  resolutions: ['goal-1', 'goal-2'].map((goalId, index) => ({
    goalId,
    titleDe: `Goal ${index + 1}`,
    groupId: 'fixture-batch-001',
    decision: 'keep_current',
    resolutionPath: `resolutions/${goalId}.resolution.json`,
    resolutionDigest: fixedDigest(index === 0 ? 'f' : '1'),
    resolutionFingerprint: fixedDigest(index === 0 ? '2' : '3'),
    strictDescriptionComplete: true,
  })),
}
assert.deepEqual(
  validateStandaloneResolutionIndexStructure(standaloneIndex, new Set(['goal-1', 'goal-2'])),
  [],
)
assert.deepEqual(validateStandaloneResolutionIndexSchema(standaloneIndex), [])
const standaloneIndexWithHumanAttestation = {
  ...standaloneIndex,
  resolutions: standaloneIndex.resolutions.map((entry, index) => (
    index === 0 ? { ...entry, humanAttestationPath: 'attestations/goal-1.json' } : entry
  )),
}
assert.match(
  validateStandaloneResolutionIndexSchema(standaloneIndexWithHumanAttestation).join('\n'),
  /closed standalone resolution-index schema violation/u,
  'The central reporter must reject fields forbidden by the closed standalone schema.',
)
assert.match(
  validateStandaloneResolutionIndexStructure(
    standaloneIndexWithHumanAttestation,
    new Set(['goal-1', 'goal-2']),
  ).join('\n'),
  /must not reference a human attestation/u,
  'Standalone AI batches must reject human-attestation paths explicitly.',
)
assert.deepEqual(
  validateStandaloneResolutionIndexStructure(
    standaloneIndex,
    new Set(['goal-1', 'goal-2', 'unrelated-new-goal']),
  ),
  [],
  'An unrelated denominator increase must not invalidate a standalone batch.',
)
assert.match(
  validateStandaloneResolutionIndexStructure(standaloneIndex, new Set(['goal-2'])).join('\n'),
  /goal-1 is not current curricularAtomic/u,
  'Drift inside the exact batch must fail closed.',
)
assert.match(
  validateStandaloneResolutionIndexStructure({
    ...standaloneIndex,
    resolutions: standaloneIndex.resolutions.slice(1),
  }, new Set(['goal-1', 'goal-2'])).join('\n'),
  /one strict resolution per batch goal|missing standalone resolution/u,
)
const legacySnapshot: AggregateResolutionIndex = {
  schemaVersion: 1,
  artifactSetId: 'legacy-calibration-fixture',
  subject: 'Mathematik',
  semanticKind: 'curricularAtomic',
  strictDescriptionReviewCompleteCount: 2,
  curriculumAtomicDenominator: 780,
  descriptionReviewPercentage: 0.3,
  groups: standaloneIndex.groups,
  resolutions: standaloneIndex.resolutions,
}
assert.deepEqual(
  validateLegacyResolutionIndexSnapshot(legacySnapshot),
  [],
  'A self-consistent legacy denominator remains historical snapshot metadata when the live denominator changes elsewhere.',
)
assert.match(
  validateLegacyResolutionIndexSnapshot({
    ...legacySnapshot,
    descriptionReviewPercentage: 2.6,
  }).join('\n'),
  /does not match its legacy snapshot denominator/u,
  'Legacy snapshot metadata still fails closed on internal drift.',
)

const metadata = new Map([
  ['goal-1', { titleEn: 'Understand the foundation', dimensionTags: { phase: 'J5', area: 'Numbers' } }],
  ['goal-2', { titleEn: 'Explain the relationship', dimensionTags: { phase: 'J5', area: 'Numbers' } }],
  ['goal-3', { titleEn: 'Investigate an independent case', dimensionTags: { phase: 'J6', area: 'Geometry' } }],
  ['goal-4', { titleEn: 'Investigate a later numbers case', dimensionTags: { phase: 'J5', area: 'Numbers' } }],
])
assert.deepEqual(
  selectGoalDescriptionRolloutCandidates({
    model: baseModel,
    completedGoalIds: new Set(['goal-1']),
    metadataByGoalId: metadata,
    maximumGoalCount: 20,
    strategy: 'landscape-order',
  }).map(({ goalId }) => goalId),
  ['goal-2', 'goal-3', 'goal-4'],
)
assert.deepEqual(
  selectGoalDescriptionRolloutCandidates({
    model: baseModel,
    completedGoalIds: new Set(['goal-1']),
    metadataByGoalId: metadata,
    maximumGoalCount: 20,
    strategy: 'coherent-area-phase',
  }).map(({ goalId }) => goalId),
  ['goal-2'],
  'Coherent selection must stop at the first stable phase/area block.',
)
assert.throws(
  () => selectGoalDescriptionRolloutCandidates({
    model: baseModel,
    completedGoalIds: new Set(),
    metadataByGoalId: metadata,
    maximumGoalCount: 21,
    strategy: 'landscape-order',
  }),
  /integer from 1 to 20/u,
)

const tmpRoot = resolve(repositoryRoot, 'tmp')
await mkdir(tmpRoot, { recursive: true })
const configDirectory = await mkdtemp(join(tmpRoot, 'goal-description-rollout-batch-test-'))
try {
  const invalidConfigPath = join(configDirectory, 'invalid.config.json')
  const invalidConfig = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json',
    schemaVersion: 1,
    batchId: 'fixture-config',
    subject: 'mathematik',
    subjectLabel: 'Mathematik',
    bookId: 'fixture-config-book',
    title: 'Fixture config',
    baseGoalBookConfigPath: 'app/scripts/config/goal-books/de-gym-math-national-atlas.json',
    goalIds: ['goal-1', 'goal-1'],
    outputDirectory: 'tmp/fixture-config-output',
    feedbackBaseUrl: 'https://skillpilot.example/feedback',
    promptPath: 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',
    criteriaPath: 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/mathematik-goal-description-understanding-evidence-review-criteria-v2.md',
  }
  await writeFile(invalidConfigPath, `${JSON.stringify(invalidConfig, null, 2)}\n`)
  await assert.rejects(
    () => loadGoalDescriptionRolloutBatchConfig(relative(repositoryRoot, invalidConfigPath)),
    /Invalid goal-description rollout batch config/u,
  )

  const activeConfigPath = join(configDirectory, 'active.config.json')
  const secondActiveConfigPath = join(configDirectory, 'second-active.config.json')
  const validConfig = {
    ...invalidConfig,
    goalIds: ['goal-1'],
  }
  await writeFile(activeConfigPath, `${JSON.stringify(validConfig, null, 2)}\n`)
  await writeFile(secondActiveConfigPath, `${JSON.stringify({
    ...validConfig,
    batchId: 'fixture-config-2',
    bookId: 'fixture-config-book-2',
  }, null, 2)}\n`)

  const ledgerPath = join(configDirectory, 'in-flight-ledger.json')
  const ledger = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-in-flight-ledger.schema.json',
    schemaVersion: 1,
    ledgerContract: 'goal-description-rollout-in-flight-ledger-v1',
    activeBatchConfigPaths: [relative(repositoryRoot, activeConfigPath)],
  }
  await writeFile(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`)
  const loadedLedger = await loadGoalDescriptionRolloutInFlightLedger(
    relative(repositoryRoot, ledgerPath),
  )
  assert.deepEqual(
    loadedLedger.activeBatches.map(({ config }) => config.goalIds),
    [['goal-1']],
    'The persistent ledger resolves and validates each active batch config.',
  )

  await writeFile(ledgerPath, `${JSON.stringify({
    ...ledger,
    activeBatchConfigPaths: [
      relative(repositoryRoot, activeConfigPath),
      relative(repositoryRoot, secondActiveConfigPath),
    ],
  }, null, 2)}\n`)
  await assert.rejects(
    () => loadGoalDescriptionRolloutInFlightLedger(relative(repositoryRoot, ledgerPath)),
    /Duplicate active in-flight claim for goal-1/u,
    'Distinct active batches must not claim the same goal in one subject/base binding.',
  )
} finally {
  await rm(configDirectory, { recursive: true, force: true })
}

console.log('Goal-description rollout batch self-test passed: exact subset bindings, topological fail-closed order, standalone denominator independence, group-local drift rejection, persistent in-flight claim validation, and deterministic selection.')
