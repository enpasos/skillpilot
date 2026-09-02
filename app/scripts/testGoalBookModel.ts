import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import {
  normalizeCanonicalLandscape,
  resolveCanonicalNodeType,
} from '../src/utils/authoring/canonicalAuthoring'
import {
  compileCompositionView,
  normalizeCompositionView,
  type CompiledCompositionPreviewNode,
} from '../src/utils/authoring/compositionViewAuthoring'
import {
  buildGoalBookModel,
  fingerprintSemanticKindSourceGoal,
  loadGoalBookBuildInputs,
  parseAndValidateGoalBookModel,
  parseSubjectDurationModelPolicy,
  stableGoalBookJson,
  type GoalBookBuildInput,
} from './goalBookModel'
import {
  fingerprintGoalEvidenceReviewInput,
  fingerprintGoalForEvidence,
} from './goalEvidenceProfileModel'

const PILOT_GOAL_ID = '8dd9f210-2683-5902-acab-e3be22725232'
const PILOT_PREREQUISITE_ID = '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2'
const LANDSCAPE_PATH = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const SEKI_VIEW_PATH = 'curricula/DE/Gymnasium/composition-views/mathematik/de-de-seki.view.json'
const SEMANTIC_KIND_LEDGER_PATH = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const GOAL_VISUALIZATION_QA_PATH = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'
const PILOT_EVIDENCE_REVIEW_PATH = 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-representation-choice-pilot.review.jsonl'
const DESCRIPTION_UNDERSTANDING_EVIDENCE_CALIBRATION_CONFIG_PATH = './config/goal-books/de-de-gym-math-description-understanding-evidence-calibration.json'
const DESCRIPTION_UNDERSTANDING_EVIDENCE_CALIBRATION_GOAL_IDS = [
  'cf474eab-1379-4877-907e-58b0892ce734',
  '6b0075bb-f71c-59f6-ab98-fb894568cc26',
  '2242c379-ddbb-4f03-8aed-13f49a4674e8',
  '8dd9f210-2683-5902-acab-e3be22725232',
  'e09072f9-67d9-412c-b872-24ecbf329232',
  '0c8c1ae9-135e-4fe5-bf67-e497eb3a9909',
  '27b63e2e-6a34-483e-8e5a-fe0f49670d1d',
  '2143e9e8-b176-545b-b2fa-91bbb6c8cf5c',
  '3bfc2747-03e2-57db-b13f-01f78835eefd',
  '2afba4a2-287d-5e8f-aeee-a3bcf8652236',
  '6481fc23-d923-5ffc-ba49-f499328f43b8',
  '10a33d93-dc20-5edd-ae3b-32338d05407c',
  '3d4d510c-0fd7-55ea-9b79-1db8d640758f',
  '508292f2-671b-4fd3-acbf-53d705e44693',
  'f9c24dd8-eaa5-5395-8679-820c1a74e7b7',
] as const
const LEGACY_BOOK_MODEL_SCHEMA_PATH = 'contracts/goal-book/v1/goal-book-model.schema.json'
const BOOK_MODEL_SCHEMA_PATH = 'contracts/goal-book/v1/goal-book-model-1.1.schema.json'
const LEGACY_BOOK_MODEL_FIXTURE_PATH = (
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/'
  + 'calibration-v2/2026-08-25/thales-current/bundle/book-model.json'
)
const FIXTURE_ASSET_DIGEST = `sha256:${'1'.repeat(64)}`
const EXPECTED_NATIONAL_MATH_MODEL_DIGEST = 'sha256:bb22b432b2ac9bfe89d94d2688c74fd39262eef2924c5ac41e1d39bb0613b266'

const goal = ({
  id,
  title = id,
  description = `Description for ${id}`,
  contains = [],
  requires = [],
  type = contains.length > 0 ? 'cluster' : 'atomic',
  resourceLinks,
}: {
  id: string
  title?: string
  description?: string
  contains?: string[]
  requires?: string[]
  type?: 'atomic' | 'cluster'
  resourceLinks?: unknown[]
}) => ({
  id,
  title,
  description,
  weight: 1,
  contains,
  requires,
  type,
  dimensionTags: {
    framework: 'fixture',
    demandLevel: 'AB1',
    processCompetencies: [],
    guidingIdeas: [],
    phase: 'fixture',
  },
  ...(resourceLinks ? { resourceLinks } : {}),
})

const fixtureInput = (): GoalBookBuildInput => {
  const landscape = {
    landscapeId: 'fixture-landscape',
    locale: 'de-DE',
    title: 'Fixture',
    description: 'Fixture landscape',
    goals: [
      goal({ id: 'main', title: 'Main chapter', contains: ['D', 'C', 'B', 'A'] }),
      goal({ id: 'external', title: 'External foundation' }),
      goal({ id: 'future', title: 'External continuation', requires: ['D'] }),
      goal({ id: 'D', requires: ['B', 'C'] }),
      goal({ id: 'C', requires: ['external'] }),
      goal({ id: 'B', requires: ['A'] }),
      goal({
        id: 'A',
        resourceLinks: [{
          type: 'goal-visualization',
          resourceType: 'image',
          role: 'primary',
          skillpilotId: 'A',
          title: 'Visualization A',
          url: '/assets/a.png',
          altText: 'A visual',
        }],
      }),
    ],
  }
  const semanticKindByGoalId = new Map<string, 'curricularAtomic' | 'curricularArea'>([
    ['main', 'curricularArea'],
    ['external', 'curricularAtomic'],
    ['future', 'curricularAtomic'],
    ['A', 'curricularAtomic'],
    ['B', 'curricularAtomic'],
    ['C', 'curricularAtomic'],
    ['D', 'curricularAtomic'],
  ])
  return {
    landscape,
    compositionView: {
    viewId: 'fixture-view',
    landscapeId: 'fixture-landscape',
    scope: { schoolForm: 'Fixture', stage: 'Fixture' },
    rootNodes: [{
      kind: 'structure',
      id: 'subject',
      label: 'Subject',
      children: [{ kind: 'canonicalSubtree', goalId: 'main' }],
    }],
  },
    semanticKindLedger: {
      $schema: 'https://skillpilot.com/schemas/curriculum-package/v1/curriculum-ontology-profile.schema.json',
      documentType: 'semantic-kind-ledger',
      ledgerFormatVersion: 1,
      ledgerId: 'fixture-semantic-kinds',
      profileId: 'fixture-semantic-kinds',
      profileVersion: '1.0.0',
      sourceLandscapeId: 'fixture-landscape',
      sourceLandscapePath: 'fixtures/landscape.json',
      sourceFingerprintContractId: 'semantic-kind-source-fingerprint-v1',
      reviewMethod: 'one-time-reviewed-pilot-migration-v1',
      counts: {
        curricularAtomic: 6,
        curricularArea: 1,
        practiceAssessment: 0,
        programStructure: 0,
        memory: 0,
        runtimeSupport: 0,
        orientation: 0,
        total: 7,
      },
      decisions: landscape.goals.map((sourceGoal) => {
        const semanticKind = semanticKindByGoalId.get(sourceGoal.id)!
        return {
          goalId: sourceGoal.id,
          sourceFingerprint: fingerprintSemanticKindSourceGoal(sourceGoal),
          semanticKind,
          decisionStatus: 'authoritative',
          decisionBasis: semanticKind === 'curricularArea'
            ? 'reviewed-current-pilot-curricular-area'
            : 'reviewed-current-pilot-curricular-atomic',
        }
      }),
    },
  goalVisualizationQa: {
    records: [{
      goalId: 'A',
      landscapeId: 'fixture-landscape',
      visualizationState: 'available',
      imageUrl: '/assets/a.png',
      assetSha256: FIXTURE_ASSET_DIGEST,
      humanApproved: 'no',
      humanIssueIdentified: 'no',
      aiApproved: 'no',
      aiApprovedAssetSha256: '',
      aiReviewedAt: null,
    }],
  },
  goalVisualizationAssetDigests: {
    '/assets/a.png': FIXTURE_ASSET_DIGEST,
  },
  evidenceReviewSources: [],
    config: {
    bookId: 'fixture-book',
    title: 'Fixture book',
    landscapePath: 'fixtures/landscape.json',
    compositionViewPath: 'fixtures/view.json',
    semanticKindLedgerPath: 'fixtures/semantic-kinds.json',
    goalVisualizationQaPath: 'fixtures/goal-visualization-qa.json',
    publicationMode: 'review',
    evidenceReviewPaths: [],
    },
  }
}

