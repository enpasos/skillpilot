import { createHash } from 'node:crypto'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from '../../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../../app/scripts/positiveGoalEvidenceReview'
import {
  validateGoalDescriptionReviewCampaign,
} from '../../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import { validateGoalDescriptionReviewCampaignResultDirectories } from '../../../../../../../../app/scripts/validateGoalDescriptionReviewCampaignResults'
import { isGoalVisualizationAiApproved } from '../../../../../../../../app/scripts/goalVisualizationQaModel'

const root = process.cwd()
const own = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = resolve(own, '../chemie-acid-analytics-ten-current419-successor-fresh-independent-a-20261015-v1')
const native = resolve(own, '../chemie-acid-analytics-ten-current419-native-preparation-technical-20261015-v1')
const author = resolve(own, '../chemie-acid-analytics-ten-current419-bounded-author-remediation-20261015-v1')
const json = async (path: string) => JSON.parse(await readFile(path, 'utf8'))
const rel = (path: string) => relative(root, path).replaceAll('\\', '/')
const sha = (data: Buffer | string) => `sha256:${createHash('sha256').update(data).digest('hex')}`
const save = async (name: string, value: unknown) => {
  const path = resolve(own, name)
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`)
}
const saveJsonl = async (name: string, rows: unknown[]) => {
  const path = resolve(own, name)
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${rows.map(row => JSON.stringify(row)).join('\n')}\n`)
}

