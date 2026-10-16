// SPDX-License-Identifier: Apache-2.0
// Technical shape, reference and binding check; no scientific approval or execution.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
const root = dirname(fileURLToPath(import.meta.url))
const repo = resolve(root, '../../../../../../..')
const requireFromApp = createRequire(resolve(repo, 'app/package.json'))
const Ajv2020 = requireFromApp('ajv/dist/2020.js').default
const {
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceProfile,
  fingerprintPositiveGoalEvidenceReviewInput,
  validatePositiveGoalEvidenceRecordSemantics,
} = await import(pathToFileURL(resolve(repo, 'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const load = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const sha = (bytes: Buffer | string) => 'sha256:' + createHash('sha256').update(bytes).digest('hex')
const envelope = load(resolve(root, 'author-profiles.seven.raw.json'))
const selected = load(resolve(root, 'inputs/whole-seven-current-goals.exact.json'))
const cases = load(resolve(root, 'inputs/fourteen-full-cases.bound.exact.json'))
const schema = load(resolve(repo, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const validator = new Ajv2020({ allErrors: true, strict: true }).compile({
  $schema: schema.$schema,
  $defs: schema.$defs,
  $ref: '#/$defs/profile',
})
const errors: string[] = []
const details: unknown[] = []
if (envelope.profiles.length !== 7 || cases.cases.length !== 14) errors.push('Expected exactly seven profiles and fourteen full cases')
if (envelope.evidenceLevel !== 'E0' || envelope.maximumClaimScope !== 'G0' || !envelope.unreviewed) errors.push('Author envelope claims exceed E0/G0')
if (envelope.reviewRecordsCreated || envelope.activeConfigCreated || envelope.gateClearancesCreated.length || envelope.independentScientificReviewRunIds.length || envelope.learnerExecutions.length) errors.push('Unexpected active/review/approval/execution claim')
for (const item of envelope.exactInputProvenance) {
  const source = readFileSync(resolve(repo, item.source.path))
  const local = readFileSync(resolve(repo, item.exactLocalCopy.path))
  if (!source.equals(local) || sha(local) !== item.exactLocalCopy.sha256 || sha(source) !== item.source.sha256) errors.push('Source/copy binding mismatch: ' + item.source.path)
}
const canonicalBytes = readFileSync(resolve(repo, envelope.externalWholeCanonicalBinding.path))
if (sha(canonicalBytes) !== envelope.externalWholeCanonicalBinding.sha256) errors.push('Full canonical snapshot binding mismatch')
const canonical = JSON.parse(canonicalBytes.toString('utf8'))
const criteria = sha(readFileSync(resolve(root, 'inputs/chemistry-positive-understanding-evidence-profile-criteria-v1.exact.md')))
for (const [i, row] of envelope.profiles.entries()) {
  const goal = selected.goals[i]
  if (row.goalId !== goal.id || goal.id !== envelope.goalIds[i]) errors.push('Ordered goal mismatch ' + row.goalId)
  const wholeGoal = canonical.goals.find((g: {id: string}) => g.id === goal.id)
  if (JSON.stringify(wholeGoal) !== JSON.stringify(goal)) errors.push('Selected goal differs from full canonical ' + goal.id)
  if (!validator(row.profile)) errors.push(row.goalId + ' profile schema: ' + JSON.stringify(validator.errors))
  if (row.profile.expectations.length !== 4 || row.profile.applicationCaseBriefs.length !== 2) errors.push(row.goalId + ' wrong expectation/case count')
  const resourceDigests: Record<string,string> = {}
  const resourceBindings: unknown[] = []
  for (const link of goal.resourceLinks ?? []) {
    if (link.type !== 'goal-visualization') continue
    const path = resolve(repo, 'app/public', link.url.slice(1))
    const bytes = readFileSync(path)
    resourceDigests[link.url] = sha(bytes)
    resourceBindings.push({ url: link.url, path: relative(repo, path), bytes: bytes.length, sha256: sha(bytes), decision: 'unchanged candidate binding only; no new V vote' })
  }
  const goalFingerprint = fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic')
  const profileFingerprint = fingerprintPositiveGoalEvidenceProfile(row.profile)
  const reviewInputFingerprint = fingerprintPositiveGoalEvidenceReviewInput(goal, criteria, resourceDigests, 'curricularAtomic')
  // An in-memory author-only carrier supplies required metadata to the production
  // semantic helper. It is neither emitted as a review row nor selectable.
  const carrier = {
    goalId: goal.id,
    goalFingerprintRuleVersion: 'goal-evidence-v1',
    profileRuleVersion: 'positive-understanding-evidence-v2',
    reviewCriteriaFingerprint: criteria,
    goalFingerprint, reviewInputFingerprint, profileFingerprint,
    status: 'needs_human_review', reviewAuthority: 'ai_candidate', profile: row.profile,
  }
  errors.push(...validatePositiveGoalEvidenceRecordSemantics(carrier, goal, resourceDigests, 'curricularAtomic'))
  const covered = new Set<string>()
  for (const [ci, ref] of row.fullCaseReferences.entries()) {
    const index = Number(ref.jsonPointer.split('/').at(-1))
    const fullcase = cases.cases[index]
    if (!fullcase || fullcase.id !== ref.caseId || sha(fullcase.fullCaseText) !== ref.fullCaseTextSha256) errors.push('Broken full-case reference ' + ref.caseId)
    const material = readFileSync(resolve(root, 'inputs/fourteen-complete-cases.de-en.exact.author.md'), 'utf8')
    if (!material.includes(fullcase.fullCaseText)) errors.push('Full-case text absent from exact source ' + ref.caseId)
    for (const marker of ['**Material DE.**','**Auftrag DE.**','**Erwartung DE.**','**Material EN.**','**Task EN.**','**Expected EN.**','**Rubric']) {
      if (!fullcase.fullCaseText.includes(marker)) errors.push('Missing ' + marker + ' in ' + ref.caseId)
    }
    const brief = row.profile.applicationCaseBriefs[ci]
    if (!brief.taskDemandDe.includes(ref.caseId) || !brief.taskDemandEn.includes(ref.caseId)) errors.push('Brief lacks explicit full-case reference ' + ref.caseId)
    ref.coveredExpectationIds.forEach((id: string) => covered.add(id))
  }
  for (const expectation of row.profile.expectations) {
    if (!covered.has(expectation.id)) errors.push('Expectation lacks case mapping ' + expectation.id)
  }
  details.push({ goalId: row.goalId, schemaValid: true, goalFingerprint, reviewInputFingerprint, profileFingerprint, effectiveSemanticKindUsedForTechnicalFingerprints: 'curricularAtomic', unchangedResourceBindings: resourceBindings, memoryStatus: 'not reviewed or changed; no M vote', sourceAndApplicabilityStatus: 'pending separate source/course review; no clearance' })
}
const report = {
  schemaVersion: 1,
  checkedAtUTC: new Date().toISOString(),
  role: 'Author/technical formatting check only; not independent science review',
  evidenceLevel: 'E0', maximumClaimScope: 'G0',
  actualCheck: 'Raw #/$defs/profile schema plus unchanged production fingerprint/semantic helper, whole canonical equivalence, exact source copies and full-case references',
  productionSources: ['app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceReview.ts','contracts/goal-evidence/v2/goal-evidence-profile.schema.json'],
  reviewFunctionExecuted: false,
  noSelectableReviewRowEmitted: true,
  sourceOrWholeGateValidationClaimed: false,
  profiles: envelope.profiles.length,
  expectations: envelope.profiles.reduce((n: number, r: any) => n + r.profile.expectations.length, 0),
  fullCases: cases.cases.length,
  rubricCriteria: 56,
  errors, details,
}
writeFileSync(resolve(root, 'CHECK.raw-profile-shape-bindings-and-full-cases.actual.json'), JSON.stringify(report, null, 2)+'\n')
console.log(JSON.stringify({ profiles: report.profiles, expectations: report.expectations, fullCases: report.fullCases, errors }))
if (errors.length) process.exitCode = 1