const refreshFixtureSemanticKindFingerprint = (
  input: GoalBookBuildInput,
  goalId: string,
): void => {
  const sourceGoal = (input.landscape as { goals: Array<Record<string, unknown>> }).goals
    .find(({ id }) => id === goalId)
  assert(sourceGoal, `missing fixture source goal ${goalId}`)
  const decision = (input.semanticKindLedger as {
    decisions: Array<{ goalId: string; sourceFingerprint: string }>
  }).decisions.find((candidate) => candidate.goalId === goalId)
  assert(decision, `missing fixture semantic-kind decision ${goalId}`)
  decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(sourceGoal)
}

const expectBuildFailure = (input: GoalBookBuildInput, pattern: RegExp) => {
  assert.throws(() => buildGoalBookModel(input), pattern)
}

const fixture = fixtureInput()
const first = buildGoalBookModel(fixture)
const second = buildGoalBookModel(JSON.parse(JSON.stringify(fixture)) as GoalBookBuildInput)

assert.equal(first.book.oneGoalPerPage, true)
assert.equal(first.book.pageCount, 4)
assert.equal(first.book.edition, 'curricular-atomic-v1')
assert.equal(first.book.publicationMode, 'review')
assert.equal(first.book.atlasBaseUrl, null)
assert.deepEqual(first.pages.map(({ goalId }) => goalId), ['C', 'A', 'B', 'D'])
assert.equal(first.digest, second.digest)
assert.equal(stableGoalBookJson(first), stableGoalBookJson(second))
assert.match(first.digest, /^sha256:[0-9a-f]{64}$/u)
assert.equal(new Set(first.pages.map(({ goalId }) => goalId)).size, first.pages.length)

const pageById = new Map(first.pages.map((page) => [page.goalId, page]))
const pageA = pageById.get('A')
const pageB = pageById.get('B')
const pageC = pageById.get('C')
const pageD = pageById.get('D')
assert.ok(pageA && pageB && pageC && pageD)
assert.deepEqual(pageD.breadcrumbs, ['Subject', 'Main chapter'])
assert.deepEqual(pageD.chapterIds, ['structure:subject', 'goal:main'])
assert.deepEqual(first.chapters.map(({ chapterId }) => chapterId), [
  'structure:subject',
  'goal:main',
])
assert.equal(pageA.anchor, 'goal-A')
assert.deepEqual(pageA.reverseRequires, [{
  goalId: 'B',
  title: 'B',
  anchor: 'goal-B',
  pageNumber: pageB.pageNumber,
}])
assert.deepEqual(pageB.requires, [{
  goalId: 'A',
  title: 'A',
  anchor: 'goal-A',
  pageNumber: pageA.pageNumber,
}])
assert.deepEqual(pageC.requires, [])
assert.deepEqual(pageC.externalPrerequisites, [{
  goalId: 'external',
  title: 'External foundation',
  canonicalUrl: null,
}])
assert.deepEqual(pageD.externalReverseRequires, [{
  goalId: 'future',
  title: 'External continuation',
  canonicalUrl: null,
}])
assert.deepEqual(pageA.visualization, {
  resourceType: 'image',
  title: 'Visualization A',
  url: '/assets/a.png',
  altText: 'A visual',
  originalDigest: FIXTURE_ASSET_DIGEST,
  qaStatus: 'review_candidate',
  approvedForPublication: false,
})
assert.match(pageA.goalFingerprint, /^sha256:[0-9a-f]{64}$/u)
assert.match(pageA.pageFingerprint, /^sha256:[0-9a-f]{64}$/u)
assert.equal(pageA.evidenceReview, null)

const changedAssetInput = JSON.parse(JSON.stringify(fixture)) as GoalBookBuildInput
changedAssetInput.goalVisualizationAssetDigests['/assets/a.png'] = `sha256:${'2'.repeat(64)}`
const changedAssetBook = buildGoalBookModel(changedAssetInput)
const changedAssetPage = changedAssetBook.pages.find(({ goalId }) => goalId === 'A')
assert.ok(changedAssetPage)
assert.equal(changedAssetPage.goalFingerprint, pageA.goalFingerprint)
assert.notEqual(changedAssetPage.pageFingerprint, pageA.pageFingerprint)
assert.notEqual(changedAssetBook.digest, first.digest)

const approvedAssetInput = JSON.parse(JSON.stringify(fixture)) as GoalBookBuildInput
const approvedAssetQa = approvedAssetInput.goalVisualizationQa as {
  records: Array<{ humanApproved: string }>
}
approvedAssetQa.records[0].humanApproved = 'yes'
const approvedAssetBook = buildGoalBookModel(approvedAssetInput)
const approvedAssetPage = approvedAssetBook.pages.find(({ goalId }) => goalId === 'A')
assert.ok(approvedAssetPage?.visualization)
assert.equal(approvedAssetPage.visualization.qaStatus, 'approved')
assert.equal(approvedAssetPage.visualization.approvedForPublication, true)
assert.notEqual(approvedAssetPage.pageFingerprint, pageA.pageFingerprint)
assert.notEqual(approvedAssetBook.digest, first.digest)
approvedAssetInput.config.publicationMode = 'public'
approvedAssetInput.config.atlasBaseUrl = 'https://skillpilot.com/goal-atlas'
const approvedPublicBook = buildGoalBookModel(approvedAssetInput)
assert.equal(
  approvedPublicBook.pages.find(({ goalId }) => goalId === 'A')?.visualization?.qaStatus,
  'approved',
)

const staleHumanApprovalInput = JSON.parse(JSON.stringify(approvedAssetInput)) as GoalBookBuildInput
staleHumanApprovalInput.goalVisualizationAssetDigests['/assets/a.png'] = `sha256:${'3'.repeat(64)}`
const staleHumanApprovalBook = buildGoalBookModel(staleHumanApprovalInput)
assert.equal(
  staleHumanApprovalBook.pages.find(({ goalId }) => goalId === 'A')?.visualization,
  null,
  'a human approval for different bytes cannot release the current asset',
)