async function main() {
  const first = await json(resolve(source, 'FIRST.independent-scientific-result.json'))
  const raw = await json(resolve(author, 'author-profiles.ten.raw.json'))
  const profiles = new Map(raw.profiles.map((row: any) => [row.goalId, row.profile]))
  const round = resolve(own, 'native/round-a')
  const campaign = await json(resolve(round, 'description-review-campaign.json'))
  const input = await json(resolve(round, 'description-review-input.json'))
  const bundle = await json(resolve(round, 'review-bundle-manifest.json'))
  const originalCampaign = await readFile(resolve(native, 'native-ten-current/round-a/description-review-campaign.json'))
  if (!(await readFile(resolve(round, 'description-review-campaign.json'))).equals(originalCampaign)) {
    throw Error('Owned copied native A campaign differs from frozen original.')
  }
  const campaignValidation = await validateGoalDescriptionReviewCampaign({ bundle, input, campaign })
  if (campaignValidation.errors.length) throw Error(campaignValidation.errors.join('\n'))
  const inputs = new Map(input.goals.map((row: any) => [row.goalId, row]))
  // These IDs label unbound technical transport rows. They do not assert an
  // original reviewer run identity or refer to an executed new scientific run.
  const transportId = 'technical-unbound-transport-of-original-A-FIRST-20261015-v1'
  const records = first.rows.map((scientific: any, index: number) => {
    const current: any = inputs.get(scientific.goalId)
    const profile: any = profiles.get(scientific.goalId)
    const evidence = Object.fromEntries(
      ['essentialUnderstanding', 'observablePerformance'].flatMap(field =>
        ['De', 'En'].map(lang => [`${field}${lang}`,
          profile.expectations.map((expectation: any) => expectation[`${field}${lang}`]).join('\n\n')]),
      ),
    )
    for (const lang of ['De', 'En']) {
      evidence[`transferExpectation${lang}`] = profile.variationAxes.map((axis: any) => axis[`text${lang}`]).join('\n\n')
    }
    return {
      $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
      schemaVersion: 1,
      recordId: `original-A-science-technical-D-${String(index + 1).padStart(2, '0')}`,
      runId: transportId,
      campaignId: campaign.campaignId,
      roundId: campaign.roundId,
      bundleFingerprint: bundle.bundleFingerprint,
      bookDigest: bundle.bookModelDigest,
      goalId: current.goalId,
      goalFingerprint: current.goalFingerprint,
      pageFingerprint: current.pageFingerprint,
      currentTitleDe: current.currentTitleDe,
      currentTitleEn: current.currentTitleEn,
      currentDescriptionDe: current.currentDescriptionDe,
      currentDescriptionEn: current.currentDescriptionEn,
      decision: scientific.D,
      understandingEvidence: evidence,
      rationale: scientific.rationaleDe,
      evidenceProfileContract: 'positive-understanding-evidence-v2',
      evidenceProfileRecommendation: 'create',
      recordStatus: 'candidate',
      reviewAuthority: 'ai_candidate',
    }
  })
  const ajv = new Ajv2020({ allErrors: true, strict: true })
  addFormats(ajv)
  const recordSchemaPath = resolve(root, 'contracts/goal-description-review/v1/goal-description-review-record.schema.json')
  const validateRecord = ajv.compile(await json(recordSchemaPath))
  for (const record of records) {
    if (!validateRecord(record)) throw Error(ajv.errorsText(validateRecord.errors))
    const exact: any = first.rows.find((row: any) => row.goalId === record.goalId)
    if (record.decision !== exact.D || record.rationale !== exact.rationaleDe) throw Error('Original A decision/rationale changed.')
  }
  await saveJsonl('D/D10.original-A-native-shaped-UNBOUND.records.jsonl', records)
  await save('checks/CHECK.D10.schema-current-text-and-original-science.actual.json', {
    schemaVersion: 1, passed: true, records: records.length,
    schemaPath: rel(recordSchemaPath), schemaSha256: sha(await readFile(recordSchemaPath)),
    stockCampaignValidationErrors: campaignValidation.errors,
    originalDecisionsAndRationalesUnchanged: true,
    originalNativeGoalPageFingerprintsUnchanged: true,
    source: rel(resolve(source, 'FIRST.independent-scientific-result.json')),
    noIndependentRunBindingCreated: true,
    runIdIsOnlyUnboundTechnicalTransportIdentifier: transportId,
    selectableIndependentRoundResults: 0,
  })

  const pConfigPath = resolve(own, 'config/P10.normal-E1G1-ai-candidate.inactive.config.json')
  const pConfig = await json(pConfigPath)
  const candidates = await json(resolve(own, 'P/P10.sealed-A-warranted-candidate-set.json'))
  const pRecords = await buildPositiveGoalEvidenceCandidateRecords({ config: pConfig, candidateSet: candidates })
  await saveJsonl('P/P10.E1G1.design-only.ai-candidate.records.jsonl', pRecords)
  const pValidation = reviewPositiveGoalEvidenceConfig(rel(pConfigPath))
  if (pValidation.errors.length) throw Error(pValidation.errors.join('\n'))
  for (const record of pRecords) {
    if (record.evidenceLevel !== 'E1' || record.maximumClaimScope !== 'G1' || record.status !== 'needs_human_review' || record.reviewAuthority !== 'ai_candidate' || record.reviewRunIds.length !== 0) throw Error('P exceeds original A design-only warrant.')
    if (JSON.stringify(record.profile) !== JSON.stringify(profiles.get(record.goalId))) throw Error('Raw profile scientifically edited during technical serialization.')
  }
  await save('checks/CHECK.P10.production-materializer-and-normal-review.actual.json', {
    schemaVersion: 1, passed: true, configPath: rel(pConfigPath),
    productionFunctions: ['buildPositiveGoalEvidenceCandidateRecords', 'reviewPositiveGoalEvidenceConfig'],
    records: pRecords.length, counts: pValidation.counts, errors: pValidation.errors,
    allProfilesExactOriginalAReviewedRawProfiles: true,
    evidenceLevel: 'E1', maximumClaimScope: 'G1', reviewAuthority: 'ai_candidate',
    status: 'needs_human_review', newIndependentReviewRuns: 0,
    originalScientificWarrant: rel(resolve(source, 'FIRST.independent-scientific-result.json')),
    actualLearnerOrLaboratoryExecutions: 0, humanApproval: false,
  })
  const reuse = await json(resolve(own, 'reuse/current-ten-M-V-and-HH.exact.json'))
  const originalReuseBytes = await readFile(resolve(native, 'inputs/current-ten-M-V-whole-records-and-HH-card.exact-reuse.json'))
  if (!(await readFile(resolve(own, 'reuse/current-ten-M-V-and-HH.exact.json'))).equals(originalReuseBytes)) throw Error('Existing M/V/HH reuse changed.')
  const mSourceBytes = await readFile(resolve(root, reuse.currentWholeMContainer.path))
  if (sha(mSourceBytes) !== reuse.currentWholeMContainer.sha256) throw Error('Original M source container changed.')
  const mSource = new Map(mSourceBytes.toString().trim().split('\n').map(line => { const row = JSON.parse(line); return [row.goalId, row] }))
  const vSourceBytes = await readFile(resolve(root, reuse.currentWholeQAContainer.path))
  if (sha(vSourceBytes) !== reuse.currentWholeQAContainer.sha256) throw Error('Original V source container changed.')
  const qa = JSON.parse(vSourceBytes.toString())
  const vRows = Array.isArray(qa) ? qa : (qa.records ?? qa.goals ?? qa.entries)
  if (!Array.isArray(vRows)) throw Error('Unrecognized original V container shape.')
  const vSource = new Map(vRows.map((row: any) => [row.goalId, row]))
  const mvChecks = []
  for (const row of reuse.rows) {
    if (JSON.stringify(row.existingWholeMRecord) !== JSON.stringify(mSource.get(row.goalId))) throw Error(`M record altered: ${row.goalId}`)
    if (JSON.stringify(row.existingWholeVRecord) !== JSON.stringify(vSource.get(row.goalId))) throw Error(`V record altered: ${row.goalId}`)
    if (row.existingWholeMRecord.fingerprint !== row.expectedCurrentMemoryFingerprint) throw Error(`M no longer current: ${row.goalId}`)
    if (!isGoalVisualizationAiApproved(row.existingWholeVRecord)) throw Error(`V existing machine approval invalid: ${row.goalId}`)
    const v = row.existingWholeVRecord
    const assetHash = sha(await readFile(resolve(root, v.canonicalAssetPath)))
    if (assetHash !== v.assetSha256 || assetHash !== v.aiApprovedAssetSha256) throw Error(`V canonical image changed: ${row.goalId}`)
    if (sha(await readFile(resolve(root, v.publicAssetPath))) !== assetHash) throw Error(`V public image changed: ${row.goalId}`)
    mvChecks.push({ goalId: row.goalId, existingMExact: true, existingMCurrentUnderUnchangedWholeGoal: true,
      existingVExact: true, productionVApprovalPredicate: true, exactCanonicalAndPublicAssetSha256: assetHash, newVotes: 0 })
  }
  const hh = reuse.HHUnchangedKeptCardBindingFromFrozenAuthor
  const deckBytes = await readFile(resolve(root, hh.wholeDeck.path))
  if (sha(deckBytes) !== hh.wholeDeck.sha256) throw Error('Original HH deck changed.')
  const deck = JSON.parse(deckBytes.toString())
  const cards = Array.isArray(deck) ? deck : deck.cards
  if (JSON.stringify(cards.find((card: any) => card.id === hh.card.id)) !== JSON.stringify(hh.card)) throw Error('HH card changed.')
  const cardReviewBytes = await readFile(resolve(root, reuse.currentWholeCardContainer.path))
  if (sha(cardReviewBytes) !== reuse.currentWholeCardContainer.sha256) throw Error('HH card review source changed.')
  const cardReview = cardReviewBytes.toString().trim().split('\n').map(line => JSON.parse(line))
    .find((row: any) => row.cardId === hh.card.id)
  if (!cardReview || cardReview.status !== 'kept' || cardReview.necessary !== true || cardReview.fingerprint !== hh.currentExistingCardFingerprint) throw Error('HH exact kept-card binding no longer valid.')
  await save('checks/CHECK.M10-V10-HH-existing-exact-reuse.actual.json', {
    schemaVersion: 1, passed: true, rows: mvChecks,
    exactMRows: mvChecks.length, exactVRows: mvChecks.length,
    currentWholeGoalsUnchangedAndOriginalMChecksRetained: true,
    productionVisualizationFunction: 'isGoalVisualizationAiApproved',
    HH: { cardId: hh.card.id, exactWholeDeck: true, exactWholeCard: true, currentKeptCardBinding: true,
      originalVisibilityConfigPreserved: hh.visibilityConfigIsPreservedWithoutNewVote, newVote: false },
    newMOrVOrCardVotes: 0,
  })
  // The honest expected result is an unbound D hold. The copied native round
  // remains untouched and has no fabricated run or independent results.
  const directoryValidation = await validateGoalDescriptionReviewCampaignResultDirectories({
    bundle, input, campaign,
    batchesDirectory: resolve(round, 'batches'),
    resultsDirectory: resolve(round, 'results'),
  })
  if (!directoryValidation.errors.length) throw Error('Expected missing original independent reviewer run hold disappeared.')
  await save('checks/CHECK.D.native-independent-round-EXPECTED-TECHNICAL-HOLD.actual.json', {
    schemaVersion: 1, status: 'expected-technical-hold',
    normalValidator: 'validateGoalDescriptionReviewCampaignResultDirectories',
    campaignPath: rel(resolve(round, 'description-review-campaign.json')),
    errors: directoryValidation.errors,
    selectableIndependentRoundResults: directoryValidation.records.length,
    scientificRowsPreserved: records.length,
    scientificCountsVerbatim: first.counts,
    missingOriginalReviewerRun: {
      originalReviewerRunManifest: true,
      actualProviderAndExactModelIdentity: true,
      originalRunIdAndGenerationParameters: true,
      actualOriginalRunStartAndCompletionTimes: true,
      exactNativeOutputDigestAndReviewerInputArtifactBindings: true,
    },
    originalFIRSTScienceIsNotRevoked: true,
    synthesizerCanSupplyIndependentRoundAuthority: false,
    contractEvidence: [
      'app/scripts/validateGoalDescriptionReviewCampaign.ts:781 independent campaigns require run.blindToOtherRuns=true',
      'app/scripts/validateGoalDescriptionReviewDualRound.ts:182-186 rejects synthesizer campaigns and requires independent campaign blindness',
      'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json requires original provider/model/run/time/output/parameter metadata',
    ],
    requiredFollowup: 'Recover genuine original native reviewer-run evidence if it exists; otherwise arrange an actual independently executed native round under repository review rules. Do not relabel this serializer as independent.',
  })
  const provenancePath = resolve(own, 'provenance/ORIGINAL-A.provenance-and-field-serialization.json')
  const provenance = await json(provenancePath)
  provenance.nativeDescriptionRunManifest = null
  provenance.nativeDescriptionRunHold = 'Original FIRST has no reviewer run manifest. The native independent campaign requires a bound independent run; a technical synthesizer is not an independent round under validateGoalDescriptionReviewDualRound.ts. No provider/model/run identity or blindness flag is invented.'
  await save('provenance/ORIGINAL-A.provenance-and-field-serialization.json', provenance)
  console.log(JSON.stringify({ DNativeShape: records.length, DIndependentNativeAuthority: 0, P: pRecords.length, PCounts: pValidation.counts, newScientificVotes: 0, expectedDHoldErrors: directoryValidation.errors.length }))
}

void main()
