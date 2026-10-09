import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { stableGoalBookJson, type GoalBookModel } from './goalBookModel'
import {
  buildGoalBookReviewBundle,
  renderGoalBookReviewMarkdown,
  type ExportOptions,
} from './exportGoalBookReviewBundle'
import { goalBookFrontMatterPageCount } from './goalBookRenderer'
import { expectedRecords } from './fixtures/positiveGoalEvidenceCandidates'
import {
  buildGoalDescriptionReviewCampaign,
  buildGoalDescriptionReviewInput,
  loadGoalDescriptionReviewRecordSchemaBytes,
  validateGoalDescriptionReviewCampaign,
} from './validateGoalDescriptionReviewCampaign'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

const hex = (character: string) => `sha256:${character.repeat(64)}`
const sha256 = (value: string | Buffer) => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)

const pageWithoutFingerprint = {
  pageNumber: 1,
  navigationOrder: 0,
  treeOrder: 2,
  goalId: 'goal-a',
  anchor: 'goal-goal-a',
  title: 'Representations compare',
  description: 'The learner can compare two representations.',
  breadcrumbs: ['Mathematics', 'Representations'],
  chapterIds: ['structure:mathematics', 'structure:representations'],
  requires: [],
  reverseRequires: [],
  externalPrerequisites: [],
  externalReverseRequires: [],
  visualization: null,
  evidenceReview: null,
  goalFingerprint: hex('e'),
}
const page = {
  ...pageWithoutFingerprint,
  pageFingerprint: sha256(stableGoalBookJson({
    modelSchemaVersion: '1.1.0',
    edition: 'curricular-atomic-v1',
    page: pageWithoutFingerprint,
  })),
}
const modelWithoutDigest = {
  schemaVersion: '1.1.0',
  book: {
    id: 'fixture-book',
    title: 'Fixture learning-goal book',
    locale: 'de-DE',
    landscapeId: 'fixture-landscape',
    viewId: 'fixture-view',
    scope: { schoolForm: 'Gymnasium', stage: 'SekI' },
    pageCount: 1,
    projectedAtomicGoalCount: 1,
    excludedTargetAtomicGoalCount: 0,
    edition: 'curricular-atomic-v1',
    publicationMode: 'review',
    atlasBaseUrl: null,
    oneGoalPerPage: true,
  },
  source: {
    landscapePath: 'curricula/fixture.json',
    compositionViewPath: 'curricula/fixture.view.json',
    semanticKindLedgerPath: 'curricula/fixture.semantic-kinds.json',
    goalVisualizationQaPath: 'curricula/fixture.visualization-qa.json',
    landscapeDigest: hex('a'),
    compositionViewDigest: hex('b'),
    semanticKindLedgerDigest: hex('c'),
    goalVisualizationQaDigest: hex('d'),
    evidenceReviewSources: [],
    goalFingerprintRuleVersion: 'goal-evidence-v1',
  },
  navigation: (() => {
    const goalGraphWithoutDigest = {
      schemaVersion: '1.0.0' as const,
      landscapeId: 'fixture-landscape',
      title: 'Fixture learning-goal graph',
      goals: [
        {
          id: 'cluster-mathematics',
          title: 'Mathematics',
          contains: ['goal-a'],
          type: 'cluster' as const,
          semanticKind: 'curricularArea',
        },
        {
          id: 'goal-a',
          title: 'Representations compare',
          contains: [],
          type: 'atomic' as const,
          semanticKind: 'curricularAtomic',
        },
      ],
    }
    const projection = {
      schemaVersion: '1.0.0' as const,
      viewId: 'fixture-view',
      landscapeId: 'fixture-landscape',
      title: 'Fixture learning-goal book',
      scope: { schoolForm: 'Gymnasium', stage: 'SekI' },
      chapters: [
        {
          chapterId: 'structure:mathematics',
          label: 'Mathematics',
          parentChapterId: null,
          order: 0,
          treeOrder: 0,
        },
        {
          chapterId: 'structure:representations',
          label: 'Representations',
          parentChapterId: 'structure:mathematics',
          order: 1,
          treeOrder: 1,
        },
      ],
      placements: [{
        goalId: 'goal-a',
        breadcrumbs: ['Mathematics', 'Representations'],
        chapterIds: ['structure:mathematics', 'structure:representations'],
        navigationOrder: 0,
        treeOrder: 2,
      }],
    }
    return {
      schemaVersion: '1.0.0' as const,
      canonicalProjectionSource: {
        path: 'curricula/fixture.view.json',
        viewId: 'fixture-view',
        title: 'Fixture learning-goal book',
        scope: { schoolForm: 'Gymnasium', stage: 'SekI' },
        digest: hex('b'),
        projectionFingerprint: sha256(stableGoalBookJson(projection)),
      },
      goalGraph: {
        ...goalGraphWithoutDigest,
        digest: sha256(stableGoalBookJson(goalGraphWithoutDigest)),
      },
    }
  })(),
  chapters: [
    {
      chapterId: 'structure:mathematics',
      label: 'Mathematics',
      parentChapterId: null,
      order: 0,
      treeOrder: 0,
      goalIds: ['goal-a'],
      pageNumbers: [1],
    },
    {
      chapterId: 'structure:representations',
      label: 'Representations',
      parentChapterId: 'structure:mathematics',
      order: 1,
      treeOrder: 1,
      goalIds: ['goal-a'],
      pageNumbers: [1],
    },
  ],
  pages: [page],
  excludedTargetGoals: [],
}
const model = {
  ...modelWithoutDigest,
  digest: sha256(stableGoalBookJson(modelWithoutDigest)),
} satisfies GoalBookModel