const publicInput = JSON.parse(JSON.stringify(fixture)) as GoalBookBuildInput
publicInput.config.publicationMode = 'public'
publicInput.config.atlasBaseUrl = 'https://skillpilot.com/goal-atlas'
const publicBook = buildGoalBookModel(publicInput)
assert.equal(publicBook.book.publicationMode, 'public')
assert.equal(publicBook.pages.find(({ goalId }) => goalId === 'A')?.visualization, null)
assert.equal(
  publicBook.pages.find(({ goalId }) => goalId === 'D')?.externalReverseRequires[0].canonicalUrl,
  'https://skillpilot.com/goal-atlas?landscape=fixture-landscape&edition=curricular-atomic-v1#goal-future',
)

const publicWithoutAtlas = JSON.parse(JSON.stringify(fixture)) as GoalBookBuildInput
publicWithoutAtlas.config.publicationMode = 'public'
expectBuildFailure(publicWithoutAtlas, /cannot resolve external canonical URL/u)

const unsafeAtlas = JSON.parse(JSON.stringify(fixture)) as GoalBookBuildInput
unsafeAtlas.config.atlasBaseUrl = 'http://skillpilot.com/goal-atlas'
expectBuildFailure(unsafeAtlas, /must be an HTTPS URL/u)

const aiOnlyInput = JSON.parse(JSON.stringify(fixture)) as GoalBookBuildInput
const aiOnlyQa = aiOnlyInput.goalVisualizationQa as {
  records: Array<{
    aiApproved: string
    aiApprovedAssetSha256: string
    aiReviewedAt: string
  }>
}
aiOnlyQa.records[0].aiApproved = 'yes'
aiOnlyQa.records[0].aiApprovedAssetSha256 = FIXTURE_ASSET_DIGEST
aiOnlyQa.records[0].aiReviewedAt = '2026-08-10T00:00:00.000Z'
const aiOnlyReviewBook = buildGoalBookModel(aiOnlyInput)
const aiOnlyReviewVisualization = aiOnlyReviewBook.pages.find(({ goalId }) => goalId === 'A')?.visualization
assert.equal(aiOnlyReviewVisualization?.qaStatus, 'review_candidate')
assert.equal(aiOnlyReviewVisualization?.approvedForPublication, false)
aiOnlyInput.config.publicationMode = 'public'
aiOnlyInput.config.atlasBaseUrl = 'https://skillpilot.com/goal-atlas'
const aiOnlyPublicBook = buildGoalBookModel(aiOnlyInput)
assert.equal(aiOnlyPublicBook.pages.find(({ goalId }) => goalId === 'A')?.visualization, null)

first.pages.forEach((page) => {
  assert.equal(page.pageNumber, first.pages.indexOf(page) + 1)
  page.requires.forEach((reference) => {
    assert.ok(reference.pageNumber)
    assert.ok(reference.pageNumber < page.pageNumber)
    assert.equal(reference.anchor, `goal-${reference.goalId}`)
    assert.ok(
      pageById.get(reference.goalId)?.reverseRequires.some(({ goalId }) => goalId === page.goalId),
      `${reference.goalId} must carry the reciprocal reverseRequires reference to ${page.goalId}`,
    )
  })
  page.reverseRequires.forEach((reference) => {
    assert.ok(reference.pageNumber)
    assert.ok(reference.pageNumber > page.pageNumber)
    assert.equal(reference.anchor, `goal-${reference.goalId}`)
  })
})
const serializedFixture = JSON.stringify(first)
for (const forbiddenLearnerField of ['learnerId', 'skillpilotId', 'learningSessionId', 'mastery']) {
  assert.equal(serializedFixture.includes(`"${forbiddenLearnerField}"`), false)
}

const requiresCycle = fixtureInput()
const requiresCycleGoals = (requiresCycle.landscape as { goals: Array<{ id: string; requires: string[] }> }).goals
requiresCycleGoals.find(({ id }) => id === 'B')!.requires = ['D']
refreshFixtureSemanticKindFingerprint(requiresCycle, 'B')
expectBuildFailure(requiresCycle, /direct requires cycle/u)

const unresolvedRequires = fixtureInput()
const unresolvedGoals = (unresolvedRequires.landscape as { goals: Array<{ id: string; requires: string[] }> }).goals
unresolvedGoals.find(({ id }) => id === 'A')!.requires = ['missing']
refreshFixtureSemanticKindFingerprint(unresolvedRequires, 'A')
expectBuildFailure(unresolvedRequires, /unresolved cross-landscape prerequisite missing/u)

const containsCycle = fixtureInput()
const containsCycleGoals = (containsCycle.landscape as { goals: Array<{ id: string; contains: string[] }> }).goals
containsCycleGoals.find(({ id }) => id === 'main')!.contains.push('main')
refreshFixtureSemanticKindFingerprint(containsCycle, 'main')
expectBuildFailure(containsCycle, /invalid canonical landscape/u)

const unresolvedComposition = fixtureInput()
unresolvedComposition.compositionView = {
  viewId: 'broken-view',
  landscapeId: 'fixture-landscape',
  scope: { schoolForm: 'Fixture', stage: 'Fixture' },
  rootNodes: [{ kind: 'goalEntry', goalId: 'missing' }],
}
expectBuildFailure(unresolvedComposition, /invalid composition view.*missing/u)

const duplicateTarget = fixtureInput()
duplicateTarget.compositionView = {
  viewId: 'duplicate-view',
  landscapeId: 'fixture-landscape',
  scope: { schoolForm: 'Fixture', stage: 'Fixture' },
  rootNodes: [{
    kind: 'structure',
    id: 'duplicates',
    label: 'Duplicates',
    children: [
      { kind: 'goalEntry', goalId: 'A' },
      { kind: 'goalEntry', goalId: 'A' },
    ],
  }],
}
expectBuildFailure(duplicateTarget, /Kanonisches Ziel erscheint mehrfach/u)

const ambiguousVisualization = fixtureInput()
const ambiguousGoals = (ambiguousVisualization.landscape as {
  goals: Array<{ id: string; resourceLinks?: unknown[] }>
}).goals
ambiguousGoals.find(({ id }) => id === 'A')!.resourceLinks!.push({
  type: 'goal-visualization',
  resourceType: 'image',
  role: 'primary',
  skillpilotId: 'A',
  title: 'Second visualization A',
  url: '/assets/a-2.png',
})
expectBuildFailure(ambiguousVisualization, /more than one primary goal visualization/u)

const nonAuthoritativeSemanticKind = fixtureInput()
const nonAuthoritativeLedger = nonAuthoritativeSemanticKind.semanticKindLedger as {
  decisions: Array<{ goalId: string; decisionStatus: string }>
}
nonAuthoritativeLedger.decisions.find(({ goalId }) => goalId === 'A')!.decisionStatus = 'candidate'
expectBuildFailure(nonAuthoritativeSemanticKind, /closed JSON Schema/u)

const staleSemanticKindFingerprint = fixtureInput()
;(staleSemanticKindFingerprint.landscape as { goals: Array<{ id: string; title: string }> }).goals
  .find(({ id }) => id === 'A')!.title = 'Mutated source title'
expectBuildFailure(staleSemanticKindFingerprint, /stale semantic-kind decision for goal A/u)

