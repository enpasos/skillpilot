// SPDX-License-Identifier: Apache-2.0
// Author serialization and contract checks only. No scientific review run.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'

async function main() {
  const repo = process.cwd()
  const own = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const load = (p: string) => JSON.parse(readFileSync(resolve(repo, p), 'utf8'))
  const ownLoad = (p: string) => load(resolve(own, p))
  const hash = (b: string | Buffer) => `sha256:${createHash('sha256').update(b).digest('hex')}`
  const write = (p: string, value: unknown) => writeFileSync(resolve(own, p), JSON.stringify(value, null, 2) + '\n')
  const selector = ownLoad('INPUTS.physical-exact-selector.json')
  const firstSeal = ownLoad('FIRST.science.seal.json')
  if (hash(readFileSync(resolve(own, 'ORIGINAL-FIRST.science-before-binding.author.json'))) !== firstSeal.firstScience.sha256) {
    throw new Error('Original substantive FIRST changed')
  }
  for (const item of [selector.currentCanonical, selector.semanticLedger, selector.originalThirtyCases,
    selector.originalFifteenRawProfiles, selector.existingImageForByteBindingOnly, selector.stockProfileHelper,
    selector.stockProfileSchema, selector.criteria]) {
    if (hash(readFileSync(resolve(repo, item.path))) !== item.sha256) throw new Error(`Changed input: ${item.path}`)
  }
  const helper = await import(pathToFileURL(resolve(repo, selector.stockProfileHelper.path)).href)
  const req = createRequire(resolve(repo, 'app/package.json'))
  const Ajv2020 = req('ajv/dist/2020').default
  const addFormats = req('ajv-formats')
  const ajv = new Ajv2020({ allErrors: true, strict: false })
  addFormats(ajv)
  const validate = ajv.compile(load(selector.stockProfileSchema.path))
  const canonical = load(selector.currentCanonical.path)
  const goal = canonical.goals.find((g: any) => g.id === selector.goalId)
  const kind = load(selector.semanticLedger.path).decisions.find((d: any) => d.goalId === goal.id).semanticKind
  const profile = ownLoad('candidate/one-profile.body-additive.author.json').profile
  const oldRecord = readFileSync(resolve(repo, selector.originalFifteenRawProfiles.path), 'utf8')
    .trim().split('\n').map(JSON.parse).find((r: any) => r.goalId === goal.id)
  if (JSON.stringify(profile.expectations.slice(0, 4)) !== JSON.stringify(oldRecord.profile.expectations)) {
    throw new Error('Old e1-e4 changed')
  }
  if (JSON.stringify(profile.applicationCaseBriefs.slice(0, 2)) !== JSON.stringify(oldRecord.profile.applicationCaseBriefs)) {
    throw new Error('Old11a/b profile briefs changed')
  }
  const resourceDigests: Record<string, string> = {}
  const imageBytes = readFileSync(resolve(repo, selector.existingImageForByteBindingOnly.path))
  const visualizations = (goal.resourceLinks ?? []).filter((l: any) => l.type === 'goal-visualization')
  if (visualizations.length !== 1) throw new Error('Expected one retained visualization')
  resourceDigests[visualizations[0].url] = hash(imageBytes)
  const record = {
    $schema: helper.POSITIVE_GOAL_EVIDENCE_SCHEMA_URL,
    schemaVersion: helper.POSITIVE_GOAL_EVIDENCE_SCHEMA_VERSION,
    reviewId: 'chemie-lab335-one-stimulus-response-author-20261015-01',
    goalFingerprintRuleVersion: helper.POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION,
    profileRuleVersion: helper.POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION,
    reviewCriteriaFingerprint: selector.criteria.sha256,
    landscapeId: canonical.landscapeId, goalId: goal.id,
    goalFingerprint: helper.fingerprintGoalForPositiveEvidence(goal, kind),
    reviewInputFingerprint: helper.fingerprintPositiveGoalEvidenceReviewInput(goal, selector.criteria.sha256, resourceDigests, kind),
    profileFingerprint: helper.fingerprintPositiveGoalEvidenceProfile(profile),
    status: 'needs_human_review', reviewAuthority: 'ai_candidate',
    reviewedAt: new Date().toISOString(), reviewer: 'codex-bounded-lab335-material-author',
    reason: 'Raw unreviewed E0/G0 author successor only. Adds one complete future practical stimulus-response case and one additive profile facet; old e1-e4,11a/b briefs and every other profile/case remain exact. This timestamp records author serialization, not an independent review. No D/P/A/M/V vote or review run, actual learner/lab performance, Human Approval, Human Trial, source/course clearance or strict closure. The legacy status field does not introduce a human prerequisite for machine M7.',
    evidenceLevel: 'E0', maximumClaimScope: 'G0', reviewRunIds: [],
    dissent: [
      'Whole source/course/selection allocation remains open; specific BcP evidence does not grant ordinary chemistry scopes.',
      'Original whole-goal atomicity dissent remains open; adding a stimulus-response design does not decide it.',
      'No learner/lab performance is claimed. Actual future practical assessment requires own observed action and raw data; an already completed human/lab trial is not a machine-M7 prerequisite.',
    ], profile,
  }
  const schemaOK = validate(record)
  const semanticErrors = helper.validatePositiveGoalEvidenceRecordSemantics(record, goal, resourceDigests, kind)
  if (!schemaOK || semanticErrors.length) {
    write('checks/production-profile-contract.actual.json', {
      schemaOK, schemaErrors: validate.errors, productionSemanticErrors: semanticErrors,
      scientificReviewRun: false, reviewVotes: 0,
    })
    throw new Error('Author serialization failed production contract')
  }
  writeFileSync(resolve(own, 'candidate/one-profile.raw-E0G0.author.jsonl'), JSON.stringify(record) + '\n')
  write('checks/production-profile-contract.actual.json', {
    role: 'One raw author record: unchanged stock schema/fingerprint/semantic contract checks only',
    helper: selector.stockProfileHelper, schema: selector.stockProfileSchema,
    criteria: selector.criteria, firstSealSHA256: hash(readFileSync(resolve(own, 'FIRST.science.seal.json'))),
    schemaOK, schemaErrors: [], productionSemanticErrors: semanticErrors,
    goalFingerprint: record.goalFingerprint, reviewInputFingerprint: record.reviewInputFingerprint,
    profileFingerprint: record.profileFingerprint,
    existingImageByteBindingOnly: selector.existingImageForByteBindingOnly,
    rawStatus: 'E0/G0', profileRecords: 1, scientificReviewRun: false,
    reviewVotes: 0, independentApprovals: 0, strictClosures: 0, humanApproval: false,
  })
  process.stdout.write(JSON.stringify({ rawAuthorRecords: 1, rawStatus: 'E0/G0', schemaErrors: [],
    productionSemanticErrors: [], scientificReviewRun: false, reviewVotes: 0 }) + '\n')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