const temporaryDirectory = await mkdtemp(join(tmpdir(), 'goal-book-review-bundle-test-'))
const temporaryEvidenceDirectory = await mkdtemp(join(repositoryRoot, '.goal-book-review-evidence-test-'))
try {
  const modelPath = join(temporaryDirectory, 'model.json')
  const pdfPath = join(temporaryDirectory, 'book.pdf')
  const pdfManifestPath = `${pdfPath}.render-manifest.json`
  const promptPath = join(temporaryDirectory, 'prompt.md')
  const criteriaPath = join(temporaryDirectory, 'criteria.md')
  const pdf = Buffer.from('%PDF-1.7\nfixture\n')
  await Promise.all([
    writeFile(modelPath, `${JSON.stringify(model, null, 2)}\n`),
    writeFile(pdfPath, pdf),
    writeFile(pdfManifestPath, JSON.stringify({
      schemaVersion: 2,
      rendererVersion: 'goal-book-renderer-v2',
      bookId: model.book.id,
      bookEdition: model.book.edition,
      publicationMode: model.book.publicationMode,
      atlasBaseUrl: model.book.atlasBaseUrl,
      feedbackBaseUrl: 'https://skillpilot.example/goal-feedback',
      modelDigest: model.digest,
      format: 'pdf',
      pageCount: model.pages.length,
      goalPageCount: model.pages.length,
      frontMatterPageCount: goalBookFrontMatterPageCount(model),
      physicalPageCount: model.pages.length + goalBookFrontMatterPageCount(model),
      pages: model.pages.map(({
        pageNumber,
        goalId,
        anchor,
        chapterIds,
        goalFingerprint,
        pageFingerprint,
      }) => ({
        pageNumber,
        goalId,
        anchor,
        chapterIds,
        goalFingerprint,
        pageFingerprint,
      })),
      chapters: model.chapters,
      visualizationMode: 'root-relative-local-assets',
      printDerivativePolicy: {
        version: 'chromium-canvas-v1',
        maxWidthPixels: 1600,
        maxHeightPixels: 1200,
        jpegQuality: 0.82,
        webpQuality: 0.9,
        maxBytes: 1500000,
      },
      assets: [],
      artifactSha256: sha256(pdf),
    })),
    writeFile(promptPath, '# Review prompt\n'),
    writeFile(criteriaPath, '# Review criteria\n'),
  ])
  const options: ExportOptions = {
    modelPath,
    pdfPath,
    pdfRenderManifestPath: pdfManifestPath,
    outputDirectory: join(temporaryDirectory, 'bundle'),
    promptPath,
    criteriaPath,
    goalIds: ['goal-a'],
  }
  const first = await buildGoalBookReviewBundle(model, options)
  const second = await buildGoalBookReviewBundle(model, options)
  assert.equal(first.manifest.bundleFingerprint, second.manifest.bundleFingerprint)
  assert.equal(first.manifest.selectedGoalCount, 1)
  assert.deepEqual(first.manifest.goals.map(({ goalId }) => goalId), ['goal-a'])
  assert.equal(first.manifest.reviewPolicy.modelVotesGrantReleaseAuthority, false)
  assert.equal(first.manifest.reviewPolicy.humanApprovalRequired, true)
  assert.equal(first.manifest.reviewPolicy.learnerDataAllowed, false)
  assert.ok(first.manifest.artifacts.some(({ role }) => role === 'book_pdf'))
  assert.ok(first.manifest.artifacts.some(({ role }) => role === 'book_model'))
  assert.match(renderGoalBookReviewMarkdown(first.input), /Full learning-goal ID: `goal-a`/u)

  // Exercise the real bundle export with a closed V2 record, not a V1-shaped
  // stand-in. The record's candidate status and all bilingual content survive.
  const positiveRecord = {
    ...expectedRecords[0],
    goalId: page.goalId,
    goalFingerprint: page.goalFingerprint,
  }
  const positiveSourcePath = join(temporaryEvidenceDirectory, 'positive.review.jsonl')
  await writeFile(positiveSourcePath, `${JSON.stringify(positiveRecord)}\n`)
  const positivePageWithoutFingerprint = {
    ...pageWithoutFingerprint,
    evidenceReview: {
      reviewId: positiveRecord.reviewId,
      status: positiveRecord.status,
      reviewInputFingerprint: positiveRecord.reviewInputFingerprint,
      profileFingerprint: positiveRecord.profileFingerprint,
      evidenceLevel: positiveRecord.evidenceLevel,
      maximumClaimScope: positiveRecord.maximumClaimScope,
    },
  }
  const positivePage = {
    ...positivePageWithoutFingerprint,
    pageFingerprint: sha256(stableGoalBookJson({
      modelSchemaVersion: '1.1.0',
      edition: 'curricular-atomic-v1',
      page: positivePageWithoutFingerprint,
    })),
  }
  const positiveModelWithoutDigest = {
    ...modelWithoutDigest,
    source: {
      ...modelWithoutDigest.source,
      evidenceReviewSources: [{
        path: relative(repositoryRoot, positiveSourcePath),
        digest: sha256(stableGoalBookJson([positiveRecord])),
      }],
    },
    pages: [positivePage],
  }
  const positiveModel = {
    ...positiveModelWithoutDigest,
    digest: sha256(stableGoalBookJson(positiveModelWithoutDigest)),
  } satisfies GoalBookModel
  const positiveModelPath = join(temporaryDirectory, 'positive.model.json')
  const positiveManifestPath = join(temporaryDirectory, 'positive.pdf.render-manifest.json')
  const positiveManifest = {
    ...JSON.parse(await readFile(pdfManifestPath, 'utf8')),
    modelDigest: positiveModel.digest,
    pages: [{
      pageNumber: positivePage.pageNumber,
      goalId: positivePage.goalId,
      anchor: positivePage.anchor,
      chapterIds: positivePage.chapterIds,
      goalFingerprint: positivePage.goalFingerprint,
      pageFingerprint: positivePage.pageFingerprint,
    }],
  }
  await writeFile(positiveModelPath, `${JSON.stringify(positiveModel)}\n`)
  await writeFile(positiveManifestPath, `${JSON.stringify(positiveManifest)}\n`)
  const positiveBundle = await buildGoalBookReviewBundle(positiveModel, {
    ...options,
    modelPath: positiveModelPath,
    pdfRenderManifestPath: positiveManifestPath,
  })
  assert.deepEqual(positiveBundle.input.pages[0].evidenceProfile, positiveRecord)
  assert.equal(positiveBundle.manifest.goals[0].evidenceReview?.status, 'needs_human_review')
  assert.equal(positiveBundle.manifest.reviewPolicy.humanApprovalRequired, true)
  const positiveMarkdown = renderGoalBookReviewMarkdown(positiveBundle.input)
  assert.match(positiveMarkdown, /positive-understanding-evidence-v2/u)
  assert.match(positiveMarkdown, /authority: `ai_candidate`/u)
  assert.match(positiveMarkdown, /Status: `needs_human_review`/u)
  assert.match(positiveMarkdown, /minimum independent demonstrations: 2/u)
  assert.match(positiveMarkdown, /fresh variation required: true/u)
  assert.match(positiveMarkdown, /independent transfer required: true/u)
  for (const expectation of positiveRecord.profile.expectations) {
    for (const text of [
      expectation.essentialUnderstandingDe, expectation.essentialUnderstandingEn,
      expectation.observablePerformanceDe, expectation.observablePerformanceEn,
    ]) assert.ok(positiveMarkdown.includes(text), `Missing V2 expectation: ${text}`)
  }
  for (const applicationCase of positiveRecord.profile.applicationCaseBriefs) {
    for (const text of [
      applicationCase.taskDemandDe, applicationCase.taskDemandEn,
      applicationCase.expectedPerformanceDe, applicationCase.expectedPerformanceEn,
      applicationCase.understandingFocusDe, applicationCase.understandingFocusEn,
    ]) assert.ok(positiveMarkdown.includes(text), `Missing V2 case content: ${text}`)
  }
  const positiveDescriptionInput = buildGoalDescriptionReviewInput({
    bundle: positiveBundle.manifest,
    reviewInput: positiveBundle.input,
    landscape: {
      goals: [{
        id: page.goalId,
        title: page.title,
        titleEn: 'Compare representations',
        description: page.description,
        descriptionEn: 'The learner can compare two representations.',
        weight: 1,
        requires: [],
        contains: [],
        dimensionTags: {
          framework: 'synthetic-review-bundle-test',
          demandLevel: 'AB1',
          processCompetencies: [],
          guidingIdeas: [],
          phase: 'test',
        },
      }],
    },
  })
  const positiveCampaign = buildGoalDescriptionReviewCampaign({
    bundle: positiveBundle.manifest,
    input: positiveDescriptionInput,
    campaignId: 'synthetic-positive-bundle-test',
    roundId: 'synthetic-positive-bundle-test-a',
    reviewerRole: 'internal_ai_reviewer',
    reviewPass: 'first_pass',
    independenceGroupId: 'synthetic-positive-bundle-independent-a',
    blindToOtherReviews: true,
    recordSchemaDigest: sha256(await loadGoalDescriptionReviewRecordSchemaBytes()),
    batchSize: 20,
  })
  assert.deepEqual((await validateGoalDescriptionReviewCampaign({
    bundle: positiveBundle.manifest,
    input: positiveDescriptionInput,
    campaign: positiveCampaign,
  })).errors, [], 'The exported V2 profile must pass the current V3 campaign contract.')
  // A source digest still cannot disguise a record that violates its V2 schema.
  const malformedRecord = { ...positiveRecord, unexpected: true }
  await writeFile(positiveSourcePath, `${JSON.stringify(malformedRecord)}\n`)
  const malformedModel = structuredClone(positiveModel)
  malformedModel.source.evidenceReviewSources[0].digest = sha256(stableGoalBookJson([malformedRecord]))
  const malformedModelWithoutDigest = Object.fromEntries(
    Object.entries(malformedModel).filter(([key]) => key !== 'digest'),
  )
  malformedModel.digest = sha256(stableGoalBookJson(malformedModelWithoutDigest))
  await assert.rejects(
    () => buildGoalBookReviewBundle(malformedModel, options),
    /closed goal-evidence schema/u,
  )

  const staleManifest = JSON.parse(await readFile(
    pdfManifestPath,
    'utf8',
  )) as { artifactSha256: string }
  staleManifest.artifactSha256 = hex('0')
  await writeFile(pdfManifestPath, JSON.stringify(staleManifest))
  await assert.rejects(
    () => buildGoalBookReviewBundle(model, options),
    /PDF render manifest does not bind/u,
  )
} finally {
  await rm(temporaryDirectory, { force: true, recursive: true })
  await rm(temporaryEvidenceDirectory, { force: true, recursive: true })
}

console.log('Goal-book review bundle tests passed.')