const wrongSemanticKindContract = fixtureInput()
;(wrongSemanticKindContract.semanticKindLedger as { sourceFingerprintContractId: string })
  .sourceFingerprintContractId = 'semantic-kind-source-fingerprint-v2'
expectBuildFailure(wrongSemanticKindContract, /closed JSON Schema/u)

const openSemanticKindLedger = fixtureInput()
;(openSemanticKindLedger.semanticKindLedger as Record<string, unknown>).unexpected = true
expectBuildFailure(openSemanticKindLedger, /closed JSON Schema/u)

const openSemanticKindDecision = fixtureInput()
;(openSemanticKindDecision.semanticKindLedger as {
  decisions: Array<Record<string, unknown>>
}).decisions[0].unexpected = true
expectBuildFailure(openSemanticKindDecision, /closed JSON Schema/u)

const inconsistentSemanticKindCounts = fixtureInput()
;(inconsistentSemanticKindCounts.semanticKindLedger as {
  counts: { curricularAtomic: number }
}).counts.curricularAtomic = 5
expectBuildFailure(inconsistentSemanticKindCounts, /count for curricularAtomic/u)

const externalLandscapeFixture = {
  landscapeId: 'fixture-mathematics',
  locale: 'de-DE',
  title: 'External mathematics fixture',
  description: 'External mathematics fixture landscape',
  goals: [goal({ id: 'math-foundation', title: 'External mathematics foundation' })],
}
const crossLandscapePrerequisite = fixtureInput()
const crossLandscapeGoalA = (crossLandscapePrerequisite.landscape as {
  goals: Array<{ id: string; requires: string[] }>
}).goals.find(({ id }) => id === 'A')!
crossLandscapeGoalA.requires = ['math-foundation']
refreshFixtureSemanticKindFingerprint(crossLandscapePrerequisite, 'A')
crossLandscapePrerequisite.config.externalLandscapePaths = ['fixtures/mathematics.json']
crossLandscapePrerequisite.externalLandscapeSources = [{
  path: 'fixtures/mathematics.json',
  landscape: externalLandscapeFixture,
}]
crossLandscapePrerequisite.config.atlasBaseUrl = 'https://skillpilot.com/goal-atlas'
const crossLandscapeBook = buildGoalBookModel(crossLandscapePrerequisite)
assert.deepEqual(crossLandscapeBook.source.externalLandscapes, [{
  path: 'fixtures/mathematics.json',
  landscapeId: 'fixture-mathematics',
  digest: crossLandscapeBook.source.externalLandscapes?.[0].digest,
}])
assert.match(crossLandscapeBook.source.externalLandscapes![0].digest, /^sha256:[0-9a-f]{64}$/u)
assert.deepEqual(
  crossLandscapeBook.pages.find(({ goalId }) => goalId === 'A')?.externalPrerequisites,
  [{
    goalId: 'math-foundation',
    title: 'External mathematics foundation',
    landscapeId: 'fixture-mathematics',
    canonicalUrl: 'https://skillpilot.com/goal-atlas?landscape=fixture-landscape&edition=curricular-atomic-v1#goal-math-foundation',
  }],
)
parseAndValidateGoalBookModel(crossLandscapeBook)

const openCrossLandscapeSource = structuredClone(crossLandscapeBook) as unknown as {
  source: { externalLandscapes: Array<Record<string, unknown>> }
}
openCrossLandscapeSource.source.externalLandscapes[0].unexpected = true
assert.throws(
  () => parseAndValidateGoalBookModel(openCrossLandscapeSource),
  /closed JSON Schema/u,
  'external landscape source bindings use a closed schema',
)

const openCrossLandscapeReference = structuredClone(crossLandscapeBook) as unknown as {
  pages: Array<{ externalPrerequisites: Array<Record<string, unknown>> }>
}
openCrossLandscapeReference.pages
  .find(({ externalPrerequisites }) => externalPrerequisites.length > 0)!
  .externalPrerequisites[0].unexpected = true
assert.throws(
  () => parseAndValidateGoalBookModel(openCrossLandscapeReference),
  /closed JSON Schema/u,
  'cross-landscape references use a closed schema',
)

const unboundCrossLandscapePrerequisite = fixtureInput()
;(unboundCrossLandscapePrerequisite.landscape as {
  goals: Array<{ id: string; requires: string[] }>
}).goals.find(({ id }) => id === 'A')!.requires = ['math-foundation']
refreshFixtureSemanticKindFingerprint(unboundCrossLandscapePrerequisite, 'A')
expectBuildFailure(unboundCrossLandscapePrerequisite, /unresolved cross-landscape prerequisite math-foundation/u)

const ambiguousExternalGoal = fixtureInput()
ambiguousExternalGoal.config.externalLandscapePaths = ['fixtures/colliding.json']
ambiguousExternalGoal.externalLandscapeSources = [{
  path: 'fixtures/colliding.json',
  landscape: {
    ...externalLandscapeFixture,
    landscapeId: 'fixture-colliding',
    goals: [goal({ id: 'A', title: 'Colliding goal' })],
  },
}]
expectBuildFailure(ambiguousExternalGoal, /external goal ID A is ambiguous/u)

const forbiddenCrossLandscapeContains = fixtureInput()
;(forbiddenCrossLandscapeContains.landscape as {
  goals: Array<{ id: string; contains: string[] }>
}).goals.find(({ id }) => id === 'main')!.contains.push('math-foundation')
refreshFixtureSemanticKindFingerprint(forbiddenCrossLandscapeContains, 'main')
forbiddenCrossLandscapeContains.config.externalLandscapePaths = ['fixtures/mathematics.json']
forbiddenCrossLandscapeContains.externalLandscapeSources = [{
  path: 'fixtures/mathematics.json',
  landscape: externalLandscapeFixture,
}]
expectBuildFailure(forbiddenCrossLandscapeContains, /foreign contains reference math-foundation/u)

const missingVisualizationQa = fixtureInput()
const missingVisualizationQaLedger = missingVisualizationQa.goalVisualizationQa as {
  records: unknown[]
}
missingVisualizationQaLedger.records = []
expectBuildFailure(missingVisualizationQa, /has no current available QA record/u)

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

const physicsAtlasInput = fixtureInput()
;(physicsAtlasInput.landscape as Record<string, unknown>).subject = 'Physik'
const physicsAtlasView = JSON.parse(JSON.stringify(physicsAtlasInput.compositionView)) as {
  scope: Record<string, string>
  rootNodes: Array<{ label: string }>
}
physicsAtlasView.scope = {
  schoolForm: 'Gymnasium',
  jurisdiction: 'DE-BY',
  stage: 'SekI',
}
physicsAtlasView.rootNodes[0].label = 'Physik'
delete physicsAtlasInput.compositionView
delete physicsAtlasInput.config.compositionViewPath
physicsAtlasInput.config.compositionViewManifestPath = 'fixtures/physics-atlas.sources.json'
physicsAtlasInput.compositionViewManifest = {
  schemaVersion: 2,
  manifestId: 'fixture-physics-atlas',
  landscapeId: 'fixture-landscape',
  navigationOwnership: 'canonical-composition-view-v1',
  navigationViewPath: 'fixtures/physics-atlas-navigation.view.json',
  expectedJurisdictions: ['DE-BY'],
  durationModelPolicyPath: 'fixtures/duration-model-policy.json',
  expectedCurricularAtomicGoalCount: 4,
  sourcePaths: ['fixtures/physics.view.json'],
}
physicsAtlasInput.navigationView = physicsAtlasView
physicsAtlasInput.compositionViewSources = [{
  path: 'fixtures/physics.view.json',
  view: physicsAtlasView,
}]
physicsAtlasInput.durationModelPolicy = {
  schemaVersion: 1,
  decisions: [
    ...singleStatePolicy.decisions,
    {
      subject: 'Physik',
      jurisdiction: 'DE-BY',
      stage: 'SekI+SekII',
      status: 'reviewed',
      decision: 'single-duration-source',
      durationModels: ['G9'],
    },
  ],
}
const physicsAtlas = buildGoalBookModel(physicsAtlasInput)
const physicsAtlasRootChapters = physicsAtlas.chapters
  .filter(({ parentChapterId }) => parentChapterId === null)
