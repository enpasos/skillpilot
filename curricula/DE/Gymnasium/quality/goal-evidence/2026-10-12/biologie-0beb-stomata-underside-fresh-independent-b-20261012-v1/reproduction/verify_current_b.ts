import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/biologie-0beb-stomata-underside-fresh-independent-b-20261012-v1'
const neutral = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/biologie-basiskonzepte-0beb-stomata-underside-one-image-technical-preparation-20261012-v1'
const gid = '0beb4ca2-2437-557a-9db2-ccda1cbcfa0a'
const json = (path: string) => JSON.parse(readFileSync(resolve(path), 'utf8'))
const sha = (bytes: Buffer | string) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const moduleAt = (path: string) => import(pathToFileURL(resolve(path)).href)

async function main() {
  const positive = await moduleAt('app/scripts/positiveGoalEvidenceProfileModel.ts')
  const description = await moduleAt('app/scripts/validateGoalDescriptionReviewCampaign.ts')
  const visualization = await moduleAt('app/scripts/reportDeepUnderstandingRollout.ts')
  const AjvModule = await moduleAt('app/node_modules/ajv/dist/2020.js')
  const FormatsModule = await moduleAt('app/node_modules/ajv-formats/dist/index.js')
  const Ajv = AjvModule.default
  const ajv = new Ajv({ allErrors: true, strict: true })
  FormatsModule.default(ajv)
  const entry = json(`${neutral}/FINAL.one-goal.neutral-current-input.json`)
  const canonical = json(entry.canonical.path)
  const goal = canonical.goals.find((g: any) => g.id === gid)
  const kinds = json(entry.semanticKinds.path)
  const kind = kinds.decisions.find((g: any) => g.goalId === gid).semanticKind
  const resourceSha = sha(readFileSync(resolve(entry.actualNewImage.path)))
  const digests = Object.fromEntries(goal.resourceLinks.filter((x: any) => x.type === 'goal-visualization').map((x: any) => [x.url, resourceSha]))
  const candidateBytes = readFileSync(resolve(`${own}/positive/P1.current-independent-b.jsonl`))
  const candidate = JSON.parse(candidateBytes.toString('utf8').trim())
  const authored = JSON.parse(readFileSync(resolve(entry.currentWholeP1.path), 'utf8').trim())
  const pRun = json(`${own}/positive/run-manifest.json`)
  const pValidate = ajv.compile(json('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
  const runValidate = ajv.compile(json('contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json'))
  const pSchemaValid = pValidate(candidate)
  const runSchemaValid = runValidate(pRun)
  const pSchemaErrors = pSchemaValid ? [] : JSON.parse(JSON.stringify(pValidate.errors))
  const runSchemaErrors = runSchemaValid ? [] : JSON.parse(JSON.stringify(runValidate.errors))
  const semanticErrors = positive.validatePositiveGoalEvidenceRecordSemantics(candidate, goal, digests, kind)
  const dBase = `${neutral}/native/D1/round-b`
  const campaign = json(`${dBase}/description-review-campaign.json`)
  const dResult = await description.validateGoalDescriptionReviewBatch({
    bundle: json(`${dBase}/review-bundle-manifest.json`),
    input: json(`${dBase}/description-review-input.json`),
    campaign,
    run: json(`${own}/description/run-manifest.json`),
    batchInputBytes: readFileSync(resolve(`${dBase}/batches/${campaign.batches[0].batchId}.input.jsonl`)),
    recordsBytes: readFileSync(resolve(`${own}/description/description-records.jsonl`)),
  })
  const vOwn = json(`${own}/v-image-only/V.current-image.independent-b.actual.json`)
  const vPredicate = visualization.hasCompletedDeepUnderstandingVisualizationReview({
    visualizationState: 'available', missingReason: '', assetSha256: resourceSha,
    aiApproved: vOwn.aiApproved, aiApprovedAssetSha256: vOwn.aiApprovedAssetSha256,
    aiReviewedAt: vOwn.aiReviewedAt, aiReviewer: vOwn.aiReviewer,
  })
  const result = {
    role: 'Actual one-goal calls to unmodified normal production validators and current-hash V predicate',
    goalId: gid,
    semanticKind: kind,
    exactCurrentAssetSha256: resourceSha,
    positiveSchemaValid: pSchemaValid,
    positiveRunManifestSchemaValid: runSchemaValid,
    positiveSchemaErrors: pSchemaErrors,
    positiveRunManifestSchemaErrors: runSchemaErrors,
    positiveNormalSemanticsErrors: semanticErrors,
    positiveProfileBodyUnchanged: JSON.stringify(candidate.profile) === JSON.stringify(authored.profile),
    positiveGoalFingerprint: positive.fingerprintGoalForPositiveEvidence(goal, kind),
    positiveReviewInputFingerprint: positive.fingerprintPositiveGoalEvidenceReviewInput(goal, candidate.reviewCriteriaFingerprint, digests, kind),
    positiveProfileFingerprint: positive.fingerprintPositiveGoalEvidenceProfile(candidate.profile),
    positiveRunOutputDigestMatches: pRun.outputDigest === sha(candidateBytes),
    positiveOwnRunReferenced: candidate.reviewRunIds.length === 1 && candidate.reviewRunIds[0] === pRun.runId,
    positiveMachineCandidateAuthorityCondition: candidate.status === 'needs_human_review' && candidate.reviewAuthority === 'ai_candidate',
    positiveAuthorityConditionReference: 'app/scripts/reportDeepUnderstandingRollout.ts:1604-1607; no aggregate M7 claim',
    descriptionNormalBatchErrors: dResult.errors,
    descriptionRecordCount: dResult.records.length,
    descriptionDecision: dResult.records[0].decision,
    descriptionReviewPass: campaign.reviewPass,
    exactCurrentHashVisualizationProductionPredicate: vPredicate,
    HumanApproval: false, HumanTrial: false, aggregateM7Computed: false,
  }
  writeFileSync(resolve(`${own}/normal-current-validation.actual.json`), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' })
  process.stdout.write(JSON.stringify(result) + '\n')
  if (!pSchemaValid || !runSchemaValid || semanticErrors.length || dResult.errors.length || !vPredicate || !result.positiveProfileBodyUnchanged || !result.positiveRunOutputDigestMatches || !result.positiveOwnRunReferenced || !result.positiveMachineCandidateAuthorityCondition) process.exitCode = 1
}
main().catch(error => { console.error(error); process.exitCode = 1 })
