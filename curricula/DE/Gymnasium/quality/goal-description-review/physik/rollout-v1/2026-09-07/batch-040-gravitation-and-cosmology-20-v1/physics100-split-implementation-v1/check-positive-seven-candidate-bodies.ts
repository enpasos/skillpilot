import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'

async function main() {
const root = process.cwd()
const require = createRequire(resolve(root, 'app/package.json'))
const Ajv2020 = require('ajv/dist/2020').default
const addFormats = require('ajv-formats').default
const ajv = new Ajv2020({ allErrors: true, strict: false })
addFormats(ajv)
const prefix = "curricula/DE/Gymnasium/quality/goal-evidence/canonical-physics-positive-understanding-evidence-rollout-v1-batch-040-split-seven-v1"
const candidates = JSON.parse(readFileSync(resolve(root, prefix + '.candidates.json'), 'utf8'))
const config = JSON.parse(readFileSync(resolve(root, prefix + '.config.json'), 'utf8'))
const configSchema = JSON.parse(readFileSync(resolve(root, 'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'), 'utf8'))
const recordSchema = JSON.parse(readFileSync(resolve(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'), 'utf8'))
const configValidate = ajv.compile(configSchema)
assert(configValidate(config), JSON.stringify(configValidate.errors))
const recordValidate = ajv.compile(recordSchema)
const { buildPositiveGoalEvidenceCandidateRecords } = await import(resolve(root, 'app/scripts/materializePositiveGoalEvidenceCandidates.ts'))
const records = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet: candidates })
assert.equal(records.length, 7)
assert.equal(new Set(records.map((r: any) => r.goalId)).size, 7)
assert.equal(records.reduce((n: number, r: any) => n + r.profile.applicationCaseBriefs.length, 0), 14)
for (const record of records) {
  assert(recordValidate(record), JSON.stringify(recordValidate.errors))
  assert.equal(record.status, 'needs_human_review')
  assert.equal(record.reviewAuthority, 'ai_candidate')
  assert.equal(record.evidenceLevel, 'E1')
  assert.equal(record.maximumClaimScope, 'G1')
  assert.deepEqual(record.reviewRunIds, [])
  assert.equal(record.profile.applicationCaseBriefs.length, 2)
  for (const c of record.profile.applicationCaseBriefs) {
    assert.notEqual(c.taskDemandDe, c.expectedPerformanceDe)
    assert.notEqual(c.taskDemandEn, c.expectedPerformanceEn)
  }
}
assert(220 - 10 > 150 + 10)
const increments = (a: number[]) => a.slice(1).map((x, i) => Math.round((x - a[i]) * 10) / 10)
assert.deepEqual(increments([1.0, 1.2, 1.4, 1.6]), [0.2, 0.2, 0.2])
assert.deepEqual(increments([1.0, 1.1, 1.3, 1.6]), [0.1, 0.2, 0.3])
const sha = (p: string) => 'sha256:' + createHash('sha256').update(readFileSync(resolve(root, p))).digest('hex')
console.log(JSON.stringify({
  schemaVersion: 1,
  checkedAt: new Date().toISOString(),
  status: 'PASS_AUTHOR_BODY_AND_NATIVE_IN_MEMORY_PREVIEW',
  bindingStatus: 'PREVIEW_ONLY_FINAL_IMAGE_BINDING_REQUIRED',
  candidates: { path: prefix + '.candidates.json', sha256: sha(prefix + '.candidates.json') },
  config: { path: prefix + '.config.json', sha256: sha(prefix + '.config.json') },
  criteria: { path: config.reviewCriteriaPath, sha256: sha(config.reviewCriteriaPath) },
  goals: 7,
  independentlyAuthoredTaskBriefs: 14,
  finalReviewRecordsWritten: false,
  registryWrites: false,
  reviewAuthority: 'ai_candidate',
  humanApproval: false,
  learnerEvidence: false,
  reviewRunClaims: 0,
  arithmeticChecks: {
    darkMatterIntervals: { observed: [210, 230], ordinaryModel: [140, 160], overlap: false },
    equalTimeScaleFactorIncrements: { A: [0.2, 0.2, 0.2], B: [0.1, 0.2, 0.3] }
  },
  profileBindings: records.map((r: any) => ({
    goalId: r.goalId, goalFingerprint: r.goalFingerprint,
    profileFingerprint: r.profileFingerprint,
    evidenceLevel: r.evidenceLevel, maximumClaimScope: r.maximumClaimScope
  }))
}, null, 2))
}
void main().catch((error) => { console.error(error); process.exitCode = 1 })
