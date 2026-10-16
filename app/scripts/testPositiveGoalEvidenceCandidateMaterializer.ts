import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { fingerprintSemanticKindSourceGoal, loadGoalBookBuildInputs } from './goalBookModel'
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildPositiveGoalEvidenceCandidateRecords,
  replaceFileAtomically,
} from './materializePositiveGoalEvidenceCandidates'
import type { PositiveGoalEvidenceReviewRecord } from './positiveGoalEvidenceProfileModel'
import {
  reviewPositiveGoalEvidenceConfig,
  type PositiveGoalEvidenceReviewConfig,
} from './positiveGoalEvidenceReview'
import {
  candidateSet,
  criteria,
  expectedRecords,
  goals,
  landscapeId,
} from './fixtures/positiveGoalEvidenceCandidates'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const temporaryParent = join(repositoryRoot, 'tmp')
await mkdir(temporaryParent, { recursive: true })
const temporaryRoot = await mkdtemp(join(temporaryParent, 'positive-evidence-materializer-test-'))
const repositoryRelative = (path: string) => relative(repositoryRoot, path).replaceAll('\\', '/')
const configPath = join(temporaryRoot, 'config.json')
const config: PositiveGoalEvidenceReviewConfig = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
  schemaVersion: 2,
  reviewId: candidateSet.reviewId,
  goalFingerprintRuleVersion: 'goal-evidence-v1',
  profileRuleVersion: 'positive-understanding-evidence-v2',
  landscapeId,
  landscapePath: repositoryRelative(join(temporaryRoot, 'landscape.json')),
  semanticKindLedgerPath: repositoryRelative(join(temporaryRoot, 'semantic-kinds.json')),
  reviewCriteriaPath: repositoryRelative(join(temporaryRoot, 'criteria.md')),
  reviewPath: repositoryRelative(join(temporaryRoot, 'review.jsonl')),
  reviewRunManifestPaths: [],
  reviewedResourceTypes: [],
  requireApproved: false,
  scope: { label: 'Synthetic materializer test scope', goalIds: goals.map(({ id }) => id) },
}
const writeLandscape = (updatedGoals = goals) => writeFile(
  resolve(repositoryRoot, config.landscapePath),
  JSON.stringify({ landscapeId, title: 'Synthetic landscape', locale: 'de-DE', goals: updatedGoals }),
)
const writeRecords = (records: PositiveGoalEvidenceReviewRecord[]) => writeFile(
  resolve(repositoryRoot, config.reviewPath),
  `${records.map((record) => JSON.stringify(record)).join('\n')}\n`,
)
const review = () => reviewPositiveGoalEvidenceConfig(repositoryRelative(configPath))
const build = (candidates = candidateSet) => buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet: candidates })

