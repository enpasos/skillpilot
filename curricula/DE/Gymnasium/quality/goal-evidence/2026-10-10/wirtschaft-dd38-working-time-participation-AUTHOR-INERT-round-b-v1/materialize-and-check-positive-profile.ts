import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import Ajv2020 from '/home/enpasos/projects/skillpilot/app/node_modules/ajv/dist/2020.js'
import addFormats from '/home/enpasos/projects/skillpilot/app/node_modules/ajv-formats/dist/index.js'
import {
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceReviewInput,
  fingerprintPositiveGoalEvidenceProfile,
  validatePositiveGoalEvidenceRecordSemantics,
} from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts'

const own = '/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-dd38-working-time-participation-AUTHOR-INERT-round-b-v1'
const goal = JSON.parse(readFileSync(`${own}/candidates/retained-dd38.whole-goal.candidate.json`, 'utf8'))
const draftPath = `${own}/candidates/retained-dd38.positive-profile.unbound-author-draft.json`
const finalPath = `${own}/candidates/retained-dd38.positive-profile.candidate.json`
const record = JSON.parse(readFileSync(existsSync(draftPath) ? draftPath : finalPath, 'utf8'))
const criteria = readFileSync(`${own}/author-criteria.txt`)
record.reviewCriteriaFingerprint = `sha256:${createHash('sha256').update(criteria).digest('hex')}`
record.goalFingerprint = fingerprintGoalForPositiveEvidence(goal)
record.reviewInputFingerprint = fingerprintPositiveGoalEvidenceReviewInput(goal, record.reviewCriteriaFingerprint, {})
record.profileFingerprint = fingerprintPositiveGoalEvidenceProfile(record.profile)
const schema = JSON.parse(readFileSync('/home/enpasos/projects/skillpilot/contracts/goal-evidence/v2/goal-evidence-profile.schema.json', 'utf8'))
const ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ajv)
const validate = ajv.compile(schema)
if (!validate(record)) throw new Error(ajv.errorsText(validate.errors))
const semanticErrors = validatePositiveGoalEvidenceRecordSemantics(record, goal, {})
if (semanticErrors.length) throw new Error(semanticErrors.join('\n'))
writeFileSync(finalPath, `${JSON.stringify(record, null, 2)}\n`)
if (existsSync(draftPath)) unlinkSync(draftPath)
const result = {
  status: 'passed_local_schema_semantics_and_native_fingerprints',
  checkedAt: new Date().toISOString(),
  goalId: goal.id,
  goalFingerprint: record.goalFingerprint,
  reviewInputFingerprint: record.reviewInputFingerprint,
  profileFingerprint: record.profileFingerprint,
  inputResourceDigests: {},
  imageBinding: 'No current visualization binding; old exact asset is preserved in History and V remains open.',
  existingMinimumIndependentDemonstrationsPreserved: record.profile.coverageExpectations.minimumIndependentDemonstrations === 2,
  fullyWrittenBilingualCaseCount: record.profile.applicationCaseBriefs.length,
  authority: record.reviewAuthority,
  evidenceLevel: record.evidenceLevel,
  maximumClaimScope: record.maximumClaimScope,
  humanApprovalClaimed: false,
  learnerTestingClaimed: false,
}
writeFileSync(`${own}/checks/native-positive-profile.json`, `${JSON.stringify(result, null, 2)}\n`)
process.stdout.write(`${JSON.stringify(result)}\n`)
