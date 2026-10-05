import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { buildGoalDescriptionReviewCampaign, serializeGoalDescriptionReviewBatchInput, fingerprintGoalDescriptionReviewRecordSchema, validateGoalDescriptionReviewBatch } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-eleven-current-source-description-candidate-v1'
const read = (name: string) => JSON.parse(readFileSync(`${own}/${name}`, 'utf8'))
const write = (name: string, o: unknown) => writeFileSync(`${own}/${name}`, `${JSON.stringify(o, null, 2)}\n`)
async function main() {
 const prepared = read('input-receipt.json'); const bundle = JSON.parse(readFileSync(`${prepared.preparedBook.directory}/bundle/manifest.json`, 'utf8')), input = read('current-description-review-input.json'), run = read('source-description-author.run.json')
 const recordSchemaDigest = await fingerprintGoalDescriptionReviewRecordSchema()
 // The campaign schema has no candidate_author role. The actual work synthesizes existing findings and a current source/text inspection; this is an informed author revision, not independent adjudication or a D2 resolution.
 const campaign = buildGoalDescriptionReviewCampaign({ bundle, input, campaignId: run.campaignId, roundId: run.roundId, reviewerRole: 'synthesizer', reviewPass: 'synthesis', independenceGroupId: run.independenceGroupId, blindToOtherReviews: false, recordSchemaDigest, batchSize: 11 })
 const batch = campaign.batches[0]
 const batchInputBytes = serializeGoalDescriptionReviewBatchInput({ bundleFingerprint: bundle.bundleFingerprint, bookDigest: bundle.bookModelDigest, reviewInputFingerprint: input.reviewInputFingerprint, inputSchemaVersion: input.schemaVersion, recordSchemaDigest, batchId: batch.batchId, goalIds: batch.goalIds, goals: input.goals })
 write('author-native-validation.campaign.json', campaign)
 writeFileSync(`${own}/author-native-validation.batch.input.jsonl`, batchInputBytes)
 Object.assign(run, { batchId: batch.batchId, batchInputFingerprint: batch.batchInputFingerprint })
 run.inputArtifacts = run.inputArtifacts.filter((a: any) => a.role !== 'description_review_batch_input_jsonl')
 run.inputArtifacts.push({ role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint })
 write('source-description-author.run.json', run)
 const result = await validateGoalDescriptionReviewBatch({ bundle, input, campaign, run, batchInputBytes, recordsBytes: readFileSync(`${own}/source-description-author.records.jsonl`) })
 write('native-author-source-d-validation.receipt.json', { observedAt: new Date().toISOString(), recordStatus: 'candidate', reviewAuthority: 'ai_candidate', nativeHelper: 'validateGoalDescriptionReviewBatch', campaignRoleQualifier: 'Informed author revision via schema synthesizer adapter; run role synthesizer truthfully identifies synthesis of existing findings and current author inspection; not a peer verdict, independent round, adjudication, Book D2 acceptance or operative gate.', result: result.errors.length ? 'FAIL' : 'PASS', goalCount: result.records.length, errors: result.errors, currentBundleFingerprint: bundle.bundleFingerprint, currentBookDigest: bundle.bookModelDigest, currentInputFingerprint: input.reviewInputFingerprint, recordsDigest: `sha256:${createHash('sha256').update(readFileSync(`${own}/source-description-author.records.jsonl`)).digest('hex')}`, strictClosureAdded: 0 })
 console.log(JSON.stringify({ result: result.errors.length ? 'FAIL' : 'PASS', goalCount: result.records.length, errors: result.errors }))
 if (result.errors.length) process.exitCode = 1
}
main()