try {
  await Promise.all([
    writeLandscape(),
    writeFile(resolve(repositoryRoot, config.semanticKindLedgerPath), JSON.stringify({
      sourceLandscapeId: landscapeId,
      decisions: goals.map(({ id }) => ({ goalId: id, semanticKind: 'curricularAtomic', decisionStatus: 'authoritative' })),
    })),
    writeFile(resolve(repositoryRoot, config.reviewCriteriaPath), criteria),
    writeFile(configPath, JSON.stringify(config)),
    writeRecords(expectedRecords),
  ])

  const materialized = await build()
  assert.deepEqual(materialized, expectedRecords)
  assert.deepEqual(await build(), expectedRecords, 'Repeated materialization must be deterministic')
  assert.deepEqual(review().errors, [])

  await assert.rejects(
    build({ ...candidateSet, goals: [...candidateSet.goals].reverse() }),
    /must match the configured scope exactly and in order/u,
  )
  await assert.rejects(
    build({ ...candidateSet, goals: candidateSet.goals.slice(0, 1) }),
    /must match the configured scope exactly and in order/u,
  )
  await assert.rejects(
    build({ ...candidateSet, goals: [candidateSet.goals[0], candidateSet.goals[0]] }),
    /Candidate set repeats goalIds/u,
  )
  await assert.rejects(build({ ...candidateSet, reviewId: 'wrong-review' }), /does not match/u)
  await assert.rejects(build({ ...candidateSet, reviewedAt: 'not-a-date' }), /not a valid date-time/u)
  await assert.rejects(build({ ...candidateSet, reviewer: ' ' }), /reviewer must be non-blank/u)
  const invalidProfile = structuredClone(candidateSet)
  invalidProfile.goals[0].profile.coverageExpectations.minimumIndependentDemonstrations = 1
  await assert.rejects(build(invalidProfile), /minimumIndependentDemonstrations must be an integer from 2 to 8/u)

  // Metadata remains review input even when image-byte review is disabled. This
  // reproduces the historical fixture's image-link drift without reading or
  // rewriting any historical review record or live curriculum resource.
  const changedVisualization = structuredClone(goals)
  const visualization = changedVisualization[0].resourceLinks?.[0]
  assert.ok(visualization)
  visualization.url = '/assets/goal-visualizations/materializer-test/revised.png'
  visualization.altText = 'Zwei gleich große, beschriftete Mengen.'
  const changedDependency = structuredClone(goals)
  changedDependency[1].requires = []
  const changedDescription = structuredClone(goals)
  changedDescription[0].description += ' Sie begründet die Rechnung an einem neuen Beispiel.'

  for (const { changedGoals, changedIndex, semanticChange } of [
    { changedGoals: changedVisualization, changedIndex: 0, semanticChange: false },
    { changedGoals: changedDependency, changedIndex: 1, semanticChange: false },
    { changedGoals: changedDescription, changedIndex: 0, semanticChange: true },
  ]) {
    await writeLandscape(changedGoals)
    await writeRecords(expectedRecords)
    const staleErrors = review().errors
    assert.match(staleErrors.join('\n'), /stale reviewInputFingerprint/u)
    assert.equal(staleErrors.some((error) => error.includes('stale goalFingerprint')), semanticChange)
    const refreshed = await build()
    const prior = expectedRecords[changedIndex]
    const current = refreshed[changedIndex]
    assert.notEqual(current.reviewInputFingerprint, prior.reviewInputFingerprint)
    assert.equal(current.goalFingerprint !== prior.goalFingerprint, semanticChange)
    assert.equal(current.profileFingerprint, prior.profileFingerprint)
    assert.deepEqual(refreshed[1 - changedIndex], expectedRecords[1 - changedIndex])
    await writeRecords(refreshed)
    assert.deepEqual(review().errors, [])
  }

  // Exercise the real producer -> config reader -> native Book path. The Book
  // image is bound even when the producer deliberately leaves image bytes out
  // of P; no image review, curriculum decision, or approval is implied here.
  await writeLandscape()
  await writeRecords(expectedRecords)
  const imageBytes = Buffer.from('synthetic optional visualization')
  const imageDigest = `sha256:${createHash('sha256').update(imageBytes).digest('hex')}`
  const bookConfigPath = join(temporaryRoot, 'book.config.json')
  const bookConfig = {
    schemaVersion: 1, bookId: 'producer-policy-book-fixture', title: 'Synthetic P policy book',
    landscapePath: config.landscapePath,
    compositionViewPath: repositoryRelative(join(temporaryRoot, 'view.json')),
    semanticKindLedgerPath: config.semanticKindLedgerPath,
    goalVisualizationQaPath: repositoryRelative(join(temporaryRoot, 'qa.json')),
    publicationMode: 'review', evidenceReviewPaths: [config.reviewPath],
    evidenceReviewConfigPaths: [repositoryRelative(configPath)],
    outputPath: repositoryRelative(join(temporaryRoot, 'book-model.json')),
  }
  // A unique synthetic fixture URL avoids modifying any pre-existing asset.
  const integrationGoals = structuredClone(goals)
  integrationGoals[0].resourceLinks![0].resourceType = 'image'
  integrationGoals[0].resourceLinks![0].skillpilotId = integrationGoals[0].id
  integrationGoals[0].resourceLinks![0].url = `/assets/goal-visualizations/materializer-test/${process.pid}-${temporaryRoot.split('/').at(-1)}.png`
  const integrationImagePath = resolve(repositoryRoot, `app/public${integrationGoals[0].resourceLinks![0].url}`)
  const integrationImageUrl = integrationGoals[0].resourceLinks![0].url
  const writeFullLedger = () => writeFile(resolve(repositoryRoot, config.semanticKindLedgerPath), JSON.stringify({
    $schema: 'https://skillpilot.com/schemas/curriculum-package/v1/curriculum-ontology-profile.schema.json',
    documentType: 'semantic-kind-ledger', ledgerFormatVersion: 1,
    ledgerId: 'synthetic-kind-fixture', profileId: 'synthetic-kind-fixture', profileVersion: '1.0.0',
    sourceLandscapeId: landscapeId, sourceLandscapePath: config.landscapePath,
    sourceFingerprintContractId: 'semantic-kind-source-fingerprint-v1', reviewMethod: 'one-time-reviewed-pilot-migration-v1',
    counts: { curricularAtomic: 2, curricularArea: 0, practiceAssessment: 0, programStructure: 0, memory: 0, runtimeSupport: 0, orientation: 0, total: 2 },
    decisions: integrationGoals.map((goal) => ({ goalId: goal.id, sourceFingerprint: fingerprintSemanticKindSourceGoal(goal as unknown as Record<string, unknown>), semanticKind: 'curricularAtomic', decisionStatus: 'authoritative', decisionBasis: 'reviewed-current-pilot-curricular-atomic' })),
  }))
  const writeQa = (digest = imageDigest) => writeFile(resolve(repositoryRoot, bookConfig.goalVisualizationQaPath), JSON.stringify({ records: [{
    goalId: goals[0].id, landscapeId, visualizationState: 'available', imageUrl: integrationImageUrl,
    publicAssetPath: `app/public${integrationImageUrl}`, assetSha256: digest,
    humanApproved: 'no', humanIssueIdentified: 'no', aiApproved: 'no', aiApprovedAssetSha256: '', aiReviewedAt: null,
  }] }))
  const loadBook = () => loadGoalBookBuildInputs(repositoryRelative(bookConfigPath))
  try {
    await mkdir(dirname(integrationImagePath), { recursive: true })
    await writeFile(integrationImagePath, imageBytes, { flag: 'wx' })
    await writeLandscape(integrationGoals)
    await writeFullLedger()
    await writeQa()
    await writeFile(resolve(repositoryRoot, bookConfig.compositionViewPath), JSON.stringify({
      viewId: 'producer-policy-fixture', landscapeId, scope: { schoolForm: 'Fixture', stage: 'Fixture' },
      rootNodes: [{ kind: 'structure', id: 'subject', label: 'Synthetic', children: integrationGoals.map(({ id }) => ({ kind: 'goalEntry', goalId: id })) }],
    }))
    await writeFile(bookConfigPath, JSON.stringify(bookConfig))
    const ownerWithoutImage = await build()
    await writeRecords(ownerWithoutImage)
    assert.deepEqual(review().errors, [])
    const withoutImage = (await loadBook()).model
    assert.equal(withoutImage.pages[0].evidenceReview?.reviewInputFingerprint, ownerWithoutImage[0].reviewInputFingerprint)
    assert.equal(withoutImage.pages[0].visualization?.originalDigest, imageDigest)
    assert.deepEqual(withoutImage.source.evidenceReviewSources[0].producerConfig?.reviewedResourceTypes, [])
    assert.equal(withoutImage.source.evidenceReviewSources[0].producerConfig?.digest, `sha256:${createHash('sha256').update(await readFile(configPath)).digest('hex')}`)
    const producerConfigText = await readFile(configPath, 'utf8')
    await writeFile(configPath, `${producerConfigText}\n`)
    const reformattedProducerBook = (await loadBook()).model
    assert.notEqual(reformattedProducerBook.source.evidenceReviewSources[0].producerConfig?.digest, withoutImage.source.evidenceReviewSources[0].producerConfig?.digest)
    assert.notEqual(reformattedProducerBook.digest, withoutImage.digest)
    assert.equal(reformattedProducerBook.pages[0].evidenceReview?.reviewInputFingerprint, ownerWithoutImage[0].reviewInputFingerprint)
    await writeFile(configPath, producerConfigText)
    // Distinct malformed source bytes must fail before JSON interpretation;
    // replacement-character decoding cannot stand in for raw input provenance.
    const marker = 'INVALID_UTF8_MARKER'
    const invalidByteTemplate = JSON.stringify({ ...config, scope: { ...config.scope, label: marker } })
    const [invalidPrefix, invalidSuffix] = invalidByteTemplate.split(marker)
    const rawConfigDigests: string[] = []
    for (const invalidByte of [0xff, 0xfe]) {
      const rawBytes = Buffer.concat([Buffer.from(invalidPrefix), Buffer.from([invalidByte]), Buffer.from(invalidSuffix)])
      rawConfigDigests.push(createHash('sha256').update(rawBytes).digest('hex'))
      await writeFile(configPath, rawBytes)
      await assert.rejects(loadBook(), /producer config .* must contain valid UTF-8 bytes/u)
    }
    assert.notEqual(rawConfigDigests[0], rawConfigDigests[1])
    const validUnicodeBytes = Buffer.from(JSON.stringify({ ...config, scope: { ...config.scope, label: 'Maßstäbe 🧮' } }), 'utf8')
    await writeFile(configPath, validUnicodeBytes)
    const unicodeProducerBook = (await loadBook()).model
    assert.equal(unicodeProducerBook.source.evidenceReviewSources[0].producerConfig?.digest, `sha256:${createHash('sha256').update(validUnicodeBytes).digest('hex')}`)
    assert.equal(unicodeProducerBook.pages[0].evidenceReview?.reviewInputFingerprint, ownerWithoutImage[0].reviewInputFingerprint)
    await writeFile(configPath, producerConfigText)
    // No explicit producer retains the historical image-bound Book behavior.
    await writeFile(bookConfigPath, JSON.stringify({ ...bookConfig, evidenceReviewConfigPaths: undefined }))
    await assert.rejects(loadBook(), /stale reviewInputFingerprint/u)
    await writeFile(bookConfigPath, JSON.stringify(bookConfig))
    // Optional image changes are page changes, not changes to an [] owner's P.
    const changedImage = Buffer.from('changed synthetic optional visualization')
    const changedImageDigest = `sha256:${createHash('sha256').update(changedImage).digest('hex')}`
    await writeFile(integrationImagePath, changedImage)
    await writeQa(changedImageDigest)
    const changedImageBook = (await loadBook()).model
    assert.notEqual(changedImageBook.pages[0].pageFingerprint, withoutImage.pages[0].pageFingerprint)
    assert.equal(changedImageBook.pages[0].evidenceReview?.reviewInputFingerprint, ownerWithoutImage[0].reviewInputFingerprint)
    const originalAltText = integrationGoals[0].resourceLinks![0].altText
    integrationGoals[0].resourceLinks![0].altText = 'Changed image metadata remains P input even under []'
    await writeLandscape(integrationGoals)
    await assert.rejects(loadBook(), /stale reviewInputFingerprint/u)
    integrationGoals[0].resourceLinks![0].altText = originalAltText
    await writeLandscape(integrationGoals)
    config.reviewedResourceTypes = ['goal-visualization']
    await writeFile(configPath, JSON.stringify(config))
    await assert.rejects(loadBook(), /stale reviewInputFingerprint/u)
    const ownerWithImage = await build()
    assert.notEqual(ownerWithImage[0].reviewInputFingerprint, ownerWithoutImage[0].reviewInputFingerprint)
    await writeRecords(ownerWithImage)
    assert.deepEqual(review().errors, [])
    assert.equal((await loadBook()).model.pages[0].evidenceReview?.reviewInputFingerprint, ownerWithImage[0].reviewInputFingerprint)
    const secondaryUrl = integrationImageUrl.replace('.png', '-secondary.png')
    const secondaryPath = resolve(repositoryRoot, `app/public${secondaryUrl}`)
    try {
      await writeFile(secondaryPath, 'second synthetic visualization', { flag: 'wx' })
      integrationGoals[0].resourceLinks!.push({ type: 'goal-visualization', resourceType: 'image', role: 'secondary', url: secondaryUrl, title: 'Synthetic secondary image' })
      await writeLandscape(integrationGoals)
      const bothImages = await build()
      await writeRecords(bothImages)
      assert.equal((await loadBook()).model.pages[0].evidenceReview?.reviewInputFingerprint, bothImages[0].reviewInputFingerprint)
      await writeFile(secondaryPath, 'changed second synthetic visualization')
      await assert.rejects(loadBook(), /stale reviewInputFingerprint/u)
      await rm(secondaryPath)
      await assert.rejects(loadBook(), /ENOENT/u)
    } finally {
      await rm(secondaryPath, { force: true })
      integrationGoals[0].resourceLinks = integrationGoals[0].resourceLinks!.filter(({ url }) => url !== secondaryUrl)
      await writeLandscape(integrationGoals)
      await writeRecords(ownerWithImage)
    }
    // Ambiguous, missing and wrong-owner selection cannot weaken another P.
    const secondConfigPath = join(temporaryRoot, 'second.config.json')
    await writeFile(secondConfigPath, JSON.stringify(config))
    await writeFile(bookConfigPath, JSON.stringify({ ...bookConfig, evidenceReviewConfigPaths: [repositoryRelative(configPath), repositoryRelative(secondConfigPath)] }))
    await assert.rejects(loadBook(), /ambiguous producer configs/u)
    await writeFile(bookConfigPath, JSON.stringify({ ...bookConfig, evidenceReviewConfigPaths: [repositoryRelative(configPath), repositoryRelative(configPath)] }))
    await assert.rejects(loadBook(), /duplicate/u)
    await writeFile(bookConfigPath, JSON.stringify({ ...bookConfig, evidenceReviewConfigPaths: [repositoryRelative(join(temporaryRoot, 'missing.json'))] }))
    await assert.rejects(loadBook(), /ENOENT/u)
    await writeFile(bookConfigPath, JSON.stringify(bookConfig))
    for (const wrong of [
      { ...config, reviewId: 'another-owner' },
      { ...config, reviewPath: repositoryRelative(join(temporaryRoot, 'other.jsonl')) },
      { ...config, landscapeId: 'other-landscape' },
      { ...config, scope: { ...config.scope, goalIds: [...config.scope.goalIds].reverse() } },
      { ...config, reviewedResourceTypes: [] },
      { ...config, requireApproved: true },
      { ...config, schemaVersion: 1 },
    ]) {
      await writeFile(configPath, JSON.stringify(wrong))
      await assert.rejects(loadBook(), /owner|own|scope|schema|stale reviewInputFingerprint/u)
    }
    await writeFile(configPath, JSON.stringify(config))
    // Required SVG material stays mandatory under [] in both reviewed subject lanes.
    for (const materialSubject of ['mathematik', 'physik']) {
    const stimulusBytes = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg"><text>${temporaryRoot}</text></svg>`)
    const stimulusHash = createHash('sha256').update(stimulusBytes).digest('hex')
    const stimulusName = `producer-policy-fixture-${stimulusHash}.svg`
    const stimulusUrl = `/assets/task-material/${materialSubject}/${stimulusName}`
    const stimulusPublic = resolve(repositoryRoot, `app/public${stimulusUrl}`)
    const stimulusSource = resolve(repositoryRoot, `curricula/DE/Gymnasium/task-material/${materialSubject}/${stimulusName}`)
    try {
      for (const path of [stimulusPublic, stimulusSource]) {
        await mkdir(dirname(path), { recursive: true })
        await writeFile(path, stimulusBytes, { flag: 'wx' })
      }
      integrationGoals[0].resourceLinks!.push({ type: 'task-material', resourceType: 'image', role: 'assessment-stimulus', skillpilotId: integrationGoals[0].id, title: 'Synthetic required stimulus', url: stimulusUrl, lang: 'de', license: 'CC-BY-4.0' })
      await writeLandscape(integrationGoals)
      await writeFullLedger()
      config.reviewedResourceTypes = []
      await writeFile(configPath, JSON.stringify(config))
      const requiredStimulusRecords = await build()
      await writeRecords(requiredStimulusRecords)
      assert.deepEqual(review().errors, [])
      assert.equal((await loadBook()).model.pages[0].evidenceReview?.reviewInputFingerprint, requiredStimulusRecords[0].reviewInputFingerprint)
      assert.notEqual(requiredStimulusRecords[0].reviewInputFingerprint, ownerWithoutImage[0].reviewInputFingerprint)
      for (const path of [stimulusPublic, stimulusSource]) {
        for (const mutation of ['missing', 'changed']) {
          try {
            if (mutation === 'missing') await rm(path)
            else await writeFile(path, '<svg xmlns="http://www.w3.org/2000/svg">changed</svg>')
            await assert.rejects(build(), /task-material|ENOENT/u)
            assert.match(review().errors.join('\n'), /task-material|ENOENT/u)
            await assert.rejects(loadBook(), /task-material|ENOENT/u)
          } finally {
            await writeFile(path, stimulusBytes)
          }
        }
      }
    } finally {
      await Promise.all([stimulusPublic, stimulusSource].map((path) => rm(path, { force: true })))
      integrationGoals[0].resourceLinks = integrationGoals[0].resourceLinks!.filter(({ type }) => type !== 'task-material')
      await writeLandscape(integrationGoals)
      await writeFullLedger()
      config.reviewedResourceTypes = ['goal-visualization']
      await writeFile(configPath, JSON.stringify(config))
      await writeRecords(ownerWithImage)
    }
    }
    await rm(integrationImagePath)
    await assert.rejects(loadBook(), /ENOENT/u)
  } finally {
    await rm(integrationImagePath, { force: true })
    config.reviewedResourceTypes = []
    await writeFile(configPath, JSON.stringify(config))
    await writeLandscape()
    await writeFile(resolve(repositoryRoot, config.semanticKindLedgerPath), JSON.stringify({ sourceLandscapeId: landscapeId, decisions: goals.map(({ id }) => ({ goalId: id, semanticKind: 'curricularAtomic', decisionStatus: 'authoritative' })) }))
  }

  await writeLandscape()
  await writeRecords(expectedRecords)
  await writeFile(resolve(repositoryRoot, config.reviewCriteriaPath), `${criteria}\nRevised test criterion.\n`)
  assert.match(review().errors.join('\n'), /reviewCriteriaFingerprint does not match/u)
  const newCriteriaRecords = await build()
  assert.notEqual(newCriteriaRecords[0].reviewCriteriaFingerprint, expectedRecords[0].reviewCriteriaFingerprint)
  assert.notEqual(newCriteriaRecords[0].reviewInputFingerprint, expectedRecords[0].reviewInputFingerprint)
  assert.equal(newCriteriaRecords[0].goalFingerprint, expectedRecords[0].goalFingerprint)
  await writeRecords(newCriteriaRecords)
  assert.deepEqual(review().errors, [])

  await writeFile(resolve(repositoryRoot, config.reviewCriteriaPath), criteria)
  const tamperedProfile = structuredClone(expectedRecords)
  tamperedProfile[0].profile.applicationCaseBriefs[0].expectedPerformanceDe = 'Eine andere Testantwort.'
  await writeRecords(tamperedProfile)
  assert.match(review().errors.join('\n'), /profileFingerprint does not match/u)
  await writeRecords(expectedRecords)
  assert.deepEqual(await build(), expectedRecords)
  assert.deepEqual(review().errors, [])
} finally {
  await rm(temporaryRoot, { recursive: true, force: true })
}