assert.deepEqual(physicsAtlasRootChapters.map(({ label }) => label), ['Physik'])
assert.ok(physicsAtlas.pages.every(({ breadcrumbs }) => breadcrumbs[0] === 'Physik'))
assert.ok(physicsAtlas.pages.every(({ applicability }) => (
  applicability?.[0]?.jurisdiction === 'DE-BY'
  && applicability[0].scopes[0]?.durationModel === 'G9'
)))

const roleAwareAtlasInput = JSON.parse(JSON.stringify(physicsAtlasInput)) as GoalBookBuildInput
roleAwareAtlasInput.compositionViewManifest = {
  schemaVersion: 2,
  manifestId: 'fixture-role-aware-physics-atlas',
  landscapeId: 'fixture-landscape',
  navigationOwnership: 'canonical-composition-view-v1',
  navigationViewPath: 'fixtures/physics-atlas-navigation.view.json',
  expectedJurisdictions: ['DE-BY', 'DE-HE'],
  durationModelPolicyPath: 'fixtures/duration-model-policy.json',
  expectedCurricularAtomicGoalCount: 4,
  sourcePaths: ['fixtures/by-physics.view.json', 'fixtures/he-physics.view.json'],
}
const roleAwareBaseView = JSON.parse(JSON.stringify(physicsAtlasView)) as {
  viewId: string
  scope: Record<string, string>
  rootNodes: Array<{ kind: string, children: Array<Record<string, unknown>> }>
}
roleAwareBaseView.viewId = 'fixture-by-role-aware-physics'
roleAwareBaseView.scope.jurisdiction = 'DE-BY'
const roleAwareExcludedView = JSON.parse(JSON.stringify(roleAwareBaseView)) as typeof roleAwareBaseView
roleAwareExcludedView.viewId = 'fixture-he-role-aware-physics'
roleAwareExcludedView.scope.jurisdiction = 'DE-HE'
roleAwareExcludedView.rootNodes[0].children.push({
  kind: 'goalEntry',
  goalId: 'A',
  projectionRole: 'prerequisiteOnly',
})
roleAwareAtlasInput.compositionViewSources = [{
  path: 'fixtures/by-physics.view.json',
  view: roleAwareBaseView,
}, {
  path: 'fixtures/he-physics.view.json',
  view: roleAwareExcludedView,
}]
roleAwareAtlasInput.durationModelPolicy = {
  schemaVersion: 1,
  decisions: [
    ...singleStatePolicy.decisions,
    {
      subject: 'Physik',
      jurisdiction: 'DE-BY',
      stage: 'SekI+SekII',
      status: 'reviewed',
      decision: 'single-duration-source',
      durationModels: ['G9'],
    },
    {
      subject: 'Physik',
      jurisdiction: 'DE-HE',
      stage: 'SekI+SekII',
      status: 'reviewed',
      decision: 'single-duration-source',
      durationModels: ['G9'],
    },
  ],
}
const roleAwareAtlas = buildGoalBookModel(roleAwareAtlasInput)
assert.equal(roleAwareAtlas.pages.length, 4)
assert.deepEqual(
  roleAwareAtlas.pages.find(({ goalId }) => goalId === 'A')?.applicability
    ?.map(({ jurisdiction }) => jurisdiction),
  ['DE-BY'],
  'A direct prerequisiteOnly goalEntry must remove an inherited target from that atlas source.',
)
assert.deepEqual(
  roleAwareAtlas.pages.find(({ goalId }) => goalId === 'B')?.applicability
    ?.map(({ jurisdiction }) => jurisdiction),
  ['DE-BY', 'DE-HE'],
  'The role override must not remove unaffected siblings from the atlas source.',
)
const roleAwareHeSource = roleAwareAtlas.source.compositionViewSources
  ?.find(({ viewId }) => viewId === roleAwareExcludedView.viewId)
assert.ok(roleAwareHeSource)
const explicitRoleAwareAtlasInput = JSON.parse(JSON.stringify(roleAwareAtlasInput)) as GoalBookBuildInput
const explicitHeView = (explicitRoleAwareAtlasInput.compositionViewSources ?? [])[1]
  ?.view as typeof roleAwareExcludedView
assert.ok(explicitHeView)
explicitHeView.rootNodes[0].children = ['B', 'C', 'D'].map((goalId) => ({
  kind: 'goalEntry',
  goalId,
}))
const explicitRoleAwareAtlas = buildGoalBookModel(explicitRoleAwareAtlasInput)
assert.equal(
  roleAwareHeSource.projectionFingerprint,
  explicitRoleAwareAtlas.source.compositionViewSources
    ?.find(({ viewId }) => viewId === explicitHeView.viewId)?.projectionFingerprint,
  'The source projection fingerprint must bind the effective role-aware target IDs.',
)

const sekIBookConfigPath = fileURLToPath(new URL(
  './config/goal-books/de-de-gym-seki-math.json',
  import.meta.url,
))
const sekIBook = (await loadGoalBookBuildInputs(sekIBookConfigPath)).model
assert.equal(sekIBook.book.id, 'de-de-gym-seki-mathematik')
assert.equal(sekIBook.book.viewId, 'de-de-gym-seki-math')
assert.equal(sekIBook.book.scope.stage, 'SekI')
assert.ok(sekIBook.pages.length > 100)
assert.equal(new Set(sekIBook.pages.map(({ goalId }) => goalId)).size, sekIBook.pages.length)
sekIBook.pages.forEach((page, index) => {
  assert.equal(page.pageNumber, index + 1)
  assert.equal(page.anchor, `goal-${page.goalId}`)
  page.requires.forEach((reference) => {
    assert.ok(reference.pageNumber)
    assert.ok(reference.pageNumber < page.pageNumber)
  })
})

