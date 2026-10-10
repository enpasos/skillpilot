import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

async function main() {
  const root = process.cwd()
  const own = dirname(fileURLToPath(import.meta.url))
  const model = await import(resolve(root, 'app/scripts/positiveGoalEvidenceProfileModel.ts'))
  const { default: Ajv2020 } = await import(resolve(root, 'app/node_modules/ajv/dist/2020.js'))
  const { default: addFormats } = await import(resolve(root, 'app/node_modules/ajv-formats/dist/index.js'))
  const parse = (name: string) => JSON.parse(readFileSync(resolve(own, name), 'utf8'))
  const sha = (bytes: string | Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
  const goals = parse('candidate-whole-goals.json')
  const authored = parse('positive-understanding-evidence-v2.author-candidates.json')
  const criteriaFingerprint = sha(readFileSync(resolve(own, 'author-criteria.md')))
  const original = parse('input-snapshots/current-selected-whole-goals.json')
  const oldProfiles = readFileSync(resolve(own, 'input-snapshots/current-selected-whole-P2-records.jsonl'), 'utf8')
    .trim().split('\n').map((line) => JSON.parse(line))
  const kinds = parse('input-snapshots/current-selected-semantic-kinds.json')
  const schema = JSON.parse(readFileSync(resolve(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'), 'utf8'))
  const ajv = new Ajv2020({ allErrors: true, strict: true })
  addFormats(ajv)
  const validate = ajv.compile(schema)
  const records = authored.goals.map((candidate: any) => {
    const goal = goals.goals.find((g: any) => g.id === candidate.goalId)
    const kind = kinds.decisions.find((k: any) => k.goalId === candidate.goalId)?.semanticKind
    if (kind !== 'curricularAtomic' || goal.type !== 'atomic' || goal.contains.length !== 0) {
      throw new Error(`${candidate.goalId}: original ID must remain curricularAtomic`)
    }
    const record = {
      $schema: model.POSITIVE_GOAL_EVIDENCE_SCHEMA_URL,
      schemaVersion: model.POSITIVE_GOAL_EVIDENCE_SCHEMA_VERSION,
      reviewId: authored.reviewId,
      goalFingerprintRuleVersion: model.POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION,
      profileRuleVersion: model.POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION,
      reviewCriteriaFingerprint: criteriaFingerprint,
      landscapeId: goals.landscapeId,
      goalId: candidate.goalId,
      goalFingerprint: model.fingerprintGoalForPositiveEvidence(goal, kind),
      // No graphic is read or qualified by this separately authorized author task.
      reviewInputFingerprint: model.fingerprintPositiveGoalEvidenceReviewInput(goal, criteriaFingerprint, {}, kind),
      profileFingerprint: model.fingerprintPositiveGoalEvidenceProfile(candidate.profile),
      status: 'needs_human_review',
      reviewAuthority: 'ai_candidate',
      reviewedAt: authored.reviewedAt,
      reviewer: authored.reviewer,
      reason: candidate.reason,
      evidenceLevel: candidate.evidenceLevel,
      maximumClaimScope: candidate.maximumClaimScope,
      reviewRunIds: [],
      dissent: candidate.dissent,
      profile: candidate.profile,
    }
    if (!validate(record)) throw new Error(ajv.errorsText(validate.errors))
    const errors = model.validatePositiveGoalEvidenceRecordSemantics(record, goal, {}, kind)
    if (errors.length) throw new Error(errors.join('\n'))
    const old = oldProfiles.find((r: any) => r.goalId === candidate.goalId)
    if (JSON.stringify(old.profile.coverageExpectations) !== JSON.stringify(record.profile.coverageExpectations)) {
      throw new Error(`${candidate.goalId}: coverage settings changed`)
    }
    return record
  })
  const tariff = '121fea28-9943-575d-9c96-1fb2e3356f32'
  const oldTariff = oldProfiles.find((r: any) => r.goalId === tariff)
  const newTariff = records.find((r: any) => r.goalId === tariff)
  if (JSON.stringify(oldTariff.profile.applicationCaseBriefs) !== JSON.stringify(newTariff.profile.applicationCaseBriefs.slice(0, 2))) {
    throw new Error('Both old whole tariff case briefs must remain unchanged')
  }
  if (JSON.stringify(original.goals.find((g: any) => g.id === tariff)) !== JSON.stringify(goals.goals.find((g: any) => g.id === tariff))) {
    throw new Error('Tariff whole goal was changed')
  }
  if (goals.newGoalIds.length !== 0) throw new Error('This smallest candidate must not duplicate a tariff atom')
  const bytes = records.map((r: any) => JSON.stringify(r)).join('\n') + '\n'
  writeFileSync(resolve(own, 'positive-understanding-evidence-v2.author-records.jsonl'), bytes)
  const tsx = JSON.parse(readFileSync(resolve(root, 'app/node_modules/tsx/package.json'), 'utf8')).version
  console.log(JSON.stringify({
    claim: 'INERT author schema and native P2 fingerprint/semantic validation only',
    completedAt: new Date().toISOString(), node: process.version, tsx,
    records: records.length, oldTariffWholeCasesUnchanged: true,
    coverageSettingsUnchanged: true, newGoalIds: [],
    outputDigest: sha(bytes), imageDigestsBound: false,
    independentReview: false, humanApproval: false,
  }, null, 2))
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
