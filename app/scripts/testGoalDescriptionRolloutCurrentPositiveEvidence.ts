import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { LearningGoal } from '../src/landscapeTypes'
import { normalizeCanonicalLandscape } from '../src/utils/authoring/canonicalAuthoring'
import {
  buildGoalBookModel,
  stableGoalBookJson,
  type GoalBookBuildInput,
} from './goalBookModel'
import {
  assertGoalDescriptionRolloutCurrentPositiveEvidence,
  buildGoalDescriptionRolloutSubsetModel,
} from './materializeGoalDescriptionRolloutBatch'
import { loadDeepUnderstandingRolloutConfig } from './reportDeepUnderstandingRollout'
import {
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceReviewInput,
  type PositiveGoalEvidenceReviewRecord,
} from './positiveGoalEvidenceProfileModel'
import { validateGoalBookEvidenceReviewRecordSemantics } from './goalBookEvidenceReviewLoader'

const root = fileURLToPath(new URL('../..', import.meta.url))
const json = <T>(path: string): T => JSON.parse(readFileSync(resolve(root, path), 'utf8')) as T
const subject = loadDeepUnderstandingRolloutConfig().subjects.find(({ subject }) => subject === 'physik')!
const goalIds = ['09029573-864f-40ca-bf8a-cee7bf6dcb73', 'd18d4190-ddc1-5181-b1b6-e79947b737c2']
const ownerConfigs = subject.positiveEvidenceConfigPaths.map((path) => json<{
  reviewPath: string; reviewedResourceTypes: string[]; scope: { goalIds: string[] }
}>(path))
const selectedOwners = goalIds.map((id) => ownerConfigs.find(({ scope }) => scope.goalIds.includes(id))!)
assert(selectedOwners.every((owner) => owner.reviewedResourceTypes.length === 0))
const imageOwner = ownerConfigs.find(({ reviewedResourceTypes }) => reviewedResourceTypes.includes('goal-visualization'))!
const imageRecord = JSON.parse(readFileSync(resolve(root, imageOwner.reviewPath), 'utf8').split(/\r?\n/u).find((line) => line.trim())!) as PositiveGoalEvidenceReviewRecord
const originalEvidenceReviewPaths = [...selectedOwners.map(({ reviewPath }) => reviewPath), imageOwner.reviewPath]
const selectedGoalIds = [...goalIds, imageRecord.goalId]
const allRecords = originalEvidenceReviewPaths.flatMap((path) => readFileSync(resolve(root, path), 'utf8')
  .split(/\r?\n/u).filter((line) => line.trim()).map((line) => JSON.parse(line) as PositiveGoalEvidenceReviewRecord))
  .filter(({ goalId }) => selectedGoalIds.includes(goalId))