const [
  canonicalLandscapeText,
  sekIViewText,
  goalVisualizationQaText,
  archivedPilotEvidenceReviewText,
] = await Promise.all([
  readFile(fileURLToPath(new URL(`../../${LANDSCAPE_PATH}`, import.meta.url)), 'utf8'),
  readFile(fileURLToPath(new URL(`../../${SEKI_VIEW_PATH}`, import.meta.url)), 'utf8'),
  readFile(fileURLToPath(new URL(`../../${GOAL_VISUALIZATION_QA_PATH}`, import.meta.url)), 'utf8'),
  readFile(fileURLToPath(new URL(`../../${PILOT_EVIDENCE_REVIEW_PATH}`, import.meta.url)), 'utf8'),
])
const semanticKindLedgerText = await readFile(
  fileURLToPath(new URL(`../../${SEMANTIC_KIND_LEDGER_PATH}`, import.meta.url)),
  'utf8',
)
const semanticKindLedger = JSON.parse(semanticKindLedgerText) as {
  decisions: Array<{ goalId: string; semanticKind: string; decisionStatus: string }>
}
const goalVisualizationQa = JSON.parse(goalVisualizationQaText) as {
  records: Array<{
    visualizationState: string
    imageUrl: string
    assetSha256: string
  }>
}
const goalVisualizationAssetDigests = Object.fromEntries(goalVisualizationQa.records
  .filter(({ visualizationState }) => visualizationState === 'available')
  .map(({ imageUrl, assetSha256 }) => [imageUrl, assetSha256]))
const curricularAtomicGoalIds = new Set(semanticKindLedger.decisions
  .filter(({ semanticKind, decisionStatus }) => (
    semanticKind === 'curricularAtomic' && decisionStatus === 'authoritative'
  ))
  .map(({ goalId }) => goalId))
const canonicalLandscapeForProjection = normalizeCanonicalLandscape(JSON.parse(canonicalLandscapeText))
const canonicalGoalById = new Map(canonicalLandscapeForProjection.goals.map((item) => [item.id, item]))
const pilotGoal = canonicalGoalById.get(PILOT_GOAL_ID)
assert.ok(pilotGoal)
const pilotSemanticKind = semanticKindLedger.decisions.find(({ goalId }) => goalId === PILOT_GOAL_ID)
  ?.semanticKind
assert.ok(pilotSemanticKind)
const currentV1CompatibilityRecord = JSON.parse(archivedPilotEvidenceReviewText) as Record<string, unknown>
const currentV1RuleVersion = String(currentV1CompatibilityRecord.ruleVersion)
currentV1CompatibilityRecord.goalFingerprint = fingerprintGoalForEvidence(
  pilotGoal,
  currentV1RuleVersion,
  pilotSemanticKind,
)
currentV1CompatibilityRecord.reviewInputFingerprint = fingerprintGoalEvidenceReviewInput(
  pilotGoal,
  currentV1RuleVersion,
  goalVisualizationAssetDigests,
  pilotSemanticKind,
)
const currentV1CompatibilityText = `${JSON.stringify(currentV1CompatibilityRecord)}\n`
const sekICompilation = compileCompositionView(
  normalizeCompositionView(JSON.parse(sekIViewText)),
  canonicalLandscapeForProjection,
)
assert.equal(sekICompilation.findings.filter(({ severity }) => severity === 'error').length, 0)
const expectedTargetAtomicIds = new Set<string>()
const collectExpectedTargetAtoms = (node: CompiledCompositionPreviewNode) => {
  if (node.kind === 'goal' && node.sourceGoalId) {
    const sourceGoal = canonicalGoalById.get(node.sourceGoalId)
    assert.ok(sourceGoal)
    if (
      resolveCanonicalNodeType(sourceGoal) === 'atomic'
      && curricularAtomicGoalIds.has(sourceGoal.id)
    ) expectedTargetAtomicIds.add(sourceGoal.id)
  }
  node.children.forEach(collectExpectedTargetAtoms)
}
sekICompilation.compiledRootNodes.forEach(collectExpectedTargetAtoms)
assert.deepEqual(
  new Set(sekIBook.pages.map(({ goalId }) => goalId)),
  expectedTargetAtomicIds,
  'every target atomic goal from the reviewed composition view appears exactly once',
)
assert.equal(
  sekIBook.book.projectedAtomicGoalCount,
  sekIBook.book.pageCount + sekIBook.book.excludedTargetAtomicGoalCount,
)
assert.equal(sekIBook.excludedTargetGoals.length, sekIBook.book.excludedTargetAtomicGoalCount)
assert.ok(sekIBook.excludedTargetGoals.every(({ semanticKind }) => semanticKind !== 'curricularAtomic'))

const sekIIGkBookConfigPath = fileURLToPath(new URL(
  './config/goal-books/de-de-gym-sekii-gk-math.json',
  import.meta.url,
))
const sekIIGkBook = (await loadGoalBookBuildInputs(sekIIGkBookConfigPath)).model
assert.equal(sekIIGkBook.book.viewId, 'de-de-gym-sekii-math-gk')
assert.ok(sekIIGkBook.pages.length > 100)
assert.equal(new Set(sekIIGkBook.pages.map(({ goalId }) => goalId)).size, sekIIGkBook.pages.length)
assert.ok(sekIIGkBook.pages.some(({ goalId }) => goalId === PILOT_GOAL_ID))
assert.ok(sekIIGkBook.excludedTargetGoals.some(({ semanticKind }) => semanticKind === 'memory'))
assert.ok(sekIIGkBook.excludedTargetGoals.some(({ semanticKind }) => semanticKind === 'orientation'))
assert.ok(sekIIGkBook.excludedTargetGoals.some(({ semanticKind }) => semanticKind === 'practiceAssessment'))
const sekIIPilotPage = sekIIGkBook.pages.find(({ goalId }) => goalId === PILOT_GOAL_ID)
assert.ok(sekIIPilotPage)
assert.equal(
  sekIIPilotPage.visualization?.originalDigest,
  'sha256:c016cda41bb13375f1ec5eec23ca3fdace458322e4bd174ce9b7601e7fca5cd2',
)
assert.equal(sekIIPilotPage.evidenceReview, null)