const atomicWriteDirectory = await mkdtemp(join(tmpdir(), 'skillpilot-positive-evidence-atomic-'))
try {
  const targetPath = join(atomicWriteDirectory, 'review.jsonl')
  const expectedBytes = Buffer.from('{"goalId":"new"}\n')
  await writeFile(targetPath, '{"goalId":"old"}\n')
  await replaceFileAtomically(targetPath, expectedBytes)
  assert.deepEqual(await readFile(targetPath), expectedBytes)
  assert.deepEqual(await readdir(atomicWriteDirectory), ['review.jsonl'])
} finally {
  await rm(atomicWriteDirectory, { recursive: true, force: true })
}

const targetPath = '/repository/review.jsonl'
const oldTargetBytes = Buffer.from('{"goalId":"old"}\n')
const replacementBytes = Buffer.from('{"goalId":"new"}\n')
let targetBytes: Buffer = oldTargetBytes
let temporaryPath = ''
const temporaryFiles = new Map<string, Buffer>()
const operationOrder: string[] = []
await replaceFileAtomically(targetPath, replacementBytes, {
  writeFile: async (path, bytes, options) => {
    assert.notEqual(path, targetPath)
    assert.equal(dirname(path), dirname(targetPath))
    assert.equal(options.flag, 'wx')
    assert.deepEqual(targetBytes, oldTargetBytes)
    temporaryPath = path
    temporaryFiles.set(path, Buffer.from(bytes))
    operationOrder.push('write-temp')
  },
  rename: async (sourcePath, destinationPath) => {
    assert.equal(sourcePath, temporaryPath)
    assert.equal(destinationPath, targetPath)
    assert.deepEqual(targetBytes, oldTargetBytes)
    targetBytes = temporaryFiles.get(sourcePath) ?? Buffer.alloc(0)
    temporaryFiles.delete(sourcePath)
    operationOrder.push('rename')
  },
  rm: async () => {
    assert.fail('Successful atomic replacement must not need cleanup')
  },
})
assert.deepEqual(operationOrder, ['write-temp', 'rename'])
assert.deepEqual(targetBytes, replacementBytes)
assert.equal(temporaryFiles.size, 0)

