import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { stableGoalBookJson, type GoalBookModel } from './goalBookModel'
import {
  buildGoalBookReviewBundle,
  renderGoalBookReviewMarkdown,
  type ExportOptions,
} from './exportGoalBookReviewBundle'

const hex = (character: string) => `sha256:${character.repeat(64)}`
const sha256 = (value: string | Buffer) => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)

const pageWithoutFingerprint = {
  pageNumber: 1,
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
    modelSchemaVersion: '1.0.0',
    edition: 'curricular-atomic-v1',
    page: pageWithoutFingerprint,
  })),
}
const modelWithoutDigest = {
  schemaVersion: '1.0.0',
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
  chapters: [
    {
      chapterId: 'structure:mathematics',
      label: 'Mathematics',
      parentChapterId: null,
      goalIds: ['goal-a'],
      pageNumbers: [1],
    },
    {
      chapterId: 'structure:representations',
      label: 'Representations',
      parentChapterId: 'structure:mathematics',
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
      schemaVersion: 1,
      rendererVersion: 'goal-book-renderer-v1',
      bookId: model.book.id,
      bookEdition: model.book.edition,
      publicationMode: model.book.publicationMode,
      atlasBaseUrl: model.book.atlasBaseUrl,
      feedbackBaseUrl: 'https://skillpilot.example/goal-feedback',
      modelDigest: model.digest,
      format: 'pdf',
      pageCount: model.pages.length,
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

  const staleManifest = JSON.parse(await (await import('node:fs/promises')).readFile(
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
}

console.log('Goal-book review bundle tests passed.')