const nationalAtlasConfigPath = fileURLToPath(new URL(
  './config/goal-books/de-gym-math-national-atlas.json',
  import.meta.url,
))
const nationalAtlas = (await loadGoalBookBuildInputs(nationalAtlasConfigPath)).model
const publishedNationalAtlasText = await readFile(fileURLToPath(new URL(
  '../public/lernzielbuch/de-gym-mathematik-bundesweit.book-model.json',
  import.meta.url,
)), 'utf8')
assert.equal(nationalAtlas.book.id, 'de-gym-mathematik-bundesweit')
assert.equal(nationalAtlas.book.viewId, 'de-gym-math-national-atlas')
assert.equal(nationalAtlas.book.pageCount, 793)
assert.equal(nationalAtlas.book.scope.schoolForm, 'Gymnasium')
assert.deepEqual(Object.keys(nationalAtlas.book.scope), ['schoolForm'])
assert.equal(new Set(nationalAtlas.pages.map(({ goalId }) => goalId)).size, 793)
assert.equal(nationalAtlas.digest, EXPECTED_NATIONAL_MATH_MODEL_DIGEST)
assert.equal(
  `${JSON.stringify(nationalAtlas, null, 2)}\n`,
  publishedNationalAtlasText,
  'subject-neutral atlas refactors must leave the published mathematics BookModel byte-exact',
)
assert.equal(nationalAtlas.source.compositionViewSources?.length, 83)
assert.match(nationalAtlas.source.compositionViewManifestDigest ?? '', /^sha256:[0-9a-f]{64}$/u)
assert.equal(nationalAtlas.source.navigationOwnership, 'canonical-composition-view-v1')
assert.match(nationalAtlas.source.durationModelPolicyDigest ?? '', /^sha256:[0-9a-f]{64}$/u)
assert.equal(
  nationalAtlas.source.durationModelPolicyPath,
  'curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json',
)
const atlasRootChapters = nationalAtlas.chapters.filter(({ parentChapterId }) => parentChapterId === null)
assert.deepEqual(atlasRootChapters.map(({ label }) => label), ['Mathematik'])
assert.equal(
  nationalAtlas.chapters.filter(({ label }) => label === 'Sekundarstufe II (GK und LK)').length,
  1,
  'the nationwide atlas must label its combined canonical profile branch truthfully',
)
assert.equal(
  nationalAtlas.chapters.some(({ label }) => label === 'Sekundarstufe II (GK)'),
  false,
  'the nationwide atlas must not present its GK/LK union as a GK-only branch',
)
const atlasSiblingKeys = nationalAtlas.chapters.map(({ parentChapterId, label }) => (
  `${parentChapterId ?? 'ROOT'}\0${label}`
))
assert.equal(new Set(atlasSiblingKeys).size, atlasSiblingKeys.length)
const atlasChapterById = new Map(nationalAtlas.chapters.map((chapter) => [chapter.chapterId, chapter]))
nationalAtlas.pages.forEach((page) => {
  assert.ok(page.applicability && page.applicability.length > 0)
  assert.ok(page.chapterIds.length > 0)
  assert.equal(page.chapterIds[0], atlasRootChapters[0].chapterId)
  page.chapterIds.forEach((chapterId, index) => {
    const chapter = atlasChapterById.get(chapterId)
    assert.ok(chapter)
    assert.equal(chapter.parentChapterId, index === 0 ? null : page.chapterIds[index - 1])
  })
})
const crossStageNavigationPage = nationalAtlas.pages.find(({ goalId }) => (
  goalId === '30c013ac-5164-4c3c-8bc1-9a10b2f49533'
))
assert.ok(crossStageNavigationPage)
const crossStageHesseScopes = crossStageNavigationPage.applicability
  ?.find(({ jurisdiction }) => jurisdiction === 'DE-HE')?.scopes ?? []
assert.ok(crossStageHesseScopes.some(({ stage }) => stage === 'SekI'))
assert.ok(crossStageHesseScopes.some(({ stage }) => stage === 'SekII'))
assert.deepEqual(crossStageNavigationPage.breadcrumbs, [
  'Mathematik',
  'Sekundarstufe II (GK und LK)',
  'Grundlagen der Analysis und mathematische Modelle',
  'Funktionen und ihre Darstellung',
  'Potenzfunktionen und ganzrationale Funktionen in Grundzügen beschreiben',
])
assert.equal(crossStageNavigationPage.breadcrumbs.some((label) => (
  /(?:G8|G9|Hessen|Bayern|Nordrhein-Westfalen)/u.test(label)
)), false)
const allAtlasScopes = nationalAtlas.pages.flatMap((page) => (
  page.applicability?.flatMap(({ jurisdiction, scopes }) => scopes.map((scope) => ({
    jurisdiction,
    ...scope,
  }))) ?? []
))
assert.deepEqual(
  [...new Set(allAtlasScopes.map(({ jurisdiction }) => jurisdiction))].sort(),
  ['DE-BB', 'DE-BE', 'DE-BW', 'DE-BY', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-MV',
    'DE-NI', 'DE-NW', 'DE-RP', 'DE-SH', 'DE-SL', 'DE-SN', 'DE-ST', 'DE-TH'],
)
assert.ok(allAtlasScopes.some((scope) => (
  scope.jurisdiction === 'DE-BY'
  && scope.stage === 'SekII'
  && scope.durationModel === 'G9'
  && scope.courseProfile === 'GK'
)))
assert.equal(allAtlasScopes.some((scope) => (
  scope.jurisdiction === 'DE-BY' && scope.stage === 'SekII' && scope.durationModel === null
)), false)
assert.ok(allAtlasScopes.some((scope) => (
  scope.jurisdiction === 'DE-BB' && scope.stage === 'SekI' && scope.durationModel === 'G8'
)))
assert.ok(allAtlasScopes.some((scope) => (
  scope.jurisdiction === 'DE-BB' && scope.stage === 'SekI' && scope.durationModel === 'G9'
)))
assert.ok(allAtlasScopes.every(({ stage, durationModel, courseProfile }) => (
  (stage === 'SekI' && (durationModel === 'G8' || durationModel === 'G9') && courseProfile === null)
  || (stage === 'SekII' && (courseProfile === 'GK' || courseProfile === 'LK'))
)))

const descriptionUnderstandingEvidenceCalibrationConfigPath = fileURLToPath(new URL(
  DESCRIPTION_UNDERSTANDING_EVIDENCE_CALIBRATION_CONFIG_PATH,
  import.meta.url,
))
const descriptionUnderstandingEvidenceCalibration = (
  await loadGoalBookBuildInputs(descriptionUnderstandingEvidenceCalibrationConfigPath)
).model
assert.equal(
  descriptionUnderstandingEvidenceCalibration.book.id,
  'de-de-gym-math-description-understanding-evidence-calibration-v1',
)
assert.equal(descriptionUnderstandingEvidenceCalibration.book.publicationMode, 'review')
assert.deepEqual(
  descriptionUnderstandingEvidenceCalibration.pages.map(({ goalId }) => goalId),
  DESCRIPTION_UNDERSTANDING_EVIDENCE_CALIBRATION_GOAL_IDS,
  'the versioned calibration book must retain all 15 goals in the reviewed order',
)
assert.equal(descriptionUnderstandingEvidenceCalibration.book.pageCount, 15)
assert.equal(
  new Set(descriptionUnderstandingEvidenceCalibration.pages.map(({ goalId }) => goalId)).size,
  15,
)

const canonicalLandscape = JSON.parse(canonicalLandscapeText) as {
  landscapeId: string
  goals: Array<{ id: string }>
}
assert.ok(canonicalLandscape.goals.some(({ id }) => id === PILOT_GOAL_ID))
const pilotBuildInput: GoalBookBuildInput = {
  landscape: canonicalLandscape,
  compositionView: {
    viewId: 'pilot-goal-book-test',
    landscapeId: canonicalLandscape.landscapeId,
    scope: { schoolForm: 'Gymnasium', stage: 'SekII' },
    rootNodes: [{
      kind: 'structure',
      id: 'pilot',
      label: 'Mathematik',
      children: [{ kind: 'goalEntry', goalId: PILOT_GOAL_ID }],
    }],
  },
  semanticKindLedger,
  goalVisualizationQa,
  goalVisualizationAssetDigests,
  evidenceReviewSources: [{
    path: PILOT_EVIDENCE_REVIEW_PATH,
    text: currentV1CompatibilityText,
  }],
  config: {
    bookId: 'pilot-goal',
    title: 'Pilot goal',
    landscapePath: LANDSCAPE_PATH,
    compositionViewPath: 'synthetic/pilot-goal.view.json',
    semanticKindLedgerPath: SEMANTIC_KIND_LEDGER_PATH,
    goalVisualizationQaPath: GOAL_VISUALIZATION_QA_PATH,
    publicationMode: 'review',
    evidenceReviewPaths: [PILOT_EVIDENCE_REVIEW_PATH],
  },
}
const pilotBook = buildGoalBookModel(pilotBuildInput)
assert.equal(pilotBook.pages.length, 1)
const pilotPage = pilotBook.pages[0]
assert.equal(pilotPage.goalId, PILOT_GOAL_ID)
assert.equal(pilotPage.anchor, `goal-${PILOT_GOAL_ID}`)
assert.equal(pilotPage.title, 'Darstellungsform auswählen und begründen')
assert.equal(
  pilotPage.goalFingerprint,
  'sha256:15f95e5f0446c03383df700b0c3d94fa1962deeac12cab5c36c13965399e27d5',
  'the book reuses the goal-evidence semantic fingerprint contract',
)
assert.match(pilotPage.pageFingerprint, /^sha256:[0-9a-f]{64}$/u)
assert.notEqual(pilotPage.pageFingerprint, pilotPage.goalFingerprint)
assert.deepEqual(pilotPage.breadcrumbs, ['Mathematik'])
assert.deepEqual(pilotPage.requires, [])
assert.deepEqual(pilotPage.externalPrerequisites.map(({ goalId }) => goalId), [PILOT_PREREQUISITE_ID])
assert.equal(
  pilotPage.visualization?.url,
  `/assets/goal-visualizations/mathematik/${PILOT_GOAL_ID}/${PILOT_GOAL_ID}.jpg`,
)
assert.equal(pilotPage.evidenceReview?.reviewId, 'canonical-math-representation-choice-pilot')
assert.equal(pilotPage.evidenceReview?.status, 'needs_human_review')