const renameFailure = new Error('simulated rename failure')
targetBytes = oldTargetBytes
temporaryPath = ''
await assert.rejects(
  replaceFileAtomically(targetPath, replacementBytes, {
    writeFile: async (path, bytes) => {
      temporaryPath = path
      temporaryFiles.set(path, Buffer.from(bytes))
    },
    rename: async () => {
      throw renameFailure
    },
    rm: async (path, options) => {
      assert.equal(path, temporaryPath)
      assert.equal(options.force, true)
      temporaryFiles.delete(path)
    },
  }),
  (error) => error === renameFailure,
)
assert.deepEqual(targetBytes, oldTargetBytes)
assert.equal(temporaryFiles.size, 0)

const writeFailure = new Error('simulated partial temporary write failure')
temporaryPath = ''
await assert.rejects(
  replaceFileAtomically(targetPath, replacementBytes, {
    writeFile: async (path, bytes) => {
      temporaryPath = path
      temporaryFiles.set(path, Buffer.from(bytes.subarray(0, 4)))
      throw writeFailure
    },
    rename: async () => {
      assert.fail('A failed temporary write must never be renamed')
    },
    rm: async (path, options) => {
      assert.equal(path, temporaryPath)
      assert.equal(options.force, true)
      temporaryFiles.delete(path)
    },
  }),
  (error) => error === writeFailure,
)
assert.deepEqual(targetBytes, oldTargetBytes)
assert.equal(temporaryFiles.size, 0)

console.log(`Positive understanding-evidence candidate materializer self-test passed: ${expectedRecords.length} synthetic profile(s), producer/config-reader/native-Book policy, strict raw UTF-8 binding and required-SVG regressions, freshness and atomic-write checks.`)
