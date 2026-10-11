import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { resolve, join } from 'node:path'
import {
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceReviewInput,
  fingerprintPositiveGoalEvidenceProfile,
  validatePositiveGoalEvidenceRecordSemantics,
} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'

const root = process.cwd()
const own = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-6482-5aaf-79d-source-scope-f6bc-0b3d-followers-AUTHOR-INERT-round-b-v1')
const require = createRequire(join(root, 'app/package.json'))
const Ajv2020 = require('ajv/dist/2020.js')
const addFormats = require('ajv-formats/dist/index.js')
const hash = (bytes: Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const schemaPath = join(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'))
const ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ajv)
const validate = ajv.compile(schema)
const goalList = JSON.parse(readFileSync(join(own, 'candidates/three-whole-content-goals.scope-candidate.INERT.json'), 'utf8'))
const goals = new Map(goalList.map((g: any) => [g.id, g]))
const draftPath = join(own, 'candidates/positive-profiles.unbound-author-drafts.json')
const finalPath = join(own, 'candidates/positive-profiles.native-bound.INERT.json')
const records = JSON.parse(readFileSync(existsSync(draftPath) ? draftPath : finalPath, 'utf8'))
const criteriaDigest = hash(readFileSync(join(own, 'author-criteria.txt')))
const checks: any[] = []
const kindBindings = JSON.parse(readFileSync(join(own, 'history/selected-current-semantic-inputs.actual.json'), 'utf8'))
const historicalChecks: any[] = [] // Unaffected historical P and 685 cases deliberately not rerated.
for (const record of records) {
  const goal: any = goals.get(record.goalId)
  if (!goal) throw new Error(`Missing own whole goal ${record.goalId}`)
  const resources: Record<string, string> = {}
  for (const link of goal.resourceLinks || []) {
    if (link.type === 'goal-visualization' && link.url?.startsWith('/assets/')) {
      resources[link.url] = hash(readFileSync(join(root, 'app/public', link.url)))
    }
  }
  record.reviewCriteriaFingerprint = criteriaDigest
  const candidateEffectiveKind = kindBindings.candidateEffectiveKinds[goal.id]
  record.goalFingerprint = fingerprintGoalForPositiveEvidence(goal, candidateEffectiveKind)
  record.reviewInputFingerprint = fingerprintPositiveGoalEvidenceReviewInput(goal, criteriaDigest, resources, candidateEffectiveKind)
  record.profileFingerprint = fingerprintPositiveGoalEvidenceProfile(record.profile)
  if (!validate(record)) throw new Error(`${record.goalId}: ${ajv.errorsText(validate.errors)}`)
  const errors = validatePositiveGoalEvidenceRecordSemantics(record, goal, resources, candidateEffectiveKind)
  if (errors.length) throw new Error(errors.join('\n'))
  if (record.reviewAuthority !== 'ai_candidate' || record.status !== 'needs_human_review' || record.evidenceLevel !== 'E1' || record.maximumClaimScope !== 'G1' || record.reviewRunIds.length) {
    throw new Error(`${record.goalId}: untruthful author authority/run claim`)
  }
  if (record.profile.applicationCaseBriefs.length !== 2 || record.profile.coverageExpectations.minimumIndependentDemonstrations !== 2) {
    throw new Error(`${record.goalId}: expected two example briefs and unchanged native evidence minimum`)
  }
  checks.push({ goalId: goal.id, effectiveSemanticKind: candidateEffectiveKind, semanticKindAuthority: 'INERT author semantic/scope proposal; existing model prose unchanged except retained648; independent A open', goalFingerprint: record.goalFingerprint, reviewInputFingerprint: record.reviewInputFingerprint, profileFingerprint: record.profileFingerprint, inputResourceDigests: resources, bilingualCaseBriefCount: 2, authority: record.reviewAuthority, status: record.status, evidenceLevel: record.evidenceLevel, maximumClaimScope: record.maximumClaimScope, reviewRunIds: record.reviewRunIds })
}
writeFileSync(finalPath, `${JSON.stringify(records, null, 2)}\n`)
writeFileSync(join(own, 'candidates/positive-profiles.native-bound.INERT.jsonl'), records.map((r: any) => JSON.stringify(r)).join('\n') + '\n')
if (existsSync(draftPath)) unlinkSync(draftPath)
const metadataPath = join(own, 'generation-metadata.actual.json')
const result = {
  status: 'passed_local_positive_v2_schema_semantics_and_native_fingerprints',
  checkedAt: new Date().toISOString(),
  provider: 'OpenAI', model: 'GPT-6', runtime: 'Codex',
  generationParametersFingerprint: hash(readFileSync(metadataPath)),
  generationMetadataPath: 'generation-metadata.actual.json',
  actualToolchain: { node: process.version, tsx: require('tsx/package.json').version, ajv: require('ajv/package.json').version },
  inputArtifacts: [
    { path: 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json', digest: hash(readFileSync(schemaPath)) },
    { path: 'app/scripts/positiveGoalEvidenceProfileModel.ts', digest: hash(readFileSync(join(root, 'app/scripts/positiveGoalEvidenceProfileModel.ts'))) },
    { path: 'app/scripts/goalEvidenceProfileModel.ts', digest: hash(readFileSync(join(root, 'app/scripts/goalEvidenceProfileModel.ts'))) },
  ],
  ownNativeRecordChecks: checks,
  originalWholeContractBindingChecks: historicalChecks,
  outputJsonDigest: hash(readFileSync(finalPath)),
  outputJsonlDigest: hash(readFileSync(join(own, 'candidates/positive-profiles.native-bound.INERT.jsonl'))),
  independentContentReviewClaimed: false,
  humanApprovalClaimed: false,
  learnerTrialClaimed: false,
  activeMutationClaimed: false,
}
writeFileSync(join(own, 'checks/native-positive-candidates.actual.json'), `${JSON.stringify(result, null, 2)}\n`)
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