const recordsByGoalId = new Map(allRecords.map((record) => [record.goalId, record]))
const temporaryRoot = resolve(root, 'tmp')
await mkdir(temporaryRoot, { recursive: true })
const temporary = await mkdtemp(join(temporaryRoot, 'technical-current-p-boundary-'))
try {
  // Relocating unchanged full records is valid; no Book-only record is generated.
  const relocatedPath = join(temporary, 'exact-current-records.review.jsonl')
  await writeFile(relocatedPath, allRecords.map((record) => JSON.stringify(record)).join('\n') + '\n')
  const evidenceReviewPaths = [relative(root, relocatedPath)]
  const qa = json<{ records: Array<{ goalId: string; imageUrl: string }> }>(subject.visualizationQaPath)
  qa.records = qa.records.filter(({ goalId }) => selectedGoalIds.includes(goalId))
  const assetDigests = Object.fromEntries(qa.records.map(({ imageUrl }) => [imageUrl,
    `sha256:${createHash('sha256').update(readFileSync(resolve(root, `app/public${imageUrl}`))).digest('hex')}`]))
  const externalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
  const input: GoalBookBuildInput = {
    landscape: json(subject.landscapePath),
    compositionView: {
      viewId: 'technical-current-p-import-test', landscapeId: '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a',
      scope: { schoolForm: 'Gymnasium', stage: 'SekII' },
      rootNodes: [{ kind: 'structure', id: 'test', label: 'Technical import regression',
        children: selectedGoalIds.map((goalId) => ({ kind: 'goalEntry', goalId })) }],
    },
    semanticKindLedger: json(subject.semanticKindLedgerPath),
    goalVisualizationQa: qa,
    goalVisualizationAssetDigests: assetDigests,
    externalLandscapeSources: [{ path: externalPath, landscape: json(externalPath) }],
    evidenceReviewSources: evidenceReviewPaths.map((path) => ({ path, text: readFileSync(resolve(root, path), 'utf8') })),
    config: {
      bookId: 'technical-current-p-import-test', title: 'Technical current P import regression',
      landscapePath: subject.landscapePath,
      semanticKindLedgerPath: subject.semanticKindLedgerPath,
      compositionViewPath: 'fixtures/technical-current-p-import-test.view.json',
      goalVisualizationQaPath: subject.visualizationQaPath,
      externalLandscapePaths: [externalPath], publicationMode: 'review', evidenceReviewPaths,
    },
  }
  // This bounded structural build is a technical regression. It creates no review,
  // rendering, approval or historical evidence artifact.
  const originalRecords = stableGoalBookJson(allRecords)
  const built = buildGoalBookModel(input)
  assert.equal(built.pages.length, 3)
  for (const page of built.pages) {
    assert.equal(page.evidenceReview?.reviewInputFingerprint, recordsByGoalId.get(page.goalId)?.reviewInputFingerprint)
    assert.equal(page.visualization?.originalDigest, assetDigests[page.visualization!.url])
  }
  assert.equal(stableGoalBookJson(allRecords), originalRecords, 'Import must preserve every original current P record.')
  const subset = buildGoalDescriptionRolloutSubsetModel({ baseModel: built, goalIds,
    bookId: 'technical-current-p-bound-subset', title: 'Technical P-bound subset' })
  const preparedInputGoals = subset.pages.map((page) => ({ goalId: page.goalId,
    reviewContext: { page, evidenceProfile: recordsByGoalId.get(page.goalId)! } }))
  await assertGoalDescriptionRolloutCurrentPositiveEvidence({ subject: subject.subject,
    model: subset, baseConfig: input.config, preparedInputGoals })
  const independentConfig = { ...input.config, evidenceReviewPaths: [] }
  const independent = buildGoalDescriptionRolloutSubsetModel({
    baseModel: buildGoalBookModel({ ...input, evidenceReviewSources: [], config: independentConfig }),
    goalIds, bookId: 'technical-independent-null-subset', title: 'Technical independent null subset',
  })
  await assertGoalDescriptionRolloutCurrentPositiveEvidence({ subject: subject.subject, model: independent,
    baseConfig: independentConfig })

  // An explicitly image-scoped current P still needs the actual image digest.
  const badImage = structuredClone(input)
  const imageQa = (badImage.goalVisualizationQa as typeof qa).records.find(({ goalId }) => goalId === imageRecord.goalId)!
  badImage.goalVisualizationAssetDigests[imageQa.imageUrl] = `sha256:${'0'.repeat(64)}`
  await assert.rejects(async () => buildGoalBookModel(badImage), /stale reviewInputFingerprint/u)

  const missingPath = join(temporary, 'missing.review.jsonl')
  await writeFile(missingPath, '')
  await assert.rejects(() => assertGoalDescriptionRolloutCurrentPositiveEvidence({
    subject: subject.subject, model: subset,
    baseConfig: { ...input.config, evidenceReviewPaths: [relative(root, missingPath)] },
  }), /missing|profile\/page summary null binding conflicts/u)
  const wrapper = structuredClone(recordsByGoalId.get(goalIds[0])!)
  wrapper.reviewId = 'technical-book-only-wrapper'
  const wrapperGoal = normalizeCanonicalLandscape(input.landscape).goals.find(({ id }) => id === wrapper.goalId)! as unknown as LearningGoal
  wrapper.reviewInputFingerprint = fingerprintPositiveGoalEvidenceReviewInput(wrapperGoal,
    wrapper.reviewCriteriaFingerprint, assetDigests, 'curricularAtomic')
  const wrapperPath = join(temporary, 'wrapper.review.jsonl')
  await writeFile(wrapperPath, [wrapper, recordsByGoalId.get(goalIds[1])].map((record) => JSON.stringify(record)).join('\n') + '\n')
  const wrapperConfig = { ...input.config, evidenceReviewPaths: [relative(root, wrapperPath)] }
  const wrapperModel = buildGoalDescriptionRolloutSubsetModel({
    baseModel: buildGoalBookModel({ ...input, config: wrapperConfig,
      evidenceReviewSources: [{ path: relative(root, wrapperPath), text: readFileSync(wrapperPath, 'utf8') }] }),
    goalIds, bookId: 'technical-book-only-wrapper-subset', title: 'Technical Book-only wrapper subset',
  })
  await assert.rejects(() => assertGoalDescriptionRolloutCurrentPositiveEvidence({
    subject: subject.subject, model: wrapperModel, baseConfig: wrapperConfig,
  }), /stale full P record.*reviewId/u)
  await assert.rejects(() => assertGoalDescriptionRolloutCurrentPositiveEvidence({
    subject: subject.subject, model: subset, baseConfig: input.config,
    preparedInputGoals: [{ goalId: goalIds[0], reviewContext: {
      page: independent.pages.find(({ goalId }) => goalId === goalIds[0])!, evidenceProfile: null,
    } }],
  }), /explicitly P-bound batch is missing/u)

  // Technical mandatory-stimulus semantics: optional image scope [] never removes
  // the existing independent required task-material contract.
  const realGoal = normalizeCanonicalLandscape(input.landscape).goals.find(({ id }) => id === goalIds[0])! as unknown as LearningGoal
  const digest = `sha256:${'a'.repeat(64)}`
  const materialUrl = `/assets/task-material/mathematik/technical-stimulus-${'a'.repeat(64)}.svg`
  const materialGoal: LearningGoal = { ...realGoal, resourceLinks: [...(realGoal.resourceLinks ?? []), {
    type: 'task-material', resourceType: 'image', role: 'assessment-stimulus', skillpilotId: realGoal.id,
    title: 'Technical required stimulus', url: materialUrl, lang: 'de', license: 'CC-BY-4.0',
  }] }
  const materialRecord = { ...recordsByGoalId.get(realGoal.id)!,
    goalFingerprint: fingerprintGoalForPositiveEvidence(materialGoal, 'curricularAtomic'),
    reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(materialGoal,
      recordsByGoalId.get(realGoal.id)!.reviewCriteriaFingerprint, { [materialUrl]: digest }, 'curricularAtomic') }
  assert.deepEqual(validateGoalBookEvidenceReviewRecordSemantics(materialRecord, materialGoal,
    { [materialUrl]: digest }, 'curricularAtomic'), [])
  assert.match(validateGoalBookEvidenceReviewRecordSemantics(materialRecord, materialGoal,
    {}, 'curricularAtomic').join(' | '), /required task-material digest is missing/u)
  console.log('Current P import/batch boundary passed: exact 090/d18 owners, retained Book image bindings, explicit image digest, required stimulus, missing/wrapper/prepared-null rejection, historical null/null.')
} finally { await rm(temporary, { recursive: true, force: true }) }
