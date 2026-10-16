// SPDX-License-Identifier: Apache-2.0
// Bounded author integrity/schema checks. No independent science vote.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
const own = dirname(fileURLToPath(import.meta.url))
const repo = resolve(own, '../../../../../../..')
const read = (p: string) => JSON.parse(readFileSync(resolve(own, p), 'utf8'))
const sha = (b: Buffer | string) => 'sha256:' + createHash('sha256').update(b).digest('hex')
const sorted = (x: any): any => Array.isArray(x) ? x.map(sorted) : x && typeof x === 'object'
  ? Object.fromEntries(Object.keys(x).sort().map(k => [k, sorted(x[k])])) : x
const objectSha = (x: any) => sha(JSON.stringify(sorted(x)))
const requireApp = createRequire(resolve(repo, 'app/package.json'))
const Ajv2020 = requireApp('ajv/dist/2020.js').default
const ajv = new Ajv2020({ allErrors: true, strict: false })
const profileSchema = JSON.parse(readFileSync(resolve(repo, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'), 'utf8'))
const profileValidator = ajv.compile({ $schema: profileSchema.$schema, $defs: profileSchema.$defs, $ref: '#/$defs/profile' })
const viewValidator = ajv.compile(JSON.parse(readFileSync(resolve(repo, 'contracts/curriculum-package/v1/composition-view.schema.json'), 'utf8')))
const landscapeValidator = ajv.compile(JSON.parse(readFileSync(resolve(repo, 'docs/landscape-runtime.schema.json'), 'utf8')))
const model = await import(pathToFileURL(resolve(repo, 'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const { collectAuthoritativeTargetAtomicGoalIds } = await import(pathToFileURL(resolve(repo, 'app/scripts/compositionViewSourceCoverage.ts')).href)
const base = read('inputs/canonical551.current419.exact.json')
const candidate = read('candidate/canonical554.prospective422.three-new-atoms.inactive.author.json')
const additions = read('candidate/three-whole-goals.author.json').goals
const baseById = new Map<string, any>(base.goals.map((g: any) => [g.id, g]))
const byId = new Map<string, any>(candidate.goals.map((g: any) => [g.id, g]))
const errors: string[] = []
if (!landscapeValidator(candidate)) errors.push('Whole candidate runtime schema: ' + JSON.stringify(landscapeValidator.errors))
const changedExisting = base.goals.filter((g: any) => JSON.stringify(g) !== JSON.stringify(byId.get(g.id))).map((g: any) => g.id)
if (JSON.stringify(changedExisting) !== JSON.stringify(['d11fc507-4fae-5f2f-bd84-c3dbc9c43daf'])) errors.push('Unexpected existing-goal change')
const parentBefore = baseById.get(changedExisting[0])
const parentAfter = byId.get(changedExisting[0])
if (JSON.stringify({ ...parentBefore, contains: parentAfter.contains, weight: parentAfter.weight }) !== JSON.stringify(parentAfter)) errors.push('Existing boundary cluster changed beyond contains/weight')
if (parentAfter.extendedData.applicabilityMappingInheritance !== 'boundary') errors.push('Missing existing source boundary')
if (candidate.goals.length !== 554 || additions.length !== 3 || new Set(candidate.goals.map((g: any) => g.id)).size !== 554) errors.push('Whole goal/ID count mismatch')
for (const field of ['requires', 'contains']) {
  const done = new Set<string>(), visiting = new Set<string>()
  const walk = (id: string) => {
    if (visiting.has(id)) { errors.push(field + ' cycle at ' + id); return }
    if (done.has(id)) return
    const g = byId.get(id)
    if (!g) { errors.push(field + ' dangling goal ' + id); return }
    visiting.add(id)
    for (const child of g[field] ?? []) walk(child)
    visiting.delete(id); done.add(id)
  }
  for (const id of byId.keys()) walk(id)
}
const provenance = read('INPUTS.exact-author-provenance.json')
for (const item of provenance.files) {
  const b = readFileSync(resolve(own, item.local.path))
  const original = readFileSync(resolve(repo, item.source.path))
  if (!b.equals(original) || sha(b) !== item.local.sha256 || b.length !== item.local.bytes) errors.push('Exact-copy mismatch ' + item.local.path)
}
const v2 = read('materials/ten-whole-cases.exact-v2.author.json')
const v1 = read('inputs/history/ten-whole-cases.original-v1.exact.json')
const v2Cases = v2.units.flatMap((u: any) => u.cases)
const v1Cases = v1.units.flatMap((u: any) => u.cases)
const full = read('materials/eleven-complete-cases.v3.bound.author.json')
const changedV1V2 = v2Cases.filter((c: any) => JSON.stringify(c) !== JSON.stringify(v1Cases.find((v: any) => v.id === c.id))).map((c: any) => c.id)
if (JSON.stringify(changedV1V2) !== JSON.stringify(['HB-I1', 'HB-W1'])) errors.push('Unexpected old v1/v2 material delta')
for (const c of v2Cases) if (JSON.stringify(c) !== JSON.stringify(full.cases.find((v: any) => v.id === c.id))) errors.push('Retained whole case changed ' + c.id)
if (full.cases.length !== 11 || full.cases.reduce((n: number, c: any) => n + c.rubric.length, 0) !== 44) errors.push('Case/rubric count mismatch')
for (const c of full.cases) {
  for (const field of ['materialDe', 'materialEn', 'taskDemandDe', 'taskDemandEn', 'modelAnswerDe', 'modelAnswerEn']) if (!c[field]?.trim()) errors.push('Missing full case field ' + c.id + ':' + field)
  if (c.executed || c.learnerWorkPresent || c.evidenceLevel !== 'E0' || c.maximumClaimScope !== 'G0' || !c.authorOnly) errors.push('Case claim exceeds author E0/G0 ' + c.id)
  if (c.rubric.length !== 4 || c.maximumPoints !== 12) errors.push('Whole rubric incomplete ' + c.id)
}
const envelope = read('candidate/author-profiles.three.raw.json')
if (!envelope.unreviewed || envelope.evidenceLevel !== 'E0' || envelope.maximumClaimScope !== 'G0' || envelope.reviewRecordsCreated || envelope.activeConfigCreated || envelope.gateClearancesCreated.length || envelope.independentScientificReviewRunIds.length || envelope.learnerExecutions.length) errors.push('Profile envelope claim exceeds author role')
const criteria = sha(readFileSync(resolve(own, 'inputs/positive-profile-criteria.exact.md')))
const profileDetails: any[] = []
for (const row of envelope.profiles) {
  const goal = byId.get(row.goalId)
  if (!profileValidator(row.profile)) errors.push(row.goalId + ' raw profile schema: ' + JSON.stringify(profileValidator.errors))
  if (objectSha(goal) !== row.wholeGoalObjectSha256) errors.push('Whole goal object mismatch ' + row.goalId)
  const goalFingerprint = model.fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic')
  const profileFingerprint = model.fingerprintPositiveGoalEvidenceProfile(row.profile)
  const reviewInputFingerprint = model.fingerprintPositiveGoalEvidenceReviewInput(goal, criteria, {}, 'curricularAtomic')
  // In-memory helper input only; no accepted/selectable review row is emitted.
  const carrier = { goalId: goal.id, goalFingerprintRuleVersion: 'goal-evidence-v1', profileRuleVersion: 'positive-understanding-evidence-v2', reviewCriteriaFingerprint: criteria, goalFingerprint, reviewInputFingerprint, profileFingerprint, status: 'needs_human_review', reviewAuthority: 'ai_candidate', profile: row.profile }
  errors.push(...model.validatePositiveGoalEvidenceRecordSemantics(carrier, goal, {}, 'curricularAtomic'))
  const coverage: Record<string, string[]> = {}
  for (const ref of row.fullCaseReferences) {
    const c = full.cases[Number(ref.jsonPointer.split('/').at(-1))]
    if (!c || c.id !== ref.caseId || objectSha(c) !== ref.wholeCaseObjectSha256) errors.push('Broken whole case reference ' + ref.caseId)
    if (!row.profile.applicationCaseBriefs.some((b: any) => b.id === ref.caseId.toLowerCase() && b.taskDemandDe.includes(ref.caseId) && b.taskDemandEn.includes(ref.caseId))) errors.push('Missing explicit bilingual case reference ' + ref.caseId)
    for (const e of ref.coveredExpectationIds) (coverage[e] ??= []).push(ref.caseId)
  }
  for (const e of row.profile.expectations) if (!coverage[e.id]?.length) errors.push('Uncovered expectation ' + e.id)
  const mechanismCoverage = coverage['property-selective-separation']
  if (mechanismCoverage && JSON.stringify(mechanismCoverage) !== JSON.stringify(['HB-I1', 'HB-I3'])) errors.push('I2 incorrectly used as mechanism evidence')
  profileDetails.push({ goalId: row.goalId, goalFingerprint, profileFingerprint, reviewInputFingerprint, coverage, formalReviewStatus: 'pending; author technical shape only' })
}
const targetReports: any[] = []
for (const name of ['de-hb-lk', 'de-hb-gk', 'de-bw-lk', 'de-bw-gk', 'de-st-lk', 'de-st-gk']) {
  const before = read('inputs/views/' + name + '.view.exact.json')
  const changed = ['de-hb-lk', 'de-bw-lk'].includes(name)
  const view = changed ? read('candidate/views/' + name + '.view.author.json') : before
  if (!viewValidator(view)) errors.push(name + ' view schema: ' + JSON.stringify(viewValidator.errors))
  const targetBefore = collectAuthoritativeTargetAtomicGoalIds(base, before)
  const targets = collectAuthoritativeTargetAtomicGoalIds(candidate, view)
  const removed = [...targetBefore].filter((id: string) => !targets.has(id))
  if (removed.length) errors.push(name + ' removed existing targets')
  const newPresent = additions.filter((g: any) => targets.has(g.id)).map((g: any) => g.id)
  const expected = name === 'de-hb-lk' ? additions.slice(0, 2).map((g: any) => g.id) : name === 'de-bw-lk' ? [additions[2].id] : []
  if (JSON.stringify(newPresent) !== JSON.stringify(expected)) errors.push(name + ' wrong new domain target scope')
  const requirementReports = newPresent.map((id: string) => {
    const all = new Set<string>(), stack = [...byId.get(id).requires]
    while (stack.length) {
      const p = stack.pop() as string
      if (all.has(p)) continue
      all.add(p); stack.push(...(byId.get(p)?.requires ?? []))
    }
    return { goalId: id, directRequires: byId.get(id).requires, transitiveRequires: [...all], missingTransitiveTargets: [...all].filter(p => !targets.has(p)).map(p => ({ goalId: p, title: byId.get(p)?.title })), allDirectRequiresPresentAsTargets: byId.get(id).requires.every((p: string) => targets.has(p)), acquisitionApproved: false }
  })
  targetReports.push({ view: name, targetBefore: targetBefore.size, targetAfter: targets.size, added: [...targets].filter((id: string) => !targetBefore.has(id)), removed, newDomainTargets: newPresent, requirementReports, claim: 'actual stock projection observation only, not source/acquisition approval' })
}
const parseFiles: string[] = []
const walkFiles = (dir: string) => {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const p = resolve(dir, item.name)
    if (item.isDirectory()) walkFiles(p)
    else if (item.name.endsWith('.json')) { JSON.parse(readFileSync(p, 'utf8')); parseFiles.push(p.slice(own.length + 1)) }
  }
}
walkFiles(own)
const report = { schemaVersion: 1, checkedAtUTC: new Date().toISOString(), role: 'V3 author technical integrity/shape check only', productionHelpersUnchanged: true, independentReviewExecuted: false, strictClosureGain: 0, evidenceLevel: 'E0', maximumClaimScope: 'G0', changedExistingCanonicalGoalIds: changedExisting, exactV1V2CaseChangesRetained: changedV1V2, originalTenCasesUnchangedInV3: true, additionalCompleteCase: 'HB-I3', fullCases: 11, rubricRows: 44, profiles: profileDetails, targetReports, jsonFilesParsed: parseFiles.length, errors, pendingAcquisitionFindingsDoNotBecomeTechnicalPassClaims: true }
writeFileSync(resolve(own, 'CHECK.bounded-author-shape-exactness-DAG-and-stock-target-projection.actual.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify({ fullCases: 11, profiles: profileDetails.length, jsonFilesParsed: parseFiles.length, targetReports, errors }))
if (errors.length) process.exitCode = 1
