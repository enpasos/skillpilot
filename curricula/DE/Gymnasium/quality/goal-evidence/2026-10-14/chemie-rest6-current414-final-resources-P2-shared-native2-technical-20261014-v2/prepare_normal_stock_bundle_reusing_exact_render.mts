// SPDX-License-Identifier: Apache-2.0
// Normal unchanged bundle/campaign APIs; exact immutable render bytes are reused.
import { createHash } from 'node:crypto'
import { readFile, writeFile, mkdir, link } from 'node:fs/promises'
import { resolve, dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
const prefix = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/'
const old = `${prefix}chemie-rest6-current414-final-resources-P2-shared-native2-technical-20261014-v1/`
const out = `${prefix}chemie-rest6-current414-final-resources-P2-shared-native2-technical-20261014-v2/`
const cfgPath = `${out}configs/native-two.shared-first-pass.batch.config.json`
const moduleFrom = (p: string) => import(pathToFileURL(resolve(`app/scripts/${p}`)).href)
const { loadGoalBookBuildInputs, parseAndValidateGoalBookModel, stableGoalBookJson } = await moduleFrom('goalBookModel.ts')
const { buildGoalDescriptionRolloutSubsetModel } = await moduleFrom('materializeGoalDescriptionRolloutBatch.ts')
const { buildGoalBookReviewBundle } = await moduleFrom('exportGoalBookReviewBundle.ts')
const { createGoalDescriptionReviewCampaignArtifacts } = await moduleFrom('createGoalDescriptionReviewCampaign.ts')
const { fingerprintGoalDescriptionReviewCampaign } = await moduleFrom('validateGoalDescriptionDualRoundResolution.ts')
const sha = (b: Uint8Array | string) => `sha256:${createHash('sha256').update(b).digest('hex')}`
const json = async (p: string) => JSON.parse(await readFile(p, 'utf8'))
const bytes = (x: unknown) => Buffer.from(JSON.stringify(x, null, 2) + '\n')
const cfgBytes = await readFile(cfgPath)
const cfg = JSON.parse(cfgBytes.toString())
const base = await loadGoalBookBuildInputs(cfg.baseGoalBookConfigPath)
const currentSubset = buildGoalDescriptionRolloutSubsetModel({ baseModel: base.model, goalIds: cfg.goalIds, bookId: cfg.bookId, title: cfg.title })
const sourceBundle = `${old}native-two/bundle/`
const exactOldModel = parseAndValidateGoalBookModel(await json(`${sourceBundle}book-model.json`))
if (stableGoalBookJson(currentSubset) !== stableGoalBookJson(exactOldModel)) throw new Error('Substantive model delta; reuse forbidden')
const ledger = await json(base.config.semanticKindLedgerPath)
const atomicIds = ledger.decisions.filter((d: any) => d.semanticKind === 'curricularAtomic' && d.decisionStatus === 'authoritative').map((d: any) => d.goalId)
if (atomicIds.length !== 414 || new Set(atomicIds).size !== 414 || base.model.pages.length !== 414 || base.model.pages.some((p: any) => !atomicIds.includes(p.goalId))) throw new Error('Full atomic base mismatch')
const target = cfg.outputDirectory
const bundleDirectory = `${target}/bundle`
const built = await buildGoalBookReviewBundle(currentSubset, {
  modelPath: `${sourceBundle}book-model.json`, htmlPath: `${sourceBundle}book.html`,
  htmlRenderManifestPath: `${sourceBundle}book.html.render-manifest.json`,
  pdfPath: `${sourceBundle}book.pdf`, pdfRenderManifestPath: `${sourceBundle}book.pdf.render-manifest.json`,
  outputDirectory: resolve(bundleDirectory), promptPath: resolve(cfg.promptPath), criteriaPath: resolve(cfg.criteriaPath), goalIds: [],
})
await mkdir(bundleDirectory, { recursive: true })
const reused: unknown[] = []
for (const file of built.files) {
  const destination = join(bundleDirectory, file.relativePath)
  await mkdir(dirname(destination), { recursive: true })
  let original: Buffer | undefined
  try { original = await readFile(`${sourceBundle}${file.relativePath}`) } catch {}
  if (original && sha(original) === sha(file.content)) {
    await link(`${sourceBundle}${file.relativePath}`, destination)
    reused.push({ path: file.relativePath, sha256: sha(original), immutableOriginalRenderOrArtifact: true })
  } else await writeFile(destination, file.content, { flag: 'wx' })
}
const bundleBytes = bytes(built.manifest)
await writeFile(`${bundleDirectory}/manifest.json`, bundleBytes, { flag: 'wx' })
const modelBytes = await readFile(`${bundleDirectory}/book-model.json`)
const inputBytes = await readFile(`${bundleDirectory}/review-input.json`)
const makeRound = (suffix: string) => createGoalDescriptionReviewCampaignArtifacts({
  bundleBytes, bookModelBytes: modelBytes, reviewInputBytes: inputBytes,
  bundleDirectory: resolve(bundleDirectory), outputDirectory: resolve(`${target}/round-${suffix}`),
  campaignOptions: { campaignId: `${cfg.batchId}-${suffix}`, roundId: `${cfg.batchId}-first-pass-${suffix}`,
    reviewerRole: 'internal_ai_reviewer', reviewPass: 'first_pass', independenceGroupId: `${cfg.batchId}-independent-${suffix}`,
    blindToOtherReviews: true, batchSize: 20 },
})
const [a, b] = await Promise.all([makeRound('a'), makeRound('b')])
for (const p of [`${target}/round-a/results`, `${target}/round-b/results`, `${target}/resolutions`]) await mkdir(p, { recursive: true })
const round = (directory: string, c: any) => ({ directory, campaignId: c.campaignId,
  campaignDigest: fingerprintGoalDescriptionReviewCampaign(c), roundId: c.roundId,
  independenceGroupId: c.independenceGroupId, batchId: c.batches[0].batchId,
  batchInputFingerprint: c.batches[0].batchInputFingerprint })
const manifest = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-manifest.schema.json',
  schemaVersion: 1, validationContract: 'goal-description-rollout-batch-v1', batchId: cfg.batchId,
  subject: cfg.subject, subjectLabel: cfg.subjectLabel, configPath: cfgPath, configDigest: sha(cfgBytes), goalIds: cfg.goalIds,
  curriculumAtomicDenominatorAtPreparation: atomicIds.length,
  source: { baseGoalBookConfigPath: cfg.baseGoalBookConfigPath, landscapePath: base.config.landscapePath,
    landscapeId: currentSubset.book.landscapeId, baseBookDigest: base.model.digest },
  artifacts: { bundleDirectory: 'bundle', bookModelPath: 'bundle/book-model.json', bookModelDigest: currentSubset.digest,
    bundleManifestPath: 'bundle/manifest.json', bundleFingerprint: built.manifest.bundleFingerprint,
    reviewInputFingerprint: a.input.reviewInputFingerprint, rounds: { first: round('round-a', a.campaign), second: round('round-b', b.campaign) } },
  reviewPolicy: { oneBatchPerRound: true, blindIndependentFirstPass: true, aiRecordsAreCandidatesOnly: true, automaticAcceptance: false },
}
await writeFile(`${target}/batch-manifest.json`, bytes(manifest), { flag: 'wx' })
await writeFile(`${out}STOCK.API-prepare-reused-exact-render-normal-new-bundle-and-campaigns.actual.json`, bytes({
  schemaVersion: 1, completedAtUTC: new Date().toISOString(), status: 'prepared, normal batch check follows',
  preparationMethod: 'Unmodified loadGoalBookBuildInputs + buildGoalDescriptionRolloutSubsetModel + buildGoalBookReviewBundle + createGoalDescriptionReviewCampaignArtifacts. Batch manifest uses the unchanged normal contract; ordinary stock check validates it next.',
  sourceModelActuallyComparedToCurrentSubset: true, oldRenderBytesReused: reused,
  PDFRerenderOrImageOrGoalOrProfileOrCaseChanges: 0, newCurrentBundleFingerprint: built.manifest.bundleFingerprint,
  originalV1ScientificRecordsRenamedOrRebound: 0, newScientificVotes: 0,
}))
console.log(JSON.stringify({ status: 'prepared', currentModelDigest: currentSubset.digest, currentBundleFingerprint: built.manifest.bundleFingerprint, hardlinkedUnchangedArtifacts: reused.length, goals: 2, atomicBase: 414 }))
