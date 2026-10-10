import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

async function main() {
  const root = process.cwd()
  const own = dirname(fileURLToPath(import.meta.url))
  const { default: Ajv2020 } = await import(resolve(root, 'app/node_modules/ajv/dist/2020.js'))
  const { default: addFormats } = await import(resolve(root, 'app/node_modules/ajv-formats/dist/index.js'))
  const { fingerprintPositiveGoalEvidenceProfile } = await import(resolve(root, 'app/scripts/positiveGoalEvidenceProfileModel.ts'))
  const schema = JSON.parse(readFileSync(resolve(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'), 'utf8'))
  const ajv = new Ajv2020({ allErrors: true, strict: true })
  addFormats(ajv)
  const validate = ajv.compile(schema)
  const folder = resolve(own, 'input-snapshots')
  const objects = readdirSync(folder).filter((name) => name.includes('.whole-')).map((name) => ({
    name, record: JSON.parse(readFileSync(resolve(folder, name), 'utf8')),
  }))
  if (objects.length !== 10) throw new Error('Expected ten whole before/after inputs')
  for (const { name, record } of objects) {
    if (!validate(record)) throw new Error(`${name}: ${ajv.errorsText(validate.errors)}`)
    if (record.status !== 'needs_human_review' || record.reviewAuthority !== 'ai_candidate'
      || record.evidenceLevel !== 'E1' || record.maximumClaimScope !== 'G1') {
      throw new Error(`${name}: candidate status was upgraded`)
    }
  }
  const candidates = objects.filter(({ name }) => name.includes('INERT-AUTHOR'))
  const pending = candidates.map(({ record }) => ({
    goalId: record.goalId,
    authoredProfileFingerprintStillOld: record.profileFingerprint !== fingerprintPositiveGoalEvidenceProfile(record.profile),
  }))
  if (!pending.every(({ authoredProfileFingerprintStillOld }) => authoredProfileFingerprintStillOld)) {
    throw new Error('Expected explicit pending profile rebindings in all five author inputs')
  }
  const reviews = readFileSync(resolve(own, 'five-whole-P-content.independent-review.jsonl'), 'utf8')
    .trim().split('\n').map((line) => JSON.parse(line))
  if (reviews.length !== 5 || new Set(reviews.map((r) => r.goalId)).size !== 5) throw new Error('Expected five unique reviews')
  for (const r of reviews) {
    for (const key of ['positiveUnderstandingDe', 'positiveUnderstandingEn', 'concreteExpectedPerformanceDe',
      'concreteExpectedPerformanceEn', 'transferCounterexampleDe', 'transferCounterexampleEn', 'rationaleDe', 'rationaleEn']) {
      if (typeof r[key] !== 'string' || !r[key].trim()) throw new Error(`${r.goalId}: missing ${key}`)
    }
  }
  console.log(JSON.stringify({
    claim: 'Whole input schema/status and explicit pending profile-binding checks only',
    completedAt: new Date().toISOString(), node: process.version,
    tsx: JSON.parse(readFileSync(resolve(root, 'app/node_modules/tsx/package.json'), 'utf8')).version,
    wholeInputSchemaPassCount: objects.length, independentContentRecords: reviews.length,
    pendingProfileFingerprintBindings: pending, authorInputsMutated: false,
    finalNativeInputOrGoalBindingPassClaimed: false, humanApprovalClaimed: false,
  }, null, 2))
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
