// SPDX-License-Identifier: Apache-2.0
// Narrow technical observations only. Never emits scientific votes or active records.
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const own = dirname(fileURLToPath(import.meta.url))
const repo = resolve(own, '../../../../../../..')
const e14 = resolve(repo, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14')
const base = resolve(e14, 'chemie-four-source-duties-explicit-compulsory-domain-carriers-author-20261014-v3')
const selector = resolve(e14, 'chemie-source-three-goals-materials-and-images-review-selector-root-20261014-v1')
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const sha = (b: Buffer | string) => 'sha256:' + createHash('sha256').update(b).digest('hex')
const sorted = (x: any): any => Array.isArray(x) ? x.map(sorted) : x && typeof x === 'object'
  ? Object.fromEntries(Object.keys(x).sort().map(k => [k, sorted(x[k])])) : x
const objectSha = (x: any) => sha(JSON.stringify(sorted(x)))
const req = createRequire(resolve(repo, 'app/package.json'))
const Ajv2020 = req('ajv/dist/2020.js').default
const ajv = new Ajv2020({ allErrors: true, strict: false })
const schema = read(resolve(repo, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const validateProfile = ajv.compile({ $schema: schema.$schema, $defs: schema.$defs, $ref: '#/$defs/profile' })
const validateLandscape = ajv.compile(read(resolve(repo, 'docs/landscape-runtime.schema.json')))
const validateView = ajv.compile(read(resolve(repo, 'contracts/curriculum-package/v1/composition-view.schema.json')))
const { collectAuthoritativeTargetAtomicGoalIds } = await import(pathToFileURL(resolve(repo, 'app/scripts/compositionViewSourceCoverage.ts')).href)
const model = await import(pathToFileURL(resolve(repo, 'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const roleModel = await import(pathToFileURL(resolve(repo, 'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const prior = read(resolve(selector, 'candidate/canonical554.prospective422.three-source-goals-plus-current-acid-deltas.inactive.json'))
const goals = read(resolve(own, 'candidate/three-whole-goals.bounded-author.json'))
const goal3 = new Map<string, any>(goals.map((g: any) => [g.id, g]))
const candidate = { ...prior, goals: prior.goals.map((g: any) => goal3.get(g.id) ?? g) }
const byId = new Map<string, any>(candidate.goals.map((g: any) => [g.id, g]))
const errors: string[] = []
if (!validateLandscape(candidate)) errors.push('Whole in-memory candidate schema: ' + JSON.stringify(validateLandscape.errors))
if (candidate.goals.length !== 554 || byId.size !== 554 || goals.length !== 3) errors.push('Goal count or stable ID mismatch')
const changed = prior.goals.filter((g: any) => objectSha(g) !== objectSha(byId.get(g.id))).map((g: any) => g.id)
if (JSON.stringify(changed) !== JSON.stringify(['93a7ce4d-1c90-568c-9368-cac423011ef9'])) errors.push('Unexpected whole-goal delta')
for (const field of ['requires', 'contains']) {
  const done = new Set<string>(), visiting = new Set<string>()
  const walk = (id: string) => {
    if (visiting.has(id)) { errors.push(field + ' cycle at ' + id); return }
    if (done.has(id)) return
    const g = byId.get(id)
    if (!g) { errors.push(field + ' dangling ID ' + id); return }
    visiting.add(id)
    for (const child of g[field] ?? []) walk(child)
    visiting.delete(id); done.add(id)
  }
  for (const id of byId.keys()) walk(id)
}
const closure = (id: string, includeClusterChildren = false) => {
  const all = new Set<string>(), stack = [...byId.get(id).requires]
  while (stack.length) {
    const current = stack.pop() as string
    if (all.has(current)) continue
    all.add(current)
    const g = byId.get(current)
    stack.push(...(g?.requires ?? []))
    if (includeClusterChildren) stack.push(...(g?.contains ?? []))
  }
  return [...all].sort()
}
const targetReports: any[] = []
for (const name of ['de-hb-lk', 'de-hb-gk', 'de-bw-lk', 'de-bw-gk', 'de-st-lk', 'de-st-gk']) {
  const viewPath = resolve(base, ['de-hb-lk', 'de-bw-lk'].includes(name)
    ? 'candidate/views/' + name + '.view.author.json' : 'inputs/views/' + name + '.view.exact.json')
  const view = read(viewPath)
  if (!validateView(view)) errors.push(name + ' view schema: ' + JSON.stringify(validateView.errors))
  const before = collectAuthoritativeTargetAtomicGoalIds(prior, view)
  const targets = collectAuthoritativeTargetAtomicGoalIds(candidate, view)
  if (JSON.stringify([...before].sort()) !== JSON.stringify([...targets].sort())) errors.push(name + ' changed atomic targets')
  const roleSets = roleModel.collectCompositionProjectionRoleGoalIds(view.rootNodes, byId)
  const newDomainTargets = goals.filter((g: any) => targets.has(g.id)).map((g: any) => g.id)
  const expected = name === 'de-hb-lk' ? goals.slice(0, 2).map((g: any) => g.id)
    : name === 'de-bw-lk' ? [goals[2].id] : []
  if (JSON.stringify(newDomainTargets) !== JSON.stringify(expected)) errors.push(name + ' new carrier scope mismatch')
  const goalRows = newDomainTargets.map((id: string) => {
    const all = closure(id)
    const withContained = closure(id, true)
    return {
      goalId: id, directRequires: byId.get(id).requires,
      allDirectRequiresAreAtomicTargets: byId.get(id).requires.every((p: string) => targets.has(p)),
      rawRequiresClosure: all,
      missingFromAtomicTargetSet: all.filter(p => !targets.has(p)).map(p => ({
        goalId: p, title: byId.get(p).title, kind: byId.get(p).contains?.length ? 'cluster' : 'atomic',
        authoredTargetRoleIncludesWholeId: roleSets.targetGoalIds.has(p),
      })),
      requiresClosureWithClusterContents: withContained,
      missingContainedOrTransitiveAtomicTargets: withContained.filter(p => !byId.get(p).contains?.length && !targets.has(p))
        .map(p => ({ goalId: p, title: byId.get(p).title })),
      clusterChildrenAreSeparateWholePerformanceGoals: true,
      sourceCourseAndAcquisitionStatus: 'HOLD; target membership does not prove acquisition', acquisitionApproved: false,
    }
  })
  targetReports.push({ view: name, viewPath: viewPath.slice(repo.length + 1), viewSHA256: sha(readFileSync(viewPath)),
    targetCountBeforeAndAfterUnchanged: targets.size, newDomainTargets, goalRows,
    prerequisiteOnlyRolesNotInvented: true })
}
const profileRows = read(resolve(own, 'candidate/two-profiles.raw.author.json')).profiles
const full = read(resolve(own, 'materials/eleven-complete-cases.remediated.author.json'))
const criteria = sha(readFileSync(resolve(base, 'inputs/positive-profile-criteria.exact.md')))
const profiles: any[] = []
for (const row of profileRows) {
  if (!validateProfile(row.profile)) errors.push(row.goalId + ' profile schema: ' + JSON.stringify(validateProfile.errors))
  const goal = byId.get(row.goalId)
  if (objectSha(goal) !== row.wholeGoalObjectSha256) errors.push(row.goalId + ' goal object hash')
  const goalFingerprint = model.fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic')
  const profileFingerprint = model.fingerprintPositiveGoalEvidenceProfile(row.profile)
  const reviewInputFingerprint = model.fingerprintPositiveGoalEvidenceReviewInput(goal, criteria, {}, 'curricularAtomic')
  // Ephemeral candidate helper input; no formal review record is stored or integrated.
  errors.push(...model.validatePositiveGoalEvidenceRecordSemantics({ goalId: goal.id,
    goalFingerprintRuleVersion: 'goal-evidence-v1', profileRuleVersion: 'positive-understanding-evidence-v2',
    reviewCriteriaFingerprint: criteria, goalFingerprint, reviewInputFingerprint, profileFingerprint,
    status: 'needs_human_review', reviewAuthority: 'ai_candidate', profile: row.profile }, goal, {}, 'curricularAtomic'))
  const coverage: Record<string, string[]> = {}
  for (const ref of row.fullCaseReferences) {
    const c = full.cases[Number(ref.jsonPointer.split('/').at(-1))]
    if (c?.id !== ref.caseId || objectSha(c) !== ref.wholeCaseObjectSha256) errors.push(ref.caseId + ' case binding')
    if (!readFileSync(resolve(repo, ref.path)).equals(readFileSync(resolve(own, 'materials/eleven-complete-cases.remediated.author.json')))) errors.push(ref.caseId + ' path binding')
    for (const e of ref.coveredExpectationIds) (coverage[e] ??= []).push(ref.caseId)
  }
  for (const e of row.profile.expectations) if (!coverage[e.id]?.length) errors.push('Uncovered expectation ' + e.id)
  if (coverage['property-selective-separation'] && JSON.stringify(coverage['property-selective-separation']) !== JSON.stringify(['HB-I1', 'HB-I3'])) errors.push('I2 mechanism credit invented')
  profiles.push({ goalId: row.goalId, goalFingerprint, profileFingerprint, reviewInputFingerprint,
    coverage, formalReviewStatus: 'pending; technical author shape only' })
}
const report = { schemaVersion: 1, checkedAtUTC: new Date().toISOString(),
  role: 'bounded author schema, DAG, stock target projection and raw profile semantics check',
  inMemoryCandidateOnly: true, fullGoalCount: 554, stableNewGoalIds: goals.map((g: any) => g.id),
  changedWholeGoalIdsFromPrior422: changed, viewsEdited: false, targetReports, profiles,
  productionHelpersChanged: false, independentScienceReviewsExecuted: false,
  formalRecordsCreated: false, strictClosureGain: 0, sourceAndAcquisitionHOLDsRemainOpen: true, errors }
writeFileSync(resolve(own, 'CHECK.stock-projection-DAG-schema-and-profile-semantics.actual.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify({ fullGoals: 554, profiles: profiles.length, views: targetReports.map(r => ({ view: r.view,
  atomicTargets: r.targetCountBeforeAndAfterUnchanged, openGoalRows: r.goalRows })), errors }))
if (errors.length) process.exitCode = 1