const archivedV1EvidenceInput = JSON.parse(JSON.stringify(pilotBuildInput)) as GoalBookBuildInput
archivedV1EvidenceInput.evidenceReviewSources[0].text = archivedPilotEvidenceReviewText
expectBuildFailure(archivedV1EvidenceInput, /stale goalFingerprint/u)

const changedEvidenceInput = JSON.parse(JSON.stringify(pilotBuildInput)) as GoalBookBuildInput
const changedEvidenceRecord = JSON.parse(currentV1CompatibilityText.trim()) as Record<string, unknown>
changedEvidenceRecord.status = 'rejected'
changedEvidenceInput.evidenceReviewSources[0].text = `${JSON.stringify(changedEvidenceRecord)}\n`
const changedEvidenceBook = buildGoalBookModel(changedEvidenceInput)
assert.equal(changedEvidenceBook.pages[0].goalFingerprint, pilotPage.goalFingerprint)
assert.notEqual(changedEvidenceBook.pages[0].pageFingerprint, pilotPage.pageFingerprint)
assert.notEqual(changedEvidenceBook.digest, pilotBook.digest)

const staleEvidenceInput = JSON.parse(JSON.stringify(pilotBuildInput)) as GoalBookBuildInput
const staleEvidenceRecord = JSON.parse(currentV1CompatibilityText.trim()) as Record<string, unknown>
staleEvidenceRecord.reviewInputFingerprint = `sha256:${'f'.repeat(64)}`
staleEvidenceInput.evidenceReviewSources[0].text = `${JSON.stringify(staleEvidenceRecord)}\n`
expectBuildFailure(staleEvidenceInput, /stale reviewInputFingerprint/u)

const evidenceWithUnknownFieldInput = JSON.parse(JSON.stringify(pilotBuildInput)) as GoalBookBuildInput
const evidenceWithUnknownField = JSON.parse(currentV1CompatibilityText.trim()) as Record<string, unknown>
evidenceWithUnknownField.unexpected = true
evidenceWithUnknownFieldInput.evidenceReviewSources[0].text = `${JSON.stringify(evidenceWithUnknownField)}\n`
expectBuildFailure(evidenceWithUnknownFieldInput, /violates the closed goal-evidence schema/u)

const evidenceWithUnknownFacetInput = JSON.parse(JSON.stringify(pilotBuildInput)) as GoalBookBuildInput
const evidenceWithUnknownFacet = JSON.parse(currentV1CompatibilityText.trim()) as {
  profile: { coverageRequirements: { allOf: string[] } }
}
evidenceWithUnknownFacet.profile.coverageRequirements.allOf.push('unknown-facet')
evidenceWithUnknownFacetInput.evidenceReviewSources[0].text = `${JSON.stringify(evidenceWithUnknownFacet)}\n`
expectBuildFailure(evidenceWithUnknownFacetInput, /coverage references unknown facet/u)

const bookModelSchema = JSON.parse(await readFile(
  fileURLToPath(new URL(`../../${BOOK_MODEL_SCHEMA_PATH}`, import.meta.url)),
  'utf8',
))
const validateBookModel = new Ajv2020({ allErrors: true, strict: true }).compile(bookModelSchema)
const legacyBookModelSchema = JSON.parse(await readFile(
  fileURLToPath(new URL(`../../${LEGACY_BOOK_MODEL_SCHEMA_PATH}`, import.meta.url)),
  'utf8',
))
const validateLegacyBookModel = new Ajv2020({ allErrors: true, strict: true })
  .compile(legacyBookModelSchema)
const legacyBookModel = JSON.parse(await readFile(
  fileURLToPath(new URL(`../../${LEGACY_BOOK_MODEL_FIXTURE_PATH}`, import.meta.url)),
  'utf8',
))
assert.equal(
  validateLegacyBookModel(legacyBookModel),
  true,
  `archived 1.0 model must remain valid: ${JSON.stringify(validateLegacyBookModel.errors)}`,
)
assert.equal(validateBookModel(legacyBookModel), false, '1.1 schema must reject an archived 1.0 model')
for (const [label, model] of [
  ['SekI', sekIBook],
  ['SekII-GK', sekIIGkBook],
  ['national atlas', nationalAtlas],
] as const) {
  assert.equal(
    validateBookModel(model),
    true,
    `${label} model must satisfy the closed GoalBookModel schema: ${JSON.stringify(validateBookModel.errors)}`,
  )
  assert.equal(parseAndValidateGoalBookModel(JSON.stringify(model)).digest, model.digest)
}
assert.equal(
  validateLegacyBookModel(nationalAtlas),
  false,
  'legacy 1.0 schema must reject a current 1.1 model',
)
const modelWithUnknownField = JSON.parse(JSON.stringify(sekIBook)) as Record<string, unknown>
modelWithUnknownField.unexpected = true
assert.equal(validateBookModel(modelWithUnknownField), false, 'closed schema rejects unknown fields')
assert.throws(
  () => parseAndValidateGoalBookModel(modelWithUnknownField),
  /violates its closed JSON Schema/u,
)

const stalePageModel = JSON.parse(JSON.stringify(sekIBook)) as typeof sekIBook
stalePageModel.pages[0].title = `${stalePageModel.pages[0].title} changed`
assert.throws(() => parseAndValidateGoalBookModel(stalePageModel), /stale pageFingerprint/u)

const staleBookDigestModel = JSON.parse(JSON.stringify(sekIBook)) as typeof sekIBook
staleBookDigestModel.digest = `sha256:${'0'.repeat(64)}`
assert.throws(() => parseAndValidateGoalBookModel(staleBookDigestModel), /stale digest/u)

console.log(
  `Goal-book model tests passed (${sekIBook.pages.length} Sek-I, ${sekIIGkBook.pages.length} SekII-GK, ${nationalAtlas.pages.length} nationwide curricular pages, and ${descriptionUnderstandingEvidenceCalibration.pages.length} calibration pages).`,
)
